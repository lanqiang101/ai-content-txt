import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { callModelSafe, getActiveModel } from './useModelCall';
import { usePromptBuilder, cleanGeneratedContent } from './usePromptBuilder'; // 🔥 导入清理函数
import { useMemory } from './useMemory';
import { GenerationParams, ChapterOutline, Chapter, Work } from '../types';
import { CYCLE_CONFIG, analyzeContentQuality, generateTargetedContinuationPrompt } from './constants'; // 🔥 导入智能分析工具

/**
 * 智能截断到完整句子（避免在句子中间截断）
 */
const truncateToCompleteSentence = (content: string): string => {
  const trimmedEnd = content.trimEnd();
  
  // 查找最后一个完整的句子结束符
  const sentenceEndings = ['。', '！', '？', '…'];
  let lastCompleteIndex = -1;
  
  for (const ending of sentenceEndings) {
    const index = trimmedEnd.lastIndexOf(ending);
    if (index > lastCompleteIndex) {
      lastCompleteIndex = index;
    }
  }
  
  // 如果找到完整句子结束符，截断到这里
  if (lastCompleteIndex > 0) {
    return trimmedEnd.substring(0, lastCompleteIndex + 1);
  }
  
  // 否则尝试在段落边界截断
  const paragraphs = content.split('\n\n');
  if (paragraphs.length > 1) {
    return paragraphs.slice(0, -1).join('\n\n') + '\n\n';
  }
  
  // 无法安全截断，返回原文
  return content;
};

/**
 * 从Stage 1的大纲中解析出章节信息
 */
const parseChapterOutlines = (
  stage1Result: string,
  targetWordCount: number
): ChapterOutline[] => {
  const chapters: ChapterOutline[] = [];
  
  let estimatedChapterCount: number;
  
  if (targetWordCount <= 10000) {
    // 短篇：3-5章
    estimatedChapterCount = Math.max(3, Math.min(5, Math.ceil(targetWordCount / 2500)));
  } else if (targetWordCount <= 20000) {
    // 中篇：5-8章
    estimatedChapterCount = Math.max(5, Math.min(8, Math.ceil(targetWordCount / 2500)));
  } else {
    // 长篇：按每章3000-4000字计算，最多50章
    estimatedChapterCount = Math.min(50, Math.ceil(targetWordCount / 3500));
  }
  
  // 🔥 严格计算每章字数，确保总和接近目标字数
  const wordsPerChapter = Math.ceil(targetWordCount / estimatedChapterCount);
  
  console.log(`[parseChapterOutlines] 目标字数: ${targetWordCount}, 预计章节数: ${estimatedChapterCount}, 每章约: ${wordsPerChapter}字`);
  console.log(`[parseChapterOutlines] 字数验证: ${estimatedChapterCount}章 × ${wordsPerChapter}字 = ${estimatedChapterCount * wordsPerChapter}字 (目标: ${targetWordCount}字)`);
  
  // 尝试从大纲中提取章节标题和摘要
  // 格式可能是："第1章：xxx" 或 "第一章：xxx" 或 "Chapter 1: xxx"
  const chapterRegex = /(?:第[一二三四五六七八九十\d]+章|Chapter\s+\d+)[：:]\s*(.+?)(?=\n|$)/g;
  let match;
  let chapterNumber = 1;
  
  while ((match = chapterRegex.exec(stage1Result)) !== null) {
    const title = match[1].trim();
    
    chapters.push({
      chapterNumber: chapterNumber++,
      title: title || `第${chapterNumber - 1}章`,
      summary: '', // TODO: 从大纲中提取本章摘要
      targetWordCount: wordsPerChapter, // 🔥 每章使用计算出的目标字数
      status: 'pending',
    });
  }
  
  // 如果没有检测到章节，创建默认章节
  if (chapters.length === 0) {
    console.log(`[parseChapterOutlines] 未检测到章节标记，创建 ${estimatedChapterCount} 个默认章节`);
    
    for (let i = 1; i <= estimatedChapterCount; i++) {
      chapters.push({
        chapterNumber: i,
        title: `第${i}章`,
        summary: '',
        targetWordCount: wordsPerChapter, // 🔥 每章使用计算出的目标字数
        status: 'pending',
      });
    }
  } else {
    console.log(`[parseChapterOutlines] 从大纲中解析出 ${chapters.length} 个章节`);
  }
  
  // 🔥 验证总字数是否合理
  const totalPlannedWords = chapters.reduce((sum, ch) => sum + ch.targetWordCount, 0);
  const wordDiff = Math.abs(totalPlannedWords - targetWordCount);
  const wordDiffPercent = (wordDiff / targetWordCount * 100).toFixed(1);
  
  console.log(`[parseChapterOutlines] 📊 字数验证:`);
  console.log(`   - 规划总字数: ${totalPlannedWords}字`);
  console.log(`   - 目标总字数: ${targetWordCount}字`);
  console.log(`   - 差异: ${wordDiff}字 (${wordDiffPercent}%)`);
  
  if (parseFloat(wordDiffPercent) > 10) {
    console.warn(`[parseChapterOutlines] ⚠️ 警告：规划总字数与目标字数差异超过10%！`);
  }
  
  return chapters;
};

