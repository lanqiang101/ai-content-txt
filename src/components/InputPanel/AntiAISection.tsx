import React from "react";
import { RandomSliderButton } from "../RandomButton";
import { RandomSelectButton } from "../RandomButton";
import { AntiAIConfig } from "../../types";

interface AntiAISectionProps {
  antiAI: AntiAIConfig;
  onChange: (antiAI: Partial<AntiAIConfig>) => void;
}

export const AntiAISection: React.FC<AntiAISectionProps> = ({ antiAI, onChange }) => {
  const defaultAntiAI: AntiAIConfig = {
    templateDeletePercent: 60,
    casualTolerance: 30,
    unpredictableTurnPercent: 40,
    whitespacePercent: 20,
    writingStyle: 'soft',
  };
  const safeAntiAI = antiAI ?? defaultAntiAI;

  return (
    <details className="group open rounded-xl border border-gray-200 dark:border-slate-600 p-4">
      <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-100">
        <span className="group-open:underline">🤖 反AI化优化</span>
      </summary>
      <div className="grid grid-cols-1 gap-y-3 mt-3">
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              模板化句式删除比例: {safeAntiAI.templateDeletePercent}%
            </label>
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomSliderButton
                min={0}
                max={100}
                fieldDescription="模板化句式删除比例随机"
                onSelect={(value) => onChange({ templateDeletePercent: value })}
              />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={safeAntiAI.templateDeletePercent}
            onChange={(e) =>
              onChange({ templateDeletePercent: parseInt(e.target.value) })
            }
            className="w-full accent-primary"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            删除 "只见 / 就在这时 / 殊不知" 等模板句
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              口语化语病容忍度: {safeAntiAI.casualTolerance}%
            </label>
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomSliderButton
                min={0}
                max={100}
                fieldDescription="口语化语病容忍度随机"
                onSelect={(value) => onChange({ casualTolerance: value })}
              />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={safeAntiAI.casualTolerance}
            onChange={(e) =>
              onChange({ casualTolerance: parseInt(e.target.value) })
            }
            className="w-full accent-primary"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            真人写作的小随性，非语法病句
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              非标准化转折概率: {safeAntiAI.unpredictableTurnPercent}%
            </label>
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomSliderButton
                min={0}
                max={100}
                fieldDescription="非标准化转折概率随机"
                onSelect={(value) => onChange({ unpredictableTurnPercent: value })}
              />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={safeAntiAI.unpredictableTurnPercent}
            onChange={(e) =>
              onChange({ unpredictableTurnPercent: parseInt(e.target.value) })
            }
            className="w-full accent-primary"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            拒绝AI式可预测转折
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 block">
              生活化留白比例: {safeAntiAI.whitespacePercent}%
            </label>
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomSliderButton
                min={0}
                max={100}
                fieldDescription="生活化留白比例随机"
                onSelect={(value) => onChange({ whitespacePercent: value })}
              />
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={safeAntiAI.whitespacePercent}
            onChange={(e) =>
              onChange({ whitespacePercent: parseInt(e.target.value) })
            }
            className="w-full accent-primary"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            不把所有话写死，留想象空间
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              文笔个人风格锚点
            </label>
          </div>
          <div className="relative">
            <select
              value={safeAntiAI.writingStyle}
              onChange={(e) =>
                onChange({ writingStyle: e.target.value as any })
              }
              className="w-full pl-4 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
            >
              <option value="hard">冷硬</option>
              <option value="soft">温柔</option>
              <option value="sharp">犀利</option>
              <option value="humor">诙谐</option>
              <option value="art">文艺</option>
            </select>
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomSelectButton
                options={[
                  { value: "hard", label: "冷硬" },
                  { value: "soft", label: "温柔" },
                  { value: "sharp", label: "犀利" },
                  { value: "humor", label: "诙谐" },
                  { value: "art", label: "文艺" },
                ]}
                onSelect={(value) =>
                  onChange({ writingStyle: value as any })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </details>
  );
};
