import React, { useState } from "react";
import { Clock, Loader2 } from "lucide-react";
import { useStore } from "../store/useStore";
import { useGeneration } from "../hooks/useGeneration";
import { CYCLE_CONFIG } from "../hooks/constants";
import { RandomButton } from "./RandomButton";
import { ReaderSection } from "./InputPanel/ReaderSection";
import { CharacterSection } from "./InputPanel/CharacterSection";
import { PlotSection } from "./InputPanel/PlotSection";
import { RhythmSection } from "./InputPanel/RhythmSection";
import { DetailSection } from "./InputPanel/DetailSection";
import { EmotionSection } from "./InputPanel/EmotionSection";
import { AntiAISection } from "./InputPanel/AntiAISection";

export const TimerAutomation: React.FC = () => {
  const {
    timerAutomation,
    setTimerAutomation,
    resetGeneration,
    generation,
    batchParams,
    setBatchParams,
  } = useStore();
  const { runAllCycles, generateCandidates } = useGeneration();
  const [generatedCount, setGeneratedCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  // 检查是否已经完成目标数量
  const hasReachedTarget = generatedCount >= timerAutomation.bookCount;

  // 自动触发下一本
  React.useEffect(() => {
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
    const { timerAutomation: currentTimer, batchParams } = useStore.getState();
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
          currentTimer.minWordCount,
      );

      // 批量创作使用batchParams中的配置
      const {
        reader,
        character,
        plot,
        rhythm,
        detail,
        emotion,
        antiAI,
        style,
        type,
      } = batchParams;

      // 设置参数（主题和字数使用批量随机，其他复用批量配置参数）
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
      try {
        // 基于主题生成吸引读者的标题
        const titleResults = await generateCandidates(
          `根据主题生成吸引人的小说标题`,
          `主题是：${randomTheme}。请生成3个不同风格的小说标题，标题要吸引读者点击，突出爽点和钩子。每行一个标题，不要其他文字。`,
          3,
        );
        if (titleResults.length > 0) {
          // 随机选一个 - 这里可以后续用于设置标题参数
          console.log(
            "Generated title:",
            titleResults[Math.floor(Math.random() * titleResults.length)],
          );
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

  return (
    <div className="space-y-4">
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          💡 批量自动创作会独立使用<strong>批量创作表单</strong>
          中的配置参数。启动后会自动连续生成直到完成目标数量，上一本完成直接开始下一本。
        </p>
      </div>

      {/* 小说篇幅 - 仅在小说类型时显示 */}
      {batchParams.type === "novel" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            小说篇幅
          </label>
          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded-xl transition-all ${
                batchParams.novelLength === "short" || !batchParams.novelLength
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
              onClick={() =>
                setBatchParams({
                  novelLength: "short",
                  initialChapters: undefined,
                })
              }
            >
              短篇
            </button>
            <button
              className={`px-4 py-2 rounded-xl transition-all ${
                batchParams.novelLength === "long"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
              }`}
              onClick={() =>
                setBatchParams({
                  novelLength: "long",
                  initialChapters: batchParams.initialChapters || 3,
                })
              }
            >
              长篇
            </button>
          </div>
        </div>
      )}

      {/* 字数范围、创作数量 */}
      <div className="grid grid-cols-3 gap-4">
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
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            创作数量
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

      {/* 初始章节数 - 仅在长篇小说时显示 */}
      {batchParams.type === "novel" && batchParams.novelLength === "long" && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            初始章节数
          </label>
          <input
            type="number"
            min={1}
            max={50}
            value={batchParams.initialChapters || 3}
            onChange={(e) =>
              setBatchParams({ initialChapters: parseInt(e.target.value) })
            }
            disabled={timerAutomation.isRunning}
            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100 disabled:opacity-50"
          />
        </div>
      )}

      {/* 内容类型 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          内容类型
        </label>
        <div className="flex gap-3">
          <button
            className={`px-4 py-2 rounded-xl transition-all ${
              batchParams.type === "article"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
            }`}
            onClick={() => setBatchParams({ type: "article" })}
          >
            公众号文章
          </button>
          <button
            className={`px-4 py-2 rounded-xl transition-all ${
              batchParams.type === "novel"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
            }`}
            onClick={() => setBatchParams({ type: "novel" })}
          >
            小说
          </button>
        </div>
      </div>

      {/* 整体文风 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            整体文风
          </label>
        </div>
        <div className="relative">
          <input
            type="text"
            value={batchParams.style}
            onChange={(e) => setBatchParams({ style: e.target.value })}
            className="w-full pl-4 pr-20 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all bg-white/80 dark:bg-slate-700/80 backdrop-blur text-gray-900 dark:text-gray-100"
            placeholder="轻松幽默，都市豪门..."
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <RandomButton
              fieldDescription="整体文章文风形容词"
              rules="生成10种不同文风，每种1-3个词"
              count={10}
              onSelect={(value) => setBatchParams({ style: value })}
            />
          </div>
        </div>
      </div>

      {/* ========== 七大参数分组 - 只在小说类型显示 ========== */}
      {batchParams.type === "novel" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
          <div className="md:col-span-2">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              📚 小说专业创作参数
            </h3>
          </div>
          <ReaderSection
            reader={batchParams.reader}
            onChange={(reader) =>
              setBatchParams({ reader: { ...batchParams.reader, ...reader } })
            }
          />
          <CharacterSection
            character={batchParams.character}
            onChange={(character) =>
              setBatchParams({
                character: { ...batchParams.character, ...character },
              })
            }
          />
          <PlotSection
            plot={batchParams.plot}
            onChange={(plot) =>
              setBatchParams({ plot: { ...batchParams.plot, ...plot } })
            }
          />
          <RhythmSection
            rhythm={batchParams.rhythm}
            onChange={(rhythm) =>
              setBatchParams({ rhythm: { ...batchParams.rhythm, ...rhythm } })
            }
          />
          <DetailSection
            detail={batchParams.detail}
            onChange={(detail) =>
              setBatchParams({ detail: { ...batchParams.detail, ...detail } })
            }
          />
          <EmotionSection
            emotion={batchParams.emotion}
            onChange={(emotion) =>
              setBatchParams({
                emotion: { ...batchParams.emotion, ...emotion },
              })
            }
          />
          <AntiAISection
            antiAI={batchParams.antiAI}
            onChange={(antiAI) =>
              setBatchParams({ antiAI: { ...batchParams.antiAI, ...antiAI } })
            }
          />
        </div>
      )}

      {/* 进度显示 */}
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
      
    </div>
  );
};
