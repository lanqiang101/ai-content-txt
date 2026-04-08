import { useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';
import { ModelConfig, StageModelConfig, BookOutline, Chapter, ChapterOutline, StoryboardResult, StoryboardPrompt, StoryboardConfig } from '../types';

const getActiveModel = (stageConfig: StageModelConfig | ModelConfig): ModelConfig => {
  if ('models' in stageConfig) {
    const active = stageConfig.models.find(m => m.id === stageConfig.activeModelId);
    return active || stageConfig.models[0];
  }
  return stageConfig as ModelConfig;
};

const callModel = async (prompt: string, config: ModelConfig, signal: AbortSignal): Promise<string> => {
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

// 循环配置 - 黄金比例 2+3+2=7次
export const CYCLE_CONFIG = {
  stage1: { cycles: 2, name: '核心骨架搭建期' },
  stage2: { cycles: 3, name: '血肉细节填充期' },
  stage3: { cycles: 2, name: '去AI化质感打磨期' },
  total: 7,
};

export const useGeneration = () => {
  const { config, params, generation, setGeneration, addToHistory, addWork } = useStore();
  const {
    type, topic, keywords, wordCount, style,
    reader, character, plot, rhythm, detail, emotion, antiAI
  } = params;
  const abortControllerRef = useRef<AbortController | null>(null);

  // 工具函数
  const getPlatformName = (platform: string): string => {
    const map: Record<string, string> = {
      tomato: '番茄',
      qidian: '起点',
      jjwxc: '晋江',
      zhihu: '知乎',
      short: '短篇',
      article: '公众号',
    };
    return map[platform] || platform;
  };

  const getAtmosphereName = (atmosphere: string): string => {
    const map: Record<string, string> = {
      depressed: '压抑',
      warm: '温暖',
      relaxed: '轻松',
      tense: '紧张',
    };
    return map[atmosphere] || atmosphere;
  };

  const getEmotionStyleName = (style: string): string => {
    const map: Record<string, string> = {
      reserved: '内敛',
      direct: '直白',
      insincere: '口是心非',
    };
    return map[style] || style;
  };

  const getWritingStyle = (writingStyle: string): string => {
    const map: Record<string, string> = {
      hard: '冷硬',
      soft: '温柔',
      sharp: '犀利',
      humor: '诙谐',
      art: '文艺',
    };
    return map[writingStyle] || writingStyle;
  };

  // 构建完整prompt，根据当前阶段和循环注入参数
  const buildPrompt = (stage: number, cycle: number, previousResult: string, existingResults: Array<{ stage: number, cycle: number, result: string }>): string => {
    let prompt = '';

    // 基础信息 + 所有参数（always include for all stages/cycles）
    prompt += `你现在是一位专业的小说创作AI，遵循用户的三阶段循环创作要求，当前正在创作：

【基础信息】
类型：小说
主题：${topic}
关键词：${keywords}
目标总字数：大约${wordCount}字
整体风格：${style || '默认'}

【读者定位】
- 年龄层：${reader.ageRange}
- 性别偏好：${reader.genderPreference === 'male' ? '男频' : reader.genderPreference === 'female' ? '女频' : '通用'}
- 核心追读诉求：${reader.coreAppeal}
- 读者雷区：${reader.taboo || '无'}
- 目标平台文风：${getPlatformName(reader.targetPlatform)}

【人物深度设定】
- 核心缺陷锚点：${character.coreFlaw || '无'}
- 行为逻辑底层动机：${character.motivation || '无'}
- 微习惯/口头禅/小癖好：${character.habits || '无'}
- 情绪反差阈值：${character.emotionThreshold || '无'}
- 人物成长弧光节点：${character.growthArc || '无'}

【情节连贯设定】
- 主线逻辑链：${plot.mainChain || '无'}
- 伏笔埋设+回收计划：${plot.foreshadowing || '无'}
- 支线与主线绑定比例：${plot.branchRatio}%（不超过比例，禁止无关支线）
- 情节因果强制约束：${plot.causalConstraint ? '开启：要求无因不生果，禁止硬转折' : '关闭'}
- 反转合理性校验：${plot.checkReversal ? '开启：要求反转必须合理' : '关闭'}

【感官细节要求】
- 五感描写比例：${detail.senseRatio || '无'}
- 时代/地域专属细节：${detail.locationDetails || '无'}
- 整体环境氛围：${getAtmosphereName(detail.atmosphere)}
- 允许生活化随机插曲：${detail.randomInterlude ? '允许：加入吃饭走路等生活化小事，增加真实感' : '不允许'}

【节奏张力要求】
- 快慢节奏交替：${rhythm.alternation || '3段平淡 + 1段高潮'}
- 高潮密度：${rhythm.climaxDensity || '每3k字一小高潮，每1w字一中高潮'}
- 每章结尾留悬念钩子：${rhythm.chapterEndHook ? '要求：每章结尾必须留钩子吸引读者继续阅读' : '不要求'}
- 冲突触发频率：${rhythm.conflictFrequency}%（频率越高，冲突越多越密集）
- 允许松弛缓冲节点：${rhythm.bufferNodes ? '允许：需要缓冲段落，避免全程紧绷' : '不允许'}

【情感共鸣要求】
- 情感递进阶梯：${emotion.progression}
- 共情触发场景：${emotion.empathyScenes}
- 人物情感流露方式：${getEmotionStyleName(emotion.expressionStyle)}
- 核心情绪落点：${emotion.coreEmotion || '无'}

【去AI化优化要求】
- 模板化句式删除比例：${antiAI.templateDeletePercent}%（删除 "只见/就在这时/殊不知" 等模板化开头）
- 口语化语病容忍度：${antiAI.casualTolerance}%（允许真人写作的随性，不需要完全符合语法）
- 非标准化转折概率：${antiAI.unpredictableTurnPercent}%（越高越多意想不到的转折）
- 生活化留白比例：${antiAI.whitespacePercent}%（越高越多留白留给读者想象）
- 文笔个人风格：${getWritingStyle(antiAI.writingStyle)}
`;

    // 根据阶段和循环添加当前轮次要求
    if (stage === 1) {
      // 阶段1：核心骨架搭建期
      if (cycle === 1) {
        prompt += `
=== 当前轮次：阶段 1（骨架搭建）第 ${cycle}/${CYCLE_CONFIG.stage1.cycles} 次循环 ===
任务：粗定人设、主线、核心冲突，搭建整体故事框架。
要求：给出清晰的人物设定，完整的主线故事脉络，核心冲突点。不需要展开写正文细节，只给框架骨架。
`.trim();
      } else if (cycle === 2) {
        prompt += `
=== 当前轮次：阶段 1（骨架搭建）第 ${cycle}/${CYCLE_CONFIG.stage1.cycles} 次循环 ===
上一轮你已经给出了初步骨架：
${previousResult}

任务：修补逻辑漏洞，锁死核心脉络，防止后期情节漂移断裂。
要求：检查人设逻辑是否自洽，主线是否有漏洞，修补矛盾，确认最终完整框架。
`.trim();
      }
    } else if (stage === 2) {
      // 阶段2：血肉细节填充期
      // 获取最终骨架 - use passed existingResults which is latest from getState()
      const skeleton = existingResults.find(r => r.stage === 1 && r.cycle === 2)?.result || previousResult;

      if (cycle === 1) {
        prompt += `
=== 当前轮次：阶段 2（血肉填充）第 ${cycle}/${CYCLE_CONFIG.stage2.cycles} 次循环 ===
最终锁定骨架框架：
${skeleton}

目标总字数：大约${wordCount}字，本轮请尽量充分展开，不要写得太短。

任务：添加开篇场景、人物对话、基础伏笔，把骨架填上血肉。
要求：基于框架写出开篇正文，加入符合要求的场景描写，人物对话，埋下第一个伏笔。尽量写足内容，接近目标字数。
`.trim();
      } else if (cycle === 2) {
        prompt += `
=== 当前轮次：阶段 2（血肉填充）第 ${cycle}/${CYCLE_CONFIG.stage2.cycles} 次循环 ===
上一轮你已经写出开篇血肉：
${previousResult}

骨架框架：
${skeleton}

目标总字数：大约${wordCount}字，请继续扩展内容。

任务：补充更多细节，增加五感描写，埋设更多钩子伏笔，丰富支线情节。
要求：扩展内容，增加感官细节，埋设更多伏笔，连接支线。输出完整正文，尽量接近目标字数。
`.trim();
      } else if (cycle === 3) {
        prompt += `
=== 当前轮次：阶段 2（血肉填充）第 ${cycle}/${CYCLE_CONFIG.stage2.cycles} 次循环 ===
前两轮扩展的完整正文：
${previousResult}

骨架框架：
${skeleton}

目标总字数：大约${wordCount}字，请补充完整达到目标字数。

任务：联动支线，扩展情节，让内容充实达到目标字数。
要求：把支线和主线深度绑定，补充足够内容达到大约${wordCount}字要求，消除割裂，保证所有情节都服务于主线。输出完整正文。
`.trim();
      }
    } else if (stage === 3) {
      // 阶段3：去AI化质感打磨期
      // 获取阶段2最终全文 - use passed existingResults which is latest from getState()
      const fullText = existingResults.find(r => r.stage === 2 && r.cycle === 3)?.result || previousResult;

      if (cycle === 1) {
        prompt += `
=== 当前轮次：阶段 3（去AI打磨）第 ${cycle}/${CYCLE_CONFIG.stage3.cycles} 次循环 ===
需要打磨的完整正文：
${fullText}

任务：删除模板化表达，加入生活化随机细节，洗掉机器感。
要求：去掉AI常见模板句式，增加更多生活化小细节，调整节奏快慢，让文字更像真人写作。输出修改后的完整正文。
`.trim();
      } else if (cycle === 2) {
        prompt += `
=== 当前轮次：阶段 3（去AI打磨）第 ${cycle}/${CYCLE_CONFIG.stage3.cycles} 次循环 ===
上一轮修改后的正文：
${previousResult}

任务：最终整体润色，强化情感共鸣，固定最终版本。
要求：根据要求强化核心情绪落点，检查并回收伏笔，确保节奏松紧得当，输出最终成品全文。
`.trim();
      }
    }

    return prompt;
  };

  // 获取当前应该进行的阶段和循环
  const getNextCycle = (completed: number): { stage: number; cycle: number } => {
    if (completed < CYCLE_CONFIG.stage1.cycles) {
      return { stage: 1, cycle: completed + 1 };
    } else if (completed < CYCLE_CONFIG.stage1.cycles + CYCLE_CONFIG.stage2.cycles) {
      return { stage: 2, cycle: completed - CYCLE_CONFIG.stage1.cycles + 1 };
    } else {
      return { stage: 3, cycle: completed - (CYCLE_CONFIG.stage1.cycles + CYCLE_CONFIG.stage2.cycles) + 1 };
    }
  };

  // 一步步逐个循环生成（用户可以随时暂停继续）
  const generateNextCycle = useCallback(async () => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Always get the latest state from store to avoid stale closure
    const { completedCycles: completed, cycleResults: existingResults } = useStore.getState().generation;

    if (completed >= CYCLE_CONFIG.total) {
      // 全部完成
      return null;
    }

    setGeneration({
      isGenerating: true,
      error: null,
    });

    try {
      const { stage, cycle } = getNextCycle(completed);
      setGeneration({
        currentStage: stage,
        currentCycle: cycle,
      });

      // 获取上一轮结果作为输入
      let previousResult = '';
      if (existingResults.length > 0) {
        previousResult = existingResults[existingResults.length - 1].result;
      }

      const prompt = buildPrompt(stage, cycle, previousResult, existingResults);

      const stageConfigMap = {
        1: config.stage1,
        2: config.stage2,
        3: config.stage3,
      };
      const modelConfig = getActiveModel(stageConfigMap[stage as 1 | 2 | 3]);
      const result = await callModel(prompt, modelConfig, controller.signal);

      if (controller.signal.aborted) {
        return null;
      }

      const newCompleted = completed + 1;
      const newCycleResults = [
        ...existingResults,
        { stage, cycle, result },
      ];

      // 更新状态，保存各阶段结果
      let update: any = {
        cycleResults: newCycleResults,
        completedCycles: newCompleted,
        isGenerating: false,
      };

      if (stage === 1) update.stage1Result = result;
      else if (stage === 2) update.stage2Result = result;
      else if (stage === 3) update.stage3Result = result;

      setGeneration(update);

      // 如果全部完成，加入历史
      if (newCompleted === CYCLE_CONFIG.total) {
        addToHistory({
          id: Date.now().toString(),
          type,
          topic,
          result,
          createdAt: Date.now(),
        });
        
        const wordCount = result.length;
        addWork({
          id: 'work-' + Date.now(),
          title: params.title || topic || '未命名作品',
          topic: params.topic,
          keywords: params.keywords,
          type: params.type,
          expectedWordCount: params.wordCount,
          actualWordCount: wordCount,
          chapterCount: 1,
          status: 'completed',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      }

      return { stage, cycle, result };
    } catch (error: any) {
      if (!controller.signal.aborted) {
        setGeneration({
          isGenerating: false,
          error: error.message,
        });
      }
      throw error;
    }
  }, [config, params, generation.completedCycles, generation.cycleResults, setGeneration, addToHistory]);

  // 重新生成特定阶段特定循环
  const regenerateStageCycle = useCallback(async (stage: number, cycle: number) => {
    const controller = new AbortController();
    abortControllerRef.current = controller;

    const { cycleResults: existingResults } = generation;

    setGeneration({
      isGenerating: true,
      error: null,
    });

    try {
      // 获取重新生成之前的结果作为输入
      let previousResult = '';
      const existingIndex = existingResults.findIndex(
        r => r.stage === stage && r.cycle === cycle
      );
      if (existingIndex > 0) {
        previousResult = existingResults[existingIndex - 1].result;
      }

      const prompt = buildPrompt(stage, cycle, previousResult, existingResults);

      let modelConfig: ModelConfig;
      if (stage === 1) modelConfig = getActiveModel(config.stage1);
      else if (stage === 2) modelConfig = getActiveModel(config.stage2);
      else modelConfig = getActiveModel(config.stage3);

      const result = await callModel(prompt, modelConfig, controller.signal);

      if (controller.signal.aborted) {
        return null;
      }

      // Trim to the targetIndex + 1 to overwrite
      const trimmedResults = [...existingResults.slice(0, existingIndex), { stage, cycle, result }];
      const completed = trimmedResults.length;

      let update: any = {
        cycleResults: trimmedResults,
        completedCycles: completed,
        isGenerating: false,
      };

      // Always update the latest result for the stage
      if (stage === 1) update.stage1Result = result;
      else if (stage === 2) update.stage2Result = result;
      else if (stage === 3) update.stage3Result = result;

      setGeneration(update);

      return { stage, cycle, result };
    } catch (error: any) {
      if (!controller.signal.aborted) {
        setGeneration({
          isGenerating: false,
          error: error.message,
        });
      }
      throw error;
    }
  }, [config, params, generation.cycleResults, setGeneration, addToHistory]);

  const runAllCycles = useCallback(async () => {
    while (true) {
      // Get the latest state every iteration
      const { completedCycles, isGenerating } = useStore.getState().generation;
      if (completedCycles >= CYCLE_CONFIG.total || isGenerating) {
        break;
      }
      await generateNextCycle();
    }
  }, [generateNextCycle]);

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
      setGeneration({
        isGenerating: false,
        error: '生成已终止',
      });
    }
  };

  // 是否已全部完成
  const isComplete = generation.completedCycles >= CYCLE_CONFIG.total;

  // 当前进度信息
  const currentProgress = {
    completed: generation.completedCycles,
    total: CYCLE_CONFIG.total,
  };

  const generateBookOutline = useCallback(async (): Promise<BookOutline> => {
    const prompt = `你现在是一位专业的小说大纲规划师。根据以下信息生成完整的全书大纲：

【基础信息】
主题：${topic}
标题：${params.title}
关键词：${keywords}
目标总字数：${wordCount}字
整体风格：${style || '默认'}

【情节设定】
${plot.mainChain ? `主线逻辑链：${plot.mainChain}` : ''}
${plot.foreshadowing ? `伏笔设定：${plot.foreshadowing}` : ''}

请根据目标总字数自动规划章节结构：
1. 决定合适的章节数量（建议每章1500-3000字，章节数控制在5-30章之间）
2. 每个章节的字数可以有差异化安排（开头和高潮章节可以更长）
3. 为每个章节生成：章节标题（一句话）、章节摘要（100-200字）、目标字数

请以JSON格式返回：
{
  "chapters": [
    {
      "chapterNumber": 1,
      "title": "章节标题",
      "summary": "章节摘要",
      "targetWordCount": 2000
    }
  ],
  "totalPlannedWords": 总字数数字
}`;

    const activeConfig = getActiveModel(config.stage1);
    const result = await callModel(prompt, activeConfig, abortControllerRef.current?.signal || new AbortController().signal);
    
    const match = result.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        id: 'outline-' + Date.now(),
        workId: '',
        chapters: parsed.chapters || [],
        createdAt: Date.now(),
      };
    }
    
    throw new Error('无法解析大纲响应');
  }, [config, params, wordCount]);

  const generateChapter = useCallback(async (chapterOutline: ChapterOutline, previousChapters: Chapter[]): Promise<Chapter> => {
    setGeneration({
      isGenerating: true,
      currentStage: 1,
      currentCycle: 0,
    });

    const contextInfo = previousChapters.length > 0 
      ? `\n【前情提要】\n上一章结尾：${previousChapters[previousChapters.length - 1].content.slice(-500)}`
      : '';

    const chapterPrompt = `你现在是一位专业的小说创作AI，正在撰写《${params.title}》的第 ${chapterOutline.chapterNumber} 章。

【章节信息】
章节标题：${chapterOutline.title}
章节摘要：${chapterOutline.summary}
目标字数：${chapterOutline.targetWordCount}字${contextInfo}

【基础设定】
主题：${topic}
关键词：${keywords}
整体风格：${style || '默认'}

【读者定位】
- 年龄层：${reader.ageRange}
- 核心追读诉求：${reader.coreAppeal}
- 目标平台：${getPlatformName(reader.targetPlatform)}

请根据以上设定，生成本章的完整内容。要求：
1. 字数达到 ${chapterOutline.targetWordCount} 字左右
2. 内容要与前后章节连贯
3. 情节有起承转合
4. 结尾要留有悬念，吸引读者继续阅读

请直接输出本章内容，不要有其他格式。`;

    const activeConfig = getActiveModel(config.stage3);
    const result = await callModel(chapterPrompt, activeConfig, abortControllerRef.current?.signal || new AbortController().signal);

    setGeneration({
      isGenerating: false,
      stage3Result: result,
    });

    return {
      id: 'chapter-' + Date.now() + '-' + chapterOutline.chapterNumber,
      workId: '',
      chapterNumber: chapterOutline.chapterNumber,
      title: chapterOutline.title,
      summary: chapterOutline.summary,
      content: result,
      wordCount: result.length,
      stageData: {
        stage: 3,
        input: params,
        output: result,
        cycleResults: [],
      },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
  }, [config, params, setGeneration]);

  const generateStoryboard = useCallback(async (
    content: string,
    config: Partial<StoryboardConfig>
  ): Promise<StoryboardResult> => {
    const prompt = `你是一个专业的AI视频分镜脚本生成器。根据以下小说内容生成分镜提示词。

【小说内容】
${content.slice(0, 3000)}

【分镜配置】
- 单集时长：${config.duration || 60}秒
- 每集分镜数：${config.clipsPerEpisode || 6}
- 分镜风格：${config.style || '写实'}
- 基调：${config.tone || '紧张'}

【主角描述】
${config.mainCharacter?.description || '请从小说内容中提取主角形象'}

请为每个分镜生成详细的提示词，包含：画面描述、运镜方式、光线、音效。

请以JSON格式返回：
{
  "prompts": [
    {
      "clipNumber": 1,
      "scene": "场景名称",
      "visual": "画面描述（英文，适合AI视频生成）",
      "duration": 10,
      "camera": "运镜方式",
      "audio": "音效建议",
      "lighting": "光线"
    }
  ]
}`;

    const { config: storeConfig } = useStore.getState();
    const activeConfig = getActiveModel(storeConfig.stage1);
    const result = await callModel(prompt, activeConfig, new AbortController().signal);
    
    const match = result.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        id: 'sb-' + Date.now(),
        workId: config.workId || '',
        config: config as StoryboardConfig,
        prompts: parsed.prompts || [],
        totalDuration: (parsed.prompts || []).reduce((sum: number, p: StoryboardPrompt) => sum + (p.duration || 0), 0),
        createdAt: Date.now(),
      };
    }
    
    throw new Error('无法解析分镜响应');
  }, [callModel]);

  return {
    generateNextCycle,
    regenerateStageCycle,
    runAllCycles,
    stopGeneration,
    isComplete,
    currentProgress,
    generateBookOutline,
    generateChapter,
    callModel,
    generateStoryboard,
  };
};
