// 循环配置 - 针对长文本优化的黄金比例
export const CYCLE_CONFIG = {
  stage1: { cycles: 2, name: '核心骨架搭建期' },
  stage2: { 
    cycles: 10, // 🔥 默认值，实际使用时会根据目标字数动态调整
    name: '血肉细节填充期',
    // 🔥 根据目标字数动态计算循环次数的函数
    getCycles: (targetWords: number): number => {
      if (targetWords <= 5000) return 6;      // 短篇：6轮
      if (targetWords <= 10000) return 8;     // 中短篇：8轮
      if (targetWords <= 20000) return 10;    // 中篇：10轮
      if (targetWords <= 50000) return 12;    // 长篇：12轮
      return 14;                               // 超长篇：14轮
    }
  },
  stage3: { cycles: 2, name: '去AI化质感打磨期' },
  total: 14, // 默认值，实际会动态计算
};

// 🔥 获取总循环次数（用于进度条显示）
export const getTotalCycles = (targetWords: number): number => {
  return CYCLE_CONFIG.stage1.cycles + 
         CYCLE_CONFIG.stage2.getCycles(targetWords) + 
         CYCLE_CONFIG.stage3.cycles;
};

// 🔥 智能内容分析工具
export interface ContentAnalysis {
  avgParagraphLength: number;        // 平均段落长度
  dialogueRatio: number;             // 对话比例（0-1）
  descriptionRatio: number;          // 描写比例（0-1）
  actionRatio: number;               // 动作比例（0-1）
  hasWeakSections: boolean;          // 是否有薄弱部分
  weakSectionTypes: string[];        // 薄弱部分类型
  suggestions: string[];             // 改进建议
}

/**
 * 分析文本内容的质量指标
 */
export const analyzeContentQuality = (text: string): ContentAnalysis => {
  if (!text || text.length === 0) {
    return {
      avgParagraphLength: 0,
      dialogueRatio: 0,
      descriptionRatio: 0,
      actionRatio: 0,
      hasWeakSections: true,
      weakSectionTypes: ['empty'],
      suggestions: ['内容为空，需要生成内容'],
    };
  }

  // 分割段落
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0);
  const paragraphLengths = paragraphs.map(p => p.length);
  const avgParagraphLength = paragraphLengths.reduce((sum, len) => sum + len, 0) / paragraphs.length;

  // 检测对话比例（引号内的内容）
  const dialogueMatches = text.match(/[""「」『』《》][""「」『』《》]*?[""「」『』《》]/g) || [];
  const dialogueLength = dialogueMatches.reduce((sum, match) => sum + match.length, 0);
  const dialogueRatio = dialogueLength / text.length;

  // 检测描写比例（形容词、副词、环境描写关键词）
  const descriptionKeywords = ['仿佛', '如同', '似乎', '渐渐', '缓缓', '轻轻', '静静', '微微', '淡淡'];
  let descriptionCount = 0;
  descriptionKeywords.forEach(keyword => {
    const matches = text.match(new RegExp(keyword, 'g'));
    if (matches) descriptionCount += matches.length;
  });
  const descriptionRatio = Math.min(descriptionCount * 50 / text.length, 1); // 估算

  // 检测动作比例（动词密集度）
  const actionKeywords = ['走', '跑', '跳', '飞', '打', '杀', '说', '看', '听', '想', '做', '拿', '放'];
  let actionCount = 0;
  actionKeywords.forEach(keyword => {
    const matches = text.match(new RegExp(keyword, 'g'));
    if (matches) actionCount += matches.length;
  });
  const actionRatio = Math.min(actionCount * 30 / text.length, 1); // 估算

  // 判断薄弱部分
  const weakSectionTypes: string[] = [];
  const suggestions: string[] = [];

  if (avgParagraphLength < 100) {
    weakSectionTypes.push('short_paragraphs');
    suggestions.push('段落过短，建议增加细节描写和扩展内容');
  }

  if (dialogueRatio < 0.15) {
    weakSectionTypes.push('low_dialogue');
    suggestions.push('对话比例偏低，建议增加角色互动和对白');
  }

  if (descriptionRatio < 0.1) {
    weakSectionTypes.push('low_description');
    suggestions.push('环境描写不足，建议增加场景氛围渲染');
  }

  if (actionRatio < 0.1) {
    weakSectionTypes.push('low_action');
    suggestions.push('动作描写不足，建议增加情节推进和角色行动');
  }

  if (text.length < 1000 && paragraphs.length < 5) {
    weakSectionTypes.push('insufficient_content');
    suggestions.push('内容量严重不足，需要大幅扩充');
  }

  return {
    avgParagraphLength,
    dialogueRatio,
    descriptionRatio,
    actionRatio,
    hasWeakSections: weakSectionTypes.length > 0,
    weakSectionTypes,
    suggestions,
  };
};

/**
 * 根据分析结果生成针对性的续写 Prompt
 */
export const generateTargetedContinuationPrompt = (
  existingContent: string,
  analysis: ContentAnalysis,
  remainingWords: number
): string => {
  const weakTypes = analysis.weakSectionTypes;
  
  let targetedInstructions = '';
  
  if (weakTypes.includes('low_dialogue')) {
    targetedInstructions += `
【重点补充：对话互动】
- 增加角色之间的对话交流
- 通过对话展现角色性格和情感
- 对话要自然流畅，符合角色身份
`;
  }

  if (weakTypes.includes('low_description')) {
    targetedInstructions += `
【重点补充：环境描写】
- 详细描绘场景氛围（光线、声音、气味等）
- 增加心理活动和情感描写
- 使用比喻、拟人等修辞手法增强画面感
`;
  }

  if (weakTypes.includes('low_action')) {
    targetedInstructions += `
【重点补充：动作情节】
- 增加角色的具体行动和反应
- 推动情节发展，制造冲突或转折
- 描写战斗、追逐、探索等动态场景
`;
  }

  if (weakTypes.includes('short_paragraphs')) {
    targetedInstructions += `
【重点补充：内容扩展】
- 扩展现有段落的细节
- 增加背景信息和前因后果
- 深入挖掘角色的内心世界
`;
  }

  return `【智能续写任务】根据内容分析结果，针对性地补充薄弱环节！

【已生成内容概览】
开头（前300字）：
${existingContent.substring(0, 300)}

结尾（后300字）：
${existingContent.slice(-300)}

【内容质量分析】
- 平均段落长度: ${Math.round(analysis.avgParagraphLength)} 字
- 对话比例: ${(analysis.dialogueRatio * 100).toFixed(1)}%
- 描写比例: ${(analysis.descriptionRatio * 100).toFixed(1)}%
- 动作比例: ${(analysis.actionRatio * 100).toFixed(1)}%

【薄弱环节】
${analysis.suggestions.map(s => `- ${s}`).join('\n')}

【续写要求】
1. 还需要至少再写 ${remainingWords} 字
2. ${targetedInstructions.trim()}
3. 保持文风与上文一致，不要重复已有内容
4. 从故事中间部分插入，确保连贯性
5. 直接输出正文内容，不要添加任何说明或标题

请开始针对性补充：`;
};