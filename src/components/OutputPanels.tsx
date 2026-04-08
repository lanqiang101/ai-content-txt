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

const OutputPanel: React.FC<OutputPanelProps> = ({ title, content, stage, isLoading }) => {
  const [copied, setCopied] = useState(false);
  const { regenerateStageCycle, stopGeneration } = useGeneration();
  const generation = useStore(state => state.generation);
  const isGeneratingThis = generation.currentStage === stage && generation.isGenerating;

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
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg card-gradient overflow-hidden mb-4 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-gray-50 dark:from-slate-700 to-gray-100 dark:to-slate-600 border-b border-gray-200/50 dark:border-slate-600/50">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
        <div className="flex gap-2">
          {content && !isGeneratingThis && (
            <>
              <Tooltip content="重新生成">
                <button
                  onClick={handleRegenerate}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                >
                  <RefreshCw size={18} />
                </button>
              </Tooltip>
              <Tooltip content="复制">
                <button
                  onClick={handleCopy}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                >
                  {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </Tooltip>
              <Tooltip content="导出TXT">
                <button
                  onClick={handleDownload}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                >
                  <Download size={18} />
                </button>
              </Tooltip>
            </>
          )}
          {isGeneratingThis && (
            <Tooltip content="终止生成">
              <button
                onClick={handleStop}
                className="p-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all"
              >
                <Square size={18} fill="currentColor" />
              </button>
            </Tooltip>
          )}
        </div>
      </div>
      <div className="p-5 min-h-[180px] max-h-[400px] overflow-y-auto">
        {isGeneratingThis || (isLoading && content === '') ? (
          <div className="flex items-center justify-center py-8 text-gray-400 dark:text-gray-500">
            <div className="animate-pulse">生成中...</div>
          </div>
        ) : content ? (
          <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed m-0 bg-transparent p-0">
            {content}
          </pre>
        ) : (
          <div className="text-gray-400 dark:text-gray-500 text-center py-8">等待生成...</div>
        )}
      </div>
    </div>
  );
};

interface OutputPanelsProps {
  generation: GenerationState;
}

export const OutputPanels: React.FC<OutputPanelsProps> = ({ generation }) => {
  const { currentStage, stage1Result, stage2Result, stage3Result, isGenerating } = generation;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <OutputPanel
        title="阶段1 - 骨架"
        content={stage1Result}
        stage={1}
        isLoading={isGenerating && currentStage === 1}
      />
      <OutputPanel
        title="阶段2 - 血肉"
        content={stage2Result}
        stage={2}
        isLoading={isGenerating && currentStage === 2}
      />
      <OutputPanel
        title="阶段3 - 成品"
        content={stage3Result}
        stage={3}
        isLoading={isGenerating && currentStage === 3}
      />
    </div>
  );
};
