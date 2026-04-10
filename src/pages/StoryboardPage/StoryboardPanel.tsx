import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { StoryboardPrompt } from "../../types";

interface StoryboardPanelProps {
  storyboards: StoryboardPrompt[];
  copiedId: string | null;
  onCopy: (content: string, id: string) => void;
}

export const StoryboardPanel: React.FC<StoryboardPanelProps> = ({
  storyboards,
  copiedId,
  onCopy,
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

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4">
      <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
        分镜列表 ({storyboards.length})
      </h3>
      <div className="space-y-3">
        {storyboards.map((sb) => {
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
                    第 {sb.chapterNumber || 1} 章 - 第 {sb.clipNumber} 片段
                  </span>
                  <p className="text-sm text-gray-800 dark:text-gray-100 line-clamp-1">
                    {sb.scene}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCopy(sb.visual, sb.id);
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
                        场景：
                      </span>
                      <p className="text-gray-800 dark:text-gray-100 mt-1 whitespace-pre-wrap">
                        {sb.scene}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        视觉描述：
                      </span>
                      <p className="text-gray-800 dark:text-gray-100 mt-1 whitespace-pre-wrap">
                        {sb.visual}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        人物：
                      </span>
                      <p className="text-gray-800 dark:text-gray-100 mt-1">
                        {sb.camera}
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
                        时长：
                      </span>
                      <p className="text-gray-800 dark:text-gray-100 mt-1">
                        {sb.duration} 秒
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
