import React from "react";
import { RandomButton } from "../RandomButton";
import { RandomSelectButton } from "../RandomButton";
import { EmotionConfig } from "../../types";

interface EmotionSectionProps {
  emotion: EmotionConfig;
  onChange: (emotion: Partial<EmotionConfig>) => void;
}

export const EmotionSection: React.FC<EmotionSectionProps> = ({ emotion, onChange }) => {
  return (
    <details className="group open rounded-xl border border-gray-200 dark:border-slate-600 p-4">
      <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-100">
        <span className="group-open:underline">❤️ 情感共鸣</span>
      </summary>
      <div className="grid grid-cols-1 gap-y-3 mt-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              情感递进阶梯
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={emotion.progression}
              onChange={(e) => onChange({ progression: e.target.value })}
              className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
              placeholder="陌生→好奇→共情→动容"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomButton
                fieldDescription="情感递进阶梯"
                rules="读者情感递进路径，比如陌生→好奇→共情→动容"
                count={10}
                onSelect={(value) => onChange({ progression: value })}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              共情触发场景（多选用逗号分隔）
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={emotion.empathyScenes}
              onChange={(e) => onChange({ empathyScenes: e.target.value })}
              className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
              placeholder="遗憾 / 意难平 / 救赎 / 团圆 / 逆袭"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomButton
                fieldDescription="共情触发场景组合"
                rules="从遗憾 / 意难平 / 救赎 / 团圆 / 逆袭 选1-3个组合"
                count={10}
                onSelect={(value) => onChange({ empathyScenes: value })}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              人物情感流露方式
            </label>
          </div>
          <div className="relative">
            <select
              value={emotion.expressionStyle}
              onChange={(e) =>
                onChange({ expressionStyle: e.target.value as any })
              }
              className="w-full pl-4 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
            >
              <option value="reserved">内敛</option>
              <option value="direct">直白</option>
              <option value="insincere">口是心非</option>
            </select>
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomSelectButton
                options={[
                  { value: "reserved", label: "内敛" },
                  { value: "direct", label: "直白" },
                  { value: "insincere", label: "口是心非" },
                ]}
                onSelect={(value) =>
                  onChange({ expressionStyle: value as any })
                }
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              核心情绪落点
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={emotion.coreEmotion}
              onChange={(e) => onChange({ coreEmotion: e.target.value })}
              className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
              placeholder="全文想让读者记住的 feeling"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomButton
                fieldDescription="小说整体核心情绪落点"
                rules="全文想让读者记住什么感觉"
                count={10}
                onSelect={(value) => onChange({ coreEmotion: value })}
              />
            </div>
          </div>
        </div>
      </div>
    </details>
  );
};
