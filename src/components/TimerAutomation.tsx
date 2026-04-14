import React, { useState, useEffect } from "react";
import { Clock, Plus, X, Loader2, RotateCcw } from "lucide-react";
import { useStore } from "../store/useStore";
import { useGeneration } from "../hooks/useGeneration";
import { CYCLE_CONFIG } from "../hooks/constants";

export const TimerAutomation: React.FC = () => {
  const {
    timerAutomation,
    setTimerAutomation,
    resetGeneration,
    generation,
  } = useStore();
  const { runAllCycles, generateCandidates } = useGeneration();
  const [newTheme, setNewTheme] = useState("");
  const [generatedCount, setGeneratedCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // 检查是否已经完成目标数量
  const hasReachedTarget = generatedCount >= timerAutomation.bookCount;

  // 自动触发下一本
  useEffect(() => {
    if (
      timerAutomation.isRunning &&
      !isGenerating &&
      !hasReachedTarget &&
      generation.completedCycles === CYCLE_CONFIG.total
    ) {
      // 上一本已完成，等待一小段时间后自动开始下一本
      const timer = setTimeout(() => {
        triggerNextGeneration();
      }, 2000); // 等待2秒让用户看到结果
      return () => clearTimeout(timer);
    }
  }, [
    timerAutomation.isRunning,
    isGenerating,
    hasReachedTarget,
    generation.completedCycles,
  ]);

  const triggerNextGeneration = async () => {
    // 获取最新状态，使用局部变量判断
    const { timerAutomation: currentTimer, params } = useStore.getState();
    if (isGenerating || hasReachedTarget || !currentTimer.isRunning) return;

    // 重置生成状态，准备下一本
    resetGeneration();
    setIsGenerating(true);

    try {
      // 随机选择主题和字数
      const randomTheme =
        currentTimer.themes.length > 0
          ? currentTimer.themes[
              Math.floor(Math.random() * currentTimer.themes.length)
            ]
          : "都市生活";
      const randomWordCount = Math.floor(
        Math.random() *
          (currentTimer.maxWordCount - currentTimer.minWordCount) +
          currentTimer.minWordCount
      );

      // 批量创作复用右侧公共基础参数，不需要单独配置
      // 只覆盖主题和字数，其他参数复用公共配置
      const { reader, character, plot, rhythm, detail, emotion, antiAI, style, type } = params;

      // 设置参数（主题和字数使用批量随机，其他复用公共参数）
      useStore.getState().setParams({
        type,
        topic: randomTheme,
        wordCount: randomWordCount,
        style,
        reader,
        character,
        plot,
        rhythm,
        detail,
        emotion,
        antiAI,
      });

      // 先生成吸引读者的标题
      let generatedTitle = `${randomTheme}的意外故事`;
      try {
        // 基于主题生成吸引读者的标题
        const titleResults = await generateCandidates(
          `根据主题生成吸引人的小说标题`,
          `主题是：${randomTheme}。请生成3个不同风格的小说标题，标题要吸引读者点击，突出爽点和钩子。每行一个标题，不要其他文字。`,
          3
        );
        if (titleResults.length > 0) {
          // 随机选一个
          generatedTitle =
            titleResults[Math.floor(Math.random() * titleResults.length)];
        }
      } catch (error) {
        console.error("Generate title failed, use default:", error);
      }

      // 更新批量参数记录当前信息
      setTimerAutomation({
        ...currentTimer,
      });

      // 清除当前工作ID，这样generateNextCycle会自动创建新作品并添加到作品管理
      useStore.getState().setCurrentWork(null);

      // 开始生成
      await runAllCycles();

      // 增加计数
      setGeneratedCount((prev) => prev + 1);

      // 如果达到目标数量，自动停止
      if (generatedCount + 1 >= currentTimer.bookCount) {
        setTimerAutomation({ isRunning: false });
      }
    } catch (error) {
      console.error("Auto generation error:", error);
    } finally {
      setIsGenerating(false);
    }
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
      themes: timerAutomation.themes.filter((t) => t !== theme),
    });
  };

  const handleResetBatch = () => {
    setGeneratedCount(0);
    setIsGenerating(false);
    setTimerAutomation({ isRunning: false });
    resetGeneration();
    console.log("✅ 批量创作已重置");
  };

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 批量自动创作会复用<strong>右侧公共基础参数</strong>，无需重复配置。只需要设置批量创作特有选项，启动后会自动连续生成直到完成目标数量，上一本完成直接开始下一本。
        </p>
      </div>

      {/* 创作数量 */}
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          创作数量（自动连续生成，直到完成）
          </label>
          <input
            type="number"
            min={1}
            max={100}
            value={timerAutomation.bookCount}
            onChange={(e) =>
              setTimerAutomation({ bookCount: parseInt(e.target.value) || 1 })
            }
            disabled={timerAutomation.isRunning}
            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100 disabled:opacity-50"
          />
        </div>
      </div>

      {/* 字数范围 */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            最少字数
          </label>
          <input
            type="number"
            min={100}
            value={timerAutomation.minWordCount}
            onChange={(e) =>
              setTimerAutomation({
                minWordCount: parseInt(e.target.value) || 1000,
              })
            }
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
            onChange={(e) =>
              setTimerAutomation({
                maxWordCount: parseInt(e.target.value) || 5000,
              })
            }
            disabled={timerAutomation.isRunning}
            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100 disabled:opacity-50"
          />
        </div>
      </div>

      {/* 创作主题 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          创作主题（回车添加，随机抽取）
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

      {/* 进度显示 + 重置按钮 */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1">
          {timerAutomation.isRunning && (
            <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              {isGenerating && (
                <Loader2
                  size={18}
                  className="animate-spin text-blue-600 dark:text-blue-400"
                />
              )}
              <div className="text-sm text-blue-700 dark:text-blue-300">
                {isGenerating
                  ? `正在生成第 ${generatedCount + 1}/${timerAutomation.bookCount} 本...`
                  : `等待当前创作完成，准备开始下一本...`}
              </div>
            </div>
          )}
          {!timerAutomation.isRunning && generatedCount > 0 && (
            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <Clock size={18} className="text-green-600 dark:text-green-400" />
              <div className="text-sm text-green-700 dark:text-green-300">
                已完成 {generatedCount}/{timerAutomation.bookCount} 本自动创作
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleResetBatch}
          className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20 dark:hover:bg-orange-900/40 dark:text-orange-400 rounded-lg transition-all whitespace-nowrap"
        >
          <RotateCcw size={16} />
          重置批量
        </button>
      </div>
    </div>
  );
};
