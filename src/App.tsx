import { useEffect, useState } from 'react';
import { BaseParamsPanel } from './components/BaseParamsPanel';
import { InputPanel } from './components/InputPanel';
import { CycleProgress } from './components/CycleProgress';
import { OutputPanels } from './components/OutputPanels';
import { GenerateButton } from './components/GenerateButton';
import { FinalOutput } from './components/FinalOutput';
import { ConfigPanel } from './components/ConfigPanel';
import { HistorySidebar } from './components/HistorySidebar';
import { WorksPanel } from './components/WorksPanel';
import { TimerAutomation } from './components/TimerAutomation';
import { useStore } from './store/useStore';
import { useGeneration } from './hooks/useGeneration';
import { PenTool, Moon, Sun, Monitor, Sparkles } from 'lucide-react';
import { Tooltip } from './components/Tooltip';

function App() {
  const { generation, darkMode, toggleDarkMode } = useStore();
  const { runAllCycles } = useGeneration();
  const [activeTab, setActiveTab] = useState<'single' | 'batch'>('single');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        if (!generation.isGenerating) {
          runAllCycles();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generation.isGenerating, runAllCycles]);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode === 'auto') {
      root.classList.remove('dark');
    } else if (darkMode) {
      root.classList.add('dark');
      root.style.setProperty('--bg-gradient-from', '#0f172a');
      root.style.setProperty('--bg-gradient-to', '#020617');
      root.style.setProperty('--card-bg', '#1e293b');
      root.style.setProperty('--text-primary', '#f1f5f9');
      root.style.setProperty('--text-secondary', '#cbd5e1');
      root.style.setProperty('--border-color', '#334155');
    } else {
      root.classList.remove('dark');
      root.style.removeProperty('--bg-gradient-from');
      root.style.removeProperty('--bg-gradient-to');
      root.style.removeProperty('--card-bg');
      root.style.removeProperty('--text-primary');
      root.style.removeProperty('--text-secondary');
      root.style.removeProperty('--border-color');
    }
  }, [darkMode]);

  const getDarkModeIcon = () => {
    if (darkMode === 'auto') return <Monitor size={20} />;
    if (darkMode) return <Moon size={20} />;
    return <Sun size={20} />;
  };

  const getDarkModeTooltip = () => {
    if (darkMode === 'auto') return '自动（跟随系统）';
    if (darkMode) return '暗黑模式';
    return '浅色模式';
  };

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 transition-colors duration-500 overflow-hidden">
      <div className="max-w-[1600px] mx-auto h-full flex flex-col">
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

        <main className="flex-1 overflow-y-auto pt-[60px] pb-[120px] px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            <div className="xl:col-span-1">
              <div className="sticky top-24 space-y-6">
                {/* 公共基础参数区块 */}
                <BaseParamsPanel />

                {/* Tab切换区域 - 单篇创作 / 批量自动创作 */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
                  <div className="border-b border-gray-200 dark:border-slate-700 px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        className={`flex-1 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                          activeTab === 'single'
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                        onClick={() => setActiveTab('single')}
                      >
                        单篇创作
                      </button>
                      <button
                        className={`flex-1 px-4 py-2 rounded-lg transition-all font-medium text-sm ${
                          activeTab === 'batch'
                            ? 'bg-primary text-white shadow-md shadow-primary/20'
                            : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
                        }`}
                        onClick={() => setActiveTab('batch')}
                      >
                        批量自动创作
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    {activeTab === 'single' && (
                      <div className="space-y-4">
                        <InputPanel />
                        <div className="flex items-center justify-center gap-3 pt-2">
                          <GenerateButton />
                        </div>
                      </div>
                    )}
                    {activeTab === 'batch' && (
                      <div className="space-y-4">
                        <TimerAutomation />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="xl:col-span-3 space-y-4">
              <div className="bg-white dark:bg-slate-800/50 rounded-2xl shadow-sm border border-gray-200/50 dark:border-slate-700/50 p-4">
                <CycleProgress />
              </div>
              
              <OutputPanels generation={generation} />
              
              <FinalOutput generation={generation} />
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

      <ConfigPanel />
      <HistorySidebar />
      <WorksPanel />
    </div>
  );
}

export default App;
