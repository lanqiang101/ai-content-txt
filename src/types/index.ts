export type ContentType = 'article' | 'novel';
export type ModelMode = 'local' | 'api';
export type WorkStatus = 'drafting' | 'completed' | 'failed' | 'archived';
export type StoryboardStyle = 'realistic' | 'anime' | 'ink' | '3d' | 'cartoon';

export interface ModelConfig {
  id: string;
  name: string;
  mode: ModelMode;
  localUrl: string;
  apiUrl: string;
  modelName: string;
  apiKey?: string;
  enabled: boolean;
}

export interface StageModelConfig {
  models: ModelConfig[];
  activeModelId: string;
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

export interface SceneDesc {
  name: string;
  description: string;
  background: string;
  lighting: string;
  mood: string;
}

export interface GenerationParamsInfo {
  title: string;
  topic: string;
  keywords: string;
  params?: GenerationParams;
}

export interface StoryboardConfig {
  workId: string;
  chapterNumber?: number;
  duration: number;
  clipsPerEpisode: number;
  clipDuration: number;
  mainCharacter: CharacterDesc;
  supportingCharacters: CharacterDesc[];
  scenes: SceneDesc[];
  videoSettings: VideoSettings;
  style: StoryboardStyle;
  tone: string;
  previousContent?: string;
  globalInfo?: GenerationParamsInfo;
}

export interface StoryboardPrompt {
  id: string;
  workId: string;
  chapterNumber?: number;
  clipNumber: number;
  scene: string;
  visual: string;
  duration: number;
  camera: string;
  audio: string;
  lighting: string;
  createdAt: number;
}

export interface StoryboardResult {
  id: string;
  workId: string;
  config: StoryboardConfig;
  prompts: StoryboardPrompt[];
  totalDuration: number;
  createdAt: number;
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
  result: string;
  createdAt: number;
}
