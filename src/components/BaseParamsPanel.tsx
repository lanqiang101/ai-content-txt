import React from "react";
import { useStore } from "../store/useStore";
import { RandomButton } from "./RandomButton";
import { HotTopicSearch } from "./HotTopicSearch";
import { ReaderSection } from "./InputPanel/ReaderSection";
import { CharacterSection } from "./InputPanel/CharacterSection";
import { PlotSection } from "./InputPanel/PlotSection";
import { RhythmSection } from "./InputPanel/RhythmSection";
import { DetailSection } from "./InputPanel/DetailSection";
import { EmotionSection } from "./InputPanel/EmotionSection";
import { AntiAISection } from "./InputPanel/AntiAISection";

export const BaseParamsPanel: React.FC = () => {
  const { params, setParams } = useStore();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg card-gradient p-4 sm:p-5 transition-all hover:shadow-xl border border-gray-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          公共基础参数
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          对单篇和批量创作都生效
        </span>
      </div>

      <div className="space-y-5">
        {/* 内容类型 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            内容类型
          </label>
          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded-xl transition-all ${
                params.type === "article"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
              onClick={() => setParams({ type: "article" })}
            >
              公众号文章
            </button>
            <button
              className={`px-4 py-2 rounded-xl transition-all ${
                params.type === "novel"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
              onClick={() => setParams({ type: "novel" })}
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
              value={params.style}
              onChange={(e) => setParams({ style: e.target.value })}
              className="w-full pl-4 pr-20 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="轻松幽默，都市豪门..."
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              <RandomButton
                fieldDescription="整体文章文风形容词"
                rules="生成10种不同文风，每种1-3个词"
                count={10}
                onSelect={(value) => setParams({ style: value })}
              />
            </div>
          </div>
        </div>

        {/* ========== 七大参数分组 - 只在小说类型显示 ========== */}
        {params.type === "novel" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <ReaderSection
              reader={params.reader}
              onChange={(reader) =>
                setParams({ reader: { ...params.reader, ...reader } })
              }
            />
            <CharacterSection
              character={params.character}
              onChange={(character) =>
                setParams({ character: { ...params.character, ...character } })
              }
            />
            <PlotSection
              plot={params.plot}
              onChange={(plot) =>
                setParams({ plot: { ...params.plot, ...plot } })
              }
            />
            <RhythmSection
              rhythm={params.rhythm}
              onChange={(rhythm) =>
                setParams({ rhythm: { ...params.rhythm, ...rhythm } })
              }
            />
            <DetailSection
              detail={params.detail}
              onChange={(detail) =>
                setParams({ detail: { ...params.detail, ...detail } })
              }
            />
            <EmotionSection
              emotion={params.emotion}
              onChange={(emotion) =>
                setParams({ emotion: { ...params.emotion, ...emotion } })
              }
            />
            <AntiAISection
              antiAI={params.antiAI}
              onChange={(antiAI) =>
                setParams({ antiAI: { ...params.antiAI, ...antiAI } })
              }
            />
          </div>
        )}

        {/* 热门主题推荐搜索 - 独立区块 */}
        <div className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800 mt-6">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            🔥 热门主题推荐（输入关键词获取2026年番茄热门推荐）
          </label>
          <HotTopicSearch
            onSelectTopic={(topic) => setParams({ topic })}
          />
        </div>
      </div>
    </div>
  );
};
