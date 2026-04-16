export type ContentType = 'article' | 'novel';
export type ModelMode = 'local' | 'api';
export type WorkStatus = 'draft' | 'generating' | 'completed' | 'failed' | 'archived';
export type StoryboardStyle = 'realistic' | 'anime' | 'ink' | '3d' | 'cartoon';

// 分镜类型区分
export type StoryboardType = 'video' | 'comic';
// video = 漫剧（动态视频分镜，每个镜头有持续时间，用于生成短视频）
// comic = 漫画（静态分镜，每个分镜一格/一页，用于生成漫画）

export interface ModelConfig {
  id: string;
  name: string;
  modelName: string;
  baseUrl?: string;
  enabled: boolean;
  mode: 'local' | 'remote' | 'openai' | 'api';
  provider: string;
  model: string;
  apiKey?: string;
  apiUrl?: string;
  localUrl?: string;
  temperature: number;
  topP: number;
  maxTokens: number;
  timeout: number;
}

export interface StageModelConfig {
  models: ModelConfig[];
  activeModelId: string | null;
}

export interface PipelineConfig {
  stage1: StageModelConfig;
  stage2: StageModelConfig;
  stage3: StageModelConfig;
  random?: StageModelConfig;
  storyboard?: StageModelConfig;
  popularTopics?: StageModelConfig; // 热门主题推荐模型
  chapterContinuation?: StageModelConfig; // 章节续写模型
  chapterOptimization?: StageModelConfig; // 章节优化模型
  enabledStages?: number[];
  cyclesPerStage?: Record<number, number>;
  autoContinue?: boolean;
  stopAfterStage?: number;
}

export interface ReaderConfig {
  ageRange: string;
  genderPreference?: 'male' | 'female' | 'all';
  coreAppeal: string;
  taboo: string;
  targetPlatform: 'tomato' | 'qidian' | 'jjwxc' | 'zhihu' | 'short' | 'article';
}

export interface CharacterConfig {
  coreFlaw: string;
  motivation: string;
  habits: string;
  emotionThreshold: string;
  growthArc: string;
  secretIntensity: number;
  goldenSentencePerThousand: number;
  arcType: 'none' | 'positive' | 'fall' | 'complex';
  supportingBackstory: boolean;
}

export interface PlotConfig {
  mainChain: string;
  foreshadowing: string;
  branchRatio: number;
  causalConstraint: boolean;
  checkReversal: boolean;
  hookWordCount: number;
  twistPerThousand: number;
  structure: 'linear' | 'inverted' | 'interrupt' | 'multiline';
  forceConflictAtStart: boolean;
  seedForeshadow: boolean;
  openEnding: boolean;
}

export interface RhythmConfig {
  alternation: string;
  climaxDensity: string;
  chapterEndHook: boolean;
  conflictFrequency: number;
  bufferNodes: boolean;
  averageParaLength: 'short' | 'medium' | 'long';
}

export interface DetailConfig {
  senseRatio: string;
  locationDetails: string;
  atmosphere: 'depressed' | 'warm' | 'relaxed' | 'tense';
  randomInterlude: boolean;
  environmentDescription?: number;
  characterAppearance?: number;
  psychologicalActivity?: number;
  dialogueProportion?: number;
}

export interface EmotionConfig {
  progression: string;
  empathyScenes: string;
  expressionStyle: 'reserved' | 'direct' | 'insincere';
  coreEmotion: string;
  emotionalIntensity?: number;
  emotionalFluctuation?: number;
  dominantEmotion?: string;
}

export interface AntiAIConfig {
  templateDeletePercent: number;
  casualTolerance: number;
  unpredictableTurnPercent: number;
  whitespacePercent: number;
  writingStyle: 'hard' | 'soft' | 'sharp' | 'humor' | 'art';
  humanizeLevel?: number;
}

export interface GenerationParams {
  type: ContentType;
  topic: string;
  title: string;
  keywords: string;
  wordCount: number;
  style: string;
  reader: ReaderConfig;
  character: CharacterConfig;
  plot: PlotConfig;
  rhythm: RhythmConfig;
  detail: DetailConfig;
  emotion: EmotionConfig;
  antiAI: AntiAIConfig;
  novelLength?: 'short' | 'medium' | 'long';
  initialChapters?: number;
}

