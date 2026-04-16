import { useCallback, useState } from 'react';
import { useStore } from '../store/useStore';
import { callModel } from '../hooks/useModelCall';
import { getActiveModel } from '../hooks/useModelCall';

export const useHotTopics = () => {
  const { config } = useStore();
  const [loading, setLoading] = useState(false);

  // 使用热门主题推荐专用配置，降级到random配置
  const stageConfig = config.popularTopics || config.random;
  const modelConfig = stageConfig ? getActiveModel(stageConfig) : null;

  const generateHotTopics = useCallback(async (
    userQuery?: string
  ): Promise<string[]> => {
    if (!modelConfig) {
      throw new Error('未配置热门主题推荐模型，请先在系统配置中设置');
    }

    setLoading(true);
    
    // 创建AbortController用于取消请求
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const prompt = userQuery 
        ? `用户输入了一个关键词或创意方向：【${userQuery}】。
请基于这个方向，推荐5个当前2026年番茄小说平台热度最高、读者最喜爱的热门小说主题。
要求：
1. 必须贴合2026年最新热点，真正符合当下读者喜好
2. 不一定要把用户原话原封不动放进去，可以基于用户创意拓展出真正畅销热门主题
3. 每个主题一句话，简洁清晰，突出核心卖点和爽点
4. 必须是现在番茄读者愿意点击的热门题材

请直接返回5个主题，每行一个主题，不要其他内容。`
        : `请推荐5个2026年番茄小说平台当前热度最高、读者最喜爱的热门小说主题。
要求：
1. 必须是2026年最新最畅销的热门题材
2. 具有高点击率、高完读率、高读者粘性
3. 符合当下读者喜好，突出爽点和钩子
4. 每个主题简洁一句话，直接列出

要求直接返回5个热门主题，每行一个。`;

      const response = await callModel(prompt, modelConfig, signal);

      // 解析结果，按行分割
      const lines = response.split('\n')
        .map(line => line.trim())
        .filter(line => 
          line.length > 0 && 
          !line.startsWith('{') && 
          !line.startsWith('}') &&
          !line.startsWith('```') &&
          !line.toLowerCase().startsWith('json')
        )
        .map(line => line.replace(/^\d+[\.\)]\s*/, '').replace(/^[-*]\s*/, '').replace(/^"|"$/g, '').trim())
        .filter(line => line.length > 0)
        .slice(0, 5);

      return lines;
    } catch (error) {
      console.error('Generate hot topics failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [modelConfig]);

  return {
    generateHotTopics,
    loading,
    hasConfig: !!modelConfig,
  };
};
