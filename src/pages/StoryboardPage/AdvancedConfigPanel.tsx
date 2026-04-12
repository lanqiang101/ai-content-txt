import React from "react";
import type { AnimeStyle } from "../../types";

export interface AdvancedConfigPanelProps {
  artStyle: string;
  colorStyle: string;
  prohibitedContent: string;
  onArtStyleChange: (value: string) => void;
  onColorStyleChange: (value: string) => void;
  onProhibitedContentChange: (value: string) => void;
}

export const AdvancedConfigPanel: React.FC<AdvancedConfigPanelProps> = ({
  artStyle,
  colorStyle,
  prohibitedContent,
  onArtStyleChange,
  onColorStyleChange,
  onProhibitedContentChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-4 mb-6 border border-gray-200 dark:border-slate-700">
      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-3">
        高级风格配置
      </h3>
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            美术风格
          </label>
          <input
            type="text"
            value={artStyle}
            onChange={(e) => onArtStyleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
            placeholder="日系二次元 / 韩漫 / 国漫 / 写实风"
          />
          <p className="text-xs text-gray-500 mt-1">
            指定整体美术风格，影响生成效果
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            色彩风格
          </label>
          <input
            type="text"
            value={colorStyle}
            onChange={(e) => onColorStyleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
            placeholder="高饱和 / 低饱和 / 赛博朋克 / 治愈暖色调"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            禁用内容
          </label>
          <input
            type="text"
            value={prohibitedContent}
            onChange={(e) => onProhibitedContentChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
            placeholder="禁止崩坏,禁止低清,禁止多余物体"
          />
          <p className="text-xs text-gray-500 mt-1">
            指明禁止生成哪些内容，减少AI出错
          </p>
        </div>
      </div>
    </div>
  );
};
