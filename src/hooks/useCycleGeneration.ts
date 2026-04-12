import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { callModel, getActiveModel } from './useModelCall';
import { usePromptBuilder } from './usePromptBuilder';
import { CYCLE_CONFIG } from './constants';
import { GenerationParams, CycleResult } from '../types';

export const useCycleGeneration = () => {
  const { config, generation, setGeneration } = useStore();
  const { buildStage1Prompt, buildStage2Prompt, buildStage3Prompt } = usePromptBuilder();

  const startGeneration = useCallback(async (params: GenerationParams) => {
    // 如果已经在生成，先停止之前的
    if (generation.isGenerating) {
      return;
    }

    const abortController = new AbortController();
    const signal = abortController.signal;

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
        status: 'drafting', // 创作中
        createdAt: now,
        updatedAt: now,
        storyboardIds: [],
        content: '',
        generationParams: params,
      });

      // 设置当前作品ID
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
      let currentContent = '';
      for (let i = 0; i < CYCLE_CONFIG.stage1.cycles; i++) {
        if (signal.aborted) break;

        const cyclePrompt = i === 0
          ? stage1Prompt
          : `${stage1Prompt}\n\n已经写到这里：\n${currentContent}\n\n请继续完善和补充。`;

        const cycleResult = await callModel(cyclePrompt, stage1Model, signal);
        currentContent += cycleResult;
        stage1Result = currentContent;
        setGeneration({
          stage1Result: currentContent,
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
      const currentWordCount = 0; // 第一轮从头开始
      const stage2Prompt = buildStage2Prompt(stage1Result, params, currentWordCount);

      setGeneration({
        currentStage: 2,
        currentCycle: 1,
        isGeneratingStage: 2,
      });

      let currentContentStage2 = '';
      for (let i = 0; i < CYCLE_CONFIG.stage2.cycles; i++) {
        if (signal.aborted) break;

        const cyclePrompt = i === 0
          ? stage2Prompt
          : `${stage2Prompt}\n\n已经写到这里：\n${currentContentStage2}\n\n请继续往下写。`;

        const cycleResult = await callModel(cyclePrompt, stage2Model, signal);
        currentContentStage2 += cycleResult;
        setGeneration({
          stage2Result: currentContentStage2,
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
      const stage3Prompt = buildStage3Prompt(currentContentStage2, params);

      setGeneration({
        currentStage: 3,
        currentCycle: 1,
        isGeneratingStage: 3,
      });

      let stage3Result = '';
      let currentContentStage3 = currentContentStage2;
      for (let i = 0; i < CYCLE_CONFIG.stage3.cycles; i++) {
        if (signal.aborted) break;

        const cyclePrompt = i === 0
          ? stage3Prompt
          : `${stage3Prompt}\n\n当前版本：\n${currentContentStage3}\n\n请继续打磨优化。`;

        const cycleResult = await callModel(cyclePrompt, stage3Model, signal);
        currentContentStage3 = cycleResult;
        stage3Result = currentContentStage3;
        setGeneration({
          stage3Result: currentContentStage3,
          currentCycle: i + 1,
          completedCycles: CYCLE_CONFIG.stage1.cycles + CYCLE_CONFIG.stage2.cycles + (i + 1),
          cycleResults: [
            ...generation.cycleResults,
            { stage: 3, cycle: i + 1, result: cycleResult, createdAt: Date.now() } as CycleResult,
          ],
        });
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
  }, [config, generation, setGeneration, buildStage1Prompt, buildStage2Prompt, buildStage3Prompt]);

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
