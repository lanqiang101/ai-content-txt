import React, { useState } from "react";
import { Copy, Download, Check, RefreshCw, Square, Clock } from "lucide-react";
import { GenerationState, CycleResult } from "../types";
import { useStore } from "../store/useStore";
import { useGeneration } from "../hooks/useGeneration";
import { Tooltip } from "./Tooltip";

interface OutputPanelProps {
  title: string;
  content: string;
  stage: number;
  isLoading?: boolean;
  cycleResults?: CycleResult[]; // 🔥 添加历史轮次数据
}

const STAGE_COLORS: Record<
  number,
  {
    gradient: string;
    border: string;
    bgLight: string;
  }
> = {
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

// 🔥 格式化时间戳
const formatTimestamp = (timestamp: number | undefined) => {
  if (!timestamp) return '未知';
  const date = new Date(timestamp);
  return date.toLocaleTimeString('zh-CN', { 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  });
};

const OutputPanel: React.FC<OutputPanelProps> = ({
  title,
  content,
  stage,
  isLoading,
  cycleResults,
}) => {
  const [copied, setCopied] = useState(false);
  const { regenerateStageCycle, stopGeneration } = useGeneration();
  const generation = useStore((state) => state.generation);
  const isGeneratingThis =
    generation.currentStage === stage && generation.isGenerating;
  
  // Type assertion since we know stage can only be 1, 2, 3
  const colors = STAGE_COLORS[stage as 1 | 2 | 3];

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${title.replace(/\s+/g, "-")}.txt`;
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
      console.error("Regenerate failed:", err);
    }
  };

  const handleStop = () => {
    stopGeneration();
  };

  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-xl border ${colors.border} flex flex-col h-[300px]`}
    >
      <div
        className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r ${colors.gradient}`}
      >
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
        {isGeneratingThis || (isLoading && content === "") ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-sm">生成中...</p>
            </div>
          </div>
        ) : content ? (
          <div className="space-y-3">
            {/* 🔥 时间轴 - 显示历史轮次 */}
            {cycleResults && cycleResults.length > 0 && (
              <div className="mb-4 pb-3 border-b border-gray-200 dark:border-slate-700">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2">
                  <Clock size={12} />
                  <span>生成历史 ({cycleResults.length} 轮)</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cycleResults.map((cycle, index) => (
                    <Tooltip 
                      key={index}
                      content={`Stage ${cycle.stage}, Cycle ${cycle.cycle}\n${formatTimestamp(cycle.createdAt)}\n字数: ${cycle.result?.length || 0}`}
                    >
                      <div className="px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors cursor-help">
                        S{cycle.stage}-C{cycle.cycle}
                      </div>
                    </Tooltip>
                  ))}
                </div>
              </div>
            )}
            
            {/* 内容显示 */}
            <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed">
              {content}
            </div>
            
            {/* 🔥 最新生成的时间戳 */}
            {cycleResults && cycleResults.length > 0 && (
              <div className="pt-2 text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                <Clock size={10} />
                <span>最后更新: {formatTimestamp(cycleResults[cycleResults.length - 1].createdAt)}</span>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500">
            <p className="text-sm">暂无内容</p>
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
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <OutputPanel
        title="阶段 1: 骨架搭建"
        content={generation.stage1Result || ""}
        stage={1}
        isLoading={generation.currentStage === 1 && generation.isGenerating}
        cycleResults={generation.cycleResults.filter(r => r.stage === 1)}
      />
      <OutputPanel
        title="阶段 2: 血肉填充"
        content={generation.stage2Result || ""}
        stage={2}
        isLoading={generation.currentStage === 2 && generation.isGenerating}
        cycleResults={generation.cycleResults.filter(r => r.stage === 2)}
      />
      <OutputPanel
        title="阶段 3: 去AI化打磨"
        content={generation.stage3Result || ""}
        stage={3}
        isLoading={generation.currentStage === 3 && generation.isGenerating}
        cycleResults={generation.cycleResults.filter(r => r.stage === 3)}
      />
    </div>
  );
};