export interface CycleResult {
  stage: number;
  cycle: number;
  content?: string;
  result?: string;
  timestamp?: number;
  createdAt?: number;
}

export interface StageData {
  stage: 1 | 2 | 3;
  input: GenerationParams;
  output: string;
  cycleResults: CycleResult[];
}

export interface Chapter {
  id: string;
  workId: string;
  chapterNumber: number;
  title: string;
  summary: string;
  content: string;
  wordCount: number;
  stageData: StageData;
  createdAt: number;
  updatedAt: number;
}

export interface ChapterOutline {
  chapterNumber: number;
  title: string;
  summary: string;
  targetWordCount: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

export interface BookOutline {
  id: string;
  workId: string;
  chapters: ChapterOutline[];
  createdAt: number;
}

export interface Work {
  id: string;
  title: string;
  topic: string;
  keywords: string;
  type: ContentType;
  expectedWordCount: number;
  actualWordCount: number;
  chapterCount: number;
  status: WorkStatus;
  chapters: Chapter[];
  characters: CharacterDesc[];
  storyboardIds?: string[];
  content?: string;
  generationParams?: GenerationParams;
  createdAt: number;
  updatedAt: number;
}

export interface WorkFull extends Work {
  chapters: Chapter[];
  bookOutline?: BookOutline;
}

export interface OptimizationRequest {
  workId?: string;
  chapterId?: string;
  scope: 'full' | 'chapter' | 'paragraph';
  targetChapterNumber?: number;
  targetParagraph?: string;
  instructions: string;
}

export interface OptimizationHistory {
  id: string;
  workId: string;
  chapterId?: string;
  originalContent: string;
  optimizedContent: string;
  instructions: string;
  createdAt: number;
}

// 视频设置
export interface VideoSettings {
  resolution: string;
  fps: number;
  duration: number;
  style: string;
  aspectRatio?: string;
  codec?: string;
  clipDuration?: number;
  clipsPerEpisode?: number;
  distributionChannel?: DistributionChannel;
  format?: string;
}

// 漫画设置
export interface ComicSettings {
  style: string;
  panelCount: number;
  colorScheme: string;
  comicFormat?: 'webtoon' | 'manga' | 'manhua' | 'vertical_strip' | 'horizontal_page';
  frameCount?: number;
  frameLayout?: 'single' | 'double' | 'grid' | 'vertical' | 'horizontal' | 'mixed' | 'closeup_lead';
  readOrder?: 'left-to-right' | 'right-to-left' | 'top-to-bottom' | 'top_to_bottom' | 'right_to_left' | 'left_to_right';
  aspectRatio?: string;
  outputFormat?: string;
}

export type DistributionChannel =
  | 'douyin'
  | 'bilibili'
  | 'youtube'
  | 'other'
  | '抖音'
  | '快手'
  | 'B站'
  | '视频号'
  | '小红书'
  | 'YouTube'
  | 'TikTok'
  | '多平台';

export type AnimeStyle =
  | 'anime'
  | 'realistic'
  | 'ink'
  | '3d'
  | 'cartoon'
  | 'semi-realistic'
  | 'cel-shaded'
  | 'manga'
  | 'chibi';

export interface CharacterDesc {
  id: string;
  name: string;
  description: string;
  appearance: string;
  personality: string;
  outfit: string;
  role: 'main' | 'supporting';
  workId?: string;
  createdAt?: number;
}

export interface SceneDesc {
  name: string;
  description: string;
  background: string;
  lighting: string;
  mood: string;
}

export interface Character {
  id: string;
  workId: string;
  name: string;
  description: string;
  appearance: string;
  personality: string;
  outfit: string;
  role: 'main' | 'supporting';
  createdAt: number;
  updatedAt: number;
}

// 统一分镜配置基类 - 添加 style 属性到基类
export interface StoryboardConfigBase {
  workId: string;
  chapterNumber?: number;
  tone: string;
  artStyle: string;
  colorStyle: string;
  style: AnimeStyle;
  type: StoryboardType;
  prohibitedContent?: string;
  detailLevel?: string;
  lensEmotion?: string;
}

// 漫剧分镜配置
export interface DramaStoryboardConfig extends StoryboardConfigBase {
  type: 'video';
  videoSettings: VideoSettings;
  rhythm: 'slow' | 'medium' | 'fast';
}

// 漫画分镜配置
export interface ComicStoryboardConfig extends StoryboardConfigBase {
  type: 'comic';
  comicSettings: ComicSettings;
}

// 联合类型：config 根据 type 不同有不同扩展
export type StoryboardConfig = DramaStoryboardConfig | ComicStoryboardConfig;

export interface StoryboardResult {
  id: string;
  workId: string;
  chapterNumber: number;
  config: StoryboardConfig;
  scenes: SceneDesc[];
  createdAt: number;
}

export interface GenerationParamsInfo {
  title: string;
  topic: string;
  keywords: string;
  params?: GenerationParams;
}

export interface CycleState {
  stage: number;
  cycle: number;
  completedTotal: number;
}

export interface BookGenerationState {
  mode: 'chapter' | 'book';
  currentChapter: number;
  totalChapters: number;
  bookOutline?: BookOutline;
  chapters: Chapter[];
  isGenerating: boolean;
  error: string | null;
}

export interface GenerationState {
  isGenerating: boolean;
  completedCycles: number;
  cycleResults: CycleResult[];
  isGeneratingStage: number | null;
  error: string | null;
  currentStage: number;
  currentCycle: number;
  stage1Result: string;
  stage2Result: string;
  stage3Result: string;
  currentWorkId?: string; // 🔥 当前正在生成的作品ID，用于后台任务追踪
}

// 批量自动创作配置
export interface BatchAutomationConfig {
  enabled: boolean;
  bookCount: number;
  minWordCount: number;
  maxWordCount: number;
  themes: string[];
  isRunning: boolean;
  // 批量创作独立参数配置 - 完全独立于单次创作
  params: GenerationParams;
}

// 生成状态
export interface GenerationState {
  isGenerating: boolean;
  completedCycles: number;
  cycleResults: CycleResult[];
  isGeneratingStage: number | null;
  error: string | null;
  currentStage: number;
  currentCycle: number;
  stage1Result: string;
  stage2Result: string;
  stage3Result: string;
}

// 续写状态
export interface ContinueWritingState {
  workId: string | null;
  targetChapterNumber: number | null;
  isContinuing: boolean;
}

// 定时器自动化配置
export interface TimerAutomationState {
  isRunning: boolean;
  bookCount: number;
  minWordCount: number;
  maxWordCount: number;
  themes: string[];
}

// 内容历史
export interface ContentHistory {
  id: string;
  workId: string;
  content: string;
  chapterNumber?: number;
  timestamp: number;
  type: 'generation' | 'optimization' | 'continuation';
  topic?: string;
}

// 分镜结果
export interface StoryboardResult {
  id: string;
  workId: string;
  chapterNumber?: number;
  scenes: SceneDesc[];
  config: StoryboardConfig;
  createdAt: number;
  type: StoryboardType;
}

// 作品
export interface Work {
  id: string;
  title: string;
  topic: string;
  keywords: string;
  type: ContentType;
  expectedWordCount: number;
  actualWordCount: number;
  chapterCount: number;
  status: WorkStatus;
  chapters: Chapter[];
  characters: CharacterDesc[];
  storyboardIds?: string[];
  content?: string;
  generationParams?: GenerationParams;
  createdAt: number;
  updatedAt: number;
}

// 章节
export interface Chapter {
  id: string;
  workId?: string;
  title: string;
  content: string;
  summary?: string;
  chapterNumber?: number;
  wordCount?: number;
  createdAt: number;
  updatedAt: number;
}

// 应用状态
export interface AppState {
  // UI 状态
  darkMode: boolean;
  toggleDarkMode: () => void;
  configOpen: boolean;
  toggleConfig: () => void;
  historyOpen: boolean;
  toggleHistory: () => void;
  worksOpen: boolean;
  toggleWorks: () => void;
  
