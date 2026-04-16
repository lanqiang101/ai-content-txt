import { useEffect, useState } from "react";
import { BaseParamsPanel } from "./components/BaseParamsPanel";
import { InputPanel } from "./components/InputPanel";
import { CycleProgress } from "./components/CycleProgress";
import { OutputPanels } from "./components/OutputPanels";
import { GenerateButton } from "./components/GenerateButton";
import { FinalOutput } from "./components/FinalOutput";
import { TimerAutomation } from "./components/TimerAutomation";
import { BatchStartButton } from "./components/BatchStartButton";
import { useStore } from "./store/useStore";
import { useGeneration } from "./hooks/useGeneration";
import { useTaskManager } from "./hooks/useTaskManager";
import { PenTool, Moon, Sun, Monitor, Sparkles, Database, AlertCircle, RotateCcw } from "lucide-react";
import { Tooltip } from "./components/Tooltip";

function App() {
  const { generation, darkMode, toggleDarkMode, loadConfigFromDB, currentWorkId } = useStore();
  const { runAllCycles } = useGeneration();
  const { requestNotificationPermission, restoreTaskProgress } = useTaskManager();
  const [activeTab, setActiveTab] = useState<"single" | "batch">("single");
  const [showBackgroundTaskAlert, setShowBackgroundTaskAlert] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [restoredTask, setRestoredTask] = useState<any>(null);

  // 🔥 检测是否有后台生成任务
  useEffect(() => {
    if (generation.isGenerating && generation.currentWorkId) {
      console.log('[App] Detected background generation task:', generation.currentWorkId);
      setShowBackgroundTaskAlert(true);
      
      // 5秒后自动隐藏提示
      const timer = setTimeout(() => {
        setShowBackgroundTaskAlert(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [generation.isGenerating, generation.currentWorkId]);

  // 🔥 应用启动时检查未完成的任务（断点续传）
  useEffect(() => {
    const checkUnfinishedTask = async () => {
      // 请求通知权限
      await requestNotificationPermission();
      
      // 检查是否有未保存的进度
      const progress = restoreTaskProgress();
      if (progress && !generation.isGenerating) {
        console.log('[App] Found unfinished task, showing restore prompt');
        setRestoredTask(progress);
        setShowRestorePrompt(true);
      }
    };
    
    checkUnfinishedTask();
  }, [requestNotificationPermission, restoreTaskProgress, generation.isGenerating]);

  // 🔥 恢复任务
  const handleRestoreTask = () => {
    if (restoredTask) {
      console.log('[App] Restoring task:', restoredTask.workId);
      // 设置当前作品ID，用户可以从作品管理查看进度
      useStore.getState().setCurrentWork(restoredTask.workId);
      setShowRestorePrompt(false);
      setRestoredTask(null);
    }
  };

  // 🔥 忽略恢复
  const handleIgnoreRestore = () => {
    console.log('[App] Ignoring restore prompt');
    setShowRestorePrompt(false);
    setRestoredTask(null);
    // 清除进度记录
    localStorage.removeItem('ai-content-task-progress');
  };

  // 从数据库加载模型配置
  useEffect(() => {
    loadConfigFromDB();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (!generation.isGenerating) {
          runAllCycles();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [generation.isGenerating, runAllCycles]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode === "auto") {
      root.classList.remove("dark");
    } else if (darkMode) {
      root.classList.add("dark");
      root.style.setProperty("--bg-gradient-from", "#0f172a");
      root.style.setProperty("--bg-gradient-to", "#020617");
      root.style.setProperty("--card-bg", "#1e293b");
      root.style.setProperty("--text-primary", "#f1f5f9");
      root.style.setProperty("--text-secondary", "#cbd5e1");
      root.style.setProperty("--border-color", "#334155");
    } else {
      root.classList.remove("dark");
      root.style.removeProperty("--bg-gradient-from");
      root.style.removeProperty("--bg-gradient-to");
      root.style.removeProperty("--card-bg");
      root.style.removeProperty("--text-primary");
      root.style.removeProperty("--text-secondary");
      root.style.removeProperty("--border-color");
    }
  }, [darkMode]);

  const getDarkModeIcon = () => {
    if (darkMode === "auto") return <Monitor size={20} />;
    if (darkMode) return <Moon size={20} />;
    return <Sun size={20} />;
  };

  const getDarkModeTooltip = () => {
    if (darkMode === "auto") return "自动（跟随系统）";
    if (darkMode) return "暗黑模式";
    return "浅色模式";
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500 overflow-hidden">
      {/* 🔥 断点续传提示 */}
      {showRestorePrompt && restoredTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in zoom-in-95 fade-in duration-200">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <RotateCcw size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  检测到未完成的创作任务
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  发现一个之前中断的生成任务（作品ID: {restoredTask.workId?.slice(-8)}）
                  <br />
                  中断时间: {new Date(restoredTask.timestamp).toLocaleString('zh-CN')}
                  <br />
                  进度: Stage {restoredTask.currentStage}, Cycle {restoredTask.currentCycle}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleRestoreTask}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
                  >
                    查看进度
                  </button>
                  <button
                    onClick={handleIgnoreRestore}
                    className="flex-1 px-4 py-2 bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium transition-colors"
                  >
                    忽略
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🔥 后台任务提示 */}
      {showBackgroundTaskAlert && generation.currentWorkId && (
        <div className="fixed top-20 right-4 z-50 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-lg shadow-lg p-4 animate-in slide-in-from-top-2 fade-in duration-300">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-green-800 dark:text-green-200">
                后台任务运行中
              </h4>
              <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                作品正在生成中，您可以自由浏览其他页面
              </p>
              <button
                onClick={() => setShowBackgroundTaskAlert(false)}
                className="text-xs text-green-600 dark:text-green-400 hover:underline mt-2"
              >
                知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 悬浮进度条 - 右侧固定 */}
      <CycleProgress />

      <div className="max-w-[1600px] mx-auto h-full flex flex-col pr-[340px]">
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-slate-700/50">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-primary to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-primary/25">
                    <PenTool size={20} className="text-white" />
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900 dark:text-white">
                      AI 小说创作
                    </h1>
                    <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">
                      三阶段七循环系统
                    </p>
                  </div>
                </div>
              </div>

              <div className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-gray-100 dark:bg-slate-800 rounded-full">
                <Sparkles size={14} className="text-primary" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  ⌘/Ctrl + Enter 一键生成
                </span>
              </div>

              <div className="flex items-center gap-2">
                <nav className="flex items-center gap-1 mr-2">
                  <a
                    href="/works"
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    作品管理
                  </a>
                  <a
                    href="/storyboards"
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    分镜管理
                  </a>
                  <a
                    href="/config"
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    模型配置
                  </a>
                  <a
                    href="/characters"
                    className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
                  >
                    角色管理
                  </a>
                  <a
                    href="/memory"
                    className="px-3 py-1.5 text-sm text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Database size={14} />
                    记忆管理
                  </a>
                </nav>

                <Tooltip content={getDarkModeTooltip()}>
                  <button
                    onClick={toggleDarkMode}
                    className="p-2.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-all"
                  >
                    {getDarkModeIcon()}
                  </button>
                </Tooltip>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-8 pt-4 pb-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 w-full min-h-0 flex-1 overflow-hidden">
            {/* 左侧：创作参数 - 1/4 宽度 */}
            <div className="xl:col-span-1 flex flex-col min-h-0">
              {/* Tab切换区域 - Tab头部固定，内容可滚动，按钮在最底部永远可见 */}
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden flex-shrink-0 flex flex-col flex-1">
                {/* Tab头部 */}
                <div className="border-b border-gray-200 dark:border-slate-700 px-4 py-3 flex-shrink-0">
                  <div className="flex gap-2">
                    <button
                      className={`flex-1 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                        activeTab === "single"
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                      }`}
                      onClick={() => setActiveTab("single")}
                    >
                      单篇创作
                    </button>
                    <button
                      className={`flex-1 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                        activeTab === "batch"
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                      }`}
                      onClick={() => setActiveTab("batch")}
                    >
                      批量自动创作
                    </button>
                  </div>
                </div>
                {/* Tab内容可滚动 */}
                <div className="flex-1 overflow-y-auto p-6">
                  {activeTab === "single" && (
                    <div className="space-y-6">
                      <InputPanel />
                    </div>
                  )}
                  {activeTab === "batch" && (
                    <div className="space-y-6">
                      <TimerAutomation />
                    </div>
                  )}
                </div>
                {/* 按钮永远可见在最底部 */}
                <div className="px-4 py-4 pt-3 pb-6 border-t border-gray-200 dark:border-slate-700 flex-shrink-0">
                  {activeTab === "single" && (
                    <div className="flex items-center justify-center gap-3">
                      <GenerateButton />
                    </div>
                  )}
                  {activeTab === "batch" && (
                    <div className="flex items-center justify-center gap-3">
                      <BatchStartButton />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 右侧：公共参数 + 输出 - 2/3 宽度 */}
            <div className="xl:col-span-2 flex flex-col min-h-0">
              {/* 公共基础参数区块 - 限制最大高度避免占用太多空间 */}
              <div className="mb-4 ">
                <BaseParamsPanel />
              </div>

              {/* 输出区域 */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                <OutputPanels generation={generation} />
                <FinalOutput generation={generation} />
              </div>
            </div>
          </div>
        </main>

        <footer className="h-[120px] py-6 flex items-center justify-center text-center text-gray-400 dark:text-gray-500 text-sm border-t border-gray-200 dark:border-slate-800/50">
          <div className="flex items-center justify-center gap-2">
            <span>纯本地前端</span>
            <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            <span>支持 Ollama / 在线 API</span>
            <span className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            <span>配置自动保存</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
