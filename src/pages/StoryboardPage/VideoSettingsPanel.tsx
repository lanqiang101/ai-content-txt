import React from "react";
import { VideoSettings, DistributionChannel, AnimeStyle } from "../../types";
import { RESOLUTION_OPTIONS, FPS_OPTIONS, CHANNEL_OPTIONS, STYLE_OPTIONS, STYLE_LABELS } from "./constants";

interface VideoSettingsPanelProps {
  settings: VideoSettings;
  onChange: (settings: Partial<VideoSettings>) => void;
  style: AnimeStyle;
  onStyleChange: (style: AnimeStyle) => void;
  tone: string;
  onToneChange: (tone: string) => void;
}

export const VideoSettingsPanel: React.FC<VideoSettingsPanelProps> = ({
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
        视频设置
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            分辨率
          </label>
          <select
            value={settings.resolution}
            onChange={(e) => onChange({ resolution: e.target.value as any })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
          >
            {RESOLUTION_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            FPS
          </label>
          <select
            value={settings.fps}
            onChange={(e) => onChange({ fps: parseInt(e.target.value) as 24 | 30 | 60 })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
          >
            {FPS_OPTIONS.map((fps: number) => (
              <option key={fps} value={fps}>
                {fps} FPS
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            分发平台
          </label>
          <div className="flex flex-wrap gap-2">
            {CHANNEL_OPTIONS.map((channel: DistributionChannel) => (
              <button
                key={channel}
                onClick={() => onChange({ distributionChannel: channel })}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  settings.distributionChannel === channel
                    ? "bg-primary text-white"
                    : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                }`}
              >
                {channel}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            总时长: {settings.duration} 秒
          </label>
          <input
            type="range"
            min={10}
            max={300}
            step={10}
            value={settings.duration}
            onChange={(e) => onChange({ duration: parseInt(e.target.value) })}
            className="w-full accent-primary"
          />
        </div>
      </div>
    </div>
  );
};
