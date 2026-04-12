import React from "react";
import { RandomButton } from "../RandomButton";
import { RandomSliderButton } from "../RandomButton";
import { RandomSelectButton } from "../RandomButton";
import { CharacterConfig } from "../../types";

interface CharacterSectionProps {
  character: CharacterConfig;
  onChange: (character: Partial<CharacterConfig>) => void;
}

export const CharacterSection: React.FC<CharacterSectionProps> = ({ character, onChange }) => {
  const defaultCharacter: CharacterConfig = {
    coreFlaw: '',
    motivation: '',
    habits: '',
    emotionThreshold: '',
    growthArc: '',
    secretIntensity: 50,
    goldenSentencePerThousand: 2,
    arcType: 'none',
    supportingBackstory: false,
  };
  const safeCharacter = character ?? defaultCharacter;

  return (
    <details className="group open rounded-xl border border-gray-200 dark:border-slate-600 p-4">
      <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-100">
        <span className="group-open:underline">👤 人物深度</span>
      </summary>
      <div className="grid grid-cols-1 gap-y-3 mt-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              核心缺陷锚点
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={safeCharacter.coreFlaw}
              onChange={(e) => onChange({ coreFlaw: e.target.value })}
              className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
              placeholder="懦弱 / 偏执 / 太善良"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomButton
                fieldDescription="人物核心性格缺陷"
                rules="给出一个具体人物缺陷关键词"
                count={10}
                onSelect={(value) => onChange({ coreFlaw: value })}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              隐藏秘密强度（0-100%）
            </label>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="range"
              min={0}
              max={100}
              value={safeCharacter.secretIntensity}
              onChange={(e) =>
                onChange({ secretIntensity: parseInt(e.target.value) })
              }
              className="flex-1 accent-primary"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomSliderButton
                min={0}
                max={100}
                fieldDescription="人物隐藏秘密强度随机"
                onSelect={(value) => onChange({ secretIntensity: value })}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            高=贯穿全文的伏笔钩子
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              金句密度（每一千字）
            </label>
          </div>
          <div className="flex items-center justify-between">
            <input
              type="range"
              min={0}
              max={5}
              step={1}
              value={safeCharacter.goldenSentencePerThousand}
              onChange={(e) =>
                onChange({ goldenSentencePerThousand: parseInt(e.target.value) })
              }
              className="flex-1 accent-primary"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomSliderButton
                min={0}
                max={5}
                fieldDescription="金句密度随机"
                onSelect={(value) => onChange({ goldenSentencePerThousand: value })}
              />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            适合传播平台的记忆点句子
          </p>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              人物弧光要求
            </label>
          </div>
          <div className="relative">
            <select
              value={safeCharacter.arcType}
              onChange={(e) =>
                onChange({ arcType: e.target.value as any })
              }
              className="w-full pl-4 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
            >
              <option value="none">无弧光 / 不变态</option>
              <option value="positive">成长弧光</option>
              <option value="fall">堕落弧光</option>
              <option value="complex">复杂反转</option>
            </select>
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomSelectButton
                options={[
                  { value: "none", label: "无弧光 / 不变态" },
                  { value: "positive", label: "成长弧光" },
                  { value: "fall", label: "堕落弧光" },
                  { value: "complex", label: "复杂反转" },
                ]}
                onSelect={(value) =>
                  onChange({ arcType: value as any })
                }
              />
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            给配角分配背景故事
          </label>
          <input
            type="checkbox"
            checked={safeCharacter.supportingBackstory}
            onChange={(e) =>
              onChange({ supportingBackstory: e.target.checked })
            }
            className="w-4 h-4 accent-primary"
          />
        </div>
      </div>
    </details>
  );
};
