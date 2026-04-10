import { useCallback } from 'react';
import { useStore } from '../store/useStore';
import { callModel, getActiveModel } from './useModelCall';
import { StoryboardResult, CharacterDesc } from '../types';

export const useStoryboardGenerate = () => {
  const { config } = useStore();

  const generateStoryboard = useCallback(async (
    content: string,
    characters: CharacterDesc[],
    signal: AbortSignal
  ): Promise<StoryboardResult[]> => {
    const modelConfig = getActiveModel(config.storyboard);

    const charactersText = characters.map(c =>
      `- ${c.name}: ${c.description}`
    ).join('\n');

    const prompt = `请将以下小说内容分镜，每一段落生成一个视频分镜描述。

小说内容：
${content}

已有人物：
${charactersText}

要求输出JSON格式，每个分镜包含：
- chapterNumber: number
- panelNumber: number
- content: string  文字内容
- sceneDescription: string  场景描述
- characterInPanel: string[]  此分镜包含的人物名字
- cameraAngle: string  机位角度建议
- visualStyle: string  画面风格建议

只输出JSON数组，不要其他说明。`;

    const result = await callModel(prompt, modelConfig, signal);
    try {
      const cleaned = result.replace(/```json/g, '').replace(/```/g, '').trim();
      const storyboard = JSON.parse(cleaned);
      return Array.isArray(storyboard) ? storyboard : [];
    } catch (e) {
      console.error('解析分镜JSON失败:', e);
      return [];
    }
  }, [config.storyboard]);

  return {
    generateStoryboard,
  };
};
