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

  // 5. 🔥 移除所有字数标注（不在末尾重新添加）
  cleaned = cleaned.replace(/\[?字数[：:]\s*\d+\]?/g, '');

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
    if (params.type === 'article') {
      return buildArticlePrompt(
        params.topic,
        params.title,
        params.keywords,
        params.wordCount,
        params.style
      );
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
      // 长篇：按每章2500-4000字计算
      suggestedChapterCount = Math.min(50, Math.ceil(wordCount / 3000));
      suggestedWordsPerChapter = Math.ceil(wordCount / suggestedChapterCount);
    }

    return `【最高优先级指令】你必须使用简体中文输出！绝对禁止使用英文或其他语言！

你现在是一位顶尖的${platformName}网络小说作家，请帮我创作这篇小说的完整大纲。

主题：${topic}
关键词：${keywords}
目标总字数：${wordCount} 字
整体文风：${style || '符合平台主流风格'}
篇幅类型：${novelLength === 'short' ? '短篇' : novelLength === 'medium' ? '中篇' : novelLength === 'long' ? '长篇' : '未指定'}

## ⚠️ 章节规划要求（极其重要 - 违反将导致生成失败）
1. **必须根据目标总字数 ${wordCount} 字来规划章节数**
2. **建议章节数：${suggestedChapterCount} 章**
3. **建议每章字数：${suggestedWordsPerChapter} 字左右（±20%浮动）**
4. **所有章节字数总和必须接近 ${wordCount} 字**
5. **每章字数计算公式：总字数 ÷ 章节数 = 每章字数**
6. 例如：如果目标是${wordCount}字，规划${suggestedChapterCount}章，则每章约${suggestedWordsPerChapter}字
7. **禁止**：不跑题、不水字数、不写半截内容、不写流水账、不进行无意义扩写

## ⚠️ 每章内容要求（极其重要）
### ✅ 必须做到：
1. **每章必须是一个完整的故事单元** - 有开头、发展、高潮、结尾
2. **每章结尾必须自然收束** - 可以留伏笔，但不允许未写完就结束
3. **情节必须连贯统一** - 与前文呼应，为后文铺垫
4. **字数必须严格控制** - 每章${suggestedWordsPerChapter}字左右，最多不超过${Math.floor(suggestedWordsPerChapter * 1.2)}字
5. **内容必须有实质性推进** - 不能注水、不能重复、不能空洞

### ❌ 严格禁止：
1. **禁止跑题** - 偏离主题或核心情节
2. **禁止水字数** - 用无意义的描写或对话凑字数
3. **禁止写半截内容** - 章节必须在完整的情节节点结束
4. **禁止流水账** - 不能只是罗列事件，要有重点和节奏
5. **禁止无意义扩写** - 不能为了凑字数而重复或拖沓
6. **禁止章节未完成就结束** - 每章必须有明确的结尾点

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

### 节奏控制
- 平均段落长度：${rhythm?.averageParaLength || 'short'}
- 冲突频率：${rhythm?.conflictFrequency || 50}%

### 细节描写
- 感官描写比例：${detail?.senseRatio || '中等'}
- 场景氛围：${getAtmosphereName(detail?.atmosphere || 'relaxed')}
- 环境描写比重：${detail?.environmentDescription || 30}%
- 外貌描写比重：${detail?.characterAppearance || 20}%
- 心理活动比重：${detail?.psychologicalActivity || 25}%
- 对话比例：${detail?.dialogueProportion || 35}%

### 情感表达
- 情感递进方式：${emotion?.progression || '渐进式'}
- 情感表达方式：${getEmotionStyleName(emotion?.expressionStyle || 'direct')}
- 核心情感基调：${emotion?.coreEmotion || '积极向上'}
- 情感强度：${emotion?.emotionalIntensity || 50}%
- 情感波动幅度：${emotion?.emotionalFluctuation || 40}%
- 主导情感：${emotion?.dominantEmotion || '希望与成长'}

## 📋 请按以下格式输出（严格遵守）

# 一、完整故事大纲
（用3-5句话概括整个故事的起承转合）

# 二、主角人设
- 姓名：XXX
- 年龄：XX岁
- 性格特点：XXX
- 核心缺陷：XXX
- 人物动机：XXX

# 三、分章节大纲（每章一句话梗概，必须体现完整性）
第1章：XXXXX（开头引入，建立情境）
第2章：XXXXX（情节发展，冲突升级）
第3章：XXXXX（高潮转折，问题解决）
...

# 四、预计章节列表
共${suggestedChapterCount}章，每章约${suggestedWordsPerChapter}字
（说明：总字数 = ${suggestedChapterCount}章 × ${suggestedWordsPerChapter}字/章 ≈ ${wordCount}字）
（要求：每章必须是完整的故事单元，有明确的开始和结束，不能半截而止）

---
再次强调：所有内容必须使用简体中文，禁止出现任何英文！每章必须是完整独立的单元！`;
  };

  const buildStage2Prompt = (
    stage1Result: string,
    params: GenerationParams,
    currentWordCount: number,
    relatedMemory: string = '',
    actualCycles?: number // 🔥 新增：实际循环次数
  ): string => {
    const { wordCount, novelLength, reader, character, plot, detail, emotion, antiAI } = params;

    // 🔥 如果是逐章生成模式，params.wordCount已经是单章目标字数
    // 如果是传统模式，params.wordCount是总字数，需要计算每轮字数
    const isChapterMode = novelLength === 'long' || novelLength === 'medium';
    const targetChapterWords = isChapterMode ? wordCount : wordCount; // 单章目标字数

    // 🔥 对于逐章生成，直接控制在本章字数范围内
    const maxAllowedWords = Math.floor(targetChapterWords * 1.2); // 最多120%
    const minRequiredWords = Math.floor(targetChapterWords * 0.8); // 最少80%

    // 🔥 使用实际循环次数，而不是固定值
    const cycles = actualCycles || CYCLE_CONFIG.stage2.cycles;
    const wordsPerCycle = Math.ceil(targetChapterWords / cycles);

    let prompt = `【最高优先级指令】你必须生成 **严格控制在 ${minRequiredWords}-${maxAllowedWords} 字范围内** 的内容！这是硬性要求！

## ⚠️ 字数控制要求（极其重要 - 违反将导致生成失败）
- **本章目标字数**: ${targetChapterWords} 字
- **最低要求**: ${minRequiredWords} 字（绝对不能低于此数）
- **最高限制**: ${maxAllowedWords} 字（绝对不能超过此数）
- **理想范围**: ${Math.floor(targetChapterWords * 0.9)} - ${Math.ceil(targetChapterWords * 1.1)} 字
- **本轮是第 1/${cycles} 轮，本轮目标约 ${wordsPerCycle} 字**
- **必须在文末标注实际字数**: [字数：XXXX]

## ⚠️ 内容质量要求（极其重要）
### ✅ 必须做到：
1. **章节必须完整独立** - 有明确的开头、发展、高潮、结尾
2. **结尾必须自然收束** - 可以留伏笔，但绝不允许未写完就结束
3. **情节必须有实质性推进** - 不能注水、不能重复、不能空洞
4. **与前文保持连贯** - 呼应前文，为后文铺垫
5. **严格控制字数** - 必须在规定范围内，不多不少

### ❌ 严格禁止：
1. **禁止跑题** - 偏离本章核心情节或主题
2. **禁止水字数** - 用无意义的描写或对话凑字数
3. **禁止写半截内容** - 章节必须在完整的情节节点结束
4. **禁止流水账** - 不能只是罗列事件，要有重点和节奏
5. **禁止无意义扩写** - 不能为了凑字数而重复或拖沓
6. **禁止章节未完成就结束** - 每章必须有明确的结尾点
7. **禁止字数超标** - 不能超过${maxAllowedWords}字
8. **禁止字数不足** - 不能低于${minRequiredWords}字

## 💡 如何在限定字数内写出好内容
1. **精准控制节奏** - 开头快速入题，中间充实发展，结尾干净利落
2. **对话简洁有力** - 每句对话都有目的，推动情节或展现人物
3. **描写恰到好处** - 关键场景细致描写，次要场景一笔带过
4. **情节紧凑推进** - 每个段落都有信息量，避免空转
5. **结尾收束自然** - 在情节点自然结束，不拖泥带水

## 📝 细节描写要求
- 感官描写比例：${detail?.senseRatio || '中等'}
- 场景氛围：${getAtmosphereName(detail?.atmosphere || 'relaxed')}
- 环境描写比重：${detail?.environmentDescription || 30}%
- 外貌描写比重：${detail?.characterAppearance || 20}%
- 心理活动比重：${detail?.psychologicalActivity || 25}%
- 对话比例：${detail?.dialogueProportion || 35}%

## 🎭 情感表达要求
- 情感递进方式：${emotion?.progression || '渐进式'}
- 情感表达方式：${getEmotionStyleName(emotion?.expressionStyle || 'direct')}
- 核心情感基调：${emotion?.coreEmotion || '积极向上'}
- 情感强度：${emotion?.emotionalIntensity || 50}%
- 情感波动幅度：${emotion?.emotionalFluctuation || 40}%
- 主导情感：${emotion?.dominantEmotion || '希望与成长'}

## 相关记忆参考
${relatedMemory || '（无相关记忆）'}

## 故事大纲
${stage1Result}

当前已经写了 ${currentWordCount} 字，本章目标 ${targetChapterWords} 字。
`;

    // 🔥 添加人物设定
    if (character?.coreFlaw) {
      prompt += `\n## 👤 人物设定（极其重要）
- 主角核心缺陷：${character.coreFlaw}（必须贯穿始终，推动情节发展）
- 隐藏秘密强度：${character?.secretIntensity || 0}%
- 人物弧光：${character?.arcType === 'none' ? '无弧光/不变态' :
          character?.arcType === 'positive' ? '成长弧光' :
            character?.arcType === 'fall' ? '堕落弧光' : '复杂反转'}
`;
    }

    // 🔥 添加读者定位
    if (reader?.coreAppeal) {
      prompt += `\n## 🎯 读者诉求
- 始终紧扣核心诉求：${reader.coreAppeal}
`;
    }
    if (reader?.taboo) {
      prompt += `\n## 🚫 禁忌内容
- 绝对不能包含：${reader.taboo}
`;
    }

    // 🔥 添加情节架构
    if (plot?.forceConflictAtStart) {
      prompt += `\n## ⚡ 开篇要求
- 必须有冲突抓住读者
`;
    }
    if (plot?.seedForeshadow) {
      prompt += `\n## 🔮 伏笔要求
- 需要埋下关键伏笔
`;
    }

    // 🔥 添加反AI化要求
    if (antiAI?.templateDeletePercent && antiAI.templateDeletePercent > 0) {
      prompt += `\n## 🤖 反AI化要求
- 删除模板化句式，避免"只见""就在这时""殊不知"等AI常用开头
`;
    }
    if (antiAI?.unpredictableTurnPercent && antiAI.unpredictableTurnPercent > 20) {
      prompt += `\n- 增加不可预测的转折，拒绝套路化写作
`;
    }

    prompt += `\n⚠️ **再次强调（极其重要）**: 
1. **字数必须严格控制在 ${minRequiredWords}-${maxAllowedWords} 字范围内**，超出或不足都视为失败！
2. **必须使用简体中文输出**，禁止任何英文单词或句子！
3. **只写故事正文内容**，不要包含任何分析、说明、设定介绍！
4. **章节必须完整** - 有开头、发展、高潮、结尾，绝不允许未写完就结束！
5. **禁止跑题、禁止水字数、禁止写半截内容、禁止写流水账、禁止无意义扩写**！
6. **细节描写要恰到好处** - 按照设定的比例进行环境、外貌、心理、对话描写
7. **情感表达要真实自然** - 按照设定的情感基调和强度进行表达

## 🚫 严格禁止的内容（绝对不能出现）
- ❌ 人物设定说明（如"主角性格：XXX"）
- ❌ 情节分析（如"这里应该有一个反转"）
- ❌ 写作指导（如"接下来要描写冲突"）
- ❌ 元信息标注（如"【本章要点】"、"【情感线索】"）
- ❌ 章节标题重复（不要在正文中再次写"第X章：XXX"）
- ❌ 任何非故事内容的说明文字
- ❌ 章节未写完就结束（必须有明确的结尾点）
- ❌ 字数超过${maxAllowedWords}字或低于${minRequiredWords}字

## ✅ 正确的输出格式
直接开始写故事正文，就像小说一样：
- 以场景描写或人物动作开头
- 包含对话、心理活动、环境描写
- 自然推进情节发展
- 在情节点自然收束，完整结束本章
- 在文末标注：[字数：XXXX]

## ⚠️ 字数自检要求
在生成内容前，请先在内心计算：
- 我的目标是写 ${targetChapterWords} 字左右
- 最少不能低于 ${minRequiredWords} 字
- 最多不能超过 ${maxAllowedWords} 字
- 每个段落都要有信息量，不能注水
- 结尾必须在完整的情节节点收束

Please directly begin writing the story content. **STRICTLY CONTROL WORD COUNT: ${minRequiredWords}-${maxAllowedWords} characters**. **CHAPTER MUST BE COMPLETE AND SELF-CONTAINED**.`;

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
