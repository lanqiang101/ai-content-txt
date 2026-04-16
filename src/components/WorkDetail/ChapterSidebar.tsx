import React from "react";
import { Plus, FileText } from "lucide-react";
import { Chapter } from "../../types";
import { Button } from "../../components/ui/Button";

interface ChapterSidebarProps {
  chapters: Chapter[];
  currentChapterId: string | null;
  onSelectChapter: (chapterId: string) => void;
  onAddChapter?: () => void;
}

export const ChapterSidebar: React.FC<ChapterSidebarProps> = ({
  chapters,
  currentChapterId,
  onSelectChapter,
  onAddChapter,
}) => {
  // 按章节号排序
  const sortedChapters = [...chapters].sort(
    (a, b) => a.chapterNumber - b.chapterNumber
  );

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700">
      {/* 标题栏 */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-slate-700">
        <h3 className="font-bold text-gray-800 dark:text-gray-100">
          章节列表 ({chapters.length})
        </h3>
        {onAddChapter && (
          <Button variant="secondary" size="sm" onClick={onAddChapter}>
            <Plus size={16} />
          </Button>
        )}
      </div>

      {/* 章节列表 */}
      <div className="flex-1 overflow-y-auto">
        {sortedChapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
            <FileText size={32} className="mb-2 opacity-30" />
            <p className="text-sm text-center">暂无章节</p>
          </div>
        ) : (
          <div className="py-2">
            {sortedChapters.map((chapter) => (
              <button
                key={chapter.id}
                onClick={() => onSelectChapter(chapter.id)}
                className={`w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors ${
                  currentChapterId === chapter.id
                    ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500"
                    : "border-l-4 border-transparent"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-700 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-400">
                    {chapter.chapterNumber}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-800 dark:text-gray-100 truncate">
                      {chapter.title || `第${chapter.chapterNumber}章`}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {chapter.wordCount || 0} 字
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
