import { GenerationParams } from '../types';

// 默认配置，如果外部未提供
const CYCLE_CONFIG = {
  stage1: { cycles: 2 },
  stage2: { cycles: 8 }, // 🔥 增加cycles数量，从5增加到8，降低每轮字数压力
  stage3: { cycles: 2 },
};

/**
 * 🔥 清理生成内容，移除不应该出现在成品中的元信息
 */
export const cleanGeneratedContent = (content: string): string => {
  if (!content) return content;

  let cleaned = content;

  // 1. 移除章节标题重复（如"第1章：XXX"）
  cleaned = cleaned.replace(/^#{1,6}\s*第[一二三四五六七八九十\d]+章[：:].*$/gm, '');
  
  // 2. 移除人物设定说明
  cleaned = cleaned.replace(/^(?:主角|配角|人物|角色)[人设设定]*[:：].*$/gm, '');
  cleaned = cleaned.replace(/^-?\s*(?:姓名|年龄|性格|缺陷|动机|背景)[:：].*$/gm, '');
  
  // 3. 移除情节分析/写作指导
  cleaned = cleaned.replace(/^(?:本章|这里|接下来|应该|需要).*(?:描写|展现|突出|强调|反转|冲突).*$/gm, '');
  cleaned = cleaned.replace(/^(?:【|\[).*(?:要点|提示|注意|说明|分析).*(?:】|\]).*$/gm, '');
  
  // 4. 移除元信息标注
  cleaned = cleaned.replace(/^(?:情感线索|角色成长|伏笔铺垫|剧情走向)[:：].*$/gm, '');
  cleaned = cleaned.replace(/^(?:故事大纲|分章梗概|预计章节).*$/gm, '');
  
  // 5. 移除字数标注（保留最后一个）
  const wordCountMatches = cleaned.match(/\[?字数[：:]\s*\d+\]?/g);
  if (wordCountMatches && wordCountMatches.length > 1) {
    // 移除所有字数标注
    cleaned = cleaned.replace(/\[?字数[：:]\s*\d+\]?/g, '');
    // 在末尾重新添加总字数
    const totalWords = cleaned.replace(/\s/g, '').length;
    cleaned += `\n\n[字数：${totalWords}]`;
  }
  
  // 6. 移除空行过多的部分
  cleaned = cleaned.replace(/\n{4,}/g, '\n\n\n');
  
  // 7. 去除首尾空白
  cleaned = cleaned.trim();

  console.log(`[cleanGeneratedContent] 清理前: ${content.length}字, 清理后: ${cleaned.length}字`);
  
  return cleaned;
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
      topic, keywords, wordCount, style, novelLength,
      reader, character, plot, rhythm, detail, emotion, antiAI
    } = params;

    const platformName = getPlatformName(reader?.targetPlatform || '');
    
    // 🔥 根据目标字数和篇幅类型，计算建议的章节数
    let suggestedChapterCount: number;
    let suggestedWordsPerChapter: number;
    
    if (novelLength === 'short' || wordCount <= 10000) {
      // 短篇：3-5章
      suggestedChapterCount = Math.max(3, Math.min(5, Math.ceil(wordCount / 2500)));
      suggestedWordsPerChapter = Math.ceil(wordCount / suggestedChapterCount);
    } else if (novelLength === 'medium' || wordCount <= 20000) {
      // 中篇：5-8章
      suggestedChapterCount = Math.max(5, Math.min(8, Math.ceil(wordCount / 2500)));
      suggestedWordsPerChapter = Math.ceil(wordCount / suggestedChapterCount);
    } else {
      // 长篇：按每章2500字计算
      suggestedChapterCount = Math.min(50, Math.ceil(wordCount / 2500));
      suggestedWordsPerChapter = 2500;
    }

    return `【最高优先级指令】你必须使用简体中文输出！绝对禁止使用英文或其他语言！

你现在是一位顶尖的${platformName}网络小说作家，请帮我创作这篇小说的完整大纲。

主题：${topic}
关键词：${keywords}
目标总字数：${wordCount} 字
整体文风：${style || '符合平台主流风格'}
篇幅类型：${novelLength === 'short' ? '短篇' : novelLength === 'medium' ? '中篇' : novelLength === 'long' ? '长篇' : '未指定'}

## ⚠️ 章节规划要求（极其重要）
1. **必须根据目标总字数 ${wordCount} 字来规划章节数**
2. **建议章节数：${suggestedChapterCount} 章**
3. **建议每章字数：${suggestedWordsPerChapter} 字左右**
4. **所有章节字数总和必须接近 ${wordCount} 字**
5. 例如：如果目标是10000字，应该规划为4章×2500字，而不是10章×500字

## ⚠️ 输出格式要求（极其重要）
1. **必须使用简体中文** - 禁止任何英文单词、句子或段落
2. **必须按照以下结构输出** - 不要自由发挥
3. **每个章节用一句话概括** - 不要展开详细内容
4. **人物设定要简洁** - 只写核心特征
5. **章节标题要简练有力** - 控制在8-15字以内，避免冗长描述

## 📝 章节标题规范（极其重要）
### ✅ 正确示例（简练有力）：
- 初入江湖
- 意外相遇
- 危机四伏
- 绝地反击
- 真相大白

### ❌ 错误示例（过于冗长）：
- 主人公第一次来到这个陌生的地方并且遇到了一个神秘的人
- 在经过一番激烈的战斗之后终于取得了胜利
- 两个人在咖啡馆里聊天聊了很多关于过去的事情

### 标题要求：
- 字数限制：8-15字
- 风格：简洁、有吸引力、富有张力
- 避免：描述性语句、连词过多、口语化表达

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
共${suggestedChapterCount}章，每章约${suggestedWordsPerChapter}字
（说明：总字数 = ${suggestedChapterCount}章 × ${suggestedWordsPerChapter}字/章 ≈ ${wordCount}字）

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
1. **必须确保生成内容达到 ${wordsPerCycle} 字以上**，否则视为任务失败！
2. **必须使用简体中文输出**，禁止任何英文单词或句子！
3. **只写故事正文内容**，不要包含任何分析、说明、设定介绍！
4. 如果感觉字数不够，请使用扩写技巧（增加对话、心理描写、环境细节等）来充实内容。

## 🚫 严格禁止的内容（绝对不能出现）
- ❌ 人物设定说明（如"主角性格：XXX"）
- ❌ 情节分析（如"这里应该有一个反转"）
- ❌ 写作指导（如"接下来要描写冲突"）
- ❌ 元信息标注（如"【本章要点】"、"【情感线索】"）
- ❌ 章节标题重复（不要在正文中再次写"第X章：XXX"）
- ❌ 任何非故事内容的说明文字

## ✅ 正确的输出格式
直接开始写故事正文，就像小说一样：
- 以场景描写或人物动作开头
- 包含对话、心理活动、环境描写
- 自然推进情节发展
- 在文末标注：[字数：XXXX]

Please directly begin write story正文， don't summarize, don't explain, directly write story content.`;

    return prompt;
  };

  const buildStage3Prompt = (
    currentContent: string,
    params: GenerationParams,
    relatedMemory: string = ''
  ): string => {
    const { antiAI } = params;

    let prompt = `请帮我打磨优化以下这篇小说，去除AI痕迹，让它更像真人写的。

## 📋 相关记忆 reference（ensure not change core plot and character setting）
${relatedMemory || '（无相关记忆）'}

## 📖 需要优化的原文
${currentContent}

## ✨ 优化要求

### 1. 保持故事完整性
- ✅ 保留所有情节发展和人物对话
- ✅ 保持原有的故事走向和节奏
- ❌ 不要删除重要情节或改变剧情

### 2. 去除AI痕迹
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
4. **必须使用简体中文输出**，禁止任何英文单词或句子

Please directly output optimized后的 complete text.`;

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
