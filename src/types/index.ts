export type ContentType = 'article' | 'novel';
export type ModelMode = 'local' | 'api';
export type WorkStatus = 'drafting' | 'completed' | 'failed' | 'archived';
export type StoryboardStyle = 'realistic' | 'anime' | 'ink' | '3d' | 'cartoon';

// 分镜类型区分
export type StoryboardType = 'drama' | 'comic';
// drama = 漫剧（动态视频分镜，每个镜头有持续时间，用于生成短视频）
// comic = 漫画（静态分镜，每个分镜一格/一页，用于生成漫画）

export interface ModelConfig {
  id: number;
  name: string;
  mode?: ModelMode;
  localUrl?: string;
  apiUrl?: string;
  modelName: string;
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  temperature?: number;
  enabled: boolean;
}

export interface StageModelConfig {
  models: ModelConfig[];
  activeModelId: number;
}

export interface PipelineConfig {
  stage1: StageModelConfig;
  stage2: StageModelConfig;
  stage3: StageModelConfig;
  random: ModelConfig;
  storyboard: StageModelConfig;
}

export interface ReaderConfig {
  ageRange: string;
  genderPreference: 'male' | 'female' | 'all';
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
}

export interface EmotionConfig {
  progression: string;
  empathyScenes: string;
  expressionStyle: 'reserved' | 'direct' | 'insincere';
  coreEmotion: string;
}

export interface AntiAIConfig {
  templateDeletePercent: number;
  casualTolerance: number;
  unpredictableTurnPercent: number;
  whitespacePercent: number;
  writingStyle: 'hard' | 'soft' | 'sharp' | 'humor' | 'art';
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
}

export interface CycleResult {
  stage: number;
  cycle: number;
  result: string;
  createdAt: number;
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
  createdAt: number;
  updatedAt: number;
  storyboardIds: string[];
  content?: string;
  generationParams?: GenerationParams;
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

// 漫剧视频配置（原有保留扩展）
export interface VideoSettings {
  resolution: '1920x1080' | '1280x720' | '720x1280' | '1080x1920';
  aspectRatio: '16:9' | '9:16' | '1:1';
  fps: 24 | 30 | 60;
  format: 'mp4' | 'mov' | 'webm';
  duration: number;
  clipDuration: number;
  clipsPerEpisode: number;
  distributionChannel: DistributionChannel;
}

// 漫画专属配置
export interface ComicSettings {
  comicFormat: 'vertical_strip' | 'horizontal_page';
  frameCount: number;
  frameLayout: 'vertical' | 'horizontal' | 'mixed' | 'closeup_lead';
  readOrder: 'top_to_bottom' | 'right_to_left' | 'left_to_right';
  aspectRatio: '1:1' | '16:9' | '9:16' | '4:3';
  outputFormat: 'png' | 'jpg' | 'webp';
}

export type DistributionChannel =
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
  | 'cel-shaded';

export interface CharacterDesc {
  id: string;
  name: string;
  description: string;
  appearance: string;
  personality: string;
  outfit: string;
  role: 'main' | 'supporting';
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
  type: 'drama';
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
  currentStage: number;
  currentCycle: number;
  completedCycles: number;
  stage1Result: string;
  stage2Result: string;
  stage3Result: string;
  cycleResults: CycleResult[];
  isGenerating: boolean;
  isGeneratingStage: number | null;
  error: string | null;
  bookState?: BookGenerationState;
}

export interface ContentHistory {
  id: string;
  type: ContentType;
  topic: string;
  result: GenerationParams;
  createdAt: number;
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
