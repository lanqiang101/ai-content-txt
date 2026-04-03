import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { PipelineConfig, GenerationState, GenerationParams, ContentHistory, ModelConfig } from '../types';

interface AppState {
  config: PipelineConfig;
  params: GenerationParams;
  generation: GenerationState;
  history: ContentHistory[];
  configOpen: boolean;
  historyOpen: boolean;

  setConfig: (config: Partial<PipelineConfig>) => void;
  setParams: (params: Partial<GenerationParams>) => void;
  setGeneration: (generation: Partial<GenerationState>) => void;
  addToHistory: (item: ContentHistory) => void;
  clearHistory: () => void;
  deleteFromHistory: (id: string) => void;
  loadFromHistory: (item: ContentHistory) => void;
  toggleConfig: () => void;
  toggleHistory: () => void;
  resetGeneration: () => void;
}

const defaultStageConfig: (defaultModel: string) => ModelConfig = (defaultModel) => ({
  mode: 'local',
  localUrl: 'http://localhost:11434',
  apiUrl: '/api/v3/chat/completions',
  modelName: defaultModel,
  apiKey: '',
});

const initialConfig: PipelineConfig = {
  stage1: defaultStageConfig('qwen2:0.5b'),
  stage2: defaultStageConfig('qwen2:7b'),
  stage3: {
    ...defaultStageConfig(''),
    mode: 'api',
  },
};

const initialParams: GenerationParams = {
  type: 'article',
  topic: '',
  keywords: '',
  wordCount: 1500,
  style: '专业正式',
};

const initialGeneration: GenerationState = {
  currentStage: 0,
  stage1Result: '',
  stage2Result: '',
  stage3Result: '',
  isGenerating: false,
  isGeneratingStage: null,
  error: null,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      config: initialConfig,
      params: initialParams,
      generation: initialGeneration,
      history: [],
      configOpen: false,
      historyOpen: false,

      setConfig: (newConfig) =>
        set((state) => ({
          config: { ...state.config, ...newConfig },
        })),

      setParams: (newParams) =>
        set((state) => ({
          params: { ...state.params, ...newParams },
        })),

      setGeneration: (newGeneration) =>
        set((state) => ({
          generation: { ...state.generation, ...newGeneration },
        })),

      addToHistory: (item) =>
        set((state) => ({
          history: [item, ...state.history],
        })),

      clearHistory: () => set({ history: [] }),

      deleteFromHistory: (id) =>
        set((state) => ({
          history: state.history.filter(item => item.id !== id),
        })),

      loadFromHistory: (item) =>
        set({
          params: {
            type: item.type,
            topic: item.topic,
            keywords: get().params.keywords,
            wordCount: get().params.wordCount,
            style: get().params.style,
          },
          generation: {
            ...initialGeneration,
            stage3Result: item.result,
            currentStage: 3,
          },
        }),

      toggleConfig: () => set((state) => ({ configOpen: !state.configOpen })),
      toggleHistory: () => set((state) => ({ historyOpen: !state.historyOpen })),

      resetGeneration: () => set({ generation: initialGeneration }),
    }),
    {
      name: 'ai-content-pipeline-config',
    }
  )
);
