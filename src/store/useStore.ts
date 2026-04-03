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
};

const defaultPlotConfig: PlotConfig = {
  mainChain: '',
  foreshadowing: '',
  branchRatio: 30,
  causalConstraint: true,
  checkReversal: true,
};

const defaultRhythmConfig: RhythmConfig = {
  alternation: '3段平淡 + 1段高潮',
  climaxDensity: '每3k字小高潮，每1w字中高潮',
  chapterEndHook: true,
  conflictFrequency: 50,
  bufferNodes: true,
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
  stage1: defaultStageConfig('qwen2:0.5b'),
  stage2: defaultStageConfig('qwen2:7b'),
  stage3: {
    ...defaultStageConfig(''),
    mode: 'api',
  },
};

const initialParams: GenerationParams = {
  type: 'novel',
  topic: '',
  keywords: '',
  wordCount: 1500,
  style: '',
  // 新增七大参数默认值
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

      resetGeneration: () => set({ generation: initialGeneration }),
    }),
    {
      name: 'ai-content-txt-config',
    }
  )
);
