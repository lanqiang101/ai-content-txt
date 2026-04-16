import React from "react";
import { Play, Square, RotateCcw } from "lucide-react";
import { useStore } from "../store/useStore";

export const BatchStartButton: React.FC = () => {
  const { timerAutomation, setTimerAutomation, resetGeneration } = useStore();

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

  const handleReset = () => {
    resetGeneration();
    console.log("✅ 批量创作已重置");
  };

  return (
    <div className="w-full space-y-3">
      {/* 🔥 主操作按钮 */}
      {!isRunning ? (
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
      ) : (
        <button
          onClick={handleStop}
          className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl transition-all rounded-xl text-lg font-semibold"
        >
          <Square size={24} fill="currentColor" />
          停止自动创作
        </button>
      )}
      
      {/* 🔥 重置按钮 - 单独一行，与单篇创作保持一致 */}
      <button
        onClick={handleReset}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 dark:text-orange-400 rounded-lg transition-all"
        title="重置批量创作状态"
      >
        <RotateCcw size={16} />
        重置批量
      </button>
    </div>
  );
};
