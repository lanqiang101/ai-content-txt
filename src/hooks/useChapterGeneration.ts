import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { callModelSafe, getActiveModel } from './useModelCall';
import { usePromptBuilder, cleanGeneratedContent } from './usePromptBuilder'; // 🔥 导入清理函数
import { useMemory } from './useMemory';
import { GenerationParams, ChapterOutline, Chapter, Work } from '../types';
import { CYCLE_CONFIG, analyzeContentQuality, generateTargetedContinuationPrompt } from './constants'; // 🔥 导入智能分析工具

/**
 * 解析大纲，提取章节信息
 */
const parseChapterOutlines = (stage1Result: string, targetWordCount: number): ChapterOutline[] => {
  const chapters: ChapterOutline[] = [];
  
  // 🔥 根据目标字数智能计算章节数
  // 长篇小说：每章建议 2000-3000 字
  const MIN_WORDS_PER_CHAPTER = 2000;
  const MAX_WORDS_PER_CHAPTER = 3000;
  
  let estimatedChapterCount: number;
  
  if (targetWordCount <= 10000) {
    // 短篇：3-5章
    estimatedChapterCount = Math.max(3, Math.min(5, Math.ceil(targetWordCount / 2500)));
  } else if (targetWordCount <= 20000) {
    // 中篇：5-8章
    estimatedChapterCount = Math.max(5, Math.min(8, Math.ceil(targetWordCount / 2500)));
  } else {
    // 长篇：按每章2500字计算，最多50章
    estimatedChapterCount = Math.min(50, Math.ceil(targetWordCount / 2500));
  }
  
  const wordsPerChapter = Math.ceil(targetWordCount / estimatedChapterCount);
  
  console.log(`[parseChapterOutlines] 目标字数: ${targetWordCount}, 预计章节数: ${estimatedChapterCount}, 每章约: ${wordsPerChapter}字`);
  
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
      targetWordCount: wordsPerChapter,
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
        targetWordCount: wordsPerChapter,
        status: 'pending',
      });
    }
  } else {
    console.log(`[parseChapterOutlines] 从大纲中解析出 ${chapters.length} 个章节`);
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
      
      // 动态计算本轮目标字数
      const remainingCycles = cycles - i;
      const remainingTargetWords = targetWords - totalGeneratedWords;
      const dynamicWordsPerCycle = Math.ceil(remainingTargetWords / remainingCycles);
      
      console.log(`[ChapterGen] 第${chapterOutline.chapterNumber}章 - 第${i + 1}/${cycles}轮:`);
      console.log(`  - 本轮目标: ${dynamicWordsPerCycle} 字`);
      console.log(`  - 已生成: ${totalGeneratedWords} 字`);
      
      // 检索相关记忆
      let relatedMemory = '';
      if (chapterContent.length > 100) {
        const recentContext = chapterContent.slice(-500);
        const memoryQuery = `${params.topic} ${recentContext}`;
        relatedMemory = await retrieveMemory(memoryQuery, 5);
      } else if (previousContext) {
        relatedMemory = previousContext;
      }
      
      // 构建 Prompt
      const cyclePrompt = i === 0
        ? buildStage2Prompt(
            `【本章大纲】${chapterOutline.title}\n${chapterOutline.summary}`,
            { ...params, wordCount: dynamicWordsPerCycle },
            totalGeneratedWords,
            relatedMemory
          )
        : `${buildStage2Prompt(
            `【本章大纲】${chapterOutline.title}\n${chapterOutline.summary}`,
            { ...params, wordCount: dynamicWordsPerCycle },
            totalGeneratedWords,
            relatedMemory
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
    
    // 🔥 自动续写机制：如果字数不足目标的85%，触发智能续写
    const minAcceptableWords = Math.floor(targetWords * 0.85);
    let retryCount = 0;
    const maxRetries = 2; // 最多续写2次
    
    while (totalGeneratedWords < minAcceptableWords && retryCount < maxRetries) {
      retryCount++;
      const remainingWords = targetWords - totalGeneratedWords;
      console.warn(`[ChapterGen] ⚠️ 字数不足 (${totalGeneratedWords}/${minAcceptableWords})，触发第${retryCount}次智能续写...`);
      console.log(`[ChapterGen]   - 还需补充: ${remainingWords} 字`);
      
      // 🔥 智能分析内容质量
      const analysis = analyzeContentQuality(chapterContent);
      console.log(`[ChapterGen] 📊 内容质量分析:`);
      console.log(`   - 平均段落长度: ${Math.round(analysis.avgParagraphLength)} 字`);
      console.log(`   - 对话比例: ${(analysis.dialogueRatio * 100).toFixed(1)}%`);
      console.log(`   - 描写比例: ${(analysis.descriptionRatio * 100).toFixed(1)}%`);
      console.log(`   - 动作比例: ${(analysis.actionRatio * 100).toFixed(1)}%`);
      console.log(`   - 薄弱环节: ${analysis.weakSectionTypes.join(', ') || '无明显薄弱'}`);
      
      // 🔥 生成针对性的续写 Prompt
      const continuePrompt = generateTargetedContinuationPrompt(
        chapterContent,
        analysis,
        remainingWords
      );

      const continueResult = await callModelSafe(continuePrompt, stage2Model, abortSignal);
      
      if (continueResult === null) {
        console.log('[ChapterGen] 续写被用户取消');
        break;
      }
      
      const actualAddedWords = continueResult.length;
      chapterContent += '\n\n' + continueResult;
      totalGeneratedWords += actualAddedWords;
      
      console.log(`[ChapterGen] ✅ 第${retryCount}次续写成功: +${actualAddedWords}字`);
      console.log(`[ChapterGen]   - 当前总字数: ${totalGeneratedWords}/${targetWords} (${(totalGeneratedWords/targetWords*100).toFixed(1)}%)`);
      
      // 如果已经达到目标，提前退出
      if (totalGeneratedWords >= targetWords * 0.95) {
        console.log('[ChapterGen] ✅ 字数已达标，停止续写');
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
      if (abortSignal?.aborted || !useStore.getState().generation.isGenerating) return null;
      
      const relatedMemory = await retrieveMemory(`${params.topic} ${chapterContent.substring(0, 500)}`, 3);
      const polishPrompt = buildStage3Prompt(polishedContent, params, relatedMemory);
      
      const polishResult = await callModelSafe(polishPrompt, stage3Model, abortSignal);
      if (polishResult === null) return null;
      
      polishedContent += polishResult;
      
      const progress = 70 + ((i + 1) / polishCycles) * 30; // Stage 3 占30%进度
      onProgress?.(progress);
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
        currentStage: 1,
        currentCycle: 1,
        completedCycles: 0, // 🔥 逐章生成模式下，completedCycles 表示已完成的章节数，初始为0
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
      
      // 🔥 处理作品ID：如果传入了 workId 就使用，否则创建新作品
      let finalWorkId = workId;
      
      if (finalWorkId) {
        // 🔥 作品ID已传入（从 useCycleGeneration），检查是否存在并更新章节数
        console.log('[ChapterGen] ✅ 使用传入的作品ID:', finalWorkId);
        
        const { updateWork, setCurrentWork } = useStore.getState();
        await updateWork(finalWorkId, {
          chapterCount: chapterOutlines.length,
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
          chapterCount: chapterOutlines.length,
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
        isGenerating: true, // 🔥 确保 isGenerating 为 true
        isGeneratingStage: 2, // 🔥 进入 Stage 2（逐章生成）
      });
      
      console.log('[ChapterGen] ✅ 作品记录已就绪，workId:', finalWorkId);
      console.log('[ChapterGen] 📊 当前 generation 状态:', {
        isGenerating: useStore.getState().generation.isGenerating,
        currentStage: useStore.getState().generation.currentStage,
        isGeneratingStage: useStore.getState().generation.isGeneratingStage,
        currentWorkId: useStore.getState().generation.currentWorkId,
      });
      
      // 🔥 确保 finalWorkId 存在
      if (!finalWorkId) {
        console.error('[ChapterGen] ❌ 错误：finalWorkId 为空');
        setGeneration({
          isGenerating: false,
          isGeneratingStage: null,
          error: '作品ID生成失败',
        });
        return;
      }
      
      // 逐章生成
      const generatedChapters: Chapter[] = [];
      let totalWords = 0;
      
      console.log(`[ChapterGen] 📖 开始逐章生成，共 ${chapterOutlines.length} 章`);
      console.log(`[ChapterGen] 📊 章节详情:`, chapterOutlines.map(ch => ({
        chapter: ch.chapterNumber,
        title: ch.title,
        targetWords: ch.targetWordCount,
      })));
      
      for (let i = 0; i < chapterOutlines.length; i++) {
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
        
        console.log(`[ChapterGen] 🚀 开始生成第 ${i + 1}/${chapterOutlines.length} 章: ${outline.title} (目标: ${outline.targetWordCount}字)`);
        
        // 更新章节状态
        setGeneration({
          currentStage: 2,
          currentCycle: i + 1,
          completedCycles: i + 1,
        });
        
        // 生成单章
        const chapter = await generateChapter(
          finalWorkId,
          outline,
          params,
          abortController.signal,
          (progress: number) => {
            setGeneration({
              currentStage: 2,
              currentCycle: i + 1,
              completedCycles: i + 1,
            });
          }
        );
        
        if (chapter) {
          generatedChapters.push(chapter);
          totalWords += chapter.wordCount;
          outline.status = 'completed';
          
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
          
          console.log(`[ChapterGen] 📊 进度: ${i + 1}/${chapterOutlines.length} 章, 本章 ${chapter.wordCount}字, 累计 ${totalWords} 字`);
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
