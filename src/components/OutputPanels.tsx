import React, { useState } from 'react';
import { Copy, Download, Check, RefreshCw, Square } from 'lucide-react';
import { GenerationState } from '../types';
import { useStore } from '../store/useStore';
import { useGeneration } from '../hooks/useGeneration';
import { Tooltip } from './Tooltip';

interface OutputPanelProps {
  title: string;
  content: string;
  stage: number;
  isLoading?: boolean;
}

const STAGE_COLORS = {
  1: {
    gradient: "from-blue-500 to-blue-600",
    border: "border-blue-200 dark:border-blue-700",
    bgLight: "bg-blue-50 dark:bg-blue-900/20",
  },
  2: {
    gradient: "from-green-500 to-green-600",
    border: "border-green-200 dark:border-green-700",
    bgLight: "bg-green-50 dark:bg-green-900/20",
  },
  3: {
    gradient: "from-purple-500 to-purple-600",
    border: "border-purple-200 dark:border-purple-700",
    bgLight: "bg-purple-50 dark:bg-purple-900/20",
  },
};

const OutputPanel: React.FC<OutputPanelProps> = ({ title, content, stage, isLoading }) => {
  const [copied, setCopied] = useState(false);
  const { regenerateStageCycle, stopGeneration } = useGeneration();
  const generation = useStore(state => state.generation);
  const isGeneratingThis = generation.currentStage === stage && generation.isGenerating;
  const colors = STAGE_COLORS[stage];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRegenerate = async () => {
    try {
      // For simplicity, always regenerate last cycle of this stage
      const cycleCountMap: Record<number, number> = { 1: 2, 2: 3, 3: 2 };
      const cycleCount = cycleCountMap[stage];
      await regenerateStageCycle(stage, cycleCount);
    } catch (err) {
      console.error('Regenerate failed:', err);
    }
  };

  const handleStop = () => {
    stopGeneration();
  };

  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl border ${colors.border} flex flex-col h-[500px]`}>
      <div className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r ${colors.gradient}`}>
        <h3 className="font-semibold text-white text-sm">{title}</h3>
        <div className="flex gap-1">
          {content && !isGeneratingThis && (
            <>
              <Tooltip content="重新生成">
                <button
                  onClick={handleRegenerate}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-black/20 rounded-lg transition-all"
                >
                  <RefreshCw size={16} />
                </button>
              </Tooltip>
              <Tooltip content="复制">
                <button
                  onClick={handleCopy}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-black/20 rounded-lg transition-all"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </Tooltip>
              <Tooltip content="导出TXT">
                <button
                  onClick={handleDownload}
                  className="p-1.5 text-white/80 hover:text-white hover:bg-black/20 rounded-lg transition-all"
                >
                  <Download size={16} />
                </button>
              </Tooltip>
            </>
          )}
          {isGeneratingThis && (
            <Tooltip content="终止生成">
              <button
                onClick={handleStop}
                className="p-1.5 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all"
              >
                <Square size={16} fill="currentColor" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="flex-1 p-4 overflow-y-auto">
        {isGeneratingThis || (isLoading && content === '') ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <div className="animate-pulse">生成中...</div>
          </div>
        ) : content ? (
          <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed m-0 bg-transparent p-0 text-sm">
            {content}
          </pre>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
            等待生成...
          </div>
        )}
      </div>
    </div>
  );
};

interface OutputPanelsProps {
  generation: GenerationState;
}

export const OutputPanels: React.FC<OutputPanelsProps> = ({ generation }) => {
  const { stage1Result, stage2Result, stage3Result } = generation;

  // 始终渲染三个卡片，不管有没有内容
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <OutputPanel
        title="阶段1 - 骨架"
        content={stage1Result || ''}
        stage={1}
        isLoading={generation.isGenerating && generation.currentStage === 1}
      />
      <OutputPanel
        title="阶段2 - 血肉"
        content={stage2Result || ''}
        stage={2}
        isLoading={generation.isGenerating && generation.currentStage === 2}
      />
      <OutputPanel
        title="阶段3 - 成品"
        content={stage3Result || ''}
        stage={3}
        isLoading={generation.isGenerating && generation.currentStage === 3}
      />
    </div>
  );
};
