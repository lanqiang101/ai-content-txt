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

  const startGeneration = useCallback(async (params: GenerationParams, signal?: AbortSignal) => {
    // 🔥 允许多任务并发，不再检查isGenerating
    
    // 🔥 如果没有传入signal，创建一个新的（向后兼容）
    const abortSignal = signal || new AbortController().signal;

    // 重置生成状态
    setGeneration({
      currentStage: 0,
      currentCycle: 0,
      completedCycles: 0,
      stage1Result: '',
      stage2Result: '',
      stage3Result: '',
      cycleResults: [],
      isGenerating: true,
      isGeneratingStage: null,
      error: null,
      currentWorkId: undefined, // 🔥 先清空，创建作品后再设置
    });

    try {
      // 开始生成时就创建作品添加到作品管理，状态为创作中
      const { addWork, setCurrentWork } = useStore.getState();
      const now = Date.now();
      const newWorkId = `work-${now}`;

      addWork({
        id: newWorkId,
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
      setGeneration({ currentWorkId: newWorkId });
      
      // 设置为当前作品，方便用户查看
      setCurrentWork(newWorkId);

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

      // Stage 2: 血肉填充
      const stage2Model = getActiveModel(config.stage2);
      
      // 🔥 集成记忆检索：在生成前检索相关记忆
      const memoryQuery = `${params.topic} ${params.title || ''} ${params.keywords}`;
      const relatedMemory = await retrieveMemory(memoryQuery, 5);
      
      const currentWordCount = 0; // 第一轮从头开始
      const targetWords = params.wordCount; // 总目标字数
      const stage2Prompt = buildStage2Prompt(stage1Result, params, currentWordCount, relatedMemory);

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

        const cyclePrompt = i === 0
          ? stage2Prompt
          : `${stage2Prompt}\n\n已经写到这里：\n${currentContent2}\n\n请继续完善和补充。`;

        const cycleResult = await callModelSafe(cyclePrompt, stage2Model, abortSignal);
        
        // 🔥 如果返回null，说明被用户取消（跳转页面），立即退出
        if (cycleResult === null) {
          console.log('[Generation] Stage 2 aborted by user');
          setGeneration({ isGenerating: false, isGeneratingStage: null });
          return;
        }
        
        currentContent2 += cycleResult;
        stage2Result = currentContent2;
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

      // Stage 3: 去AI化打磨
      const stage3Model = getActiveModel(config.stage3);
      const stage3Prompt = buildStage3Prompt(currentContent2, params);

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
      const { updateWork, currentWorkId } = useStore.getState();
      const wordCount = stage3Result.length;
      const completedAt = Date.now();

      if (currentWorkId) {
        updateWork(currentWorkId, {
          status: 'completed',
          actualWordCount: wordCount,
          content: stage3Result,
          updatedAt: completedAt,
        });
        
        // 🔥 集成记忆存储：将生成的章节添加到记忆系统
        const chapterId = `chp_${currentWorkId}_${Date.now()}`;
        const chapterTitle = params.title || `${params.topic} - 完整章节`;
        const summary = stage1Result.substring(0, 200) + '...'; // 使用大纲作为摘要
        
        await addChapterMemory(chapterId, chapterTitle, stage3Result, summary);
        console.log('[Memory] Chapter memory saved');
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
