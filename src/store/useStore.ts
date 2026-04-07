import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  PipelineConfig, GenerationState, GenerationParams, ContentHistory,
  ModelConfig, ReaderConfig, CharacterConfig, PlotConfig,
  RhythmConfig, DetailConfig, EmotionConfig, AntiAIConfig
} from '../types';

interface AppState {
  config: PipelineConfig;
  params: GenerationParams;
  generation: GenerationState;
  history: ContentHistory[];
  configOpen: boolean;
  historyOpen: boolean;
  darkMode: boolean | 'auto';

  setConfig: (config: Partial<PipelineConfig>) => void;
  setParams: (params: Partial<GenerationParams>) => void;
  setGeneration: (generation: Partial<GenerationState>) => void;
  addToHistory: (item: ContentHistory) => void;
  clearHistory: () => void;
  deleteFromHistory: (id: string) => void;
  loadFromHistory: (item: ContentHistory) => void;
  toggleConfig: () => void;
  toggleHistory: () => void;
  toggleDarkMode: () => void;
  resetGeneration: () => void;
}

// In development, use Vite proxy to avoid CORS issues
// In production, users can set the full URL if they host the static files behind a proxy
const isDev = import.meta.env.DEV;
// According to the documentation, the base URL is https://ark.cn-beijing.volces.com/api/coding/v3
// And the full endpoint is /chat/completions for OpenAI compatible API
const defaultApiUrl = isDev
  ? '/api/coding/v3'  // Vite proxy will forward to https://ark.cn-beijing.volces.com/api/coding/v3
  : 'https://ark.cn-beijing.volces.com/api/coding/v3';

const defaultStageConfig: (defaultModel: string) => ModelConfig = (defaultModel) => ({
  mode: 'local',
  localUrl: 'http://localhost:11434',
  apiUrl: defaultApiUrl,
  modelName: defaultModel,
  apiKey: '',
});

const defaultReaderConfig: ReaderConfig = {
  ageRange: '18-25',
  genderPreference: 'all',
  coreAppeal: '爽点',
  taboo: '',
  targetPlatform: 'tomato',
};

const defaultCharacterConfig: CharacterConfig = {
  coreFlaw: '',
  motivation: '',
  habits: '',
  emotionThreshold: '',
  growthArc: '',
  secretIntensity: 50,
  goldenSentencePerThousand: 2,
  arcType: 'none',
  supportingBackstory: false,
};

const defaultPlotConfig: PlotConfig = {
  mainChain: '',
  foreshadowing: '',
  branchRatio: 30,
  causalConstraint: true,
  checkReversal: true,
  hookWordCount: 500,
  twistPerThousand: 1,
  structure: 'linear',
  forceConflictAtStart: true,
  seedForeshadow: true,
  openEnding: false,
};

const defaultRhythmConfig: RhythmConfig = {
  alternation: '3段平淡 + 1段高潮',
  climaxDensity: '每3k字小高潮，每1w字中高潮',
  chapterEndHook: true,
  conflictFrequency: 50,
  bufferNodes: true,
  averageParaLength: 'short',
};

const defaultDetailConfig: DetailConfig = {
  senseRatio: '视觉60% + 听觉25% + 嗅觉10% + 触觉5%',
  locationDetails: '',
  atmosphere: 'relaxed',
  randomInterlude: true,
};

const defaultEmotionConfig: EmotionConfig = {
  progression: '陌生→好奇→共情→动容',
  empathyScenes: '逆袭',
  expressionStyle: 'reserved',
  coreEmotion: '',
};

const defaultAntiAIConfig: AntiAIConfig = {
  templateDeletePercent: 60,
  casualTolerance: 30,
  unpredictableTurnPercent: 40,
  whitespacePercent: 20,
  writingStyle: 'soft',
};

const initialConfig: PipelineConfig = {
  stage1: {
    ...defaultStageConfig('qwen2.5:7b'),
    mode: 'api',
  },
  stage2: {
    ...defaultStageConfig('qwen2.5:7b'),
    mode: 'api',
  },
  stage3: {
    ...defaultStageConfig('qwen2.5:7b'),
    mode: 'api',
  },
  random: defaultStageConfig('qwen2.5:7b'),
};

const initialParams: GenerationParams = {
  type: 'novel',
  topic: '',
  title: '',
  keywords: '',
  wordCount: 1500,
  style: '',
  reader: defaultReaderConfig,
  character: defaultCharacterConfig,
  plot: defaultPlotConfig,
  rhythm: defaultRhythmConfig,
  detail: defaultDetailConfig,
  emotion: defaultEmotionConfig,
  antiAI: defaultAntiAIConfig,
};

const initialGeneration: GenerationState = {
  currentStage: 0,
  currentCycle: 0,
  completedCycles: 0,
  stage1Result: '',
  stage2Result: '',
  stage3Result: '',
  cycleResults: [],
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
      darkMode: 'auto',

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
            ...get().params,
            type: item.type,
            topic: item.topic,
          },
          generation: {
            ...initialGeneration,
            stage3Result: item.result,
            currentStage: 3,
            completedCycles: 7,
          },
        }),

      toggleConfig: () => set((state) => ({ configOpen: !state.configOpen })),
      toggleHistory: () => set((state) => ({ historyOpen: !state.historyOpen })),
      toggleDarkMode: () => set((state) => {
        if (state.darkMode === 'auto') return { darkMode: false };
        if (state.darkMode === false) return { darkMode: true };
        return { darkMode: 'auto' };
      }),

      resetGeneration: () => set({ generation: initialGeneration, params: initialParams }),
    }),
    {
      name: 'ai-content-txt-config',
      // In development, always force proxy URL to avoid CORS issues
      onRehydrateStorage: () => (state) => {
        if (isDev && state) {
          // Force all apiUrl to use proxy in development
          const forceProxy = (config: ModelConfig): ModelConfig => {
            if (config.apiUrl.includes('ark.cn-beijing.volces.com')) {
              return { ...config, apiUrl: '/api/coding/v3' };
            }
            return config;
          };
          state.config = {
            ...state.config,
            stage1: forceProxy(state.config.stage1),
            stage2: forceProxy(state.config.stage2),
            stage3: forceProxy(state.config.stage3),
            random: forceProxy(state.config.random),
          };
        }
      },
    }
  )
);
