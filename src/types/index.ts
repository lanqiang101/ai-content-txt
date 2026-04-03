export type ContentType = 'article' | 'novel';

export type ModelMode = 'local' | 'api';

export interface ModelConfig {
  mode: ModelMode;
  localUrl: string;
  apiUrl: string;
  modelName: string;
  apiKey?: string;
}

export interface PipelineConfig {
  stage1: ModelConfig;
  stage2: ModelConfig;
  stage3: ModelConfig;
}

// 新增：小说专业创作-读者定位参数
export interface ReaderConfig {
  ageRange: string;
  genderPreference: 'male' | 'female' | 'all';
  coreAppeal: string;
  taboo: string;
  targetPlatform: 'tomato' | 'qidian' | 'jjwxc' | 'zhihu' | 'short' | 'article';
}

// 新增：小说专业创作-人物深度参数
export interface CharacterConfig {
  coreFlaw: string;
  motivation: string;
  habits: string;
  emotionThreshold: string;
  growthArc: string;
}

// 新增：小说专业创作-情节连贯参数
export interface PlotConfig {
  mainChain: string;
  foreshadowing: string;
  branchRatio: number; // 0-100
  causalConstraint: boolean;
  checkReversal: boolean;
}

// 新增：小说专业创作-节奏张力参数
export interface RhythmConfig {
  alternation: string;
  climaxDensity: string;
  chapterEndHook: boolean;
  conflictFrequency: number; // 0-100
  bufferNodes: boolean;
}

// 新增：小说专业创作-感官细节参数
export interface DetailConfig {
  senseRatio: string;
  locationDetails: string;
  atmosphere: 'depressed' | 'warm' | 'relaxed' | 'tense';
  randomInterlude: boolean;
}

// 新增：小说专业创作-情感共鸣参数
export interface EmotionConfig {
  progression: string;
  empathyScenes: string;
  expressionStyle: 'reserved' | 'direct' | 'insincere';
  coreEmotion: string;
}

// 新增：小说专业创作-反AI化参数
export interface AntiAIConfig {
  templateDeletePercent: number; // 0-100
  casualTolerance: number; // 0-100
  unpredictableTurnPercent: number; // 0-100
  whitespacePercent: number; // 0-100
  writingStyle: 'hard' | 'soft' | 'sharp' | 'humor' | 'art';
}

export interface GenerationParams {
  // 基础参数保留
  type: ContentType;
  topic: string;
  keywords: string;
  wordCount: number;
  style: string;

  // 新增：小说专业创作七大参数
  reader: ReaderConfig;
  character: CharacterConfig;
  plot: PlotConfig;
  rhythm: RhythmConfig;
  detail: DetailConfig;
  emotion: EmotionConfig;
  antiAI: AntiAIConfig;
}

// 新增：循环状态
export interface CycleState {
  stage: number; // 1-3
  cycle: number; // 1-2, 1-3, 1-2
  completedTotal: number; // 已完成次数 0-7
}

export interface GenerationState {
  currentStage: number;
  currentCycle: number;
  completedCycles: number;
  stage1Result: string;
  stage2Result: string;
  stage3Result: string;
  // 保存每一轮循环结果，支持查看历史
  cycleResults: {
    stage: number;
    cycle: number;
    result: string;
  }[];
  isGenerating: boolean;
  isGeneratingStage: number | null;
  error: string | null;
}

export interface ContentHistory {
  id: string;
  type: ContentType;
  topic: string;
  result: string;
  createdAt: number;
}
