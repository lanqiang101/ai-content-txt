
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  PipelineConfig, GenerationState, GenerationParams, ContentHistory,
  ModelConfig, ReaderConfig, CharacterConfig, PlotConfig,
  RhythmConfig, DetailConfig, EmotionConfig, AntiAIConfig,
  Work, BookOutline, StoryboardResult, Character, BatchAutomationConfig
} from '../types';
import { initDb, dbService } from '../services/db';

// 异步初始化数据库，初始化完成后重新加载数据
import type { SetState, GetState } from 'zustand';
const initializeStore = async (set: SetState<AppState>, get: GetState<AppState>) => {
  try {
    await initDb();
    console.log('后端 API 初始化完成');
    // 配置由 persist 保留，业务数据从后端加载
    // 作品列表等需要重新从后端加载的逻辑在业务组件中处理
  } catch (error) {
    console.error('后端 API 初始化失败，请确保后端服务已启动:', error);
  }
};

const defaultModelConfig: (defaultModel: string) => ModelConfig = (defaultModel) => ({
  id: String(Date.now()),
  name: defaultModel,
  mode: 'api',
  provider: 'custom',
  model: defaultModel,
  modelName: defaultModel,
  apiUrl: '/api/coding/v3',
  localUrl: 'http://localhost:11434',
  apiKey: '',
  temperature: 0.7,
  topP: 0.9,
  maxTokens: 4096,
  timeout: 30000,
  enabled: true,
});

export const defaultReaderConfig: ReaderConfig = {
  ageRange: '18-25',
  genderPreference: 'all',
  coreAppeal: '爽点',
  taboo: '',
  targetPlatform: 'tomato',
};

