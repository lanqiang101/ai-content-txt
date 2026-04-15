import React from "react";
import { useStore } from "../store/useStore";
import { HotTopicSearch } from "./HotTopicSearch";

export const BaseParamsPanel: React.FC = () => {
  const { setSingleParams, setBatchParams } = useStore();

  // 当选择主题时,同时更新单篇和批量创作的参数
  const handleSelectTopic = (topic: string) => {
    setSingleParams({ topic });
    setBatchParams({ topic });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg card-gradient p-4 sm:p-5 transition-all hover:shadow-xl border border-gray-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
          公共基础参数
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          热门主题推荐（同时应用到单篇和批量创作）
        </span>
      </div>

      <div className="space-y-5">
        {/* 热门主题推荐搜索 - 唯一保留的字段 */}
        <div className="bg-gradient-to-r from-orange-50 to-pink-50 dark:from-orange-900/20 dark:to-pink-900/20 rounded-xl p-4 border border-orange-100 dark:border-orange-800">
          <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">
            🔥 热门主题推荐（输入关键词获取2026年番茄热门推荐）
          </label>
          <HotTopicSearch onSelectTopic={handleSelectTopic} />
        </div>
      </div>
    </div>
  );
};

export default BaseParamsPanel;
