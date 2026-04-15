import React, { useState } from "react";
import {
  Copy,
  Download,
  Check,
  RefreshCw,
  Square,
  RotateCcw,
  Wand2,
  X,
  Loader2,
} from "lucide-react";
import { GenerationState } from "../types";
import { useStore } from "../store/useStore";
import { useGeneration } from "../hooks/useGeneration";

interface FinalOutputProps {
  generation: GenerationState;
}

export const FinalOutput: React.FC<FinalOutputProps> = ({ generation }) => {
  const [copied, setCopied] = useState(false);
  const [optimizeModalOpen, setOptimizeModalOpen] = useState(false);
  const [optimizeInstructions, setOptimizeInstructions] = useState("");
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizedResult, setOptimizedResult] = useState<string | null>(null);
  const { singleParams, resetGeneration } = useStore();
  const { regenerateStageCycle, stopGeneration, runAllCycles, callModel } =
    useGeneration();
  const { stage3Result, isGenerating } = generation;

  const handleRestartAll = async () => {
    resetGeneration();
    setTimeout(() => {
      runAllCycles();
    }, 100);
  };

  if (!stage3Result) return null;

  const content = optimizedResult || stage3Result;
  const formatCount = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "k";
    }
    return count.toString();
  };

  const handleRegenerate = async () => {
    try {
      await regenerateStageCycle(3, 2);
    } catch (err) {
      console.error("Regenerate failed:", err);
    }
  };

  const handleStop = () => {
    stopGeneration();
  };

  const handleCopy = async () => {
    const textToCopy = optimizedResult || stage3Result;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const textToDownload = optimizedResult || stage3Result;
    const fileName = `${singleParams.type === "article" ? "article" : "novel"}-${singleParams.topic.slice(0, 20).replace(/\s+/g, "-")}.txt`;
    const blob = new Blob([textToDownload], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleOptimize = async () => {
    if (!optimizeInstructions.trim()) return;
    
    setIsOptimizing(true);
    try {
      const activeConfig = useStore.getState().config.stage3.models[0];
      
      const prompt = `请根据以下优化要求修改文本：

【优化要求】
${optimizeInstructions}

【当前文本】
${optimizedResult || stage3Result}

请只输出修改后的文本内容，不要有任何解释。`;

      const result = await callModel(prompt, activeConfig, new AbortController().signal);
      setOptimizedResult(result);
    } catch (err) {
      console.error("Optimize failed:", err);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl card-gradient overflow-hidden mb-6 border border-primary/10">
        <div className="flex items-center justify-between flex-wrap gap-2 px-4 sm:px-6 py-4 bg-gradient-to-r from-primary/10 dark:from-primary/5 to-primary/5 dark:to-primary/0 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {optimizedResult ? "优化后成品" : "最终成品"}
            </h2>
            <span className="px-3 py-1 text-sm font-medium text-primary bg-primary/10 rounded-full">
              {content.length} 字 ({formatCount(content.length)})
            </span>
            {optimizedResult && (
              <button
                onClick={() => setOptimizedResult(null)}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                查看原版
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {!isGenerating && (
              <>
                <button
                  onClick={handleRestartAll}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition-all"
                >
                  <RotateCcw size={16} />
                  重置生成
                </button>
                <button
                  onClick={() => setOptimizeModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-all"
                >
                  <Wand2 size={16} />
                  优化修改
                </button>
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
                >
                  <RefreshCw size={16} />
                  重生成
                </button>
              </>
            )}
            {isGenerating && (
              <button
                onClick={handleStop}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all"
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
              {copied ? "已复制" : "复制"}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
            >
              <Download size={16} />
              导出
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-6 max-h-[600px] overflow-y-auto">
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed m-0 bg-transparent p-0 text-[15px]">
              {content}
            </pre>
          </div>
        </div>
      </div>

      {optimizeModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                优化修改
              </h3>
              <button
                onClick={() => setOptimizeModalOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-slate-700 rounded"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                优化要求（每条一行）
              </label>
              <textarea
                value={optimizeInstructions}
                onChange={(e) => setOptimizeInstructions(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                rows={5}
                placeholder="1. 增加主角内心独白描写&#10;2. 加快前三段的节奏&#10;3. 丰富环境细节描写"
              />
              <div className="mt-4 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  常用优化指令：
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {[
                    "增加冲突",
                    "加快节奏",
                    "增加心理描写",
                    "丰富环境描写",
                    "增加悬念",
                    "精简冗余",
                  ].map((preset) => (
                    <button
                      key={preset}
                      onClick={() =>
                        setOptimizeInstructions((prev) =>
                          prev ? `${prev}\n${preset}` : preset
                        )
                      }
                      className="px-2 py-1 text-xs bg-white dark:bg-slate-600 border border-gray-200 dark:border-slate-500 rounded hover:bg-gray-50 dark:hover:bg-slate-500"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-slate-700">
              <button
                onClick={() => setOptimizeModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
              >
                取消
              </button>
              <button
                onClick={handleOptimize}
                disabled={isOptimizing || !optimizeInstructions.trim()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-500 hover:bg-purple-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isOptimizing ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    优化中...
                  </>
                ) : (
                  <>
                    <Wand2 size={16} />
                    开始优化
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
