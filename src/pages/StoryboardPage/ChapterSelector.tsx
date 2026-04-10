import React from "react";
import { Loader2, Sparkles } from "lucide-react";

interface ChapterSelectorProps {
  chapters: number[];
  selectedChapter: number | null;
  onSelect: (chapter: number) => void;
  onSmartDetect: () => void;
  isSmartDetecting: boolean;
}

export const ChapterSelector: React.FC<ChapterSelectorProps> = ({
  chapters,
  selectedChapter,
  onSelect,
  onSmartDetect,
  isSmartDetecting,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          选择章节
        </h3>
        <button
          onClick={onSmartDetect}
          disabled={isSmartDetecting}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-all"
        >
          {isSmartDetecting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              检测中...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              智能检测
            </>
          )}
        </button>
      </div>

      {chapters.length === 0 ? (
        <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
          暂无章节，请先点击智能检测或在作品设置中添加章节
        </p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {chapters.map((num) => (
            <button
              key={num}
              onClick={() => onSelect(num)}
              className={`px-3 py-2 rounded-lg text-sm transition-all ${
                selectedChapter === num
                  ? "bg-primary text-white"
                  : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
            >
              第 {num} 章
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
