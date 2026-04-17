import React from "react";
import {
  Play,
  AlertCircle,
  RotateCcw,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { useGeneration } from "../hooks/useGeneration";

/**
 * 校验篇幅类型与字数的匹配性
 */
const validateNovelLength = (params: any): { valid: boolean; message?: string } => {
  // 只对小说类型进行校验
  if (params.type !== 'novel') {
    return { valid: true };
  }

  const { novelLength, wordCount } = params;
  
  // 如果没有选择篇幅类型，跳过校验
  if (!novelLength) {
    return { valid: true };
  }

  // 定义各篇幅类型的字数范围
  const lengthRanges: Record<string, { min: number; max: number; label: string }> = {
    short: { min: 0, max: 10000, label: '短篇' },
    medium: { min: 10000, max: 20000, label: '中篇' },
    long: { min: 20000, max: Infinity, label: '长篇' },
  };

  const range = lengthRanges[novelLength];
  if (!range) {
    return { valid: true };
  }

  // 检查字数是否在合理范围内
  if (wordCount < range.min || wordCount > range.max) {
    let expectedRange = '';
    if (novelLength === 'short') {
      expectedRange = '< 10000字';
    } else if (novelLength === 'medium') {
      expectedRange = '10000-20000字';
    } else if (novelLength === 'long') {
      expectedRange = '> 20000字';
    }

    return {
      valid: false,
      message: `「${range.label}」篇幅建议设置为 ${expectedRange}，当前设置为 ${wordCount} 字，请调整字数或更改篇幅类型。`,
    };
  }

  return { valid: true };
};

export const GenerateButton: React.FC = () => {
  const { generation, resetGeneration, currentWorkId, singleParams } = useStore(); // 🔥 添加 singleParams
  const {
    runAllCycles,
    isComplete,
    currentProgress,
  } = useGeneration();
  const { error } = generation;
  const isProcessing = generation.isGenerating;

  // 🔥 计算预估完成时间
  const getEstimatedTime = (): string | null => {
    if (!isProcessing || !singleParams) return null;
    
    const { type, wordCount, novelLength } = singleParams;
    
    // 估算每字生成时间（秒）
    let secondsPerWord: number;
    
    if (type === 'article') {
      // 公众号文章：传统多轮生成，较快
      secondsPerWord = 0.3; // 每字0.3秒
    } else if (novelLength === 'short' || wordCount < 10000) {
      // 短篇小说：传统多轮生成
      secondsPerWord = 0.4; // 每字0.4秒
    } else if (novelLength === 'medium') {
      // 中篇小说：逐章生成，较慢
      secondsPerWord = 0.6; // 每字0.6秒（包含章节切换开销）
    } else {
      // 长篇小说：逐章生成，最慢
      secondsPerWord = 0.7; // 每字0.7秒
    }
    
    const totalSeconds = Math.ceil(wordCount * secondsPerWord);
    
    // 转换为可读格式
    if (totalSeconds < 60) {
      return `约 ${totalSeconds} 秒`;
    } else if (totalSeconds < 3600) {
      const minutes = Math.ceil(totalSeconds / 60);
      return `约 ${minutes} 分钟`;
    } else {
      const hours = Math.ceil(totalSeconds / 3600);
      return `约 ${hours} 小时`;
    }
  };

  const estimatedTime = getEstimatedTime();

  const handleRunAll = async () => {
    try {
      // 🔥 生成前校验篇幅类型与字数
      const validation = validateNovelLength(singleParams);
      if (!validation.valid && validation.message) {
        // 显示警告对话框
        const shouldContinue = window.confirm(
          `⚠️ 字数与篇幅类型不匹配\n\n${validation.message}\n\n是否继续生成？`
        );
        
        if (!shouldContinue) {
          return; // 用户取消，不执行生成
        }
      }
      
      await runAllCycles();
    } catch (err) {
      console.error("Generation failed:", err);
    }
  };

  const handleReset = () => {
    resetGeneration();
  };

  return (
    <div className="mb-6 space-y-3 w-full">
      {/* 🔥 主操作按钮 - 始终显示"开始创作" */}
      <button
        onClick={handleRunAll}
        className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all rounded-xl text-lg font-semibold"
      >
        <Play size={24} fill="currentColor" />
        开始创作{isComplete ? " (已完成)" : ""}
      </button>
      
      {/* 🔥 重置按钮 - 非运行时显示，与批量创作保持一致 */}
      {!isProcessing && (
        <button
          onClick={handleReset}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
          title="重置所有生成状态"
        >
          <RotateCcw size={20} />
          重置
        </button>
      )}
      
      {/* 🔥 预估完成时间提示 */}
      {estimatedTime && !isComplete && (
        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl text-purple-700 dark:text-purple-300 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">⏱️ 预估完成时间：{estimatedTime}</p>
            <p className="text-xs mt-1 opacity-80">
              基于目标字数 {singleParams.wordCount.toLocaleString()} 字估算，实际时间可能因网络状况和模型响应速度有所差异。
            </p>
          </div>
        </div>
      )}
      
      {/* 🔥 任务运行提示 */}
      {isProcessing && currentWorkId && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-300 text-sm flex items-start gap-3">
          <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">任务正在后台运行</p>
            <p className="text-xs mt-1 opacity-80">
              您可以跳转到其他页面，任务会继续执行。在"作品管理"中可以查看所有任务和终止操作。
            </p>
          </div>
        </div>
      )}
      
      {error && error !== "生成已终止" && (
        <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-3">
          <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
