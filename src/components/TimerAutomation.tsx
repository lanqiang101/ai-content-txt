import React, { useState, useEffect, useRef } from "react";
import { Clock, Play, Square, Plus, X, Loader2 } from "lucide-react";
import { useStore } from "../store/useStore";
import { useGeneration, CYCLE_CONFIG } from "../hooks/useGeneration";
import { Tooltip } from "./Tooltip";

export const TimerAutomation: React.FC = () => {
  const {
    timerAutomation,
    setTimerAutomation,
    params,
    setParams,
    generation,
    resetGeneration,
  } = useStore();
  const { runAllCycles, isComplete, generateCandidates } = useGeneration();
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
       const randomTheme = timerAutomation.themes.length > 0
         ? timerAutomation.themes[Math.floor(Math.random() * timerAutomation.themes.length)]
         : "都市生活";
       const randomWordCount = Math.floor(
         Math.random() *
           (timerAutomation.maxWordCount - timerAutomation.minWordCount) +
           timerAutomation.minWordCount,
       );

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
           generatedTitle = titleResults[Math.floor(Math.random() * titleResults.length)];
         }
       } catch (error) {
         console.error('Generate title failed, use default:', error);
       }

        // 设置新作品参数
        setParams({
          topic: randomTheme,
          title: generatedTitle,
          wordCount: randomWordCount,
        });

        // 清除当前工作ID，这样generateNextCycle会自动创建新作品并添加到作品管理
        useStore.getState().setCurrentWork(null);

        // 开始生成
        await runAllCycles();
        
        // 获取生成结果
        const { generation: finalGeneration } = useStore.getState();
        let finalResult = finalGeneration.stage3Result || '';
        
        // 增强完结校验，确保故事完整不截断
        const isIncomplete = (content: string): boolean => {
          // 检查是否有明显的未完结标记
          const incompletePatterns = [
            /\b(未完待续|to be continued|下一章)\b/i,
            /欲知后事如何.*下回分解/i,
          ];
          
          for (const pattern of incompletePatterns) {
            if (pattern.test(content)) {
              return false; // 这是故意留坑，不算不完整
            }
          }
          
          // 检查结尾是否明显被截断：句子不完整、没有结束标点
          const trimmed = content.trim();
          if (trimmed.length === 0) return true;
          
          const lastChar = trimmed.charAt(trimmed.length - 1);
          // 如果最后一个字符不是结束标点，很可能被截断了
          if (!['。', '！', '？', '…', '」', '】', '）', '!', '?', '.'].includes(lastChar)) {
            return true;
          }
          
          return false;
        };
        
        // 如果检测到不完整，自动补全结尾
        if (finalResult && isIncomplete(finalResult)) {
          try {
            console.log('批量生成检测到内容未完结，正在自动补全结尾...');
            const { callModel } = useStore.getState();
            const { config: storeConfig } = useStore.getState();
            const activeConfig = storeConfig.random.models.find(m => m.enabled) || storeConfig.random;
            
            const completePrompt = `前面是小说全文，但是故事结尾被截断了，请你帮忙补完故事结尾：

${finalResult}

请直接输出补完的结尾部分，不需要重复已有内容，确保故事有完整结局。`;
            
            const controller = new AbortController();
            const completion = await callModel(completePrompt, activeConfig, controller.signal);
            if (completion && completion.length > 50) {
              // 把补全添加到结尾
              const { generation } = useStore.getState();
              const { cycleResults } = generation;
              // 更新 stage3Result
              const updatedCycleResults = cycleResults.map(item => {
                if (item.stage === 3) {
                  return { ...item, result: item.result + '\n\n' + completion };
                }
                return item;
              });
              
              // 更新到store
              useStore.getState().setGeneration({
                ...generation,
                cycleResults: updatedCycleResults,
                stage3Result: finalResult + '\n\n' + completion,
              });
              
              console.log('批量生成自动补全完成，增加了' + completion.length + '字');
              
              // 更新最终结果
              finalResult = finalResult + '\n\n' + completion;
            }
          } catch (error) {
            console.error('批量生成自动补全失败，使用原有内容:', error);
          }
        }

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
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 sm:p-5 border border-gray-200/50 dark:border-slate-700/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            批量自动创作
          </h2>
        </div>
        <div className="flex items-center gap-2">
          {timerAutomation.isRunning && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                {generatedCount}/{timerAutomation.bookCount}
              </span>
            </div>
          )}
          {timerAutomation.isRunning && isGenerating && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Loader2 size={14} className="animate-spin" />
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
                生成中
              </span>
            </div>
          )}
          {!isGenerating && timerAutomation.isRunning && !hasReachedTarget && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                等待下一本
              </span>
            </div>
          )}
          {!timerAutomation.isRunning && (
            <span className="text-sm text-gray-500">已停止</span>
          )}
        </div>
      </div>

       <div className="space-y-4">
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
