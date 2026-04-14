import React from "react";
import { useStore } from "../store/useStore";
import { RandomButton } from "./RandomButton";
import { KeywordGeneratorButton } from "./KeywordGeneratorButton";

export const InputPanel: React.FC = () => {
  const { params, setParams } = useStore();

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg card-gradient p-4 sm:p-5 transition-all hover:shadow-xl border border-gray-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          单篇创作参数
        </h2>
      </div>

      <div className="space-y-5">
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              主题
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={params.topic}
              onChange={(e) => setParams({ topic: e.target.value })}
              className="w-full pl-4 pr-20 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="请输入小说主题..."
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
              <RandomButton
                fieldDescription="2026年番茄小说平台热门主题"
                rules="生成5个2026年番茄热门小说主题，每个主题一行，符合当前热点，突出爽点"
                count={10}
                onSelect={(value) => setParams({ topic: value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              小说标题
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={params.title}
              onChange={(e) => setParams({ title: e.target.value })}
              className="w-full pl-4 pr-20 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="吸引人的小说标题..."
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
              <RandomButton
                fieldDescription={`根据当前主题${params.topic}，生成爆款小说标题`}
                rules={`生成符合番茄小说平台爆款规范的标题，要求：
1. 必须紧扣主题【${params.topic}】
2. 必须包含和主题相关的元素
3. 吸引人、符合当下热点、有钩子
4. 能让读者有点击欲望
5. 不要太长
生成10个候选标题，每行一个。`}
                count={10}
                onSelect={(value) => setParams({ title: value })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              关键词（用逗号分隔）
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={params.keywords}
              onChange={(e) => setParams({ keywords: e.target.value })}
              className="w-full pl-4 pr-20 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="AI, 未来科技, 都市异能..."
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2 flex gap-1">
              <KeywordGeneratorButton
                topic={params.topic}
                title={params.title}
                currentKeywords={params.keywords}
                onSelect={(keywords) => setParams({ keywords })}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              期望字数（字）短篇小说最长100000
            </label>
          </div>
          <div className="relative">
            <input
              type="number"
              min={100}
              max={100000}
              value={params.wordCount}
              onChange={(e) =>
                setParams({ wordCount: parseInt(e.target.value) })
              }
              className="w-full pl-4 pr-12 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="期望生成多少字..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};
