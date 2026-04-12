import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { StoryboardResult, SceneDesc } from "../../types";

interface StoryboardPanelProps {
  storyboards: StoryboardResult[];
  copiedId: string | null;
  onCopy: (id: string) => void;
  onClearCopied: () => void;
  workTitle: string;
}

// 分镜单个场景描述（用于渲染）
interface StoryboardScene extends SceneDesc {
  id: string;
  chapterNumber: number;
  clipNumber: number;
}

export const StoryboardPanel: React.FC<StoryboardPanelProps> = ({
  storyboards,
  copiedId,
  onCopy,
  onClearCopied,
  workTitle,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (storyboards.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          还没有生成分镜，点击生成按钮开始吧
        </p>
      </div>
    );
  }

  // 收集所有分镜场景
  const allScenes: StoryboardScene[] = storyboards.reduce<StoryboardScene[]>((acc, sb) => {
    const chapterNumber = sb.chapterNumber || 1;
    return [
      ...acc,
      ...sb.scenes.map((scene, index) => ({
        ...scene,
        id: `${sb.id}-scene-${index}`,
        chapterNumber,
        clipNumber: index + 1,
      })),
    ];
  }, []);

  // 组合完整prompt文本用于复制
  const getFullPrompt = (sb: StoryboardScene) => {
    return [
      `场景：${sb.name} - ${sb.description}`,
      `背景：${sb.background}`,
      `灯光：${sb.lighting}`,
      `氛围：${sb.mood}`,
    ].join('\n');
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
        {workTitle} - 已生成分镜 ({allScenes.length})
      </h3>
      <div className="space-y-3">
        {allScenes.map((sb) => {
          const isExpanded = expandedId === sb.id;
          return (
            <div
              key={sb.id}
              className="border border-gray-200 dark:border-slate-600 rounded-lg overflow-hidden"
            >
              <div
                onClick={() => setExpandedId(isExpanded ? null : sb.id)}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                    第 {sb.chapterNumber} 章 - 第 {sb.clipNumber} 片段
                  </span>
                  <p className="text-sm text-gray-800 dark:text-gray-100 line-clamp-1">
                    {sb.name}: {sb.description}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(sb.id);
                    navigator.clipboard.writeText(getFullPrompt(sb));
                    setTimeout(onClearCopied, 2000);
                  }}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded transition-colors"
                  title="复制分镜描述"
                >
                  {copiedId === sb.id ? (
                    <Check size={16} className="text-green-500" />
                  ) : (
                    <Copy
                      size={16}
                      className="text-gray-500 dark:text-gray-400"
                    />
                  )}
                </button>
              </div>
              {isExpanded && (
                <div className="p-3 bg-gray-50 dark:bg-slate-700/50 border-t border-gray-200 dark:border-slate-600">
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        场景名称：
                      </span>
                      <p className="text-gray-800 dark:text-gray-100 mt-1">
                        {sb.name}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        描述：
                      </span>
                      <p className="text-gray-800 dark:text-gray-100 mt-1 whitespace-pre-wrap">
                        {sb.description}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        背景：
                      </span>
                      <p className="text-gray-800 dark:text-gray-100 mt-1">
                        {sb.background}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        灯光：
                      </span>
                      <p className="text-gray-800 dark:text-gray-100 mt-1">
                        {sb.lighting}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        氛围：
                      </span>
                      <p className="text-gray-800 dark:text-gray-100 mt-1">
                        {sb.mood}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
