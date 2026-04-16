import React, { useState } from "react";
import { X } from "lucide-react";
import { Button } from "../../components/ui/Button";

interface ContinuationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (chapterCount: number) => void;
  currentChapterCount: number;
}

export const ContinuationDialog: React.FC<ContinuationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  currentChapterCount,
}) => {
  const [chapterCount, setChapterCount] = useState(1);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (chapterCount < 1 || chapterCount > 10) {
      alert("续写章节数必须在1-10之间");
      return;
    }
    onConfirm(chapterCount);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl max-w-md w-full mx-4">
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            续写章节
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X size={20} />
          </button>
        </div>

        {/* 内容 */}
        <div className="px-6 py-6">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            当前已有 {currentChapterCount} 章，请输入要续写的章节数：
          </p>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              续写章节数
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={chapterCount}
              onChange={(e) => setChapterCount(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-2">
              建议每次续写1-3章，以保持内容连贯性
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>提示：</strong>续写将根据前文内容和人物设定生成新章节，保持故事连贯性。
            </p>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 dark:border-slate-700">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            取消
          </Button>
          <Button onClick={handleConfirm} className="flex-1">
            开始续写
          </Button>
        </div>
      </div>
    </div>
  );
};
