import { ModelConfig } from '../types';

export const getActiveModel = (stageConfig: any): ModelConfig => {
  if ('models' in stageConfig) {
    const active = stageConfig.models.find((m: any) => m.id === stageConfig.activeModelId);
    return active || stageConfig.models[0];
  }
  return stageConfig as ModelConfig;
};

export const callModel = async (
  prompt: string,
  config: ModelConfig,
  signal: AbortSignal
): Promise<string> => {
  if (config.mode === 'local') {
    // 确保 localUrl 没有尾随斜杠，然后拼接正确路径
    const baseUrl = config.localUrl.replace(/\/$/, '');
    const response = await fetch(`${baseUrl}/api/generate`, {
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
    // Ensure the API URL is absolute - if it starts with /, it's a local proxy path (Vite dev proxy)
    let apiUrl = config.apiUrl;
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

    // For Volcengine/Ark, model field is the endpoint ID
    const response = await fetch(apiUrl, {
      method: 'POST',
      signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.modelName || 'default',
        messages: [
          { role: 'user', content: prompt },
        ],
        stream: false,
        max_tokens: 4096,
        temperature: 0.7,
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
