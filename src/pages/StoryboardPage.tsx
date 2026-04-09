import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Play, Settings, Download, Copy, Check, 
  Clapperboard, Video, Clock, Film, Zap
} from "lucide-react";
import { useStore } from "../store/useStore";
import { useGeneration } from "../hooks/useGeneration";
import { 
  VideoSettings, DistributionChannel, AnimeStyle, 
  StoryboardPrompt, StoryboardResult 
} from "../types";

const RESOLUTION_OPTIONS = [
  { value: '1920x1080', label: '1920x1080 (16:9)' },
  { value: '1280x720', label: '1280x720 (16:9)' },
  { value: '720x1280', label: '720x1280 (9:16)' },
  { value: '1080x1920', label: '1080x1920 (9:16)' },
] as const;

const FPS_OPTIONS = [24, 30, 60] as const;

const FORMAT_OPTIONS = ['mp4', 'mov', 'webm'] as const;

const CHANNEL_OPTIONS: DistributionChannel[] = [
  '抖音', '快手', 'B站', '视频号', '小红书', 'YouTube', 'TikTok', '多平台'
];

const STYLE_OPTIONS: AnimeStyle[] = [
  'anime', 'realistic', 'ink', '3d', 'cartoon', 'semi-realistic', 'cel-shaded'
];

const STYLE_LABELS: Record<AnimeStyle, string> = {
  'anime': '动漫',
  'realistic': '写实',
  'ink': '水墨',
  '3d': '3D',
  'cartoon': '卡通',
  'semi-realistic': '半写实',
  'cel-shaded': '赛璐珞',
};

