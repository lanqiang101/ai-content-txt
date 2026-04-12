import React from "react";
import type { StoryboardType } from "../../types";

export interface TypeSelectorProps {
  storyboardType: StoryboardType;
  onChange: (type: StoryboardType) => void;
}

export const TypeSelector: React.FC<TypeSelectorProps> = ({
  storyboardType,
  onChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 mb-6 border border-gray-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
        选择分镜类型
      </h3>
      <div className="flex gap-4">
        <button
          className={`px-4 py-2 rounded-lg border transition-all ${
            storyboardType === "drama"
              ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300"
              : "border-gray-200 dark:border-slate-600"
          }`}
          onClick={() => onChange("drama")}
        >
          🎬 漫剧（动态视频）
        </button>
        <button
          className={`px-4 py-2 rounded-lg border transition-all ${
            storyboardType === "comic"
              ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300"
              : "border-gray-200 dark:border-slate-600"
          }`}
          onClick={() => onChange("comic")}
        >
          🖼️ 漫画（静态图片）
        </button>
      </div>
    </div>
  );
};
