import React from "react";
import { Play, Square, Loader2 } from "lucide-react";
import { useStore } from "../store/useStore";

interface BatchStartButtonProps {
  isGenerating: boolean;
  generatedCount: number;
  hasReachedTarget: boolean;
}

export const BatchStartButton: React.FC = () => {
  const { timerAutomation, setTimerAutomation, resetGeneration } = useStore();
  const { generation } = useStore();

  const isRunning = timerAutomation.isRunning;
  const hasThemes = timerAutomation.themes.length > 0;

  const handleStart = () => {
    // 实际的启动逻辑由 TimerAutomation 中的 effect 触发
    resetGeneration();
    setTimerAutomation({ isRunning: true });
  };

  const handleStop = () => {
    setTimerAutomation({ isRunning: false });
  };

  if (!isRunning) {
    return (
      <button
        onClick={handleStart}
        disabled={!hasThemes}
        className={`w-full flex items-center justify-center gap-2 px-4 py-4 ${
          !hasThemes
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all"
        } rounded-xl text-lg font-semibold`}
      >
        <Play size={24} fill="currentColor" />
        开始自动批量创作
      </button>
    );
  }

  return (
    <button
      onClick={handleStop}
      className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all rounded-xl text-lg font-semibold"
    >
      <Square size={24} fill="currentColor" />
      停止自动创作
    </button>
  );
};
