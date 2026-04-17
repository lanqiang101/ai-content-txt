import React from "react";
import { useStore } from "../store/useStore";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

export const GenerationProgressBar: React.FC = () => {
  const { generation, works, currentWorkId } = useStore();
  const { isGenerating, completedCycles, currentStage, currentCycle, isGeneratingStage, error } = generation;

  // 🔥 调试日志：检查状态
  console.log('[GenerationProgressBar] 当前状态:', {
    isGenerating,
    completedCycles,
    currentStage,
    currentCycle,
    isGeneratingStage,
    currentWorkId,
    hasError: !!error,
  });

  // 如果没有在生成，不显示进度条
  if (!isGenerating) {
    console.log('[GenerationProgressBar] ⚠️ isGenerating 为 false，不显示进度条');
    return null;
  }

  console.log('[GenerationProgressBar] ✅ 显示进度条');

  // 🔥 判断是否为逐章生成模式
  const isChapterMode = isGeneratingStage === 2;
  
  let progress = 0;
  let statusText = "";
  let detailedInfo = "";

  if (isChapterMode) {
    // 🔥 逐章生成模式
    const currentWork = works.find(w => w.id === currentWorkId);
    const totalChapters = currentWork?.chapterCount || 8;
    
    // 逐章模式：currentStage=1是大纲生成，currentStage=2是逐章生成，currentStage=3是整体打磨
    if (currentStage === 1) {
      // 大纲生成阶段（Stage 1）
      progress = 5; // 大纲占5%
      statusText = "📋 阶段1/4：正在生成章节大纲...";
      detailedInfo = "AI 正在规划整部小说的章节结构";
    } else if (currentStage === 2) {
      // 逐章生成阶段（Stage 2）
      // 🔥 修正进度计算：基于当前章节进度
      const currentChapterNum = Math.min(completedCycles + 1, totalChapters);
      const progressRatio = totalChapters > 0 ? completedCycles / totalChapters : 0;
      progress = Math.min(5 + (progressRatio * 85), 90); // 最多90%，留10%给打磨和完成
      
      const currentChapter = currentWork?.chapters?.find(c => c.chapterNumber === currentChapterNum);
      const chapterTitle = currentChapter?.title || `第${currentChapterNum}章`;
      
      statusText = `📖 阶段2/4：正在生成第 ${currentChapterNum}/${totalChapters} 章`;
      detailedInfo = `${chapterTitle}`;
    } else if (currentStage === 3) {
      // 整体打磨阶段（Stage 3）
      progress = 95;
      statusText = "✨ 阶段3/4：正在进行全文打磨...";
      detailedInfo = "优化文笔，去除AI痕迹，确保连贯性";
    } else if (currentStage === 4) {
      // 完成阶段
      progress = 100;
      statusText = "✅ 阶段4/4：生成完成，正在整理作品...";
      detailedInfo = "即将完成全部创作";
    } else {
      // 未知阶段，显示生成中
      progress = 50;
      statusText = "🔄 生成进行中...";
      detailedInfo = "请稍候";
    }
  } else {
    // 🔥 传统多轮生成模式（固定7次循环：Stage1×2 + Stage2×3 + Stage3×2）
    // currentStage: 1=Stage1, 2=Stage2, 3=Stage3
    // currentCycle: 当前阶段的循环序号（从1开始）
    // completedCycles: 已完成的总循环数
    
    const totalCycles = 7;
    
    // 🔥 计算当前阶段的循环序号
    let cycleInStage = 0;
    let stageTotalCycles = 0;
    let previousCompletedCycles = 0;
    
    if (currentStage === 1) {
      // Stage 1: 骨架搭建（2次循环）
      stageTotalCycles = 2;
      previousCompletedCycles = 0;
      cycleInStage = currentCycle || 1;
      statusText = `📝 阶段1/3：骨架搭建 - 第${cycleInStage}/2次循环`;
      detailedInfo = "搭框架 + 补漏洞";
    } else if (currentStage === 2) {
      // Stage 2: 血肉填充（3次循环）
      stageTotalCycles = 3;
      previousCompletedCycles = 2;
      cycleInStage = currentCycle || 1;
      statusText = `✍️ 阶段2/3：血肉填充 - 第${cycleInStage}/3次循环`;
      detailedInfo = "填细节 + 埋钩子";
    } else if (currentStage === 3) {
      // Stage 3: 去AI打磨（2次循环）
      stageTotalCycles = 2;
      previousCompletedCycles = 5;
      cycleInStage = currentCycle || 1;
      statusText = `✨ 阶段3/3：去AI打磨 - 第${cycleInStage}/2次循环`;
      detailedInfo = "去AI感 + 调节奏";
    } else {
      // 完成
      progress = 100;
      statusText = "✅ 生成完成，正在整理内容...";
      detailedInfo = "即将完成创作";
      cycleInStage = 0;
    }
    
    // 🔥 基于当前阶段和循环计算进度
    if (cycleInStage > 0 && stageTotalCycles > 0) {
      // 🔥 修正进度计算：使用正确的公式
      // 当前阶段内的进度 (0-1)
      const stageProgress = (cycleInStage - 1) / stageTotalCycles;
      // 总进度 = 之前阶段完成的百分比 + 当前阶段的进度 × 当前阶段权重
      const previousStagesProgress = previousCompletedCycles / totalCycles;
      const currentStageContribution = (stageProgress * stageTotalCycles) / totalCycles;
      progress = Math.min(((previousStagesProgress + currentStageContribution) * 100), 99);
    }
  }

  // 错误状态
  if (error) {
    return (
      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
        <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
          <AlertCircle size={16} />
          <span className="text-sm font-medium">生成失败</span>
        </div>
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-xl shadow-sm">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Loader2 size={16} className="animate-spin text-primary" />
          <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            创作进行中
          </span>
        </div>
        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
          {Math.round(progress)}%
        </span>
      </div>

      {/* 进度条 */}
      <div className="h-2.5 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden mb-3">
        <div 
          className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out shadow-lg"
          style={{ width: `${progress}%` }}
        >
          {/* 光泽效果 */}
          <div className="w-full h-full bg-gradient-to-b from-white/20 to-transparent" />
        </div>
      </div>

      {/* 状态文字 */}
      <div className="space-y-1">
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {statusText}
        </div>
        {detailedInfo && (
          <div className="text-xs text-gray-600 dark:text-gray-400 pl-1">
            {detailedInfo}
          </div>
        )}
      </div>

      {/* 完成提示 */}
      {progress >= 100 && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
          <CheckCircle size={12} />
          <span>即将完成...</span>
        </div>
      )}
    </div>
  );
};
