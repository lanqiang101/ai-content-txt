import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { callModelSafe, getActiveModel } from './useModelCall';
import { usePromptBuilder } from './usePromptBuilder';
import { useMemory } from './useMemory';
import { CYCLE_CONFIG } from './constants';
import { GenerationParams, CycleResult } from '../types';

/**
 * 内容完整性校验工具
 */
const validateContentIntegrity = (content: string): { isValid: boolean; issues: string[] } => {
  const issues: string[] = [];

  if (!content || content.length === 0) {
    return { isValid: false, issues: ['内容为空'] };
  }

  // 1. 检查句子完整性（结尾是否有完整标点）
  const trimmedEnd = content.trimEnd();
  const validEndings = ['。', '！', '？', '…', '"', '”', '」', '』'];
  const hasValidEnding = validEndings.some(ending => trimmedEnd.endsWith(ending));
  
  if (!hasValidEnding) {
    issues.push('内容可能不完整：结尾缺少标点符号');
  }

  // 2. 检查引号是否成对
  const doubleQuotes = (content.match(/"/g) || []).length;
  const chineseDoubleQuotes = (content.match(/[""]/g) || []).length;
  if (doubleQuotes % 2 !== 0 || chineseDoubleQuotes % 2 !== 0) {
    issues.push('检测到未闭合的引号');
  }

  // 3. 检查括号是否成对
  const openParens = (content.match(/\(/g) || []).length + (content.match(/【/g) || []).length;
  const closeParens = (content.match(/\)/g) || []).length + (content.match(/】/g) || []).length;
  if (openParens !== closeParens) {
    issues.push(`检测到未闭合的括号（开:${openParens}, 闭:${closeParens}）`);
  }

  // 4. 检查最后一段是否完整（以换行符结束）
  const lines = content.split('\n');
  const lastLine = lines[lines.length - 1];
  if (lastLine && lastLine.length > 50 && !trimmedEnd.endsWith('\n')) {
    issues.push('最后一段可能不完整（超过50字符且无换行）');
  }

  // 5. 检查是否以连接词结尾（表示句子未完）
  const conjunctions = ['而且', '但是', '然而', '因此', '所以', '并且', '或者', '因为'];
  const endsWithConjunction = conjunctions.some(cj => trimmedEnd.endsWith(cj));
  if (endsWithConjunction) {
    issues.push('内容以连接词结尾，可能不完整');
  }

  return {
    isValid: issues.length === 0,
    issues,
  };
};

/**
 * 智能截断到完整句子
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

export const useCycleGeneration = () => {
  const { config, generation, setGeneration } = useStore();
  const { buildStage1Prompt, buildStage2Prompt, buildStage3Prompt } = usePromptBuilder();
  const { retrieveMemory, addChapterMemory } = useMemory();

  const startGeneration = useCallback(async (params: GenerationParams) => {
    if (generation.isGenerating) return;

    // 重置生成状态
    setGeneration({
      stage1Result: '',
      stage2Result: '',
      stage3Result: '',
      cycleResults: [],
      error: null,
      isGenerating: true,
      currentStage: 0,
      currentCycle: 0,
      completedCycles: 0,
    });

    // 创建 AbortController 用于取消请求
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    
    // 🔥 保存引用以便外部调用 stopGeneration 时终止（通过闭包，不需要保存到state）

    try {
      // 开始生成时就创建作品添加到作品管理，状态为创作中
      const { addWork, setCurrentWork } = useStore.getState();
      const now = Date.now();
      const currentWorkId = `work-${now}`; // 🔥 提前定义 currentWorkId

      addWork({
        id: currentWorkId,
        title: params.title || params.topic || "未命名作品",
        topic: params.topic,
        keywords: params.keywords,
        type: params.type,
        expectedWordCount: params.wordCount,
        actualWordCount: 0,
        chapterCount: 1,
        status: 'generating', // 创作中
        chapters: [],
        characters: [],
        createdAt: now,
        updatedAt: now,
        storyboardIds: [],
        content: '',
        generationParams: params,
      });

      // 🔥 设置当前正在生成的作品ID
      setGeneration({ currentWorkId });
      
      // 设置为当前作品，方便用户查看
      setCurrentWork(currentWorkId);

      // Stage 1: 大纲搭建
      const stage1Model = getActiveModel(config.stage1);
      const stage1Prompt = buildStage1Prompt(params);

      setGeneration({
        currentStage: 1,
        currentCycle: 1,
        isGeneratingStage: 1,
      });
      let stage1Result = '';
      let currentContent1 = '';
      for (let i = 0; i < CYCLE_CONFIG.stage1.cycles; i++) {
        if (abortSignal.aborted) break;

        const cyclePrompt = i === 0
          ? stage1Prompt
          : `${stage1Prompt}\n\n已经写到这里：\n${currentContent1}\n\n请继续完善和补充。`;

        const cycleResult = await callModelSafe(cyclePrompt, stage1Model, abortSignal);
        
        // 🔥 如果返回null，说明被用户取消（跳转页面），立即退出
        if (cycleResult === null) {
          console.log('[Generation] Stage 1 aborted by user');
          setGeneration({ isGenerating: false, isGeneratingStage: null });
          return;
        }
        
        currentContent1 += cycleResult;
        stage1Result = currentContent1;
        setGeneration({
          stage1Result: currentContent1,
          currentCycle: i + 1,
          completedCycles: i + 1,
          cycleResults: [
            ...generation.cycleResults,
            { stage: 1, cycle: i + 1, result: cycleResult, createdAt: Date.now() } as CycleResult,
          ],
        });
      }

      // 🔥 Stage 1 完成：添加大纲和人物记忆
      if (currentWorkId && stage1Result) {
        console.log('[Memory] Adding outline memory after Stage 1...');
        
        // 1. 添加大纲记忆
        const outlineId = `outline_${currentWorkId}`;
        await addChapterMemory(outlineId, `${params.title || params.topic} - 故事大纲`, stage1Result, '作品整体大纲');
        
        // 2. 尝试从大纲中提取人物信息并添加人物记忆（简化版）
        // TODO: 未来可以使用AI提取人物列表，这里先添加一个总的人物设定记忆
        if (params.character?.coreFlaw || params.character?.motivation) {
          const characterInfo = [
            params.character.coreFlaw ? `主角缺陷：${params.character.coreFlaw}` : '',
            params.character.motivation ? `主角动机：${params.character.motivation}` : '',
            params.character.habits ? `主角习惯：${params.character.habits}` : '',
          ].filter(Boolean).join('\n');
          
          if (characterInfo) {
            const charMemId = `char_${currentWorkId}`;
            await addChapterMemory(charMemId, '主要人物设定', characterInfo, '主角核心设定');
          }
        }
        
        console.log('[Memory] ✅ Stage 1 memories added');
      }

      // Stage 2: 血肉填充
      const stage2Model = getActiveModel(config.stage2);
      
      const targetWords = params.wordCount; // 总目标字数

      setGeneration({
        currentStage: 2,
        currentCycle: 1,
        isGeneratingStage: 2,
      });

      let currentContent2 = '';
      let stage2Result = '';
      let totalGeneratedWords = 0;
      
      for (let i = 0; i < CYCLE_CONFIG.stage2.cycles; i++) {
        if (abortSignal.aborted) break;

        // 🔥 动态计算剩余字数目标
        const remainingCycles = CYCLE_CONFIG.stage2.cycles - i;
        const remainingTargetWords = targetWords - totalGeneratedWords;
        const dynamicWordsPerCycle = Math.ceil(remainingTargetWords / remainingCycles);

        console.log(`[Generation] Stage 2 Cycle ${i + 1}/${CYCLE_CONFIG.stage2.cycles}:`);
        console.log(`  - 本轮目标: ${dynamicWordsPerCycle} 字`);
        console.log(`  - 已生成: ${totalGeneratedWords} 字`);
        console.log(`  - 剩余目标: ${remainingTargetWords} 字`);

        // 🔥 每轮生成前都检索相关记忆（基于已生成的内容）
        let relatedMemory = '';
        if (currentContent2.length > 100) {
          // 使用已生成内容的最后500字作为查询上下文
          const recentContext = currentContent2.slice(-500);
          const memoryQuery = `${params.topic} ${recentContext}`;
          relatedMemory = await retrieveMemory(memoryQuery, 5);
          console.log(`[Memory] Retrieved ${relatedMemory ? 'relevant' : 'no'} memories for cycle ${i + 1}`);
        } else {
          // 第一轮使用大纲和主题
          const memoryQuery = `${params.topic} ${params.title || ''} ${stage1Result.substring(0, 300)}`;
          relatedMemory = await retrieveMemory(memoryQuery, 5);
        }

        const cyclePrompt = i === 0
          ? buildStage2Prompt(stage1Result, params, totalGeneratedWords, relatedMemory)
          : `${buildStage2Prompt(stage1Result, params, totalGeneratedWords, relatedMemory)}\n\n已经写到这里：\n${currentContent2}\n\n请继续完善和补充，确保达到字数要求。`;

        const cycleResult = await callModelSafe(cyclePrompt, stage2Model, abortSignal);
        
        // 🔥 如果返回null，说明被用户取消（跳转页面），立即退出
        if (cycleResult === null) {
          console.log('[Generation] Stage 2 aborted by user');
          setGeneration({ isGenerating: false, isGeneratingStage: null });
          return;
        }
        
        // 🔥 检查实际生成的字数
        const actualWords = cycleResult.length;
        const minAcceptableWords = Math.floor(dynamicWordsPerCycle * 0.85); // 🔥 降低阈值到85%
        
        console.log(`  - 实际生成: ${actualWords} 字 (${(actualWords/dynamicWordsPerCycle*100).toFixed(1)}%)`);
        
        // 🔥 如果字数不足，触发自动续写
        if (actualWords < minAcceptableWords && i < CYCLE_CONFIG.stage2.cycles - 1) {
          console.warn(`[Generation] ⚠️ 字数不足 (${actualWords}/${minAcceptableWords})，触发自动续写...`);
          
          const continuePrompt = `【紧急任务】上文内容字数不足，请继续往下写！

上文内容：
${cycleResult}

还需要至少再写 ${Math.ceil(dynamicWordsPerCycle - actualWords)} 字才能达到要求。
请直接继续写下去，不要重复上文内容，从新的情节开始。`;

          const continueResult = await callModelSafe(continuePrompt, stage2Model, abortSignal);
          
          if (continueResult !== null) {
            const combinedResult = cycleResult + '\n\n' + continueResult;
            console.log(`[Generation] ✅ 续写成功，合并后字数: ${combinedResult.length}`);
            currentContent2 += combinedResult;
            totalGeneratedWords += combinedResult.length;
            
            setGeneration({
              stage2Result: currentContent2,
              currentCycle: i + 1,
              completedCycles: CYCLE_CONFIG.stage1.cycles + (i + 1),
              cycleResults: [
                ...generation.cycleResults,
                { stage: 2, cycle: i + 1, result: combinedResult, createdAt: Date.now() } as CycleResult,
              ],
            });
            continue;
          }
        }
        
        currentContent2 += cycleResult;
        stage2Result = currentContent2;
        totalGeneratedWords += actualWords;
        
        console.log(`  - 累计字数: ${totalGeneratedWords}/${targetWords} (${(totalGeneratedWords/targetWords*100).toFixed(1)}%)`);
        
        // 🔥 每轮生成后添加分段记忆（用于后续轮次检索）
        if (currentWorkId && cycleResult.length > 200) {
          const segmentId = `seg_${currentWorkId}_s2_c${i + 1}`;
          const segmentTitle = `${params.title || params.topic} - 第${i + 1}段`;
          const segmentSummary = cycleResult.substring(0, 150) + '...';
          
          // 异步添加，不阻塞生成流程
          addChapterMemory(segmentId, segmentTitle, cycleResult, segmentSummary).catch(err => {
            console.warn('[Memory] Failed to add segment memory:', err);
          });
        }
        
        setGeneration({
          stage2Result: currentContent2,
          currentCycle: i + 1,
          completedCycles: CYCLE_CONFIG.stage1.cycles + (i + 1),
          cycleResults: [
            ...generation.cycleResults,
            { stage: 2, cycle: i + 1, result: cycleResult, createdAt: Date.now() } as CycleResult,
          ],
        });
      }

      // 🔥 Stage 2 完成：字数校验和补救
      const finalWordCount = currentContent2.length;
      const wordCountRatio = finalWordCount / targetWords;
      
      console.log(`[Generation] Stage 2 完成:`);
      console.log(`  - 目标字数: ${targetWords}`);
      console.log(`  - 实际字数: ${finalWordCount}`);
      console.log(`  - 完成率: ${(wordCountRatio * 100).toFixed(1)}%`);
      
      // 🔥 如果字数严重不足（低于80%），触发最终补救
      if (wordCountRatio < 0.8 && !abortSignal.aborted) {
        console.warn(`[Generation] ⚠️ 字数严重不足 (${finalWordCount}/${targetWords})，触发最终补救...`);
        
        const remainingWords = Math.ceil(targetWords - finalWordCount);
        const rescuePrompt = `【最终补救任务】当前小说字数严重不足，需要补充内容！

已生成内容（前500字）：
${currentContent2.substring(0, 500)}
...
（中间省略）
...
已生成内容（后500字）：
${currentContent2.slice(-500)}

还需要至少再写 ${remainingWords} 字才能达到目标。
请从故事中间部分继续展开，添加新的情节、对话或细节描写，不要重复已有内容。
可以直接扩展现有场景，或者引入新的事件发展。`;

        const rescueResult = await callModelSafe(rescuePrompt, stage2Model, abortSignal);
        
        if (rescueResult !== null) {
          // 将补救内容插入到中间位置（避免只加在末尾）
          const insertPosition = Math.floor(currentContent2.length / 2);
          const beforeInsert = currentContent2.substring(0, insertPosition);
          const afterInsert = currentContent2.substring(insertPosition);
          
          currentContent2 = beforeInsert + '\n\n' + rescueResult + '\n\n' + afterInsert;
          stage2Result = currentContent2;
          
          console.log(`[Generation] ✅ 补救成功，最终字数: ${currentContent2.length}`);
        }
      }
      
      // 🔥 Stage 2 完成：添加完整正文记忆
      if (currentWorkId && stage2Result) {
        console.log('[Memory] Adding Stage 2 complete content memory...');
        const stage2MemId = `stage2_${currentWorkId}`;
        await addChapterMemory(stage2MemId, `${params.title || params.topic} - 完整正文(初稿)`, stage2Result, 'Stage 2 生成的完整初稿');
        console.log('[Memory] ✅ Stage 2 memory added');
      }

      // Stage 3: 去AI化打磨
      const stage3Model = getActiveModel(config.stage3);
      
      // 🔥 润色前检索原稿记忆，确保不改变核心情节
      const stage3MemoryQuery = `${params.topic} ${stage2Result.substring(0, 500)}`;
      const stage3RelatedMemory = await retrieveMemory(stage3MemoryQuery, 3);
      
      const stage3Prompt = buildStage3Prompt(currentContent2, params, stage3RelatedMemory);

      setGeneration({
        currentStage: 3,
        currentCycle: 1,
        isGeneratingStage: 3,
      });

      let stage3Result = '';
      let currentContent3 = currentContent2;
      for (let i = 0; i < CYCLE_CONFIG.stage3.cycles; i++) {
        if (abortSignal.aborted) break;

        const cyclePrompt = i === 0
          ? stage3Prompt
          : `${stage3Prompt}\n\n已经写到这里：\n${currentContent3}\n\n请继续优化。`;

        const cycleResult = await callModelSafe(cyclePrompt, stage3Model, abortSignal);
        
        // 🔥 如果返回null，说明被用户取消（跳转页面），立即退出
        if (cycleResult === null) {
          console.log('[Generation] Stage 3 aborted by user');
          setGeneration({ isGenerating: false, isGeneratingStage: null });
          return;
        }
        
        currentContent3 += cycleResult;
        stage3Result = currentContent3;
        setGeneration({
          stage3Result: currentContent3,
          currentCycle: i + 1,
          completedCycles: CYCLE_CONFIG.stage1.cycles + CYCLE_CONFIG.stage2.cycles + (i + 1),
          cycleResults: [
            ...generation.cycleResults,
            { stage: 3, cycle: i + 1, result: cycleResult, createdAt: Date.now() } as CycleResult,
          ],
        });
      }

      // 🔥 内容完整性校验与修复
      console.log('[Validation] Checking content integrity...');
      const validation = validateContentIntegrity(stage3Result);
      
      if (!validation.isValid) {
        console.warn('[Validation] Content integrity issues detected:', validation.issues);
        
        // 尝试自动修复：截断到完整句子
        const fixedContent = truncateToCompleteSentence(stage3Result);
        const wordDiff = stage3Result.length - fixedContent.length;
        
        if (wordDiff > 0) {
          console.log(`[Validation] Auto-truncated ${wordDiff} characters to ensure completeness`);
          stage3Result = fixedContent;
        }
        
        // 如果仍有问题，记录警告
        if (validation.issues.length > 0) {
          console.warn('[Validation] Remaining issues after auto-fix:', validation.issues);
        }
      } else {
        console.log('[Validation] ✅ Content integrity check passed');
      }

      setGeneration({
        stage3Result,
        completedCycles: CYCLE_CONFIG.total,
        isGenerating: false,
        isGeneratingStage: null,
      });

      // 创作完成，更新作品状态为已完成，并更新内容
      const { updateWork } = useStore.getState();
      const wordCount = stage3Result.length;
      const completedAt = Date.now();

      if (currentWorkId) {
        updateWork(currentWorkId, {
          status: 'completed',
          actualWordCount: wordCount,
          content: stage3Result,
          updatedAt: completedAt,
        });
        
        // 🔥 集成记忆存储：将最终成品添加到记忆系统
        const chapterId = `chp_${currentWorkId}_${Date.now()}`;
        const chapterTitle = params.title || `${params.topic} - 完整章节`;
        const summary = stage1Result.substring(0, 200) + '...'; // 使用大纲作为摘要
        
        await addChapterMemory(chapterId, chapterTitle, stage3Result, summary);
        console.log('[Memory] ✅ Final chapter memory saved');
        
        // 🔥 更新 Stage 2 的记忆为最终版本（标记为已润色）
        try {
          const stage2MemId = `stage2_${currentWorkId}`;
          await addChapterMemory(stage2MemId, `${params.title || params.topic} - 完整正文(已润色)`, stage3Result, 'Stage 3 润色后的最终版本');
          console.log('[Memory] ✅ Updated Stage 2 memory to final version');
        } catch (err) {
          console.warn('[Memory] Failed to update Stage 2 memory:', err);
        }
      }

    } catch (error) {
      if ((error as Error).message !== '生成已终止') {
        setGeneration({
          error: (error as Error).message,
          isGenerating: false,
          isGeneratingStage: null,
        });
      }
    }
  }, [config, generation, setGeneration, buildStage1Prompt, buildStage2Prompt, buildStage3Prompt, retrieveMemory, addChapterMemory]);

  const stopGeneration = useCallback(() => {
    // 这里需要保留abortController引用，实际在主hook处理
    setGeneration({
      isGenerating: false,
      isGeneratingStage: null,
    });
  }, [setGeneration]);

  const regenerateStageCycle = useCallback((stage: number, cycle: number) => {
    // Implementation to be added later if needed
    console.log(`Regenerate stage ${stage} cycle ${cycle}`);
  }, []);

  return {
    startGeneration,
    stopGeneration,
    regenerateStageCycle,
  };
};
