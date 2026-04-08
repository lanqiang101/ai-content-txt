import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  PipelineConfig, GenerationState, GenerationParams, ContentHistory,
  ModelConfig, ReaderConfig, CharacterConfig, PlotConfig,
  RhythmConfig, DetailConfig, EmotionConfig, AntiAIConfig,
  Work, BookOutline, StoryboardResult
} from '../types';

interface AppState {
  config: PipelineConfig;
  params: GenerationParams;
  generation: GenerationState;
  history: ContentHistory[];
  works: Work[];
  currentWorkId: string | null;
  bookOutlines: BookOutline[];
  storyboards: StoryboardResult[];
  configOpen: boolean;
  historyOpen: boolean;
  worksOpen: boolean;
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
  toggleWorks: () => void;
  toggleDarkMode: () => void;
  resetGeneration: () => void;
  setWorks: (works: Work[]) => void;
  addWork: (work: Work) => void;
  updateWork: (id: string, updates: Partial<Work>) => void;
  deleteWork: (id: string) => void;
  setCurrentWork: (id: string | null) => void;
  setBookOutline: (outline: BookOutline) => void;
  addStoryboard: (result: StoryboardResult) => void;
}

// In development, use Vite proxy to avoid CORS issues
// In production, users can set the full URL if they host the static files behind a proxy
const isDev = import.meta.env.DEV;
// According to the documentation, the base URL is https://ark.cn-beijing.volces.com/api/coding/v3
// And the full endpoint is /chat/completions for OpenAI compatible API
const defaultApiUrl = isDev
  ? '/api/coding/v3'  // Vite proxy will forward to https://ark.cn-beijing.volces.com/api/coding/v3
  : 'https://ark.cn-beijing.volces.com/api/coding/v3';

const defaultModelConfig: (defaultModel: string) => ModelConfig = (defaultModel) => ({
  id: `model-${Date.now()}`,
  name: defaultModel,
  mode: 'local',
  localUrl: 'http://localhost:11434',
  apiUrl: defaultApiUrl,
  modelName: defaultModel,
  apiKey: '',
  enabled: true,
});

const defaultStageConfigWithActive = (defaultModel: string) => {
  const model = defaultModelConfig(defaultModel);
  return {
    models: [model],
    activeModelId: model.id,
  };
};

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
  stage1: defaultStageConfigWithActive('qwen2:7b'),
  stage2: defaultStageConfigWithActive('qwen2:7b'),
  stage3: defaultStageConfigWithActive('qwen2:7b'),
  random: defaultModelConfig('qwen2:7b'),
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
      works: [],
      currentWorkId: null,
      bookOutlines: [],
      storyboards: [],
      configOpen: false,
    historyOpen: false,
    worksOpen: false,
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
      toggleWorks: () => set((state) => ({ worksOpen: !state.worksOpen })),
      toggleDarkMode: () => set((state) => {
        if (state.darkMode === 'auto') return { darkMode: false };
        if (state.darkMode === false) return { darkMode: true };
        return { darkMode: 'auto' };
      }),

      resetGeneration: () => set({ generation: initialGeneration }),
      
      setWorks: (works) => set({ works }),
      addWork: (work) => set((state) => ({ works: [work, ...state.works] })),
      updateWork: (id, updates) => set((state) => ({
        works: state.works.map(w => w.id === id ? { ...w, ...updates } : w),
      })),
      deleteWork: (id) => set((state) => ({
        works: state.works.filter(w => w.id !== id),
      })),
      setCurrentWork: (id) => set({ currentWorkId: id }),
      
      setBookOutline: (outline) => set((state) => ({
        bookOutlines: state.bookOutlines.some(o => o.id === outline.id)
          ? state.bookOutlines.map(o => o.id === outline.id ? outline : o)
          : [...state.bookOutlines, outline],
      })),
      
      addStoryboard: (result) => set((state) => ({
        storyboards: [result, ...state.storyboards],
      })),
    }),
    {
      name: 'ai-content-txt-config',
    }
  )
);
