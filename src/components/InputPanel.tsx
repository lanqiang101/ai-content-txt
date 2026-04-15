import React from "react";
import { useStore } from "../store/useStore";
import { RandomButton } from "./RandomButton";
import { KeywordGeneratorButton } from "./KeywordGeneratorButton";
import { ReaderSection } from "./InputPanel/ReaderSection";
import { CharacterSection } from "./InputPanel/CharacterSection";
import { PlotSection } from "./InputPanel/PlotSection";
import { RhythmSection } from "./InputPanel/RhythmSection";
import { DetailSection } from "./InputPanel/DetailSection";
import { EmotionSection } from "./InputPanel/EmotionSection";
import { AntiAISection } from "./InputPanel/AntiAISection";

export const InputPanel: React.FC = () => {
  const { singleParams, setSingleParams } = useStore();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg card-gradient p-4 sm:p-5 transition-all hover:shadow-xl border border-gray-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          单篇创作参数
        </h2>
      </div>

      <div className="space-y-5">
        {/* 主题 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              主题
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={singleParams.topic}
              onChange={(e) => setSingleParams({ topic: e.target.value })}
              className="w-full pl-4 pr-20 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="请输入小说主题..."
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
              <RandomButton
                fieldDescription="2026年番茄小说平台热门主题"
                rules="生成5个2026年番茄热门小说主题，每个主题一行，符合当前热点，突出爽点"
                count={10}
                onSelect={(value) => setSingleParams({ topic: value })}
              />
            </div>
          </div>
        </div>

        {/* 小说标题 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              小说标题
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={singleParams.title}
              onChange={(e) => setSingleParams({ title: e.target.value })}
              className="w-full pl-4 pr-20 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="吸引人的小说标题..."
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
              <RandomButton
                fieldDescription={`根据当前主题${singleParams.topic}，生成爆款小说标题`}
                rules={`生成符合番茄小说平台爆款规范的标题，要求：
1. 必须紧扣主题【${singleParams.topic}】
2. 必须包含和主题相关的元素
3. 吸引人、符合当下热点、有钩子
4. 能让读者有点击欲望
5. 不要太长
生成10个候选标题，每行一个。`}
                count={10}
                onSelect={(value) => setSingleParams({ title: value })}
              />
            </div>
          </div>
        </div>

        {/* 关键词 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              关键词（用逗号分隔）
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={singleParams.keywords}
              onChange={(e) => setSingleParams({ keywords: e.target.value })}
              className="w-full pl-4 pr-20 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="AI, 未来科技, 都市异能..."
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
              <KeywordGeneratorButton
                topic={singleParams.topic}
                title={singleParams.title}
                currentKeywords={singleParams.keywords}
                onSelect={(keywords) => setSingleParams({ keywords })}
              />
            </div>
          </div>
        </div>

        {/* 期望字数 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              期望字数(字)短篇小说最长100000
            </label>
          </div>
          <div className="relative">
            <input
              type="number"
              min={100}
              max={100000}
              value={singleParams.wordCount}
              onChange={(e) =>
                setSingleParams({ wordCount: parseInt(e.target.value) })
              }
              className="w-full pl-4 pr-12 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="期望生成多少字..."
            />
          </div>
        </div>

        {/* 小说篇幅 - 仅在小说类型时显示 */}
        {singleParams.type === 'novel' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                小说篇幅
              </label>
            </div>
            <div className="flex gap-3">
              <button
                className={`px-4 py-2 rounded-xl transition-all ${
                  singleParams.novelLength === 'short' || !singleParams.novelLength
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
                onClick={() => setSingleParams({ novelLength: 'short', initialChapters: undefined })}
              >
                短篇
              </button>
              <button
                className={`px-4 py-2 rounded-xl transition-all ${
                  singleParams.novelLength === 'long'
                    ? "bg-primary text-white shadow-md shadow-primary/20"
                    : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
                onClick={() => setSingleParams({ novelLength: 'long', initialChapters: singleParams.initialChapters || 3 })}
              >
                长篇
              </button>
            </div>
          </div>
        )}

        {/* 初始章节数 - 仅在长篇小说时显示 */}
        {singleParams.type === 'novel' && singleParams.novelLength === 'long' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between mb-1">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                初始章节数
              </label>
              <span className="text-xs text-gray-500">首次生成的章节数量</span>
            </div>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={50}
                value={singleParams.initialChapters || 3}
                onChange={(e) =>
                  setSingleParams({ initialChapters: parseInt(e.target.value) })
                }
                className="w-full pl-4 pr-12 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
                placeholder="默认3章..."
              />
            </div>
          </div>
        )}

        {/* 内容类型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            内容类型
          </label>
          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded-xl transition-all ${
                singleParams.type === "article"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
              onClick={() => setSingleParams({ type: "article" })}
            >
              公众号文章
            </button>
            <button
              className={`px-4 py-2 rounded-xl transition-all ${
                singleParams.type === "novel"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
              onClick={() => setSingleParams({ type: "novel" })}
            >
              小说
            </button>
          </div>
        </div>

        {/* 整体文风 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              整体文风
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={singleParams.style}
              onChange={(e) => setSingleParams({ style: e.target.value })}
              className="w-full pl-4 pr-20 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="轻松幽默，都市豪门..."
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <RandomButton
                fieldDescription="整体文章文风形容词"
                rules="生成10种不同文风，每种1-3个词"
                count={10}
                onSelect={(value) => setSingleParams({ style: value })}
              />
            </div>
          </div>
        </div>

        {/* ========== 七大参数分组 - 只在小说类型显示 ========== */}
        {singleParams.type === "novel" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
            <div className="md:col-span-2">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                📚 小说专业创作参数
              </h3>
            </div>
            <ReaderSection
              reader={singleParams.reader}
              onChange={(reader) =>
                setSingleParams({ reader: { ...singleParams.reader, ...reader } })
              }
            />
            <CharacterSection
              character={singleParams.character}
              onChange={(character) =>
                setSingleParams({ character: { ...singleParams.character, ...character } })
              }
            />
            <PlotSection
              plot={singleParams.plot}
              onChange={(plot) =>
                setSingleParams({ plot: { ...singleParams.plot, ...plot } })
              }
            />
            <RhythmSection
              rhythm={singleParams.rhythm}
              onChange={(rhythm) =>
                setSingleParams({ rhythm: { ...singleParams.rhythm, ...rhythm } })
              }
            />
            <DetailSection
              detail={singleParams.detail}
              onChange={(detail) =>
                setSingleParams({ detail: { ...singleParams.detail, ...detail } })
              }
            />
            <EmotionSection
              emotion={singleParams.emotion}
              onChange={(emotion) =>
                setSingleParams({ emotion: { ...singleParams.emotion, ...emotion } })
              }
            />
            <AntiAISection
              antiAI={singleParams.antiAI}
              onChange={(antiAI) =>
                setSingleParams({ antiAI: { ...singleParams.antiAI, ...antiAI } })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};
