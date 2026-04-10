import React, { useState, useEffect } from "react";
import { Clock, Play, Square, Plus, X, Loader2 } from "lucide-react";
import { useStore } from "../store/useStore";
import { useGeneration } from "../hooks/useGeneration";
import { CYCLE_CONFIG } from "../hooks/constants";
import {
  defaultReaderConfig,
  defaultCharacterConfig,
  defaultPlotConfig,
  defaultRhythmConfig,
  defaultDetailConfig,
  defaultEmotionConfig,
  defaultAntiAIConfig,
} from "../store/useStore";

export const TimerAutomation: React.FC = () => {
  const {
    timerAutomation,
    setTimerAutomation,
    resetGeneration,
    setParams,
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
    const { timerAutomation: currentTimer } = useStore.getState();
    if (isGenerating || hasReachedTarget || !currentTimer.isRunning) return;

    // 重置生成状态，准备下一本
    resetGeneration();
    setIsGenerating(true);

    try {
      // 随机选择主题和字数
      const randomTheme =
        timerAutomation.themes.length > 0
          ? timerAutomation.themes[
              Math.floor(Math.random() * timerAutomation.themes.length)
            ]
          : "都市生活";
      const randomWordCount = Math.floor(
        Math.random() *
          (timerAutomation.maxWordCount - timerAutomation.minWordCount) +
          timerAutomation.minWordCount,
      );

       // 批量创作使用独立参数，不修改单次创作参数
       // 兼容旧数据，如果params不存在则使用默认值
       const batchParams = timerAutomation.params || {
         type: 'novel',
         topic: '',
         title: '',
         keywords: '',
         wordCount: 1500,
         style: '',
         reader: defaultReaderConfig,
         character: defaultCharacterConfig,
         plot: defaultPlotConfig,
         rhythm: defaultRhythmConfig,
         detail: defaultDetailConfig,
         emotion: defaultEmotionConfig,
         antiAI: defaultAntiAIConfig,
       };

       // 设置批量参数到store进行生成
       setParams({
         type: batchParams.type,
         topic: randomTheme,
         wordCount: randomWordCount,
         style: batchParams.style,
         reader: batchParams.reader,
         character: batchParams.character,
         plot: batchParams.plot,
         rhythm: batchParams.rhythm,
         detail: batchParams.detail,
         emotion: batchParams.emotion,
         antiAI: batchParams.antiAI,
       });

      // 先生成吸引读者的标题
      let generatedTitle = `${randomTheme}的意外故事`;
      try {
        // 基于主题生成吸引读者的标题
        const titleResults = await generateCandidates(
          `根据主题生成吸引人的小说标题`,
          `主题是：${randomTheme}。请生成3个不同风格的小说标题，标题要吸引读者点击，突出爽点和钩子。每行一个标题，不要其他文字。`,
          3,
        );
        if (titleResults.length > 0) {
          // 随机选一个
          generatedTitle =
            titleResults[Math.floor(Math.random() * titleResults.length)];
        }
      } catch (error) {
        console.error("Generate title failed, use default:", error);
      }

      // 更新标题到批量参数
      setTimerAutomation({
        params: {
          ...timerAutomation.params,
          topic: randomTheme,
          title: generatedTitle,
          wordCount: randomWordCount,
        },
      });

      // 清除当前工作ID，这样generateNextCycle会自动创建新作品并添加到作品管理
      useStore.getState().setCurrentWork(null);

      // 开始生成
      await runAllCycles();

      // 增加计数
      setGeneratedCount((prev) => prev + 1);

      // 如果达到目标数量，自动停止
      if (generatedCount + 1 >= timerAutomation.bookCount) {
        stopAutomation();
      }
    } catch (error) {
      console.error("Auto generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const startAutomation = () => {
    resetGeneration();
    setGeneratedCount(0);
    setTimerAutomation({ isRunning: true });
    // 直接开始第一本，使用 setTimeout 让状态更新后再执行
    setTimeout(() => {
      triggerNextGeneration();
    }, 500);
  };

  const stopAutomation = () => {
    setTimerAutomation({ isRunning: false });
    setIsGenerating(false);
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

  return (
    <div className="space-y-4">
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
          创作主题（回车添加）
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

      {/* ========== 批量创作独立基础参数 ========== */}
      <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
        <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
          <span className="w-1 h-4 bg-primary rounded-full"></span>
          基础创作参数（独立配置，不影响单次创作）
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 读者定位分组 */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                读者年龄层
              </label>
              <input
                type="text"
                value={timerAutomation.params?.reader?.ageRange || ""}
                onChange={(e) =>
                  setTimerAutomation({
                    params: {
                      ...timerAutomation.params,
                      reader: {
                        ...(timerAutomation.params?.reader || {}),
                        ageRange: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                placeholder="18-25岁"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                核心追读诉求
              </label>
              <input
                type="text"
                value={timerAutomation.params?.reader?.coreAppeal || ""}
                onChange={(e) =>
                  setTimerAutomation({
                    params: {
                      ...timerAutomation.params,
                      reader: {
                        ...(timerAutomation.params?.reader || {}),
                        coreAppeal: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                placeholder="爽点 / 泪点 / 悬疑感"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                性别偏好
              </label>
              <select
                value={
                  timerAutomation.params?.reader?.genderPreference || "male"
                }
                onChange={(e) =>
                  setTimerAutomation({
                    params: {
                      ...timerAutomation.params,
                      reader: {
                        ...(timerAutomation.params?.reader || {}),
                        genderPreference: e.target.value as any,
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
              >
                <option value="male">男频</option>
                <option value="female">女频</option>
                <option value="all">通用</option>
              </select>
            </div>
          </div>

          {/* 人物深度分组 */}
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                核心缺陷锚点
              </label>
              <input
                type="text"
                value={timerAutomation.params?.character?.coreFlaw || ""}
                onChange={(e) =>
                  setTimerAutomation({
                    params: {
                      ...timerAutomation.params,
                      character: {
                        ...(timerAutomation.params?.character || {}),
                        coreFlaw: e.target.value,
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                placeholder="懦弱 / 偏执"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                人物弧光
              </label>
              <select
                value={timerAutomation.params?.character?.arcType || "none"}
                onChange={(e) =>
                  setTimerAutomation({
                    params: {
                      ...timerAutomation.params,
                      character: {
                        ...(timerAutomation.params?.character || {}),
                        arcType: e.target.value as any,
                      },
                    },
                  })
                }
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
              >
                <option value="none">无弧光 / 不变态</option>
                <option value="positive">成长弧光</option>
                <option value="fall">堕落弧光</option>
                <option value="complex">复杂反转</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* 启动/停止按钮 */}
      <div className="flex gap-3 pt-4">
        {!timerAutomation.isRunning ? (
          <button
            onClick={startAutomation}
            disabled={timerAutomation.themes.length === 0}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
          >
            <Play size={18} />
            开始自动批量创作
          </button>
        ) : (
          <button
            onClick={stopAutomation}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <Square size={18} />
            停止自动创作
          </button>
        )}
      </div>

      {/* 进度显示 */}
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

      {/* 完成统计 */}
      {!timerAutomation.isRunning && generatedCount > 0 && (
        <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <Clock size={18} className="text-green-600 dark:text-green-400" />
          <div className="text-sm text-green-700 dark:text-green-300">
            已完成 {generatedCount}/{timerAutomation.bookCount} 本自动创作
          </div>
        </div>
      )}
    </div>
  );
};
