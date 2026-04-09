import React, { useState, useEffect, useRef } from "react";
import { Clock, Play, Square, Plus, X, Loader2 } from "lucide-react";
import { useStore } from "../store/useStore";
import { useGeneration } from "../hooks/useGeneration";
import { Tooltip } from "./Tooltip";

export const TimerAutomation: React.FC = () => {
  const { timerAutomation, setTimerAutomation, params, setParams } = useStore();
  const { runAllCycles, generateNextCycle } = useGeneration();
  const [newTheme, setNewTheme] = useState("");
  const [countdown, setCountdown] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (timerAutomation.isRunning && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timerAutomation.isRunning && countdown === 0) {
      triggerGeneration();
    }
  }, [timerAutomation.isRunning, countdown]);

  const triggerGeneration = async () => {
    if (isGenerating) return;
    setIsGenerating(true);

    try {
      const randomTheme = timerAutomation.themes.length > 0
        ? timerAutomation.themes[Math.floor(Math.random() * timerAutomation.themes.length)]
        : "都市生活";
      const randomWordCount = Math.floor(
        Math.random() * (timerAutomation.maxWordCount - timerAutomation.minWordCount) 
        + timerAutomation.minWordCount
      );

      setParams({
        topic: randomTheme,
        title: `${randomTheme}的意外故事`,
        wordCount: randomWordCount,
      });

      await runAllCycles();
      setCountdown(timerAutomation.intervalMinutes * 60);
    } catch (error) {
      console.error("Auto generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const startAutomation = () => {
    setTimerAutomation({ isRunning: true });
    setCountdown(timerAutomation.intervalMinutes * 60);
  };

  const stopAutomation = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setTimerAutomation({ isRunning: false });
    setCountdown(0);
  };

  const addTheme = () => {
    if (newTheme.trim() && !timerAutomation.themes.includes(newTheme.trim())) {
      setTimerAutomation({
        themes: [...timerAutomation.themes, newTheme.trim()],
      });
      setNewTheme("");
    }
  };

  const removeTheme = (theme: string) => {
    setTimerAutomation({
      themes: timerAutomation.themes.filter(t => t !== theme),
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-5 border border-gray-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            定时创作
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {timerAutomation.isRunning ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                {formatTime(countdown)}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-500">已停止</span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              创作数量
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={timerAutomation.bookCount}
              onChange={(e) => setTimerAutomation({ bookCount: parseInt(e.target.value) || 1 })}
              disabled={timerAutomation.isRunning}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              间隔（分钟）
            </label>
            <input
              type="number"
              min={1}
              max={1440}
              value={timerAutomation.intervalMinutes}
              onChange={(e) => setTimerAutomation({ intervalMinutes: parseInt(e.target.value) || 30 })}
              disabled={timerAutomation.isRunning}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100 disabled:opacity-50"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              最少字数
            </label>
            <input
              type="number"
              min={100}
              value={timerAutomation.minWordCount}
              onChange={(e) => setTimerAutomation({ minWordCount: parseInt(e.target.value) || 1000 })}
              disabled={timerAutomation.isRunning}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              最多字数
            </label>
            <input
              type="number"
              min={100}
              value={timerAutomation.maxWordCount}
              onChange={(e) => setTimerAutomation({ maxWordCount: parseInt(e.target.value) || 5000 })}
              disabled={timerAutomation.isRunning}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100 disabled:opacity-50"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            创作主题（逗号分隔或回车添加）
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {timerAutomation.themes.map((theme, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-lg text-sm"
              >
                {theme}
                <button
                  onClick={() => removeTheme(theme)}
                  disabled={timerAutomation.isRunning}
                  className="hover:text-orange-900 dark:hover:text-orange-100 disabled:opacity-50"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTheme}
              onChange={(e) => setNewTheme(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTheme()}
              disabled={timerAutomation.isRunning}
              className="flex-1 px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100 disabled:opacity-50"
              placeholder="输入主题后回车添加..."
            />
            <button
              onClick={addTheme}
              disabled={timerAutomation.isRunning || !newTheme.trim()}
              className="px-3 py-2 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 rounded-lg disabled:opacity-50 transition-colors"
            >
              <Plus size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        <button
          onClick={timerAutomation.isRunning ? stopAutomation : startAutomation}
          disabled={timerAutomation.themes.length === 0}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${
            timerAutomation.isRunning
              ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900/50"
              : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-md"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {timerAutomation.isRunning ? (
            <>
              <Square size={18} />
              停止自动创作
            </>
          ) : (
            <>
              <Play size={18} />
              开始自动创作
            </>
          )}
        </button>
      </div>
    </div>
  );
};
