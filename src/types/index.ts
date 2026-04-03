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

export interface GenerationParams {
  type: ContentType;
  topic: string;
  keywords: string;
  wordCount: number;
  style: string;
}

export interface GenerationState {
  currentStage: number;
  stage1Result: string;
  stage2Result: string;
  stage3Result: string;
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
