import { useEffect } from 'react';
import { InputPanel } from './components/InputPanel';
import { CycleProgress } from './components/CycleProgress';
import { OutputPanels } from './components/OutputPanels';
import { GenerateButton } from './components/GenerateButton';
import { FinalOutput } from './components/FinalOutput';
import { ConfigPanel } from './components/ConfigPanel';
import { HistorySidebar } from './components/HistorySidebar';
import { useStore } from './store/useStore';
import { useGeneration } from './hooks/useGeneration';
import { PenTool, Moon, Sun, Monitor } from 'lucide-react';

function App() {
  const { generation, darkMode, toggleDarkMode } = useStore();
  const { runAllCycles } = useGeneration();

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

  // 处理暗黑模式
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode === 'auto') {
      // 跟随系统，CSS already handles this
      root.classList.remove('dark');
    } else if (darkMode) {
      root.classList.add('dark');
      // Override CSS variables for explicit dark
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-8 dark:from-slate-900 dark:to-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 sm:mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <PenTool size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-gray-100">
              AI 小说创作三阶段七循环系统
            </h1>
            <button
              onClick={toggleDarkMode}
              className="ml-4 p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur border border-gray-200 dark:border-slate-700 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all"
              title={getDarkModeTooltip()}
            >
              {getDarkModeIcon()}
            </button>
          </div>
          <p className="text-gray-600 dark:text-gray-400 text-base sm:text-lg max-w-3xl mx-auto">
            黄金比例 2次骨架 + 3次血肉 + 2次打磨 · 逐步递进 · 解决AI感重/情节断裂/吸引力差三大问题 · ⌘/Ctrl + Enter 一键生成所有循环
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <InputPanel />
          </div>
          <div className="lg:col-span-2">
            <CycleProgress />
            <OutputPanels generation={generation} />
            <GenerateButton />
            <FinalOutput generation={generation} />
          </div>
        </div>

        <ConfigPanel />
        <HistorySidebar />

        <footer className="mt-10 sm:mt-12 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>纯本地前端 · 支持 Ollama 本地模型 / 在线 API 自由切换 · 配置和历史自动保存</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
