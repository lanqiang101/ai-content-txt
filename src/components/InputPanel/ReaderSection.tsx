import React from "react";
import { RandomButton } from "../RandomButton";
import { RandomSelectButton } from "../RandomButton";
import { ReaderConfig } from "../../types";

interface ReaderSectionProps {
  reader: ReaderConfig;
  onChange: (reader: Partial<ReaderConfig>) => void;
}

export const ReaderSection: React.FC<ReaderSectionProps> = ({ reader, onChange }) => {
  return (
    <details className="group open rounded-xl border border-gray-200 dark:border-slate-600 p-4">
      <summary className="cursor-pointer font-medium text-gray-800 dark:text-gray-100">
        <span className="group-open:underline">🔍 读者定位</span>
      </summary>
      <div className="grid grid-cols-1 gap-y-3 mt-3">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              读者年龄层
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={reader.ageRange}
              onChange={(e) => onChange({ ageRange: e.target.value })}
              className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
              placeholder="18-25岁"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomButton
                fieldDescription="常见网络小说读者年龄范围"
                rules="常见年龄范围，比如 18-25岁"
                count={10}
                onSelect={(value) => onChange({ ageRange: value })}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              性别偏好
            </label>
          </div>
          <div className="relative">
            <select
              value={reader.genderPreference}
              onChange={(e) =>
                onChange({ genderPreference: e.target.value as any })
              }
              className="w-full pl-4 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
            >
              <option value="male">男频</option>
              <option value="female">女频</option>
              <option value="all">通用</option>
            </select>
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomSelectButton
                options={[
                  { value: "male", label: "男频" },
                  { value: "female", label: "女频" },
                  { value: "all", label: "通用" },
                ]}
                onSelect={(value) =>
                  onChange({ genderPreference: value as any })
                }
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              核心追读诉求
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={reader.coreAppeal}
              onChange={(e) => onChange({ coreAppeal: e.target.value })}
              className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
              placeholder="爽点 / 泪点 / 悬疑感 / 治愈感"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomButton
                fieldDescription="读者读小说核心诉求"
                rules="从爽点/泪点/悬疑感/治愈感/刀感/反转/脑洞 这些里面选或者组合"
                count={10}
                onSelect={(value) => onChange({ coreAppeal: value })}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              读者雷区
            </label>
          </div>
          <div className="relative">
            <input
              type="text"
              value={reader.taboo}
              onChange={(e) => onChange({ taboo: e.target.value })}
              className="w-full pl-3 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
              placeholder="禁止的情节、人设、三观"
            />
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomButton
                fieldDescription="小说读者雷区禁区"
                rules="常见不能碰的情节，给出2-3个用逗号分开"
                count={2}
                onSelect={(value) => onChange({ taboo: value })}
              />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">
              目标平台文风
            </label>
          </div>
          <div className="relative">
            <select
              value={reader.targetPlatform}
              onChange={(e) =>
                onChange({ targetPlatform: e.target.value as any })
              }
              className="w-full pl-4 pr-12 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
            >
              <option value="tomato">番茄</option>
              <option value="qidian">起点</option>
              <option value="jjwxc">晋江</option>
              <option value="zhihu">知乎</option>
              <option value="short">短篇</option>
              <option value="article">公众号</option>
            </select>
            <div className="absolute right-1 top-1/2 -translate-y-1/2">
              <RandomSelectButton
                options={[
                  { value: "tomato", label: "番茄" },
                  { value: "qidian", label: "起点" },
                  { value: "jjwxc", label: "晋江" },
                  { value: "zhihu", label: "知乎" },
                  { value: "short", label: "短篇" },
                  { value: "article", label: "公众号" },
                ]}
                onSelect={(value) =>
                  onChange({ targetPlatform: value as any })
                }
              />
            </div>
          </div>
        </div>
      </div>
    </details>
  );
};
