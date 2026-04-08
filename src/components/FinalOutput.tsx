import React, { useState } from "react";
import {
  Copy,
  Download,
  Check,
  RefreshCw,
  Square,
  RotateCcw,
} from "lucide-react";
import { GenerationState } from "../types";
import { useStore } from "../store/useStore";
import { useGeneration } from "../hooks/useGeneration";

interface FinalOutputProps {
  generation: GenerationState;
}

export const FinalOutput: React.FC<FinalOutputProps> = ({ generation }) => {
  const [copied, setCopied] = useState(false);
  const { params, resetGeneration } = useStore();
  const { regenerateStageCycle, stopGeneration, runAllCycles } =
    useGeneration();
  const { stage3Result, currentStage, isGenerating, completedCycles } =
    generation;
  const isGeneratingThis = currentStage === 3 && isGenerating;

  const handleRestartAll = async () => {
    // Reset generation state but keep parameters, then auto-run all cycles again
    resetGeneration();
    setTimeout(() => {
      runAllCycles();
    }, 100);
  };

  if (!stage3Result) return null;

  // Calculate actual character count
  const charCount = stage3Result.length;
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "k";
    }
    return count.toString();
  };

  const handleRegenerate = async () => {
    try {
      // Always regenerate the last cycle of stage 3 (cycle 2)
      await regenerateStageCycle(3, 2);
    } catch (err) {
      console.error("Regenerate failed:", err);
    }
  };

  const handleStop = () => {
    stopGeneration();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(stage3Result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fileName = `${params.type === "article" ? "article" : "novel"}-${params.topic.slice(0, 20).replace(/\s+/g, "-")}.txt`;
    const blob = new Blob([stage3Result], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl card-gradient overflow-hidden mb-6 border border-primary/10">
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 sm:px-6 py-4 bg-gradient-to-r from-primary/10 dark:from-primary/5 to-primary/5 dark:to-primary/0 border-b border-primary/10">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            最终成品
          </h2>
          <span className="px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full">
            {charCount} 字 ({formatCount(charCount)})
          </span>
        </div>
        <div className="flex gap-2">
          {!isGenerating && (
            <>
              <button
                onClick={handleRestartAll}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all"
                title="保留参数，整个流程重新生成"
              >
                <RotateCcw size={16} />
                重新全部生成
              </button>
              <button
                onClick={handleRegenerate}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
                title="重新生成最终成品"
              >
                <RefreshCw size={16} />
                重新生成
              </button>
            </>
          )}
          {isGenerating && (
            <button
              onClick={handleStop}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all"
              title="终止生成"
            >
              <Square size={16} fill="currentColor" />
              停止
            </button>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "已复制" : "复制全文"}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
          >
            <Download size={16} />
            导出TXT
          </button>
        </div>
      </div>
      <div className="p-4 sm:p-6 max-h-[600px] overflow-y-auto">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed m-0 bg-transparent p-0 text-[15px]">
            {stage3Result}
          </pre>
        </div>
      </div>
    </div>
  );
};
