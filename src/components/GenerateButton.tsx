import React from "react";
import {
  Play,
  Square,
  StepForward,
  AlertCircle,
  AlertTriangle,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { useGeneration } from "../hooks/useGeneration";

export const GenerateButton: React.FC = () => {
  const { generation } = useStore();
  const {
    generateNextCycle,
    runAllCycles,
    stopGeneration,
    isComplete,
    currentProgress,
  } = useGeneration();
  const { error } = generation;
  const isProcessing = generation.isGenerating;

  const handleNext = async () => {
    try {
      await generateNextCycle();
    } catch (err) {
      // Error is already handled in the hook
      console.error("Generation failed:", err);
    }
  };

  const handleRunAll = async () => {
    try {
      await runAllCycles();
    } catch (err) {
      console.error("Generation failed:", err);
    }
  };

  const handleStop = () => {
    stopGeneration();
  };

  return (
    <div className="mb-6 space-y-3 w-full">
      {isProcessing ? (
        <button
          onClick={handleStop}
          className="flex-1 w-full flex items-center justify-center gap-2 px-4 py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <Square size={24} fill="currentColor" />
          终止生成
        </button>
      ) : (
        <div className="grid gap-3">
          {/* <button
            onClick={handleNext}
            disabled={isProcessing || isComplete}
            className={`py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-lg font-semibold text-white transition-all ${
              isProcessing || isComplete
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            <StepForward size={22} fill="currentColor" />
            下一步 ({currentProgress.completed}/7)
          </button> */}
          <button
            onClick={handleRunAll}
            disabled={isProcessing || isComplete}
            className={`w-full flex items-center justify-center gap-2 px-4 py-4 ${
              isProcessing || isComplete
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all"
            } rounded-xl text-lg font-semibold`}
          >
            <Play size={24} fill="currentColor" />
            开始创作{isComplete ? " (已完成)" : ""}({currentProgress.completed}
            /7)
          </button>
        </div>
      )}
      {error && error !== "生成已终止" && (
        <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {error === "生成已终止" && (
        <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm flex items-start gap-3">
          <AlertTriangle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
