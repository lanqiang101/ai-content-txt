import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Loader2, Sparkles } from "lucide-react";
import { useStore } from "../store/useStore";
import { useGeneration } from "../hooks/useGeneration";
import { StoryboardResult, CharacterDesc, VideoSettings, AnimeStyle } from "../types";
import {
  VideoSettingsPanel,
  CharacterPanel,
  StoryboardPanel,
  ChapterSelector,
  DEFAULT_SETTINGS,
} from "./StoryboardPage/index";

export const StoryboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workId = searchParams.get('workId');
  const storyboardId = searchParams.get('storyboardId');

  const { works, storyboards, updateWork, addStoryboard, characters } = useStore();
  const { generateStoryboard } = useGeneration();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSmartGenerating, setIsSmartGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>('');

  const work = workId ? works.find(w => w.id === workId) : null;
  const storyboard = storyboardId
    ? storyboards.find(s => s.id === storyboardId)
    : storyboards.find(s => s.workId === workId);

  const workCharacters = characters.filter(c => c.workId === workId);
  const chapterCount = work?.chapterCount || 1;

  const chapters = useMemo(() =>
    Array.from({ length: chapterCount }, (_, i) => i + 1),
  [chapterCount]);

  const [settings, setSettings] = useState<VideoSettings>(DEFAULT_SETTINGS);
  const [style, setStyle] = useState<AnimeStyle>('anime');
  const [tone, setTone] = useState('紧张');

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
      // 获取完整作品内容（这里需要从 generation 或 work 内容获取）
      // 由于原逻辑依赖全局 generation state，保持原有实现
      const content = work.content || '';
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

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleGenerate = async () => {
    if (!work) {
      alert('未找到对应作品');
      return;
    }
    if (!selectedChapter) {
      alert('请先选择章节');
      return;
    }

    // 获取章节内容
    const content = work.content || '';
    if (!content) {
      alert('作品内容为空');
      return;
    }

    // 获取选中的人物描述
    const characterDescs: CharacterDesc[] = workCharacters
      .filter(c => c.id === selectedCharacterId)
      .map(c => ({
        id: c.id,
        name: c.name,
        description: c.description,
        appearance: c.appearance,
        personality: c.personality,
        outfit: c.outfit,
        role: c.role,
      }));

    setIsGenerating(true);
    try {
      const abortController = new AbortController();
      const results = await generateStoryboard(content, characterDescs, abortController.signal);

      // 保存到store
      results.forEach(result => {
        addStoryboard({
          ...result,
          workId: work.id,
          config: {
            videoSettings: settings,
            style,
            tone,
            chapterNumber: selectedChapter,
          },
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
      });

      alert(`成功生成 ${results.length} 个分镜`);
    } catch (error) {
      console.error('Generate storyboard failed:', error);
      alert('生成失败: ' + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentStoryboards = storyboards.filter(s =>
    s.workId === workId && (!selectedChapter || s.chapterNumber === selectedChapter)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <ArrowLeft size={20} />
            返回
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            视频分镜生成
            {work && <span className="text-gray-500 dark:text-gray-400 text-lg ml-2"> - {work.title}</span>}
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <ChapterSelector
              chapters={chapters}
              selectedChapter={selectedChapter}
              onSelect={setSelectedChapter}
              onSmartDetect={handleSmartGetChapters}
              isSmartDetecting={isSmartGenerating}
            />

            <VideoSettingsPanel
              settings={settings}
              onChange={(s) => setSettings({ ...settings, ...s })}
              style={style}
              onStyleChange={setStyle}
              tone={tone}
              onToneChange={setTone}
            />

            <CharacterPanel
              characters={workCharacters}
              selectedCharacterId={selectedCharacterId}
              onSelect={setSelectedCharacterId}
              onAdd={() => {
                // 跳转到角色创建页面
                if (workId) {
                  navigate(`/characters?workId=${workId}`);
                }
              }}
              onDelete={(id) => {
                // 删除角色 - 需要在store中实现，这里保持原有逻辑
                // 由于原实现没有删除，保持占位
              }}
            />

            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedChapter}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg font-semibold"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  生成分镜
                </>
              )}
            </button>
          </div>

          <div>
            <StoryboardPanel
              storyboards={currentStoryboards}
              copiedId={copiedId}
              onCopy={handleCopy}
            />

            {currentStoryboards.length > 0 && (
              <div className="mt-4">
                <button
                  className="w-full py-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-xl shadow transition-all flex items-center justify-center gap-2"
                  disabled={currentStoryboards.length === 0}
                >
                  <Download size={20} />
                  下载全部分镜JSON
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