  // 生成相关
  generation: GenerationState;
  setGeneration: (state: Partial<GenerationState>) => void;
  resetGeneration: () => void;
  
  // 参数配置
  params: GenerationParams;
  setParams: (params: Partial<GenerationParams>) => void;
  
  // 流水线配置
  config: PipelineConfig;
  setConfig: (config: Partial<PipelineConfig>) => void;
  resetConfig: () => void;
  
  // 作品管理
  currentWorkId: string | null;
  setCurrentWorkId: (id: string | null) => void;
  works: Work[];
  setCurrentWork: (work: Work | null) => void;
  deleteWork: (id: string) => void;
  
  // 分镜管理
  storyboards: StoryboardResult[];
  addStoryboard: (storyboard: StoryboardResult) => void;
  deleteStoryboard: (id: string) => void;
  
  // 人物管理
  characters: CharacterDesc[];
  addCharacter: (character: Omit<CharacterDesc, 'id' | 'createdAt'>) => void;
  deleteCharacter: (id: string) => void;
  
  // 历史记录
  history: ContentHistory[];
  addToHistory: (item: Omit<ContentHistory, 'id'>) => void;
  clearHistory: () => void;
  loadFromHistory: (id: string) => void;
  deleteFromHistory: (id: string) => void;
  
  // 续写
  continueWriting: ContinueWritingState;
  setContinueWriting: (state: Partial<ContinueWritingState>) => void;
  resetContinueWriting: () => void;
  
