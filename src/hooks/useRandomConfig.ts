import { useCallback, useState } from 'react';
import { useStore } from '../store/useStore';
import { callModel, getActiveModel } from '../hooks/useModelCall';

export const useRandomConfig = () => {
  const { config } = useStore();
  const [loading, setLoading] = useState(false);

  // 使用随机生成专用配置，降级到stage1配置
  const stageConfig = config.random || config.stage1;
  const modelConfig = stageConfig ? getActiveModel(stageConfig) : null;

  const generateCandidates = useCallback(async (
    fieldDescription: string,
    rules: string,
    count: number = 10
  ): Promise<string[]> => {
    if (!modelConfig) {
      throw new Error('未配置随机生成模型，请先在系统配置中设置');
    }

    setLoading(true);
    
    // 创建AbortController用于取消请求
    const controller = new AbortController();
    const signal = controller.signal;

    try {
      const prompt = `你现在是小说创作选题助手，用户需要随机生成${fieldDescription}。
请严格按照JSON格式返回：
{
  "candidates": [
    "候选1",
    "候选2", 
    "候选3"
  ]
}
要求：
- 必须返回合法JSON
- 只返回JSON，不要其他解释
- ${rules}
- 返回 exactly ${count} 个候选人`;

      const response = await callModel(prompt, modelConfig, signal);

      // 尝试解析JSON，提取candidates
      try {
        // 清理结果，提取JSON部分
        const jsonMatch = response.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : response;
        const data = JSON.parse(jsonStr);
        return data.candidates.slice(0, count);
      } catch (e) {
        // 如果解析失败，尝试按行分割提取
        console.warn('JSON parse failed, falling back to line split', e);
        const lines = response.split('\n')
          .filter(line => 
            line.trim().length > 0 && 
            !line.trim().startsWith('{') && 
            !line.trim().startsWith('}')
          );
        return lines.slice(0, count).map(line => 
          line.replace(/^"/, '').replace(/"$/, '').replace(/^\d+\.\s*/, '').trim()
        );
      }
    } catch (error) {
      console.error('Random generate failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [modelConfig]);

  return {
    generateCandidates,
    loading,
    hasConfig: !!modelConfig,
  };
};
