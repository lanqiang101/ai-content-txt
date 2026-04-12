import React from "react";
import { RandomSelectButton } from "../RandomButton";
import { RandomSliderButton } from "../RandomButton";
import { RhythmConfig } from "../../types";

interface RhythmSectionProps {
  rhythm: RhythmConfig;
  onChange: (rhythm: Partial<RhythmConfig>) => void;
}

export const RhythmSection: React.FC<RhythmSectionProps> = ({ rhythm, onChange }) => {
  const defaultRhythm: RhythmConfig = {
    alternation: '3段平淡 + 1段高潮',
    climaxDensity: '每3k字小高潮，每1w字中高潮',
    chapterEndHook: true,
    conflictFrequency: 50,
    bufferNodes: true,
    averageParaLength: 'short',
  };
  const safeRhythm = rhythm ?? defaultRhythm;

  return (
    <details className="group open rounded-xl border border-gray-200 dark:border-slate-600 p-4">
      <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-100">
        <span className="group-open:underline">⏱️ 节奏掌控</span>
      </summary>
      <div className="grid grid-cols-1 gap-y-3 mt-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              平均段落长度
            </label>
          </div>
          <div className="relative">
            <select
              value={safeRhythm.averageParaLength}
              onChange={(e) =>
                onChange({ averageParaLength: e.target.value as any })
              }
              className="w-full pl-4 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
            >
              <option value="short">短段落（网文）</option>
              <option value="medium">中等段落</option>
              <option value="long">长段落（出版）</option>
            </select>
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomSelectButton
                options={[
                  { value: "short", label: "短段落（网文）" },
                  { value: "medium", label: "中等段落" },
                  { value: "long", label: "长段落（出版）" },
                ]}
                onSelect={(value) =>
                  onChange({ averageParaLength: value as any })
                }
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              冲突频率: {safeRhythm.conflictFrequency}%
            </label>
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomSliderButton
                min={0}
                max={100}
                fieldDescription="冲突频率随机"
                onSelect={(value) => onChange({ conflictFrequency: value })}
              />
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={safeRhythm.conflictFrequency}
            onChange={(e) =>
              onChange({ conflictFrequency: parseInt(e.target.value) })
            }
            className="w-full accent-primary"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            避免全程流水账，高频率更紧凑
          </p>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            缓冲节点插入
          </label>
          <input
            type="checkbox"
            checked={safeRhythm.bufferNodes}
            onChange={(e) =>
              onChange({ bufferNodes: e.target.checked })
            }
            className="w-4 h-4 accent-primary"
          />
        </div>
      </div>
    </details>
  );
};
