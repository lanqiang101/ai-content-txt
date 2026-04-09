import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Play, Settings, Download, Copy, Check, 
  Clapperboard, Video, Clock, Film, Zap, User, ChevronDown, ChevronRight, Loader2, Sparkles
} from "lucide-react";
import { useStore } from "../store/useStore";
import { useGeneration } from "../hooks/useGeneration";
import { 
  VideoSettings, DistributionChannel, AnimeStyle, 
  StoryboardPrompt, StoryboardResult, Character
} from "../types";

const RESOLUTION_OPTIONS = [
  { value: '1920x1080', label: '1920x1080 (16:9)' },
  { value: '1280x720', label: '1280x720 (16:9)' },
  { value: '720x1280', label: '720x1280 (9:16)' },
  { value: '1080x1920', label: '1080x1920 (9:16)' },
] as const;

const FPS_OPTIONS = [24, 30, 60] as const;

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
  
  const { works, storyboards, updateWork, characters, generation } = useStore();
  const { generateStoryboard, callModel, generateCandidates } = useGeneration();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSmartGenerating, setIsSmartGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [showCharacterPanel, setShowCharacterPanel] = useState(false);
  
  const work = workId ? works.find(w => w.id === workId) : null;
  const storyboard = storyboardId 
    ? storyboards.find(s => s.id === storyboardId)
    : storyboards.find(s => s.workId === workId);
  
  const workCharacters = characters.filter(c => c.workId === workId);
  const mainCharacters = workCharacters.filter(c => c.role === 'main');
  const chapterCount = work?.chapterCount || 1;
  
  const chapters = useMemo(() => 
    Array.from({ length: chapterCount }, (_, i) => i + 1),
  [chapterCount]);

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
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');

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
      if (storyboard.config.chapterNumber) {
        setSelectedChapter(storyboard.config.chapterNumber);
      }
    }
  }, [storyboard]);

  const handleSmartGetChapters = async () => {
    if (!work) return;
    setIsSmartGenerating(true);
    try {
      // 获取完整作品内容
      const content = generation.stage3Result;
      if (!content) {
        alert('未找到作品内容，请先生成作品');
        return;
      }
      
      // 使用正则表达式智能检测章节
      const patterns = [
        /第[一二三四五六七八九十百千零\d]+章/g,
        /第[一二三四五六七八九十百千零\d]+回/g,
        /Chapter\s*\d+/gi,
        /第[一二三四五六七八九十百千零\d]+节/g,
        /^(楔子|序章|序言|尾声|后记|番外)/gm,
      ];
      
      let chapterCount = 1;
      for (const pattern of patterns) {
        const matches = content.match(pattern);
        if (matches && matches.length > chapterCount) {
          chapterCount = matches.length;
        }
      }
      
      // 如果没检测到章节，根据行数估算
      if (chapterCount === 1) {
        const lines = content.split('\n').filter(line => line.trim().length > 0);
        const estimatedByLines = Math.ceil(lines.length / 50);
        if (estimatedByLines > 1) {
          chapterCount = estimatedByLines;
        }
      }
      
      if (chapterCount > 0 && chapterCount <= 100) {
        updateWork(work.id, { chapterCount });
      }
    } catch (error) {
      console.error('Smart get chapters failed:', error);
    } finally {
      setIsSmartGenerating(false);
    }
  };

  const handleSmartGenerateTone = async () => {
    if (!work) return;
    setIsSmartGenerating(true);
    try {
      const results = await generateCandidates(
        `根据小说《${work.title}》的主题“${work.topic}”`,
        `请生成3-5个适合这个故事的AI视频基调关键词，如：紧张、温馨、浪漫、悬疑、热血等。返回3-5个选项，每行一个。`,
        5
      );
      if (results.length > 0) {
        setTone(results[Math.floor(Math.random() * results.length)]);
      }
    } catch (error) {
      console.error('Smart generate tone failed:', error);
    } finally {
      setIsSmartGenerating(false);
    }
  };

  const handleSmartGenerateCharacter = async () => {
    if (!work) return;
    setIsSmartGenerating(true);
    try {
      // 获取完整作品内容
      const fullContent = work.content || generation.stage3Result;
      if (!fullContent) {
        alert('未找到作品内容，请先生成作品');
        return;
      }
      
      // 截取前3000字足够识别主要角色，避免prompt过长
      const contentSnippet = fullContent.length > 3000 
        ? fullContent.slice(0, 3000) + '\n...(内容已截断)'
        : fullContent;
        
      const results = await generateCandidates(
        `根据以下《${work.title}》的小说内容，提取主要角色信息：

${contentSnippet}`,
        `请从上述小说内容中提取1-3个主要角色的描述，每个角色包含：名字、外貌特征、性格特点。格式：角色名:外貌-性格。每行一个角色。不要其他文字。`,
        3
      );
      if (results.length > 0) {
        results.forEach((charInfo, idx) => {
          const [namePart, descPart] = charInfo.split(':');
          const [appearance, personality] = (descPart || '').split('-');
          const character: Character = {
            id: 'char-smart-' + Date.now() + '-' + idx,
            workId: workId || '',
            name: namePart?.trim() || `角色${idx + 1}`,
            description: descPart?.trim() || '',
            appearance: appearance?.trim() || '',
            personality: personality?.trim() || '',
            outfit: '',
            role: idx === 0 ? 'main' : 'supporting',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          useStore.getState().addCharacter(character);
        });
        alert(`智能生成${results.length}个角色成功！`);
      }
    } catch (error) {
      console.error('Smart generate character failed:', error);
    } finally {
      setIsSmartGenerating(false);
    }
  };

  const selectedCharacter = selectedCharacterId 
    ? workCharacters.find(c => c.id === selectedCharacterId) 
    : null;

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
      // 获取完整作品内容
      const fullContent = work.content || generation.stage3Result;
      if (!fullContent) {
        alert('未找到作品内容，请先生成作品');
        return;
      }
      
      // 根据章节提取对应内容
      let chapterContent = fullContent;
      let previousContent = '';
      
      if (selectedChapter && work.chapterCount && work.chapterCount > 1) {
        // 使用多种正则模式匹配章节标题
        const chapterPatterns = [
          /第[一二三四五六七八九十百千零\d]+章/g,
          /第[一二三四五六七八九十百千零\d]+回/g,
          /第[一二三四五六七八九十百千零\d]+节/g,
          /Chapter\s*\d+/gi,
          /^\s*(楔子|序章|序言|引言|前言|尾声|后记|番外)\b/gm,
        ];
        
        let matches: {index: number, text: string}[] = [];
        
        // 收集所有匹配
        for (const pattern of chapterPatterns) {
          const regex = new RegExp(pattern.source, pattern.flags);
          let match;
          while ((match = regex.exec(fullContent)) !== null) {
            // 去重：相同位置不重复添加
            if (!matches.find(m => m.index === match.index)) {
              matches.push({index: match.index, text: match[0]});
            }
          }
        }
        
        // 按位置排序匹配结果
        matches = matches.sort((a, b) => a.index - b.index);
        
        // 如果找到了足够的章节
        if (matches.length >= selectedChapter) {
          const startIndex = matches[selectedChapter - 1].index;
          const endIndex = selectedChapter < matches.length 
            ? matches[selectedChapter].index 
            : fullContent.length;
          
          // 提取本章内容，去除首尾空行
          chapterContent = fullContent.slice(startIndex, endIndex).trim();
          
          // 获取前一章内容作为上下文（只取最后500字）
          if (selectedChapter > 1 && matches[selectedChapter - 2]) {
            const prevStart = matches[selectedChapter - 2].index;
            const prevEnd = startIndex;
            const fullPrevContent = fullContent.slice(prevStart, prevEnd).trim();
            // 只保留最后500字作为上下文，避免prompt过长
            previousContent = fullPrevContent.length > 500 
              ? '...' + fullPrevContent.slice(-500) 
              : fullPrevContent;
          }
        } else if (matches.length > 0) {
          // 如果匹配到部分章节，但不够，按字数均分
          const avgLength = Math.floor(fullContent.length / work.chapterCount);
          const startIndex = (selectedChapter - 1) * avgLength;
          const endIndex = selectedChapter * avgLength;
          chapterContent = fullContent.slice(startIndex, endIndex).trim();
          
          // 获取前一章末尾作为上下文
          if (selectedChapter > 1) {
            const prevStart = (selectedChapter - 2) * avgLength;
            const prevEnd = startIndex;
            const fullPrevContent = fullContent.slice(prevStart, prevEnd).trim();
            previousContent = fullPrevContent.length > 500 
              ? '...' + fullPrevContent.slice(-500) 
              : fullPrevContent;
          }
        }
      }
      
      // 如果提取后的内容仍然太长，需要进行摘要处理避免token溢出
      // 大概估算：1个token ≈ 4个汉字，模型一般限制在2000-4000token
      const MAX_CONTENT_LENGTH = 8000; // 约 2000token
      let needsSummary = chapterContent.length > MAX_CONTENT_LENGTH;
      let chapterContentForPrompt = chapterContent;
      
      if (needsSummary) {
        // 保留开头和结尾，截取中间核心内容
        const keepStart = 2000;
        const keepEnd = 2000;
        const middleStart = keepStart;
        const middleEnd = chapterContent.length - keepEnd;
        chapterContentForPrompt = 
          chapterContent.slice(0, middleStart) + 
          '\n...(中间内容省略)...\n' + 
          chapterContent.slice(middleEnd);
      }
      
      const globalInfo = {
        title: work.title,
        topic: work.topic,
        keywords: work.keywords,
        params: work.generationParams,
      };
      
      const mainChar = selectedCharacter || (mainCharacters[0] ? {
        name: mainCharacters[0].name,
        description: mainCharacters[0].description,
        appearance: mainCharacters[0].appearance,
        personality: mainCharacters[0].personality,
        outfit: mainCharacters[0].outfit,
        id: mainCharacters[0].id,
      } : null);
      
      const supportingChars = workCharacters
        .filter(c => c.role === 'supporting')
        .map(c => ({
          name: c.name,
          description: c.description,
          appearance: c.appearance,
          personality: c.personality,
          outfit: c.outfit,
          id: c.id,
        }));
      
       const result = await generateStoryboard(chapterContentForPrompt, {
        workId: workId || '',
        chapterNumber: selectedChapter || undefined,
        duration: settings.duration,
        clipsPerEpisode: settings.clipsPerEpisode,
        clipDuration: settings.clipDuration,
        videoSettings: settings,
        style: style as any,
        tone,
        previousContent: previousContent,
        globalInfo,
        mainCharacter: mainChar ? {
          name: mainChar.name,
          description: mainChar.description || '请从小说内容中提取主角形象',
          appearance: mainChar.appearance || '',
          personality: mainChar.personality || '',
          outfit: mainChar.outfit || '',
        } : {
          name: '主角',
          description: '请从小说内容中提取主角形象',
          appearance: '',
          personality: '',
          outfit: '',
        },
        supportingCharacters: supportingChars,
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
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      视频基调
                    </label>
                    <button
                      onClick={handleSmartGenerateTone}
                      disabled={isSmartGenerating}
                      className="text-xs text-pink-500 hover:text-pink-600 flex items-center gap-1"
                    >
                      {isSmartGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      智能推荐
                    </button>
                  </div>
                  <input
                    type="text"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    placeholder="紧张、温馨、浪漫..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      选择章节
                    </label>
                    <button
                      onClick={handleSmartGetChapters}
                      disabled={isSmartGenerating}
                      className="text-xs text-pink-500 hover:text-pink-600 flex items-center gap-1"
                    >
                      {isSmartGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      智能获取章节
                    </button>
                  </div>
                  <select
                    value={selectedChapter || ''}
                    onChange={(e) => setSelectedChapter(e.target.value ? parseInt(e.target.value) : null)}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  >
                    <option value="">全书内容</option>
                    {chapters.map(ch => (
                      <option key={ch} value={ch}>第 {ch} 章</option>
                    ))}
                  </select>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      角色描述
                    </label>
                    <button
                      onClick={() => navigate('/characters' + (workId ? `?workId=${workId}` : ''))}
                      className="text-xs text-purple-500 hover:text-purple-600 flex items-center gap-1"
                    >
                      <User size={12} />
                      管理角色
                    </button>
                  </div>
                  
                  {workCharacters.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <select
                          value={selectedCharacterId}
                          onChange={(e) => setSelectedCharacterId(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                        >
                          <option value="">自动选择主角</option>
                          {workCharacters.map(char => (
                            <option key={char.id} value={char.id}>
                              {char.name} {char.role === 'main' ? '(主角)' : '(配角)'}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={handleSmartGenerateCharacter}
                          disabled={isSmartGenerating}
                          className="ml-2 px-2 py-2 text-xs text-purple-500 hover:text-purple-600 flex items-center gap-1 border border-purple-300 dark:border-purple-700 rounded-lg"
                          title="智能获取更多角色"
                        >
                          {isSmartGenerating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={handleSmartGenerateCharacter}
                        disabled={isSmartGenerating}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border border-dashed border-purple-300 dark:border-purple-700 rounded-xl text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all"
                      >
                        {isSmartGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                        智能生成角色
                      </button>
                      <p className="text-xs text-gray-400 text-center">
                        或前往角色管理页面添加
                      </p>
                    </div>
                  )}
                  
                  {selectedCharacter && (
                    <div className="mt-2 p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-xs">
                      <p className="text-purple-700 dark:text-purple-300 font-medium">{selectedCharacter.name}</p>
                      {selectedCharacter.appearance && <p className="text-gray-600 dark:text-gray-400">{selectedCharacter.appearance}</p>}
                    </div>
                  )}
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
