import { GenerationParams } from '../types';

// 默认配置，如果外部未提供
const CYCLE_CONFIG = {
  stage1: { cycles: 2 },
  stage2: { cycles: 8 }, // 🔥 增加cycles数量，从5增加到8，降低每轮字数压力
  stage3: { cycles: 2 },
};

export const usePromptBuilder = () => {

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

  const buildFullPrompt = (params: GenerationParams): string => {
    const {
      type, topic, title, keywords, wordCount, style,
      reader, character, plot, rhythm, detail, emotion, antiAI
    } = params;

    if (type === 'article') {
      return buildArticlePrompt(topic, title, keywords, wordCount, style);
    }

    return buildNovelFullPrompt(params);
  };

  const buildArticlePrompt = (
    topic: string,
    title: string,
    keywords: string,
    wordCount: number,
    style: string
  ): string => {
    return `你现在是一位资深公众号作者，请帮我写一篇公众号文章。

主题：${topic}
标题：${title || '自动生成合适的标题'}
关键词：${keywords}
目标字数：${wordCount} 字
文风要求：${style || '轻松流畅'}

请直接写出完整文章，不要多余说明。`;
  };

  const buildNovelFullPrompt = (params: GenerationParams): string => {
    const {
      topic, title, keywords, wordCount, style,
      reader, character, plot, rhythm, detail, emotion, antiAI
    } = params;

    const platformName = getPlatformName(reader?.targetPlatform || '');

    let prompt = `你现在是一位顶尖的${platformName}网络小说作家，请帮我创作一篇短篇小说。

## 基础信息
主题：${topic}
标题：${title || '请自动生成吸引人的标题'}
关键词：${keywords}
目标字数：${wordCount} 字
整体文风：${style || '符合平台主流风格'}

## 读者定位
- 读者年龄层：${reader?.ageRange || '不限'}
- 性别偏好：${getPlatformName(reader?.genderPreference || '')}
- 核心追读诉求：${reader?.coreAppeal || '爽点'}
- 读者雷区：${reader?.taboo || '无'}
- 目标平台：${platformName}

## 人物深度设定
- 核心缺陷锚点：${character?.coreFlaw || '请自动设定'}
- 隐藏秘密强度：${character?.secretIntensity || 0}%
- 金句密度：${character?.goldenSentencePerThousand || 0} 句/千字
- 人物弧光：${character?.arcType === 'none' ? '无弧光/不变态' :
        character?.arcType === 'positive' ? '成长弧光' :
          character?.arcType === 'fall' ? '堕落弧光' : '复杂反转'}
${character?.supportingBackstory ? '- 需要给配角分配背景故事\n' : ''}
## 情节架构
- 开篇钩子长度：${plot?.hookWordCount || 500} 字
- 反转密度：${plot?.twistPerThousand || 1} 次/千字
- 故事结构：${plot?.structure === 'linear' ? '线性顺叙' :
        plot?.structure === 'inverted' ? '倒叙开头' :
          plot?.structure === 'interrupt' ? '插叙补全' : '多线并行'
      }
${plot?.forceConflictAtStart ? '- 开篇强制冲突\n' : ''}${plot?.seedForeshadow ? '- 需要埋下关键伏笔\n' : ''}${plot?.openEnding ? '- 使用开放式结尾\n' : ''}
## 节奏掌控
- 平均段落长度：${rhythm?.averageParaLength === 'short' ? '短段落（网文）' :
        rhythm?.averageParaLength === 'medium' ? '中等段落' : '长段落（出版）'
      }
- 冲突频率：${rhythm?.conflictFrequency || 50}%
${rhythm?.bufferNodes ? '- 需要插入缓冲节点\n' : ''}
## 感官细节
- 五感描写比例：${detail?.senseRatio || '视觉60% + 听觉25% + 嗅觉10% + 触觉5%'}
- 时代/地域专属细节：${detail?.locationDetails || '无特殊要求'}
- 环境氛围：${getAtmosphereName(detail?.atmosphere || '')}
${detail?.randomInterlude ? '- 需要插入生活化随机插曲\n' : ''}
## 情感共鸣
- 情感递进阶梯：${emotion?.progression || '陌生→好奇→共情→动容'}
- 共情触发场景：${emotion?.empathyScenes || '逆袭'}
- 人物情感流露方式：${getEmotionStyleName(emotion?.expressionStyle || '')}
- 核心情绪落点：${emotion?.coreEmotion || '请自动把握'}

## 反AI化优化
- 模板化句式删除比例：${antiAI?.templateDeletePercent || 0}%
- 口语化语病容忍度：${antiAI?.casualTolerance || 0}%
- 非标准化转折概率：${antiAI?.unpredictableTurnPercent || 0}%
- 生活化留白比例：${antiAI?.whitespacePercent || 0}%
- 文笔个人风格：${getWritingStyle(antiAI?.writingStyle || '')}

请按照以上要求，直接写出完整小说正文，不要前置分析说明，不要讨论要求，直接开始写故事。`;

    return prompt;
  };

  const buildStage1Prompt = (params: GenerationParams): string => {
    const {
      topic, keywords, wordCount, style,
      reader, character, plot, rhythm, detail, emotion, antiAI
    } = params;

    const platformName = getPlatformName(reader?.targetPlatform || '');

    return `【最高优先级指令】你必须使用简体中文输出！绝对禁止使用英文或其他语言！

你现在是一位顶尖的${platformName}网络小说作家，请帮我创作这篇小说的完整大纲。

主题：${topic}
关键词：${keywords}
目标总字数：${wordCount} 字
整体文风：${style || '符合平台主流风格'}

## ⚠️ 输出格式要求（极其重要）
1. **必须使用简体中文** - 禁止任何英文单词、句子或段落
2. **必须按照以下结构输出** - 不要自由发挥
3. **每个章节用一句话概括** - 不要展开详细内容
4. **人物设定要简洁** - 只写核心特征

## 设定参数
### 读者定位
- 读者年龄层：${reader?.ageRange || '不限'}
- 性别偏好：${getPlatformName(reader?.genderPreference || '')}
- 核心追读诉求：${reader?.coreAppeal || '爽点'}
- 读者雷区：${reader?.taboo || '无'}

### 人物深度
- 核心缺陷锚点：${character?.coreFlaw || '请自动设计'}
- 隐藏秘密强度：${character?.secretIntensity || 0}%
- 人物弧光：${character?.arcType === 'none' ? '无弧光/不变态' :
        character?.arcType === 'positive' ? '成长弧光' :
          character?.arcType === 'fall' ? '堕落弧光' : '复杂反转'}

### 情节架构
- 开篇钩子长度：${plot?.hookWordCount || 500} 字
- 反转密度：${plot?.twistPerThousand || 1} 次/千字
- 故事结构：${plot?.structure === 'linear' ? '线性顺叙' :
        plot?.structure === 'inverted' ? '倒叙开头' :
          plot?.structure === 'interrupt' ? '插叙补全' : '多线并行'
      }
${plot?.forceConflictAtStart ? '- 开篇强制冲突\n' : ''}${plot?.seedForeshadow ? '- 需要埋下关键伏笔\n' : ''}

### 节奏
- 平均段落长度：${rhythm?.averageParaLength || 'short'}
- 冲突频率：${rhythm?.conflictFrequency || 50}%

## 📋 请按以下格式输出（严格遵守）

# 一、完整故事大纲
（用3-5句话概括整个故事的起承转合）

# 二、主角人设
- 姓名：XXX
- 年龄：XX岁
- 性格特点：XXX
- 核心缺陷：XXX
- 人物动机：XXX

# 三、分章节大纲（每章一句话梗概）
第1章：XXXXX
第2章：XXXXX
第3章：XXXXX
...

# 四、预计章节列表
共XX章，每章约XXX字

---
再次强调：所有内容必须使用简体中文，禁止出现任何英文！`;
  };

  const buildStage2Prompt = (
    stage1Result: string,
    params: GenerationParams,
    currentWordCount: number,
    relatedMemory: string = ''
  ): string => {
    const { wordCount } = params;
    const remainingWords = wordCount - currentWordCount;
    const targetWords = remainingWords > 0 ? remainingWords : wordCount;
    const cycles = CYCLE_CONFIG.stage2.cycles;
    const wordsPerCycle = Math.ceil(targetWords / cycles);

    let prompt = `【最高优先级指令】你必须生成 **至少 ${wordsPerCycle} 字** 的内容！这是硬性要求，绝对不能低于这个字数！

我已经写好了小说大纲，请你帮我把它扩展写成完整正文。

## 📏 字数控制要求（极其重要）
- **本轮目标字数**: ${wordsPerCycle} 字
- **最低要求**: ${Math.floor(wordsPerCycle * 0.9)} 字（绝对不能低于此数）
- **理想范围**: ${wordsPerCycle} - ${Math.ceil(wordsPerCycle * 1.1)} 字
- **请在文末标注实际字数**: [字数：XXXX]

## 💡 如何达到字数要求（扩写技巧）
如果字数不足，请使用以下方法扩写：
1. **增加对话**: 让人物多说话，加入语气词、停顿、重复
2. **心理描写**: 深入刻画人物内心想法、情绪变化
3. **环境细节**: 描写场景的光线、声音、气味、温度
4. **动作分解**: 把简单动作拆解成多个步骤详细描写
5. **回忆插叙**: 插入人物的过往经历或背景故事
6. **支线情节**: 添加次要人物的反应和互动
7. **感官体验**: 从视觉、听觉、触觉、嗅觉多角度描写
8. **比喻修辞**: 使用比喻、拟人等修辞手法丰富表达

## 相关记忆参考
${relatedMemory || '（无相关记忆）'}

## 故事大纲
${stage1Result}

当前已经写了 ${currentWordCount} 字，还需要写大约 ${targetWords} 字。
`;

    const { reader, character, plot, antiAI } = params;

    if (reader?.coreAppeal) {
      prompt += `\n## 读者诉求\n- 始终紧扣核心诉求：${reader.coreAppeal}\n`;
    }
    if (reader?.taboo) {
      prompt += `\n## 禁忌内容\n- 绝对不能包含：${reader.taboo}\n`;
    }
    if (character?.coreFlaw) {
      prompt += `\n## 人物设定\n- 主角核心缺陷：${character.coreFlaw}，要贯穿始终\n`;
    }
    if (plot?.forceConflictAtStart) {
      prompt += `\n## 开篇要求\n- 必须有冲突抓住读者\n`;
    }
    if (antiAI?.templateDeletePercent && antiAI.templateDeletePercent > 0) {
      prompt += `\n## 反AI化\n- 删除模板化句式，避免"只见""就在这时""殊不知"等AI常用开头\n`;
    }
    if (antiAI?.unpredictableTurnPercent && antiAI.unpredictableTurnPercent > 20) {
      prompt += `\n- 增加不可预测的转折，拒绝套路化写作\n`;
    }

    prompt += `\n⚠️ **再次强调**: 
1. 请 ensure生成内容达到 ${wordsPerCycle} 字 above，otherwise视为任务 failed！
2. **必须使用简体中文 output**，禁止 any English words or sentences！
3. If feel words not enough，please use expansion techniques (add dialogue, psychological description, environmental details, etc.) to充实 content.

Please directly start write story正文， do not summarize, do not explain, just write story content.`;

    return prompt;
  };

  const buildStage3Prompt = (
    currentContent: string,
    params: GenerationParams,
    relatedMemory: string = ''
  ): string => {
    const { antiAI } = params;

    let prompt = `请帮我打磨优化以下这篇小说，去除AI痕迹，让它更像真人写的。

## 相关 memory reference（ensure not change core plot and character setting）
${relatedMemory || '（无相关记忆）'}

原文：
${currentContent}

优化要求：
`;

    if (antiAI?.templateDeletePercent && antiAI.templateDeletePercent > 0) {
      prompt += `- 删除大约 ${antiAI.templateDeletePercent}% 的模板化句式\n`;
    }
    if (antiAI?.casualTolerance && antiAI.casualTolerance > 0) {
      prompt += `- 增加 ${antiAI.casualTolerance}% 的口语化随性表达，可以有一些无伤大雅的小"语病"\n`;
    }
    if (antiAI?.unpredictableTurnPercent && antiAI.unpredictableTurnPercent > 0) {
      prompt += `- 增加 ${antiAI.unpredictableTurnPercent}% 的非标准化转折\n`;
    }
    if (antiAI?.whitespacePercent && antiAI.whitespacePercent > 0) {
      prompt += `- 增加大约 ${antiAI.whitespacePercent}% 的留白，不要把话说死\n`;
    }

    prompt += `
⚠️ **重要**: 
1. 保持原有故事走向、人物设定、关键情节不变
2. 只优化文笔质感，去除AI痕迹
3. 如果原文中有伏笔或关键信息，必须保留

Please directly output optimized full text.`;

    return prompt;
  };

  return {
    getPlatformName,
    getAtmosphereName,
    getEmotionStyleName,
    getWritingStyle,
    buildFullPrompt,
    buildStage1Prompt,
    buildStage2Prompt,
    buildStage3Prompt,
  };
};
