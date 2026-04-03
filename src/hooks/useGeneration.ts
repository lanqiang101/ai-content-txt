import { useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';
import { ModelConfig } from '../types';

const callModel = async (prompt: string, config: ModelConfig, signal: AbortSignal): Promise<string> => {
  if (config.mode === 'local') {
    const response = await fetch(`${config.localUrl}/api/generate`, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.modelName,
        prompt,
        stream: false,
      }),
    });

    if (signal.aborted) {
      throw new Error('生成已终止');
    }

    if (!response.ok) {
      throw new Error(`本地模型调用失败: ${response.statusText}`);
    }

    const data = await response.json();
    return data.response;
  } else {
    // For Volcengine/Ark, model field is the endpoint ID
    const response = await fetch(config.apiUrl, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.modelName,
        messages: [
          { role: 'user', content: prompt },
        ],
        stream: false,
      }),
    });

    if (signal.aborted) {
      throw new Error('生成已终止');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API调用失败: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }
};

export const useGeneration = () => {
  const { config, params, generation, setGeneration, addToHistory } = useStore();
  const { type, topic, keywords, wordCount, style } = params;
  const { stage1Result, stage2Result } = generation;
  const abortControllerRef = useRef<AbortController | null>(null);

  const runFullPipeline = useCallback(async () => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setGeneration({
      isGenerating: true,
      isGeneratingStage: null,
      error: null,
      currentStage: 1,
    });

    try {
      // Stage 1: Generate outline and title
      const stage1Prompt = `
你是一个专业的内容策划师。请为${type === 'article' ? '一篇公众号文章' : '一部小说'}生成大纲和标题。
主题：${topic}
关键词：${keywords}
要求字数：大约${wordCount}字
风格要求：${style}

请输出清晰的标题和详细的大纲结构。
      `.trim();

      const stage1Result = await callModel(stage1Prompt, config.stage1, controller.signal);
      if (controller.signal.aborted) return;
      setGeneration({ stage1Result, currentStage: 2 });

      // Stage 2: Generate draft
      const stage2Prompt = `
基于以下大纲，生成完整的${type === 'article' ? '公众号文章' : '小说'}正文初稿。
要求字数：大约${wordCount}字
风格要求：${style}

大纲内容：
${stage1Result}

请写出完整的正文内容。
      `.trim();

      const stage2Result = await callModel(stage2Prompt, config.stage2, controller.signal);
      if (controller.signal.aborted) return;
      setGeneration({ stage2Result, currentStage: 3 });

      // Stage 3: Polish and optimize
      const stage3Prompt = `
请对以下${type === 'article' ? '公众号文章' : '小说'}正文进行润色、排版和合规检查，优化语言表达，让内容更流畅自然，符合发布要求。

原文内容：
${stage2Result}

请输出最终优化后的完整内容。
      `.trim();

      const stage3Result = await callModel(stage3Prompt, config.stage3, controller.signal);
      if (controller.signal.aborted) return;
      setGeneration({ stage3Result, currentStage: 3, isGenerating: false, isGeneratingStage: null });

      // Add to history
      addToHistory({
        id: Date.now().toString(),
        type,
        topic,
        result: stage3Result,
        createdAt: Date.now(),
      });

      return stage3Result;
    } catch (error) {
      if ((error as Error).message === '生成已终止') {
        setGeneration({
          isGenerating: false,
          isGeneratingStage: null,
          error: '生成已终止',
        });
        return;
      }
      setGeneration({
        error: error instanceof Error ? error.message : '生成失败',
        isGenerating: false,
        isGeneratingStage: null,
      });
      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }, [config, params, setGeneration, addToHistory]);

  const regenerateStage = useCallback(async (stage: number) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setGeneration({
      isGenerating: false,
      isGeneratingStage: stage,
      error: null,
    });

    try {
      if (stage === 1) {
        // 重新生成阶段1：大纲
        const stage1Prompt = `
你是一个专业的内容策划师。请为${type === 'article' ? '一篇公众号文章' : '一部小说'}生成大纲和标题。
主题：${topic}
关键词：${keywords}
要求字数：大约${wordCount}字
风格要求：${style}

请输出清晰的标题和详细的大纲结构。
        `.trim();

        const result = await callModel(stage1Prompt, config.stage1, controller.signal);
        if (controller.signal.aborted) return;
        setGeneration({
          stage1Result: result,
          currentStage: 1,
          // 清空后续结果
          stage2Result: '',
          stage3Result: '',
          isGenerating: false,
          isGeneratingStage: null,
        });
        return result;
      }

      if (stage === 2) {
        // 重新生成阶段2：基于当前阶段1结果生成初稿
        const stage2Prompt = `
基于以下大纲，生成完整的${type === 'article' ? '公众号文章' : '小说'}正文初稿。
要求字数：大约${wordCount}字
风格要求：${style}

大纲内容：
${stage1Result}

请写出完整的正文内容。
        `.trim();

        const result = await callModel(stage2Prompt, config.stage2, controller.signal);
        if (controller.signal.aborted) return;
        setGeneration({
          stage2Result: result,
          currentStage: 2,
          // 清空后续结果
          stage3Result: '',
          isGenerating: false,
          isGeneratingStage: null,
        });
        return result;
      }

      if (stage === 3) {
        // 重新生成阶段3：基于当前阶段2结果润色
        const stage3Prompt = `
请对以下${type === 'article' ? '公众号文章' : '小说'}正文进行润色、排版和合规检查，优化语言表达，让内容更流畅自然，符合发布要求。

原文内容：
${stage2Result}

请输出最终优化后的完整内容。
        `.trim();

        const result = await callModel(stage3Prompt, config.stage3, controller.signal);
        if (controller.signal.aborted) return;
        setGeneration({
          stage3Result: result,
          currentStage: 3,
          isGenerating: false,
          isGeneratingStage: null,
        });

        // Add to history
        addToHistory({
          id: Date.now().toString(),
          type,
          topic,
          result,
          createdAt: Date.now(),
        });

        return result;
      }
    } catch (error) {
      if ((error as Error).message === '生成已终止') {
        setGeneration({
          isGenerating: false,
          isGeneratingStage: null,
          error: '生成已终止',
        });
        return;
      }
      setGeneration({
        error: error instanceof Error ? error.message : '生成失败',
        isGenerating: false,
        isGeneratingStage: null,
      });
      throw error;
    } finally {
      abortControllerRef.current = null;
    }
  }, [config, params, stage1Result, stage2Result, setGeneration, addToHistory]);

  const stopGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return { runFullPipeline, regenerateStage, stopGeneration, generation };
};
