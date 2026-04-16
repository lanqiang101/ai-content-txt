import { useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';
import { callModel, getActiveModel } from './useModelCall';
import { usePromptBuilder } from './usePromptBuilder';
import { useCycleGeneration } from './useCycleGeneration';
import { useCharacterGenerate } from './useCharacterGenerate';
import { useStoryboardGenerate } from './useStoryboardGenerate';
import { CYCLE_CONFIG } from './constants';

export { CYCLE_CONFIG };

export const useGeneration = () => {
  const { singleParams, generation } = useStore();
  const abortControllerRef = useRef<AbortController | null>(null);
  const { buildFullPrompt } = usePromptBuilder();
  const { startGeneration, stopGeneration, regenerateStageCycle } = useCycleGeneration();
  const { generateCharacter } = useCharacterGenerate();
  const { generateStoryboard } = useStoryboardGenerate();

  // 🔥 注意：已移除组件卸载时自动停止的逻辑
  // 任务将在后台持续运行，用户可以自由跳转页面
  // 如需停止，请手动调用 stop() 方法

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    stopGeneration();
  }, [stopGeneration]);

  const start = useCallback(async () => {
    const abortController = new AbortController();
    abortControllerRef.current = abortController;
    
    // 🔥 传递signal给startGeneration，支持中途取消
    await startGeneration(singleParams, abortController.signal);
  }, [singleParams, startGeneration]);

  const generateNextCycle = useCallback(async () => {
    // This is handled by startGeneration for now
    await start();
  }, [start]);

  const runAllCycles = useCallback(async () => {
    await start();
  }, [start]);

  // generateCandidates for TimerAutomation - generates multiple candidates
  const generateCandidates = useCallback(async (
    systemPrompt: string,
    userPrompt: string,
    count: number
  ): Promise<string[]> => {
    const { config } = useStore.getState();
    const activeModel = getActiveModel(config.random);
    const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

    const candidates: string[] = [];
    for (let i = 0; i < count; i++) {
      const controller = new AbortController();
      const result = await callModel(fullPrompt, activeModel, controller.signal);
      // Split by line and filter empty lines
      const lines = result.split('\n').map((line: string) => line.trim()).filter((line: string) => line.length > 0);
      candidates.push(...lines);
    }

    return candidates.slice(0, count);
  }, []);

  const isComplete = generation.completedCycles >= CYCLE_CONFIG.total;
  const currentProgress = {
    completed: generation.completedCycles
  };

  return {
    start,
    stop,
    generation,
    generateNextCycle,
    runAllCycles,
    stopGeneration: stop,
    regenerateStageCycle,
    isComplete,
    currentProgress,
    buildFullPrompt,
    generateCharacter,
    generateStoryboard,
    generateCandidates,
    callModel,
  };
};
