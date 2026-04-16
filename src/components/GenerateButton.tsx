import React from "react";
import {
  Play,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { useGeneration } from "../hooks/useGeneration";

export const GenerateButton: React.FC = () => {
  const { generation, resetGeneration, currentWorkId } = useStore();
  const {
    runAllCycles,
    isComplete,
    currentProgress,
  } = useGeneration();
  const { error } = generation;
  const isProcessing = generation.isGenerating;

  const handleRunAll = async () => {
    try {
      await runAllCycles();
    } catch (err) {
      console.error("Generation failed:", err);
    }
  };

  const handleReset = () => {
    resetGeneration();
  };

  return (
    <div className="mb-6 space-y-3 w-full">
      {/* 🔥 主操作按钮 - 始终显示"开始创作" */}
      <button
        onClick={handleRunAll}
        className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all rounded-xl text-lg font-semibold"
      >
        <Play size={24} fill="currentColor" />
        开始创作{isComplete ? " (已完成)" : ""}
      </button>
      
      {/* 🔥 重置按钮 - 非运行时显示，与批量创作保持一致 */}
      {!isProcessing && (
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
          title="重置所有生成状态"
        >
          <RotateCcw size={20} />
          重置
        </button>
      )}
      
      {/* 🔥 任务运行提示 */}
      {isProcessing && currentWorkId && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-300 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">任务正在后台运行</p>
            <p className="text-xs mt-1 opacity-80">
              您可以跳转到其他页面，任务会继续执行。在"作品管理"中可以查看所有任务和终止操作。
            </p>
          </div>
        </div>
      )}
      
      {error && error !== "生成已终止" && (
        <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
