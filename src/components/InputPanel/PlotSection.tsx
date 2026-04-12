import React from "react";
import { RandomButton } from "../RandomButton";
import { RandomSliderButton } from "../RandomButton";
import { RandomSelectButton } from "../RandomButton";
import { PlotConfig } from "../../types";

interface PlotSectionProps {
  plot: PlotConfig;
  onChange: (plot: Partial<PlotConfig>) => void;
}

export const PlotSection: React.FC<PlotSectionProps> = ({ plot, onChange }) => {
  const defaultPlot: PlotConfig = {
    mainChain: '',
    foreshadowing: '',
    branchRatio: 30,
    causalConstraint: true,
    checkReversal: true,
    hookWordCount: 500,
    twistPerThousand: 1,
    structure: 'linear',
    forceConflictAtStart: true,
    seedForeshadow: true,
    openEnding: false,
  };
  const safePlot = plot ?? defaultPlot;

  return (
    <details className="group open rounded-xl border border-gray-200 dark:border-slate-600 p-4">
      <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-100">
        <span className="group-open:underline">🧩 情节架构</span>
      </summary>
      <div className="grid grid-cols-1 gap-y-3 mt-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              开篇钩子长度（字数）
            </label>
          </div>
          <div className="relative">
            <input
              type="number"
              min={100}
              max={5000}
              value={safePlot.hookWordCount}
              onChange={(e) =>
                onChange({ hookWordCount: parseInt(e.target.value) })
              }
              className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
              placeholder="建议300-800字"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomButton
                fieldDescription="开篇钩子建议字数"
                rules="只返回一个数字，单位字"
                count={10}
                onSelect={(value) => {
                  const num = parseInt(value.replace(/\D/g, ""));
                  if (!isNaN(num)) onChange({ hookWordCount: num });
                }}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              反转密度要求（千字几次）
            </label>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="range"
              min={0}
              max={3}
              step={0.5}
              value={safePlot.twistPerThousand}
              onChange={(e) =>
                onChange({ twistPerThousand: parseFloat(e.target.value) })
              }
              className="flex-1 accent-primary"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomSliderButton
                min={0}
                max={3}
                fieldDescription="反转密度随机"
                onSelect={(value) => onChange({ twistPerThousand: value })}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              故事结构
            </label>
          </div>
          <div className="relative">
            <select
              value={safePlot.structure}
              onChange={(e) =>
                onChange({ structure: e.target.value as any })
              }
              className="w-full pl-4 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
            >
              <option value="linear">线性顺叙</option>
              <option value="inverted">倒叙开头</option>
              <option value="interrupt">插叙补全</option>
              <option value="multiline">多线并行</option>
            </select>
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomSelectButton
                options={[
                  { value: "linear", label: "线性顺叙" },
                  { value: "inverted", label: "倒叙开头" },
                  { value: "interrupt", label: "插叙补全" },
                  { value: "multiline", label: "多线并行" },
                ]}
                onSelect={(value) =>
                  onChange({ structure: value as any })
                }
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            开篇强制冲突
          </label>
          <input
            type="checkbox"
            checked={safePlot.forceConflictAtStart}
            onChange={(e) =>
              onChange({ forceConflictAtStart: e.target.checked })
            }
            className="w-4 h-4 accent-primary"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            埋关键伏笔
          </label>
          <input
            type="checkbox"
            checked={safePlot.seedForeshadow}
            onChange={(e) =>
              onChange({ seedForeshadow: e.target.checked })
            }
            className="w-4 h-4 accent-primary"
          />
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            开放式结尾
          </label>
          <input
            type="checkbox"
            checked={safePlot.openEnding}
            onChange={(e) =>
              onChange({ openEnding: e.target.checked })
            }
            className="w-4 h-4 accent-primary"
          />
        </div>
      </div>
    </details>
  );
};
