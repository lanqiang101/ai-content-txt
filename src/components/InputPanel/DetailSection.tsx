import React from "react";
import { RandomButton } from "../RandomButton";
import { RandomSelectButton } from "../RandomButton";
import { DetailConfig } from "../../types";

interface DetailSectionProps {
  detail: DetailConfig;
  onChange: (detail: Partial<DetailConfig>) => void;
}

export const DetailSection: React.FC<DetailSectionProps> = ({ detail, onChange }) => {
  return (
    <details className="group open rounded-xl border border-gray-200 dark:border-slate-600 p-4">
      <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-100">
        <span className="group-open:underline">👀 感官细节</span>
      </summary>
      <div className="grid grid-cols-1 gap-y-3 mt-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              五感描写比例
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={detail.senseRatio}
              onChange={(e) => onChange({ senseRatio: e.target.value })}
              className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
              placeholder="视/听/嗅/味/触分配"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomButton
                fieldDescription="五感官描写比例分配"
                rules="比如：视觉60% + 听觉25% + 嗅觉10% + 触觉5%"
                count={10}
                onSelect={(value) => onChange({ senseRatio: value })}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              时代/地域专属细节
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={detail.locationDetails}
              onChange={(e) => onChange({ locationDetails: e.target.value })}
              className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
              placeholder="方言 / 老物件 / 特色场景"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomButton
                fieldDescription="小说故事发生的时代地域专属细节"
                rules="给出具体时代地域特色细节，比如 90年代广州电子厂"
                count={10}
                onSelect={(value) => onChange({ locationDetails: value })}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              环境氛围锚点
            </label>
          </div>
          <div className="relative">
            <select
              value={detail.atmosphere}
              onChange={(e) =>
                onChange({ atmosphere: e.target.value as any })
              }
              className="w-full pl-4 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
            >
              <option value="depressed">压抑</option>
              <option value="warm">温暖</option>
              <option value="relaxed">轻松</option>
              <option value="tense">紧张</option>
            </select>
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomSelectButton
                options={[
                  { value: "depressed", label: "压抑" },
                  { value: "warm", label: "温暖" },
                  { value: "relaxed", label: "轻松" },
                  { value: "tense", label: "紧张" },
                ]}
                onSelect={(value) =>
                  onChange({ atmosphere: value as any })
                }
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            生活化随机插曲
          </label>
          <input
            type="checkbox"
            checked={detail.randomInterlude}
            onChange={(e) =>
              onChange({ randomInterlude: e.target.checked })
            }
            className="w-4 h-4 accent-primary"
          />
        </div>
      </div>
    </details>
  );
};
