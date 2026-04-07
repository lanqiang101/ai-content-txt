import { useCallback, useState } from 'react';
import { useStore } from '../store/useStore';

export interface Candidate {
  text: string;
}

export const useRandomGenerate = () => {
  const { config } = useStore();
  const [loading, setLoading] = useState(false);

  // 使用随机生成单独配置，借鉴Claude Code源码泄露模块化设计
  const modelConfig = config.random;

  const generateCandidates = useCallback(async (
    fieldDescription: string,
    rules: string,
    count: number = 3
  ): Promise<string[]> => {
    setLoading(true);
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

      let result: string;

      if (modelConfig.mode === 'local') {
        const response = await fetch(`${modelConfig.localUrl}/api/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: modelConfig.modelName,
            prompt,
            stream: false,
            options: {
              temperature: 0.9, // 高温度增加随机性
            },
          }),
        });

        if (!response.ok) {
          throw new Error(`本地模型调用失败: ${response.statusText}`);
        }

        const data = await response.json();
        result = data.response;
      } else {
        // Ensure the API URL is absolute - if it starts with /, it's a local proxy path (Vite dev proxy)
        let apiUrl = modelConfig.apiUrl;
        if (apiUrl.startsWith('/')) {
          // For local dev proxy, keep it as relative path so it works correctly
          // Don't convert to https://... because that breaks the proxy
          // Only handle special case if it's /api/v3/ but not /api/coding/v3/
        } else if (!apiUrl.startsWith('http')) {
          apiUrl = `https://${apiUrl}`;
        }

        // Only auto-add /chat/completions if user hasn't provided it explicitly
        const isArkBaseUrl = apiUrl.includes('ark.cn-beijing.volces.com') || apiUrl.startsWith('/api/coding/v3');
        if (isArkBaseUrl && !apiUrl.endsWith('/chat/completions')) {
          // If user only provided base URL, add the endpoint suffix
          apiUrl = apiUrl.replace(/\/chat$/, '').replace(/\/inference$/, '');
          apiUrl = apiUrl.replace(/\/$/, '') + '/chat/completions';
        }

        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${modelConfig.apiKey}`,
          },
          body: JSON.stringify({
            model: modelConfig.modelName,
            messages: [
              { role: 'user', content: prompt },
            ],
            temperature: 0.9,
            stream: false,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API调用失败: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data = await response.json();
        result = data.choices[0].message.content;
      }

      // 尝试解析JSON，提取candidates
      try {
        // 清理结果，提取JSON部分
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : result;
        const data = JSON.parse(jsonStr);
        setLoading(false);
        return data.candidates.slice(0, count);
      } catch (e) {
        // 如果解析失败，尝试按行分割提取
        console.warn('JSON parse failed, falling back to line split', e);
        const lines = result.split('\n').filter(line => line.trim().length > 0 && !line.trim().startsWith('{') && !line.trim().startsWith('}'));
        setLoading(false);
        return lines.slice(0, count).map(line => line.replace(/^"/, '').replace(/"$/, '').replace(/^\d+\.\s*/, '').trim());
      }

    } catch (error: any) {
      setLoading(false);
      throw error;
    }
  }, [modelConfig]);

  return {
    generateCandidates,
    loading,
  };
};