export const defaultCharacterConfig: CharacterConfig = {
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

export const defaultPlotConfig: PlotConfig = {
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

export const defaultRhythmConfig: RhythmConfig = {
  alternation: '3段平淡 + 1段高潮',
  climaxDensity: '每3k字小高潮，每1w字中高潮',
  chapterEndHook: true,
  conflictFrequency: 50,
  bufferNodes: true,
  averageParaLength: 'short',
};

export const defaultDetailConfig: DetailConfig = {
  senseRatio: '视觉60% + 听觉25% + 嗅觉10% + 触觉5%',
  locationDetails: '',
  atmosphere: 'relaxed',
  randomInterlude: true,
};

export const defaultEmotionConfig: EmotionConfig = {
  progression: '陌生→好奇→共情→动容',
  empathyScenes: '逆袭',
  expressionStyle: 'reserved',
  coreEmotion: '',
};

export const defaultAntiAIConfig: AntiAIConfig = {
  templateDeletePercent: 60,
  casualTolerance: 30,
  unpredictableTurnPercent: 40,
  whitespacePercent: 20,
  writingStyle: 'soft',
};

// 获取完整默认配置，保证结构不缺
const getDefaultConfig = (): PipelineConfig => {
  const defaultModel = defaultModelConfig('ep-20250210-xxxxx');
  return {
    stage1: {
      models: [defaultModel],
      activeModelId: defaultModel.id,
    },
    stage2: {
      models: [defaultModelConfig('ep-20250210-xxxxx')],
      activeModelId: defaultModel.id,
    },
    stage3: {
      models: [defaultModelConfig('ep-20250210-xxxxx')],
      activeModelId: defaultModel.id,
    },
    random: {
      models: [defaultModelConfig('ep-20250210-xxxxx')],
      activeModelId: defaultModel.id,
    },
    storyboard: {
      models: [defaultModelConfig('ep-20250210-xxxxx')],
      activeModelId: defaultModel.id,
    },
  };
};

// 从数据库加载配置
const loadInitialConfig = (): PipelineConfig => {
  try {
    if (!dbService.isInitialized()) {
      console.log('数据库未初始化，使用默认配置');
      return getDefaultConfig();
    }
    return getDefaultConfig();
  } catch (e) {
    console.error('加载配置失败:', e);
    return getDefaultConfig();
  }
};

// 从数据库加载生成参数
const loadInitialParams = (): GenerationParams => {
  try {
    if (!dbService.isInitialized()) {
      console.log('数据库未初始化，使用默认参数');
    }
    return {
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
  } catch (e) {
    console.error('加载生成参数失败:', e);
    return {
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
  }
};

// 从数据库加载定时器自动化配置
const loadInitialTimerAutomation = (): {
  enabled: boolean;
  bookCount: number;
  minWordCount: number;
  maxWordCount: number;
  themes: string[];
  intervalMinutes: number;
  isRunning: boolean;
  params: GenerationParams;
} => {
  try {
    if (!dbService.isInitialized()) {
      console.log('数据库未初始化，使用默认定时器配置');
    }
    return {
      enabled: false,
      bookCount: 3,
      minWordCount: 1000,
      maxWordCount: 5000,
      themes: [],
      intervalMinutes: 30,
      isRunning: false,
      params: {
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
      },
    };
  } catch (e) {
    console.error('加载定时器配置失败:', e);
    return {
      enabled: false,
      bookCount: 3,
      minWordCount: 1000,
      maxWordCount: 5000,
      themes: [],
      intervalMinutes: 30,
      isRunning: false,
      params: {
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
      },
    };
  }
};

// 初始空列表
const loadInitialWorks = (): Work[] => {
  return [];
};

const loadInitialHistory = (): ContentHistory[] => {
  return [];
};

const loadInitialCharacters = (): Character[] => {
  return [];
};

const loadInitialStoryboards = (): StoryboardResult[] => {
  return [];
};

const loadInitialBookOutlines = (): BookOutline[] => {
  return [];
};

const initialDarkMode = (): boolean | 'auto' => {
  return 'auto';
};

interface TimerAutomation extends Omit<BatchAutomationConfig, 'params'> {
  params: GenerationParams;
}

interface AppState {
  config: PipelineConfig;
  params: GenerationParams; // 保留作为向后兼容,但主要使用singleParams和batchParams
  singleParams: GenerationParams; // 单篇创作独立参数
  batchParams: GenerationParams; // 批量创作独立参数
  generation: GenerationState;
  history: ContentHistory[];
  works: Work[];
  currentWorkId: string | null;
  bookOutlines: BookOutline[];
  storyboards: StoryboardResult[];
  characters: Character[];
  configOpen: boolean;
  historyOpen: boolean;
  worksOpen: boolean;
  darkMode: boolean | 'auto';
  timerAutomation: TimerAutomation;

  setConfig: (newConfig: Partial<PipelineConfig>) => void;
  loadConfigFromDB: () => Promise<void>;
  setParams: (newParams: Partial<GenerationParams>) => void; // 保留作为向后兼容
  setSingleParams: (newParams: Partial<GenerationParams>) => void; // 设置单篇创作参数
  setBatchParams: (newParams: Partial<GenerationParams>) => void; // 设置批量创作参数
  setGeneration: (newGeneration: Partial<GenerationState>) => void;
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
  deleteWork: (id: string) => Promise<void>;
  addCharacter: (character: Character) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  deleteCharacter: (id: string) => void;
  setCurrentWork: (id: string | null) => void;
  setBookOutline: (outline: BookOutline) => void;
  addStoryboard: (result: StoryboardResult) => void;
  deleteStoryboard: (id: string) => void;
  setTimerAutomation: (automation: Partial<TimerAutomation>) => void;
}

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
    (set, get) => {
      // 初始值用默认值，数据库就绪后异步更新
      const initialState = {
        config: loadInitialConfig(),
        params: loadInitialParams(),
        singleParams: loadInitialParams(), // 单篇创作独立参数
        batchParams: { ...loadInitialParams(), themes: [] }, // 批量创作独立参数(不包含themes字段,因为会在TimerAutomation中管理)
        generation: initialGeneration,
        history: loadInitialHistory(),
        works: loadInitialWorks(),
        currentWorkId: null,
        bookOutlines: loadInitialBookOutlines(),
        storyboards: loadInitialStoryboards(),
        characters: loadInitialCharacters(),
        configOpen: false,
        historyOpen: false,
        worksOpen: false,
        darkMode: initialDarkMode(),
        timerAutomation: loadInitialTimerAutomation(),

        setConfig: (newConfig: Partial<PipelineConfig>) => set((state) => ({
          config: { ...state.config, ...newConfig },
        })),
        loadConfigFromDB: async () => {
          try {
            const models = await dbService.getModels();
            if (!models || models.length === 0) {
              console.log('未找到可用模型配置');
              return;
            }
            
            const enabledModels = models.filter(model => model.enabled);
            if (enabledModels.length === 0) {
              console.log('未找到启用的模型配置');
              return;
            }
            
            const defaultModel = enabledModels[0];
            const modelList = enabledModels.map(model => ({
              id: String(model.id),
              name: model.name,
              mode: model.mode as 'local' | 'remote' | 'openai' | 'api',
              modelName: model.modelName,
              apiKey: model.apiKey,
              apiUrl: model.baseUrl,
              baseUrl: model.baseUrl,
              maxTokens: model.maxTokens,
              temperature: model.temperature,
              topP: 0.9,
              timeout: 30000,
              provider: 'custom',
              model: model.modelName,
              enabled: model.enabled,
            }));
            
            set((state) => ({
              config: {
                ...state.config,
                stage1: { models: modelList, activeModelId: String(defaultModel.id) },
                stage2: { models: modelList, activeModelId: String(defaultModel.id) },
                stage3: { models: modelList, activeModelId: String(defaultModel.id) },
                random: { models: modelList, activeModelId: String(defaultModel.id) },
                storyboard: { models: modelList, activeModelId: String(defaultModel.id) },
              },
            }));
            
            console.log('✅ 已从数据库加载模型配置:', enabledModels.length, '个模型');
          } catch (e) {
            console.error('❌ 从数据库加载配置失败:', e);
          }
        },
        setParams: (newParams: Partial<GenerationParams>) => set((state) => ({
          params: { ...state.params, ...newParams },
        })),
        setSingleParams: (newParams: Partial<GenerationParams>) => set((state) => ({
          singleParams: { ...state.singleParams, ...newParams },
        })),
        setBatchParams: (newParams: Partial<GenerationParams>) => set((state) => ({
          batchParams: { ...state.batchParams, ...newParams },
        })),
        setGeneration: (newGeneration: Partial<GenerationState>) => set((state) => ({
          generation: { ...state.generation, ...newGeneration },
        })),
        addToHistory: (item: ContentHistory) => set((state) => ({
          history: [item, ...state.history],
        })),
        clearHistory: () => set({ history: [] }),
        deleteFromHistory: (id: string) => set((state) => ({
          history: state.history.filter(h => h.id !== id),
        })),
        loadFromHistory: (item: ContentHistory) => set((state) => ({
          params: { ...state.params, topic: item.topic || '' },
        })),
        toggleConfig: () => set((state) => ({
          configOpen: !state.configOpen,
        })),
        toggleHistory: () => set((state) => ({
          historyOpen: !state.historyOpen,
        })),
        toggleWorks: () => set((state) => ({
          worksOpen: !state.worksOpen,
        })),
        toggleDarkMode: () => set((state) => {
          if (state.darkMode === 'auto') return { darkMode: false };
          if (state.darkMode === false) return { darkMode: true };
          return { darkMode: 'auto' };
        }),
        resetGeneration: () => set({
          generation: initialGeneration,
        }),
        setWorks: (works: Work[]) => set({ works }),
        addWork: async (work: Work) => {
          set((state) => ({
            works: [work, ...state.works],
          }));
          // 保存到数据库
          try {
            await dbService.addWork(work);
            console.log('✅ 作品已保存到数据库:', work.id);
          } catch (error) {
            console.error('❌ 保存作品到数据库失败:', error);
          }
        },
        updateWork: async (id: string, updates: Partial<Work>) => {
          set((state) => ({
            works: state.works.map(w => w.id === id ? { ...w, ...updates } : w),
          }));
          // 更新到数据库
          try {
            await dbService.updateWork(id, updates);
            console.log('✅ 作品已更新到数据库:', id);
          } catch (error) {
            console.error('❌ 更新作品到数据库失败:', error);
          }
        },
        deleteWork: async (id: string) => {
          set((state) => ({
            works: state.works.filter(w => w.id !== id),
          }));
          // 从数据库删除
          try {
            await dbService.deleteWork(id);
            console.log('✅ 作品已从数据库删除:', id);
          } catch (error) {
            console.error('❌ 从数据库删除作品失败:', error);
          }
        },
        addCharacter: (character: Character) => set((state) => ({
          characters: [...state.characters, character],
        })),
        updateCharacter: (id: string, updates: Partial<Character>) => set((state) => ({
          characters: state.characters.map(c => c.id === id ? { ...c, ...updates } : c),
        })),
        deleteCharacter: (id: string) => set((state) => ({
          characters: state.characters.filter(c => c.id !== id),
        })),
        setCurrentWork: (id: string | null) => set({ currentWorkId: id }),
        setBookOutline: (outline: BookOutline) => set((state) => ({
          bookOutlines: state.bookOutlines.filter(o => o.id !== outline.id)
            .concat([outline]),
        })),
        addStoryboard: (result: StoryboardResult) => set((state) => ({
          storyboards: [result, ...state.storyboards],
        })),
        deleteStoryboard: (id: string) => set((state) => ({
          storyboards: state.storyboards.filter(s => s.id !== id),
        })),
        setTimerAutomation: (automation: Partial<TimerAutomation>) => set((state) => ({
          timerAutomation: { ...state.timerAutomation, ...automation },
        })),
      };

      // 异步初始化完成后更新数据
      initializeStore(set, get);

      return initialState;
    },
    {
      name: 'ai-content-txt-config',
      // persist 配置到 localStorage 作为兜底
    }
  )
);
























