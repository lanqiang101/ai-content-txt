import { ModelConfig } from '../types';

export const getActiveModel = (stageConfig: any): ModelConfig => {
  if ('models' in stageConfig) {
    const active = stageConfig.models.find((m: any) => m.id === stageConfig.activeModelId);
    const selectedModel = active || stageConfig.models[0];
    
    // 添加调试日志
    console.log('🎯 getActiveModel - Stage配置:', {
      activeModelId: stageConfig.activeModelId,
      totalModels: stageConfig.models.length,
      selectedModel: {
        id: selectedModel.id,
        name: selectedModel.name,
        mode: selectedModel.mode,
        apiUrl: selectedModel.apiUrl,
        localUrl: selectedModel.localUrl,
      }
    });
    
    return selectedModel;
  }
  return stageConfig as ModelConfig;
};

export const callModel = async (
  prompt: string,
  config: ModelConfig,
  signal: AbortSignal
): Promise<string> => {
  if (config.mode === 'local' && config.localUrl) {
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
  } else if (config.apiUrl) {
    // Ensure the API URL is absolute - if it starts with /, it's a local proxy path (Vite dev proxy)
    let apiUrl = config.apiUrl;
    
    // 开发环境下，将火山引擎的完整URL转换为代理路径，避免CORS问题
    const isDev = import.meta.env.DEV;
    if (isDev && apiUrl.includes('ark.cn-beijing.volces.com')) {
      // 提取 /api/coding/v3 之后的路径
      const pathMatch = apiUrl.match(/\/api\/coding\/v3.*/);
      if (pathMatch) {
        apiUrl = pathMatch[0];
        console.log('🔄 开发模式：使用代理路径', apiUrl);
      }
    }
    
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
  } else {
    throw new Error('未配置模型地址');
  }
};

// 🔥 包装callModel，优雅处理AbortError
export const callModelSafe = async (
  prompt: string,
  config: ModelConfig,
  signal: AbortSignal
): Promise<string | null> => {
  try {
    return await callModel(prompt, config, signal);
  } catch (error: any) {
    // 如果是用户主动取消（跳转页面），静默处理
    if (error.name === 'AbortError' || error.message === '生成已终止') {
      console.log('[ModelCall] Request was aborted by user (page navigation)');
      return null; // 返回null表示被取消
    }
    
    // 其他错误继续抛出
    throw error;
  }
};
