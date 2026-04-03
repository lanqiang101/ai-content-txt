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
import { PenTool } from 'lucide-react';

function App() {
  const { generation } = useStore();
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 sm:mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-primary/10 rounded-full">
              <PenTool size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
              AI 小说创作三阶段七循环系统
            </h1>
          </div>
          <p className="text-gray-600 text-base sm:text-lg">
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

        <footer className="mt-10 sm:mt-12 text-center text-gray-500 text-sm">
          <p>纯本地前端 · 支持 Ollama 本地模型 / 在线 API 自由切换 · 配置和历史自动保存</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
