import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { callModel, getActiveModel } from './useModelCall';
import { GenerationParams, Character } from '../types';

export const useCharacterGenerate = () => {
  const { config } = useStore();

  const generateCharacter = useCallback(async (
    topic: string,
    title: string,
    signal: AbortSignal
  ): Promise<Character[]> => {
    const modelConfig = getActiveModel(config.storyboard);

    const prompt = `根据小说主题"${topic}"，标题"${title}"，请设计5个主要小说人物。

要求输出JSON格式，每个人物包含：
- id: string
- name: string
- description: string  人物简介
- appearance: string  外貌描写
- personality: string  性格
- outfit: string  衣着
- role: "main" | "supporting"  主角还是配角

只输出JSON，不要其他说明。`;

    const result = await callModel(prompt, modelConfig, signal);
    try {
      const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
      const characters = JSON.parse(cleaned);
      return Array.isArray(characters) ? characters : [];
    } catch (e) {
      console.error('解析人物JSON失败:', e);
      return [];
    }
  }, [config.storyboard]);

  return {
    generateCharacter,
  };
};
