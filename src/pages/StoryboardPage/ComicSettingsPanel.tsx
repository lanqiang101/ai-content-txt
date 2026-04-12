import React from "react";
import { ComicSettings, AnimeStyle } from "../../types";
import {
  COMIC_FORMAT_OPTIONS,
  COMIC_FRAME_LAYOUT_OPTIONS,
  COMIC_READ_ORDER_OPTIONS,
  COMIC_ASPECT_RATIO_OPTIONS,
  COMIC_OUTPUT_FORMAT_OPTIONS,
  STYLE_OPTIONS,
  STYLE_LABELS,
} from "./constants";

interface ComicSettingsPanelProps {
  settings: ComicSettings;
  onChange: (settings: Partial<ComicSettings>) => void;
  style: AnimeStyle;
  onStyleChange: (style: AnimeStyle) => void;
  tone: string;
  onToneChange: (tone: string) => void;
}

export const ComicSettingsPanel: React.FC<ComicSettingsPanelProps> = ({
  settings,
  onChange,
  style,
  onStyleChange,
  tone,
  onToneChange,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
        漫画设置
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            漫画格式
          </label>
          <select
            value={settings.comicFormat}
            onChange={(e) =>
              onChange({ comicFormat: e.target.value as any })
            }
            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
          >
            {COMIC_FORMAT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            格子数量: {settings.frameCount}
          </label>
          <input
            type="range"
            min={3}
            max={15}
            step={1}
            value={settings.frameCount}
            onChange={(e) => onChange({ frameCount: parseInt(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            格子排版
          </label>
          <div className="flex flex-wrap gap-2">
            {COMIC_FRAME_LAYOUT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ frameLayout: opt.value as any })}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  settings.frameLayout === opt.value
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            阅读顺序
          </label>
          <div className="flex flex-wrap gap-2">
            {COMIC_READ_ORDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ readOrder: opt.value as any })}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  settings.readOrder === opt.value
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            画布比例
          </label>
          <div className="flex flex-wrap gap-2">
            {COMIC_ASPECT_RATIO_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ aspectRatio: opt.value as any })}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  settings.aspectRatio === opt.value
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            输出格式
          </label>
          <div className="flex flex-wrap gap-2">
            {COMIC_OUTPUT_FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => onChange({ outputFormat: opt.value as any })}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  settings.outputFormat === opt.value
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            画面风格
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STYLE_OPTIONS.map((styleOption: AnimeStyle) => (
              <button
                key={styleOption}
                onClick={() => onStyleChange(styleOption)}
                className={`px-3 py-2 rounded-lg text-sm transition-all ${
                  style === styleOption
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {STYLE_LABELS[styleOption]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            整体色调
          </label>
          <input
            type="text"
            value={tone}
            onChange={(e) => onToneChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
            placeholder="暖调/冷调/赛博朋克/复古"
          />
        </div>
      </div>
    </div>
  );
};