/**
 * 获取前几章的摘要作为上下文
 */
const getPreviousChaptersContext = async (
  workId: string,
  currentChapter: number,
  maxChapters: number = 3
): Promise<string> => {
  const store = useStore.getState();
  const currentWork = store.works.find(w => w.id === workId);
  
  if (!currentWork || !currentWork.chapters) {
    return '';
  }
  
  const previousChapters = currentWork.chapters
    .filter((ch: Chapter) => ch.chapterNumber < currentChapter)
    .sort((a: Chapter, b: Chapter) => a.chapterNumber - b.chapterNumber)
    .slice(-maxChapters);
  
  if (previousChapters.length === 0) {
    return '';
  }
  
  const context = previousChapters.map((ch: Chapter) => 
    `【第${ch.chapterNumber}章摘要】${ch.summary || ch.content.substring(0, 200)}...`
  ).join('\n\n');
  
  return context;
};

export const useChapterGeneration = () => {
  const { config, generation, setGeneration, works, setWorks } = useStore();
  const { buildStage2Prompt, buildStage3Prompt } = usePromptBuilder();
  const { retrieveMemory, addChapterMemory } = useMemory();

  /**
   * 生成单个章节
   */
  const generateChapter = useCallback(async (
    workId: string,
    chapterOutline: ChapterOutline,
    params: GenerationParams,
    abortSignal: AbortSignal,
    onProgress?: (progress: number) => void
  ): Promise<Chapter | null> => {
    console.log(`[ChapterGen] 开始生成第${chapterOutline.chapterNumber}章: ${chapterOutline.title}`);
    console.log(`[ChapterGen]   - 目标字数: ${chapterOutline.targetWordCount}字`);
    console.log(`[ChapterGen]   - 允许范围: ${Math.floor(chapterOutline.targetWordCount * 0.8)}-${Math.floor(chapterOutline.targetWordCount * 1.2)}字`);
    
    const targetWords = chapterOutline.targetWordCount;
    const stage2Model = getActiveModel(config.stage2);
    const stage3Model = getActiveModel(config.stage3);
    
    // 获取前文上下文
    const previousContext = await getPreviousChaptersContext(workId, chapterOutline.chapterNumber);
    
    // Stage 2: 生成本章正文（多轮）
    console.log(`[ChapterGen] Stage 2: 生成第${chapterOutline.chapterNumber}章正文...`);
    let chapterContent = '';
    let totalGeneratedWords = 0;
    
    // 🔥 动态计算循环次数：根据章节目标字数调整
    const cycles = CYCLE_CONFIG.stage2.getCycles(targetWords);
    console.log(`[ChapterGen]   - 目标字数: ${targetWords}, 使用 ${cycles} 轮循环`);
    
    for (let i = 0; i < cycles; i++) {
      // Check if generation should be aborted
      if (abortSignal?.aborted || !useStore.getState().generation.isGenerating) {
        console.log('[ChapterGen] 用户取消生成');
        return null;
      }
      
      // 🔥 严格检查字数上限（目标字数的120%）
      const maxAcceptableWords = Math.floor(targetWords * 1.2);
      const minAcceptableWords = Math.floor(targetWords * 0.8);
      
      if (totalGeneratedWords >= maxAcceptableWords) {
        console.log(`[ChapterGen] ⚠️ 已达到字数上限 (${totalGeneratedWords}/${maxAcceptableWords})，停止生成`);
        break;
      }
      
      // 动态计算本轮目标字数
      const remainingCycles = cycles - i;
      const remainingTargetWords = targetWords - totalGeneratedWords;
      const dynamicWordsPerCycle = Math.ceil(remainingTargetWords / remainingCycles);
      
      console.log(`[ChapterGen] 第${chapterOutline.chapterNumber}章 - 第${i + 1}/${cycles}轮:`);
      console.log(`  - 本轮目标: ${dynamicWordsPerCycle} 字`);
      console.log(`  - 已生成: ${totalGeneratedWords} 字`);
      console.log(`  - 剩余目标: ${remainingTargetWords} 字`);
      console.log(`  - 允许范围: ${minAcceptableWords}-${maxAcceptableWords} 字`);
      
      // 检索相关记忆
      let relatedMemory = '';
      if (chapterContent.length > 100) {
        const recentContext = chapterContent.slice(-500);
        const memoryQuery = `${params.topic} ${recentContext}`;
        relatedMemory = await retrieveMemory(memoryQuery, 5);
      } else if (previousContext) {
        relatedMemory = previousContext;
      }
      
      // 构建 Prompt - 🔥 传入本章目标字数和实际循环次数
      const chapterParams = {
        ...params,
        wordCount: targetWords, // 🔥 关键修改：使用本章目标字数，而不是总字数
      };
      
      const cyclePrompt = i === 0
        ? buildStage2Prompt(
            `【本章大纲】${chapterOutline.title}\n${chapterOutline.summary}`,
            chapterParams, // 🔥 使用本章参数
            totalGeneratedWords,
            relatedMemory,
            cycles // 🔥 传递实际循环次数
          )
        : `${buildStage2Prompt(
            `【本章大纲】${chapterOutline.title}\n${chapterOutline.summary}`,
            chapterParams, // 🔥 使用本章参数
            totalGeneratedWords,
            relatedMemory,
            cycles // 🔥 传递实际循环次数
          )}\n\n已经写到这里：\n${chapterContent}\n\n请继续完善和补充。`;
      
      const cycleResult = await callModelSafe(cyclePrompt, stage2Model, abortSignal);
      
      if (cycleResult === null) {
        console.log('[ChapterGen] Stage 2 被用户取消');
        return null;
      }
      
      chapterContent += cycleResult;
      totalGeneratedWords += cycleResult.length;
      
      const progress = ((i + 1) / cycles) * 70; // Stage 2 占70%进度
      onProgress?.(progress);
      
      console.log(`  - 累计字数: ${totalGeneratedWords}/${targetWords} (${(totalGeneratedWords/targetWords*100).toFixed(1)}%)`);
    }
    
    // 🔥 严格字数控制：确保在80%-120%范围内
    const minAcceptableWords = Math.floor(targetWords * 0.8);
    const maxAcceptableWords = Math.floor(targetWords * 1.2);
    
    console.log(`[ChapterGen] 📊 Stage 2 完成后的字数检查:`);
    console.log(`   - 实际生成: ${totalGeneratedWords}字`);
    console.log(`   - 目标字数: ${targetWords}字`);
    console.log(`   - 允许范围: ${minAcceptableWords}-${maxAcceptableWords}字`);
    
    // 🔥 如果超过上限，强制截断
    if (totalGeneratedWords > maxAcceptableWords) {
      console.warn(`[ChapterGen] ⚠️ 字数超出上限 (${totalGeneratedWords}/${maxAcceptableWords})，进行智能截断...`);
      
      // 尝试在完整句子处截断
      const truncatedContent = truncateToCompleteSentence(chapterContent.substring(0, maxAcceptableWords));
      chapterContent = truncatedContent;
      totalGeneratedWords = truncatedContent.length;
      
      console.log(`[ChapterGen] ✅ 截断后字数: ${totalGeneratedWords}/${targetWords} (${(totalGeneratedWords/targetWords*100).toFixed(1)}%)`);
    }
    
    // 🔥 如果低于下限，触发续写
    let retryCount = 0;
    const maxRetries = 2; // 最多续写2次
    
    while (totalGeneratedWords < minAcceptableWords && retryCount < maxRetries) {
      retryCount++;
      console.log(`[ChapterGen] 🔄 字数不足 (${totalGeneratedWords}/${minAcceptableWords})，第${retryCount}次续写...`);
      
      const remainingWords = minAcceptableWords - totalGeneratedWords;
      const recentContext = chapterContent.slice(-500);
      const memoryQuery = `${params.topic} ${recentContext}`;
      const relatedMemory = await retrieveMemory(memoryQuery, 5);
      
      // 🔥 分析内容质量，针对性续写
      const analysis = analyzeContentQuality(chapterContent);
      const continuePrompt = generateTargetedContinuationPrompt(
        chapterContent,
        analysis,
        remainingWords
      );
      
      const continueResult = await callModelSafe(continuePrompt, stage2Model, abortSignal);
      
      if (continueResult === null) {
        console.log('[ChapterGen] 续写被取消');
        break;
      }
      
      chapterContent += continueResult;
      totalGeneratedWords += continueResult.length;
      
      console.log(`[ChapterGen]   - 续写后字数: ${totalGeneratedWords}/${targetWords} (${(totalGeneratedWords/targetWords*100).toFixed(1)}%)`);
      
      // 如果已经达到要求，停止续写
      if (totalGeneratedWords >= minAcceptableWords) {
        console.log(`[ChapterGen] ✅ 字数已达标，停止续写`);
        break;
      }
    }
    
    if (retryCount > 0) {
      console.log(`[ChapterGen] 📊 续写总结: 共续写${retryCount}次，最终字数 ${totalGeneratedWords}/${targetWords} (${(totalGeneratedWords/targetWords*100).toFixed(1)}%)`);
    }
    
    // Stage 3: 润色本章
    console.log(`[ChapterGen] Stage 3: 润色第${chapterOutline.chapterNumber}章...`);
    let polishedContent = chapterContent;
    const polishCycles = 2;
    
    for (let i = 0; i < polishCycles; i++) {
      if (abortSignal?.aborted || !useStore.getState().generation.isGenerating) {
        console.log('[ChapterGen] Stage 3 被用户取消');
        return null;
      }
      
      console.log(`[ChapterGen] Stage 3 - 第${i + 1}/${polishCycles}轮润色...`);
      
      const relatedMemory = await retrieveMemory(`${params.topic} ${polishedContent.substring(0, 500)}`, 3);
      const polishPrompt = buildStage3Prompt(polishedContent, params, relatedMemory);
      
      const polishResult = await callModelSafe(polishPrompt, stage3Model, abortSignal);
      
      if (polishResult === null) {
        console.log('[ChapterGen] Stage 3 被用户取消');
        return null;
      }
      
      // 🔥 修复：Stage 3应该替换内容，而不是累加
      // buildStage3Prompt返回的是完整润色后的内容，不是增量
      polishedContent = polishResult;
      
      console.log(`[ChapterGen]   - 润色后字数: ${polishedContent.length}字`);
      
      const progress = 70 + ((i + 1) / polishCycles) * 30; // Stage 3 占30%进度
      onProgress?.(progress);
    }
    
    // 🔥 验证Stage 3后的字数是否仍然在合理范围内
    const finalWordCount = polishedContent.length;
    
    console.log(`[ChapterGen] 📊 Stage 3 完成后的字数检查:`);
    console.log(`   - 实际字数: ${finalWordCount}字`);
    console.log(`   - 目标字数: ${targetWords}字`);
    console.log(`   - 允许范围: ${minAcceptableWords}-${maxAcceptableWords}字`);
    
    // 如果Stage 3导致字数超标，进行截断
    if (finalWordCount > maxAcceptableWords) {
      console.warn(`[ChapterGen] ⚠️ Stage 3后字数超出上限 (${finalWordCount}/${maxAcceptableWords})，进行智能截断...`);
      const truncatedContent = truncateToCompleteSentence(polishedContent.substring(0, maxAcceptableWords));
      polishedContent = truncatedContent;
      
      console.log(`[ChapterGen] ✅ 截断后字数: ${polishedContent.length}字`);
    }
    
    // 🔥 清理生成内容，移除元信息
    console.log(`[ChapterGen] 🧹 开始清理第${chapterOutline.chapterNumber}章内容...`);
    const originalLength = polishedContent.length;
    polishedContent = cleanGeneratedContent(polishedContent);
    const cleanedLength = polishedContent.length;
    console.log(`[ChapterGen] ✅ 清理完成: ${originalLength}字 → ${cleanedLength}字 (移除 ${originalLength - cleanedLength} 字元信息)`);
    
    // 创建章节对象
    const chapter: Chapter = {
      id: `chapter_${workId}_${chapterOutline.chapterNumber}`,
      workId,
      chapterNumber: chapterOutline.chapterNumber,
      title: chapterOutline.title,
      summary: chapterOutline.summary || polishedContent.substring(0, 200),
      content: polishedContent,
      wordCount: polishedContent.length,
      stageData: {
        stage: 2,
        input: params,
        output: polishedContent,
        cycleResults: [],
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    
    console.log(`[ChapterGen] ✅ 第${chapterOutline.chapterNumber}章生成完成: ${polishedContent.length}字`);
    
    // 🔥 保存章节到后端数据库
    try {
      console.log(`[ChapterGen] 💾 开始保存第${chapterOutline.chapterNumber}章到数据库...`);
      
      const response = await fetch(`/api/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workId: workId, // 🔥 作品ID作为请求体参数
          chapter_number: chapterOutline.chapterNumber,
          title: chapterOutline.title,
          content: polishedContent,
          word_count: polishedContent.length,
          status: 'completed',
          summary: chapterOutline.summary || polishedContent.substring(0, 200),
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[ChapterGen] ❌ API 响应错误:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || data.details || 'Unknown error');
      }
      
      console.log(`[ChapterGen] 💾 章节已保存到数据库: ${data.chapter.id}`);
      
      // 🔥 同步更新 Store 中的作品 chapters
      const store = useStore.getState();
      const currentWork = store.works.find(w => w.id === workId);
      
      if (currentWork) {
        const updatedChapters = [...(currentWork.chapters || []), chapter];
        const updatedWorks = store.works.map((w: Work) => 
          w.id === workId 
            ? { ...w, chapters: updatedChapters, actualWordCount: w.actualWordCount + polishedContent.length }
            : w
        );
        
        useStore.setState({ works: updatedWorks });
        console.log(`[ChapterGen] 🔄 Store 已同步: ${updatedChapters.length} 章, 总字数 ${updatedWorks.find(w => w.id === workId)?.actualWordCount}`);
      }
    } catch (error) {
      console.error('[ChapterGen] ❌ 保存章节失败:', error);
      // 不阻断流程，继续执行
    }
    
    // 保存章节记忆
    await addChapterMemory(
      `chapter_${workId}_${chapterOutline.chapterNumber}`,
      `第${chapterOutline.chapterNumber}章: ${chapterOutline.title}`,
      polishedContent,
      chapterOutline.summary || '本章内容'
    );
    
    return chapter;
  }, [config, buildStage2Prompt, buildStage3Prompt, retrieveMemory, addChapterMemory]);

  /**
   * 逐章生成完整作品
   */
  const startChapterGeneration = useCallback(async (params: GenerationParams, workId?: string) => {
    if (generation.isGenerating) {
      console.warn('[ChapterGen] 已有生成任务在进行中');
      return;
    }
    
    // Create an AbortController for this generation session
    const abortController = new AbortController();
    
    try {
      // 🔥 正确初始化生成状态
      setGeneration({
        isGenerating: true,
        isGeneratingStage: 1, // 🔥 添加这个字段
        currentStage: 1,
        currentCycle: 0,
        completedCycles: 0,
        stage1Result: '',
        stage2Result: '',
        stage3Result: '',
        cycleResults: [],
        error: null,
      });
      
      // Stage 1: 生成大纲
      console.log('[ChapterGen] Stage 1: 生成作品大纲...');
      console.log('[ChapterGen] ⚠️ 注意：逐章生成模式中 Stage 1 只有1次调用，不进行循环');
      
      const stage1Model = getActiveModel(config.stage1);
      const { buildStage1Prompt } = usePromptBuilder();
      const stage1Prompt = buildStage1Prompt(params);
      
      console.log('[ChapterGen]   - 调用模型生成大纲...');
      const stage1Result = await callModelSafe(stage1Prompt, stage1Model, abortController.signal);
      
      if (stage1Result === null) {
        console.warn('[ChapterGen] ⚠️ Stage 1 返回 null，可能是：');
        console.warn('   1. 用户主动取消（跳转页面）');
        console.warn('   2. API 请求被中止');
        console.warn('   3. 网络错误');
        console.log('[ChapterGen] 当前 abortController.signal.aborted:', abortController.signal.aborted);
        console.log('[ChapterGen] 当前 isGenerating:', useStore.getState().generation.isGenerating);
        
        setGeneration({ isGenerating: false, isGeneratingStage: null });
        return;
      }
      
      console.log(`[ChapterGen] ✅ Stage 1 完成，生成 ${stage1Result.length} 字`);
      console.log('[ChapterGen] ✅ Stage 1 完成，开始设置状态...');
      setGeneration({
        stage1Result,
        currentStage: 1, // 🔥 currentStage=1 表示大纲生成阶段
        currentCycle: 1,
        completedCycles: 0, // 🔥 逐章生成模式下，completedCycles 表示已完成的章节数，初始为0
        isGeneratingStage: 1, // 🔥 明确标记当前在Stage 1
      });
      
      console.log('[ChapterGen] ✅ 状态已设置，开始解析章节大纲...');
      // 解析章节大纲
      const chapterOutlines = parseChapterOutlines(stage1Result, params.wordCount);
      console.log(`[ChapterGen] 📊 解析出 ${chapterOutlines.length} 个章节`);
      
      if (chapterOutlines.length === 0) {
        console.error('[ChapterGen] ❌ 错误：未能解析出任何章节！');
        console.error('[ChapterGen] Stage 1 返回内容:', stage1Result.substring(0, 500));
        setGeneration({
          isGenerating: false,
          isGeneratingStage: null,
          error: '未能解析出章节大纲，请检查 Stage 1 的输出格式',
        });
        return;
      }
      
      // 🔥 根据用户设置的 initialChapters 限制实际生成的章节数
      const maxChaptersToGenerate = params.initialChapters || chapterOutlines.length;
      const actualChaptersToGenerate = Math.min(maxChaptersToGenerate, chapterOutlines.length);
      
      console.log(`[ChapterGen] 📊 章节生成计划:`);
      console.log(`   - Stage 1 解析出章节数: ${chapterOutlines.length}`);
      console.log(`   - 用户设置初始章节数: ${params.initialChapters || '未设置(使用全部)'}`);
      console.log(`   - 实际将生成章节数: ${actualChaptersToGenerate}`);
      
      if (actualChaptersToGenerate < chapterOutlines.length) {
        console.log(`[ChapterGen] ⚠️ 注意：只生成前 ${actualChaptersToGenerate} 章，剩余章节可后续续写`);
      }
      
      // 🔥 处理作品ID：如果传入了 workId 就使用，否则创建新作品
      let finalWorkId = workId;
      
      if (finalWorkId) {
        // 🔥 作品ID已传入（从 useCycleGeneration），检查是否存在并更新章节数
        console.log('[ChapterGen] ✅ 使用传入的作品ID:', finalWorkId);
        
        const { updateWork, setCurrentWork } = useStore.getState();
        await updateWork(finalWorkId, {
          chapterCount: actualChaptersToGenerate, // 🔥 使用实际要生成的章节数
        });
        
        setCurrentWork(finalWorkId);
      } else {
        // 🔥 没有传入 workId，创建新作品
        console.log('[ChapterGen] 🆕 创建新作品记录');
        
        const { addWork, setCurrentWork } = useStore.getState();
        const savedWork = await addWork({
          id: '', // 🔥 空ID，让后端生成
          title: params.title || params.topic,
          topic: params.topic,
          keywords: params.keywords,
          type: params.type,
          expectedWordCount: params.wordCount,
          actualWordCount: 0,
          chapterCount: actualChaptersToGenerate, // 🔥 使用实际要生成的章节数
          status: 'generating' as const,
          chapters: [],
          characters: [],
          createdAt: Date.now(),
          updatedAt: Date.now(),
          generationParams: params,
        });
        
        // 🔥 使用后端返回的作品ID
        finalWorkId = savedWork.id;
        console.log('[ChapterGen] ✅ 作品已创建，ID:', finalWorkId);
        
        setCurrentWork(finalWorkId || null);
      }
      
      // 🔥 修复闭包陷阱：从 Store 获取最新状态，而不是使用闭包中的旧状态
      const latestGeneration = useStore.getState().generation;
      setGeneration({ 
        ...latestGeneration, 
        currentWorkId: finalWorkId || undefined,
        isGenerating: true,
        isGeneratingStage: 2,
        currentStage: 2, // 🔥 同时更新currentStage为2
      });
      
      // 🔥 如果传入的是已存在的作品ID（续写场景），保持状态为completed，不设置为generating
      // 只有新创建的作品才需要设置为generating
      if (!workId) {
        // 新作品：已在上面创建时设置为generating
        console.log('[ChapterGen] 🆕 新作品，状态已是generating');
      } else {
        // 续写场景：作品状态应保持为completed，只是内部章节在生成
        const { updateWork } = useStore.getState();
        await updateWork(finalWorkId!, {
          status: 'completed', // 🔥 续写时保持completed状态
        });
        console.log('[ChapterGen] 📝 续写场景，作品状态保持为completed');
      }
      
      // 生成章节
      const generatedChapters: Chapter[] = [];
      let totalWords = 0;
      
      console.log(`[ChapterGen] 📖 开始逐章生成，共 ${actualChaptersToGenerate} 章`);
      console.log(`[ChapterGen] 📊 章节详情:`, chapterOutlines.slice(0, actualChaptersToGenerate).map(ch => ({
        chapter: ch.chapterNumber,
        title: ch.title,
        targetWords: ch.targetWordCount,
      })));
      
      for (let i = 0; i < actualChaptersToGenerate; i++) {
        // Check if generation should be aborted
        const currentState = useStore.getState().generation;
        console.log(`[ChapterGen] 🔍 第 ${i + 1} 章开始前检查状态:`, {
          isGenerating: currentState.isGenerating,
          currentStage: currentState.currentStage,
          aborted: abortController.signal.aborted,
        });
        
        if (abortController.signal.aborted || !currentState.isGenerating) {
          console.warn('[ChapterGen] ⚠️ 用户中断生成或状态异常');
          console.warn('[ChapterGen]   - abortController.aborted:', abortController.signal.aborted);
          console.warn('[ChapterGen]   - isGenerating:', currentState.isGenerating);
          console.log(`[ChapterGen] 📊 已生成 ${generatedChapters.length} 章, 总字数 ${totalWords}`);
          if (!abortController.signal.aborted) abortController.abort();
          break;
        }
        
        const outline = chapterOutlines[i];
        outline.status = 'generating';
        
        console.log(`[ChapterGen] 🚀 开始生成第 ${i + 1}/${actualChaptersToGenerate} 章: ${outline.title} (目标: ${outline.targetWordCount}字)`);
        
        // 🔥 更新章节状态和进度
        setGeneration({
          currentStage: 2,
          currentCycle: i + 1,
          completedCycles: i, // 🔥 使用i而不是i+1，表示已完成的章节数
          isGeneratingStage: 2,
        });
        
        // 生成单章
        const chapter = await generateChapter(
          finalWorkId,
          outline,
          params,
          abortController.signal,
          (progress: number) => {
            // 🔥 章节内部进度更新
            setGeneration({
              currentStage: 2,
              currentCycle: i + 1,
              completedCycles: i,
              isGeneratingStage: 2,
            });
          }
        );
        
        if (chapter) {
          generatedChapters.push(chapter);
          totalWords += chapter.wordCount;
          outline.status = 'completed';
          
          // 🔥 更新进度：章节完成后更新completedCycles
          setGeneration({
            currentStage: 2,
            currentCycle: i + 1,
            completedCycles: i + 1, // 🔥 完成后更新为i+1
            isGeneratingStage: 2,
          });
          
          // 🔥 实时更新 Store 中的作品信息
          const store = useStore.getState();
          const updatedWorks = store.works.map((w: Work) => 
            w.id === finalWorkId 
              ? { 
                  ...w, 
                  chapters: [...generatedChapters], // 使用展开运算符创建新数组
                  actualWordCount: totalWords,
                  updatedAt: Date.now(),
                }
              : w
          );
          
          setWorks(updatedWorks);
          
          console.log(`[ChapterGen] 📊 进度: ${i + 1}/${actualChaptersToGenerate} 章, 本章 ${chapter.wordCount}字, 累计 ${totalWords} 字`);
        } else {
          // If chapter generation returned null, it might have been cancelled
          if (abortController.signal.aborted || !useStore.getState().generation.isGenerating) {
             if (!abortController.signal.aborted) abortController.abort();
             break;
          }
          
          outline.status = 'failed';
          console.error(`[ChapterGen] 第${outline.chapterNumber}章生成失败`);
        }
      }
      
      // 生成完成
      console.log(`\n[ChapterGen] ════════════════════════════════════════`);
      console.log(`[ChapterGen] ✅ 作品生成完成！`);
      console.log(`[ChapterGen] ════════════════════════════════════════`);
      console.log(`[ChapterGen] 📊 最终统计:`);
      console.log(`   - 目标章节数: ${chapterOutlines.length}`);
      console.log(`   - 实际生成章节数: ${generatedChapters.length}`);
      console.log(`   - 章节完成率: ${((generatedChapters.length / chapterOutlines.length) * 100).toFixed(1)}%`);
      console.log(`   - 目标总字数: ${params.wordCount.toLocaleString()}`);
      console.log(`   - 实际总字数: ${totalWords.toLocaleString()}`);
      console.log(`   - 字数完成率: ${((totalWords / params.wordCount) * 100).toFixed(1)}%`);
      console.log(`   - 平均每章字数: ${generatedChapters.length > 0 ? Math.round(totalWords / generatedChapters.length).toLocaleString() : 0}`);
      
      // 🔥 详细章节统计
      if (generatedChapters.length > 0) {
        console.log(`\n[ChapterGen] 📖 各章节详情:`);
        generatedChapters.forEach((ch, idx) => {
          const targetWords = ch.chapterNumber <= chapterOutlines.length 
            ? chapterOutlines[ch.chapterNumber - 1]?.targetWordCount || 0 
            : 0;
          const completionRate = targetWords > 0 ? ((ch.wordCount / targetWords) * 100).toFixed(1) : 'N/A';
          const status = ch.wordCount >= targetWords * 0.9 ? '✅' : ch.wordCount >= targetWords * 0.7 ? '⚠️' : '❌';
          
          console.log(`   ${status} 第${ch.chapterNumber}章: ${ch.title.substring(0, 20)}...`);
          console.log(`      目标: ${targetWords.toLocaleString()}字 | 实际: ${ch.wordCount.toLocaleString()}字 | 完成率: ${completionRate}%`);
        });
      }
      
      console.log(`[ChapterGen] ════════════════════════════════════════\n`);
      
      // 🔥 更新进度：开始整体打磨
      setGeneration({
        currentStage: 3,
        completedCycles: actualChaptersToGenerate,
      });
      
      // 🔥 新增：所有章节生成完成后，执行整体Stage 3打磨
      console.log(`[ChapterGen] 🌟 开始执行整体Stage 3：全文打磨...`);
      
      try {
        // 获取全文内容
        const fullContent = generatedChapters
          .map(ch => `# 第${ch.chapterNumber}章：${ch.title}\n\n${ch.content}`)
          .join('\n\n---\n\n');
        
        console.log(`[ChapterGen]   - 全文总字数: ${fullContent.length}字`);
        
        // 分段打磨（避免一次性处理太长内容）
        const stage3Model = getActiveModel(config.stage3);
        const polishedChapters = [];
        
        for (let i = 0; i < generatedChapters.length; i++) {
          const chapter = generatedChapters[i];
          
          if (abortController.signal.aborted || !useStore.getState().generation.isGenerating) {
            console.log('[ChapterGen] 整体打磨被用户取消');
            break;
          }
          
          console.log(`[ChapterGen]   - 打磨第${chapter.chapterNumber}章...`);
          
          // 获取前后章节作为上下文
          const prevChapter = i > 0 ? generatedChapters[i - 1] : null;
          const nextChapter = i < generatedChapters.length - 1 ? generatedChapters[i + 1] : null;
          
          let context = '';
          if (prevChapter) {
            context += `【前一章摘要】${prevChapter.content.substring(0, 300)}...\n\n`;
          }
          if (nextChapter) {
            context += `【后一章摘要】${nextChapter.content.substring(0, 300)}...\n\n`;
          }
          
          const relatedMemory = await retrieveMemory(`${params.topic} ${chapter.content.substring(0, 500)}`, 3);
          const polishPrompt = buildStage3Prompt(
            chapter.content,
            params,
            relatedMemory + '\n\n' + context
          );
          
          const polishResult = await callModelSafe(polishPrompt, stage3Model, abortController.signal);
          
          if (polishResult === null) {
            console.log(`[ChapterGen]   - 第${chapter.chapterNumber}章打磨被取消`);
            polishedChapters.push(chapter);
            continue;
          }
          
          // 验证打磨后的字数
          const polishedWordCount = polishResult.length;
          const targetWordCount = chapter.wordCount;
          const maxAllowed = Math.floor(targetWordCount * 1.2);
          
          let finalContent = polishResult;
          if (polishedWordCount > maxAllowed) {
            console.warn(`[ChapterGen]   - 第${chapter.chapterNumber}章打磨后字数超标 (${polishedWordCount}/${maxAllowed})，截断...`);
            finalContent = truncateToCompleteSentence(polishResult.substring(0, maxAllowed));
          }
          
          polishedChapters.push({
            ...chapter,
            content: finalContent,
            wordCount: finalContent.length,
            updatedAt: Date.now(),
          });
          
          console.log(`[ChapterGen]   - ✅ 第${chapter.chapterNumber}章打磨完成: ${finalContent.length}字`);
        }
        
        // 更新生成的章节列表
        if (polishedChapters.length > 0) {
          generatedChapters.length = 0;
          generatedChapters.push(...polishedChapters);
          
          // 更新总字数
          totalWords = polishedChapters.reduce((sum, ch) => sum + ch.wordCount, 0);
          
          console.log(`[ChapterGen] ✅ 整体打磨完成，更新章节列表`);
        }
        
        // 更新进度：整体打磨完成
        setGeneration({
          currentStage: 4,
          completedCycles: actualChaptersToGenerate,
        });
      } catch (error) {
        console.error('[ChapterGen] 整体打磨失败:', error);
        // 即使打磨失败，也继续使用原有章节
      }
      
      const finalWorks = works.map((w: Work) => 
        w.id === finalWorkId 
          ? { ...w, status: 'completed' as const, actualWordCount: totalWords }
          : w
      );
      setWorks(finalWorks);
      
      setGeneration({
        isGenerating: false,
        currentStage: undefined,
        currentCycle: 0,
        completedCycles: chapterOutlines.length,
        stage1Result,
        stage2Result: generatedChapters.map(ch => ch.content).join('\n\n'),
      });
      
      console.log(`[ChapterGen] ✅ 作品生成完成: ${generatedChapters.length}章, ${totalWords}字`);
      
    } catch (error) {
      console.error('[ChapterGen] 生成失败:', error);
      setGeneration({
        isGenerating: false,
        isGeneratingStage: null,
      });
    }
  }, [generation.isGenerating, config, works, setGeneration, setWorks, generateChapter]);

  return {
    startChapterGeneration,
    generateChapter,
  };
};