  // 定时器自动化
  timerAutomation: TimerAutomationState;
  setTimerAutomation: (state: Partial<TimerAutomationState>) => void;
}

// 默认生成参数
export const defaultGenerationParams: GenerationParams = {
  type: 'novel',
  topic: '',
  title: '',
  keywords: '',
  wordCount: 3000,
  style: '现代都市',
  reader: {
    ageRange: '18-35岁',
    coreAppeal: '强情节、快节奏',
    taboo: '政治敏感、色情暴力',
    targetPlatform: 'tomato',
  },
  character: {
    coreFlaw: '',
    motivation: '',
    habits: '',
    emotionThreshold: '',
    growthArc: '',
    secretIntensity: 5,
    goldenSentencePerThousand: 2,
    arcType: 'positive',
    supportingBackstory: false,
  },
  plot: {
    mainChain: '',
    foreshadowing: '',
    branchRatio: 0.3,
    causalConstraint: true,
    checkReversal: true,
    hookWordCount: 100,
    twistPerThousand: 3,
    structure: 'linear',
    forceConflictAtStart: true,
    seedForeshadow: true,
    openEnding: false,
  },
  rhythm: {
    alternation: 'fast-slow',
    climaxDensity: 'medium',
    chapterEndHook: true,
    conflictFrequency: 3,
    bufferNodes: true,
    averageParaLength: 'medium',
  },
  detail: {
    senseRatio: 'balanced',
    locationDetails: 'moderate',
    atmosphere: 'warm',
    randomInterlude: false,
    environmentDescription: 30,
    characterAppearance: 20,
    psychologicalActivity: 40,
    dialogueProportion: 50,
  },
  emotion: {
    progression: 'gradual',
    empathyScenes: 'moderate',
    expressionStyle: 'direct',
    coreEmotion: 'hope',
    emotionalIntensity: 7,
    emotionalFluctuation: 5,
    dominantEmotion: 'positive',
  },
  antiAI: {
    templateDeletePercent: 30,
    casualTolerance: 50,
    unpredictableTurnPercent: 20,
    whitespacePercent: 10,
    writingStyle: 'soft',
    humanizeLevel: 7,
  },
  novelLength: 'medium',
  initialChapters: 10,
};

// 默认流水线配置
export const defaultPipelineConfig: PipelineConfig = {
  stage1: { models: [], activeModelId: null },
  stage2: { models: [], activeModelId: null },
  stage3: { models: [], activeModelId: null },
  enabledStages: [1, 2, 3],
  cyclesPerStage: { 1: 2, 2: 3, 3: 2 },
  autoContinue: true,
};