export const StoryboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workId = searchParams.get('workId');
  const storyboardId = searchParams.get('storyboardId');
  
  const { works, storyboards, updateWork } = useStore();
  const { generateStoryboard, callModel } = useGeneration();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const work = workId ? works.find(w => w.id === workId) : null;
  const storyboard = storyboardId 
    ? storyboards.find(s => s.id === storyboardId)
    : storyboards.find(s => s.workId === workId);

  const [settings, setSettings] = useState<VideoSettings>({
    resolution: '1080x1920',
    aspectRatio: '9:16',
    fps: 30,
    format: 'mp4',
    duration: 60,
    clipDuration: 10,
    clipsPerEpisode: 6,
    distributionChannel: '抖音',
  });

  const [style, setStyle] = useState<AnimeStyle>('anime');
  const [tone, setTone] = useState('紧张');
  const [mainCharacterDesc, setMainCharacterDesc] = useState('');

  useEffect(() => {
    if (storyboard?.config) {
      setSettings({
        resolution: storyboard.config.videoSettings.resolution,
        aspectRatio: storyboard.config.videoSettings.aspectRatio,
        fps: storyboard.config.videoSettings.fps,
        format: storyboard.config.videoSettings.format,
        duration: storyboard.config.videoSettings.duration,
        clipDuration: storyboard.config.videoSettings.clipDuration,
        clipsPerEpisode: storyboard.config.videoSettings.clipsPerEpisode,
        distributionChannel: storyboard.config.videoSettings.distributionChannel,
      });
      setStyle(storyboard.config.style as AnimeStyle);
      setTone(storyboard.config.tone);
    }
  }, [storyboard]);

  const handleResolutionChange = (resolution: typeof settings.resolution) => {
    const aspectRatio = resolution.includes('x1920') || resolution.includes('x1280') 
      ? '9:16' 
      : '16:9';
    setSettings(prev => ({ ...prev, resolution, aspectRatio: aspectRatio as typeof prev.aspectRatio }));
  };

  const handleGenerate = async () => {
    if (!work) return;
    
    setIsGenerating(true);
    try {
      const workData = works.find(w => w.id === workId);
      const content = workData?.topic || '';
      
      const result = await generateStoryboard(content, {
        workId: workId || '',
        duration: settings.duration,
        clipsPerEpisode: settings.clipsPerEpisode,
        clipDuration: settings.clipDuration,
        videoSettings: settings,
        style: style as any,
        tone,
        mainCharacter: {
          name: '主角',
          description: mainCharacterDesc || '请从小说内容中提取主角形象',
          appearance: '',
          personality: '',
          outfit: '',
        },
        supportingCharacters: [],
        scenes: [],
      });

      useStore.getState().addStoryboard(result);
      
      if (workId) {
        const currentWork = works.find(w => w.id === workId);
        const existingIds = currentWork?.storyboardIds || [];
        updateWork(workId, {
          storyboardIds: [...existingIds, result.id],
        });
      }
      
      navigate(`/storyboard?workId=${workId}&storyboardId=${result.id}`);
    } catch (error) {
      console.error('Storyboard generation failed:', error);
      alert('分镜生成失败: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPrompt = async (prompt: StoryboardPrompt) => {
    await navigator.clipboard.writeText(prompt.visual);
    setCopiedId(prompt.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}分${secs}秒` : `${secs}秒`;
  };

  if (!work) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 dark:from-slate-900 dark:to-slate-950 p-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-6"
          >
            <ArrowLeft size={20} />
            返回主页
          </button>
          <div className="text-center py-20">
            <Clapperboard size={64} className="mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">未找到作品</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <Clapperboard className="text-pink-500" />
                视频分镜生成
              </h1>
              <p className="text-gray-500 dark:text-gray-400">{work.title}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 border border-gray-200/50 dark:border-slate-700/50">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                  分镜参数配置
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    视频时长（秒）
                  </label>
                  <input
                    type="number"
                    value={settings.duration}
                    onChange={(e) => setSettings(prev => ({ ...prev, duration: parseInt(e.target.value) || 60 }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    分镜数量
                  </label>
                  <input
                    type="number"
                    value={settings.clipsPerEpisode}
                    onChange={(e) => setSettings(prev => ({ ...prev, clipsPerEpisode: parseInt(e.target.value) || 6 }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    片段时长（秒）
                  </label>
                  <input
                    type="number"
                    value={settings.clipDuration}
                    onChange={(e) => setSettings(prev => ({ ...prev, clipDuration: parseInt(e.target.value) || 10 }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    视频分辨率
                  </label>
                  <select
                    value={settings.resolution}
                    onChange={(e) => handleResolutionChange(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  >
                    {RESOLUTION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    帧率
                  </label>
                  <div className="flex gap-2">
                    {FPS_OPTIONS.map(fps => (
                      <button
                        key={fps}
                        onClick={() => setSettings(prev => ({ ...prev, fps }))}
                        className={`flex-1 py-2 rounded-lg transition-all ${
                          settings.fps === fps
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                        }`}
                      >
                        {fps}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    投放渠道
                  </label>
                  <select
                    value={settings.distributionChannel}
                    onChange={(e) => setSettings(prev => ({ ...prev, distributionChannel: e.target.value as DistributionChannel }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  >
                    {CHANNEL_OPTIONS.map(ch => (
                      <option key={ch} value={ch}>{ch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    视频风格
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value as AnimeStyle)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  >
                    {STYLE_OPTIONS.map(s => (
                      <option key={s} value={s}>{STYLE_LABELS[s]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    视频基调
                  </label>
                  <input
                    type="text"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    placeholder="紧张、温馨、浪漫..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    主角描述（可选）
                  </label>
                  <textarea
                    value={mainCharacterDesc}
                    onChange={(e) => setMainCharacterDesc(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 resize-none"
                    placeholder="描述主角外貌特征，用于AI生成画面..."
                  />
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl font-medium transition-all disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      生成分镜
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            {storyboard ? (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Clapperboard className="text-pink-500" />
                      <h2 className="text-lg font-bold text-gray-800 dark:text-white">
                        分镜结果
                      </h2>
                      <span className="px-2 py-1 text-sm bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full">
                        {storyboard.prompts.length} 个分镜
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock size={14} />
                      <span>总时长: {formatDuration(storyboard.totalDuration)}</span>
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-200 dark:divide-slate-700 max-h-[70vh] overflow-y-auto">
                  {storyboard.prompts.map((prompt, index) => (
                    <div key={prompt.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="w-6 h-6 flex items-center justify-center bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-sm font-medium">
                              {index + 1}
                            </span>
                            <span className="font-medium text-gray-800 dark:text-white">
                              {prompt.scene}
                            </span>
                            <span className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded">
                              {prompt.duration}秒
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">运镜: </span>
                              <span className="text-gray-700 dark:text-gray-300">{prompt.camera}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">光线: </span>
                              <span className="text-gray-700 dark:text-gray-300">{prompt.lighting}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 dark:text-gray-400">音效: </span>
                              <span className="text-gray-700 dark:text-gray-300">{prompt.audio}</span>
                            </div>
                          </div>
                          
                          <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">AI提示词:</p>
                            <p className="text-sm text-gray-800 dark:text-gray-200 font-mono">
                              {prompt.visual}
                            </p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleCopyPrompt(prompt)}
                          className="p-2 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg transition-colors"
                          title="复制提示词"
                        >
                          {copiedId === prompt.id ? (
                            <Check size={18} className="text-green-500" />
                          ) : (
                            <Copy size={18} className="text-gray-400" />
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 p-12 text-center">
                <Video size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">
                  还没有生成分镜
                </p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  点击左侧"生成分镜"按钮开始生成
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryboardPage;
