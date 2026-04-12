import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useStore } from "../store/useStore";
import { useGeneration } from "../hooks/useGeneration";
import type {
  StoryboardResult,
  StoryboardConfig,
  StoryboardType,
  VideoSettings,
  ComicSettings,
  AnimeStyle,
  Work,
  CharacterDesc,
  SceneDesc,
} from "../types";
import {
  VideoSettingsPanel,
  ComicSettingsPanel,
  CharacterPanel,
  StoryboardPanel,
  ChapterSelector,
  AdvancedConfigPanel,
  TypeSelector,
  DEFAULT_VIDEO_SETTINGS,
  DEFAULT_COMIC_SETTINGS,
} from "./StoryboardPage/index";

interface WorkWithChapters extends Work {
  chapters?: {
    content: string;
  }[];
}

// AI 返回的单个分镜项结构
interface AIFromStoryboardItem {
  chapterNumber: number;
  panelNumber: number;
  content: string;
  sceneDescription: string;
  characterInPanel: string[];
  cameraAngle: string;
  visualStyle: string;
}

export const StoryboardPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workId = searchParams.get("workId");
  const storyboardId = searchParams.get("storyboardId");

  const { works, storyboards, addStoryboard, characters } = useStore();
  const { generateStoryboard } = useGeneration();

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSmartGenerating, setIsSmartGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");

  // 分镜类型选择
  const [storyboardType, setStoryboardType] = useState<StoryboardType>("drama");

  const work = workId ? works.find((w) => w.id === workId) as WorkWithChapters : null;
  const storyboard = storyboardId
    ? storyboards.find((s) => s.id === storyboardId)
    : storyboards.find((s) => s.workId === workId);

  const workCharacters = characters.filter((c) => c.workId === workId);
  const chapterCount = work?.chapterCount || 1;

  const chapters = useMemo(
    () => Array.from({ length: chapterCount }, (_, i) => i + 1),
    [chapterCount]
  );

  // 漫剧配置
  const [videoSettings, setVideoSettings] =
    useState<VideoSettings>(DEFAULT_VIDEO_SETTINGS);
  // 漫画配置
  const [comicSettings, setComicSettings] =
    useState<ComicSettings>(DEFAULT_COMIC_SETTINGS);
  // 公共配置
  const [style, setStyle] = useState<AnimeStyle>("anime");
  const [artStyle, setArtStyle] = useState("日系二次元");
  const [colorStyle, setColorStyle] = useState("高饱和");
  const [tone, setTone] = useState("紧张");
  const [prohibitedContent, setProhibitedContent] = useState(
    "禁止崩坏,禁止低清"
  );

  // 智能检测章节内容
  const handleSmartGetChapters = async () => {
    if (!work) return;
    setIsSmartGenerating(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      alert("智能检测功能开发中");
    } catch (error) {
      console.error("Smart detect failed:", error);
      alert("智能检测失败: " + (error as Error).message);
    } finally {
      setIsSmartGenerating(false);
    }
  };

  // 加载已有分镜配置
  useEffect(() => {
    if (storyboard) {
      setStoryboardType(storyboard.config.type);
      if (storyboard.config.type === "drama") {
        setVideoSettings({
          ...DEFAULT_VIDEO_SETTINGS,
          ...storyboard.config.videoSettings,
        });
      } else {
        setComicSettings({
          ...DEFAULT_COMIC_SETTINGS,
          ...storyboard.config.comicSettings,
        });
      }
      if (storyboard.config.artStyle) setArtStyle(storyboard.config.artStyle);
      if (storyboard.config.colorStyle) setColorStyle(storyboard.config.colorStyle);
      if (storyboard.config.prohibitedContent) setProhibitedContent(storyboard.config.prohibitedContent);
      if (storyboard.config.style) setStyle(storyboard.config.style as AnimeStyle);
      if (storyboard.config.tone) setTone(storyboard.config.tone);
      if (storyboard.config.chapterNumber) setSelectedChapter(storyboard.config.chapterNumber);
    }
  }, [storyboard]);

  // 生成分镜 - 修复 generateStoryboard 参数调用错误
  const handleGenerate = async () => {
    if (!work || !workId || !selectedChapter) {
      alert("请选择一个章节");
      return;
    }

    setIsGenerating(true);
    // 获取章节内容
    let chapterContent = work.content || "";
    if (work.chapters && Array.isArray(work.chapters) && work.chapters[selectedChapter - 1]) {
      chapterContent = work.chapters[selectedChapter - 1].content || "";
    }
    
    try {
      // generateStoryboard 参数要求: (content, characters[], signal)
      const controller = new AbortController();
      // 获取当前选中角色，如果选了就只包含选中的，否则包含全部
      const selectedCharacters = selectedCharacterId
        ? workCharacters.filter(c => c.id === selectedCharacterId)
        : workCharacters;
      
      const aiResults = await generateStoryboard(
        chapterContent,
        selectedCharacters,
        controller.signal
      ) as unknown as AIFromStoryboardItem[];

      // 将AI返回结果转换为正确的 SceneDesc 格式
      if (aiResults.length === 0) {
        throw new Error("AI没有返回有效的分镜数据");
      }

      const scenes: SceneDesc[] = aiResults.map((r, index) => ({
        name: `第 ${r.chapterNumber || selectedChapter} 章 - 镜头 ${r.panelNumber || index + 1}`,
        description: r.content || "",
        background: "",
        lighting: "",
        mood: tone,
      }));

      // 创建最终分镜记录
      const newStoryboard: StoryboardResult = {
        id: `sb_${Date.now()}`,
        workId: work.id,
        chapterNumber: selectedChapter,
        config: storyboardType === "drama"
          ? {
              type: "drama",
              workId: work.id,
              chapterNumber: selectedChapter,
              tone,
              artStyle,
              colorStyle,
              prohibitedContent,
              style,
              videoSettings,
              rhythm: "medium",
            }
          : {
              type: "comic",
              workId: work.id,
              chapterNumber: selectedChapter,
              tone,
              artStyle,
              colorStyle,
              prohibitedContent,
              style,
              comicSettings,
            },
        scenes,
        createdAt: Date.now(),
      };

      addStoryboard(newStoryboard);

      alert(`成功生成 ${aiResults.length} 个分镜`);
    } catch (error) {
      console.error("Generate storyboard failed:", error);
      alert("生成失败: " + (error as Error).message);
    } finally {
      setIsGenerating(false);
    }
  };

  const currentStoryboards = storyboards.filter(
    (s) => s.workId === workId && (!selectedChapter || s.config.chapterNumber === selectedChapter)
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-6 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 顶部返回和标题 */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate("/storyboards")}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 rounded-lg shadow hover:shadow-md transition-shadow"
          >
            <ArrowLeft size={20} />
            返回分镜管理
          </button>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            {storyboardType === "drama" ? "漫剧" : "漫画"}分镜生成
            {work && (
              <span className="text-gray-500 dark:text-gray-400 text-lg ml-2">
                - {work.title}
              </span>
            )}
          </h1>
        </div>

        {/* 分镜类型选择抽离 */}
        <TypeSelector
          storyboardType={storyboardType}
          onChange={setStoryboardType}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            {/* 章节选择器 */}
            <ChapterSelector
              chapters={chapters}
              selectedChapter={selectedChapter}
              onSelect={setSelectedChapter}
              onSmartDetect={handleSmartGetChapters}
              isSmartDetecting={isSmartGenerating}
            />

            {/* 公共高级配置抽离 */}
            <AdvancedConfigPanel
              artStyle={artStyle}
              colorStyle={colorStyle}
              prohibitedContent={prohibitedContent}
              onArtStyleChange={setArtStyle}
              onColorStyleChange={setColorStyle}
              onProhibitedContentChange={setProhibitedContent}
            />

            {/* 根据类型动态显示不同配置面板 */}
            {storyboardType === "drama" ? (
              <VideoSettingsPanel
                settings={videoSettings}
                onChange={(s) => setVideoSettings({ ...videoSettings, ...s })}
                style={style}
                onStyleChange={setStyle}
                tone={tone}
                onToneChange={setTone}
              />
            ) : (
              <ComicSettingsPanel
                settings={comicSettings}
                onChange={(s) => setComicSettings({ ...comicSettings, ...s })}
                style={style}
                onStyleChange={setStyle}
                tone={tone}
                onToneChange={setTone}
              />
            )}

            {/* 角色选择 */}
            <CharacterPanel
              characters={workCharacters}
              selectedCharacterId={selectedCharacterId}
              onSelect={setSelectedCharacterId}
              onAdd={() => {
                if (workId) {
                  navigate(`/characters?workId=${workId}`);
                }
              }}
              onDelete={(id) => {}}
            />

            {/* 生成按钮 */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedChapter}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-lg font-semibold mb-6"
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

          {/* 已生成分镜列表 */}
          <div>
            <StoryboardPanel
              storyboards={currentStoryboards}
              copiedId={copiedId}
              onCopy={(id) => setCopiedId(id)}
              onClearCopied={() => setCopiedId(null)}
              workTitle={work?.title || ""}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryboardPage;
