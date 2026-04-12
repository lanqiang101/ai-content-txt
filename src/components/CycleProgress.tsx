import React from "react";
import { useStore } from "../store/useStore";
import { CheckCircle, Loader2 } from "lucide-react";

// 固定7次循环黄金比例：阶段1(骨架)2次 + 阶段2(血肉)3次 + 阶段3(打磨)2次 = 7次
const CYCLE_SCHEDULE = [
  { stage: 1, cycle: 1 },
  { stage: 1, cycle: 2 },
  { stage: 2, cycle: 1 },
  { stage: 2, cycle: 2 },
  { stage: 2, cycle: 3 },
  { stage: 3, cycle: 1 },
  { stage: 3, cycle: 2 },
];

interface StageInfo {
  name: string;
  description: string;
  color: {
    bg: string;
    bgLight: string;
    text: string;
    border: string;
    progress: string;
  };
  cycles: number;
}

const STAGE_INFO: Record<number, StageInfo> = {
  1: {
    name: "骨架搭建",
    description: "搭框架+补漏洞",
    color: {
      bg: "from-blue-500 to-blue-600",
      bgLight: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-700 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-700",
      progress: "bg-blue-500",
    },
    cycles: 2,
  },
  2: {
    name: "血肉填充",
    description: "填细节+埋钩子",
    color: {
      bg: "from-green-500 to-green-600",
      bgLight: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-700 dark:text-green-300",
      border: "border-green-200 dark:border-green-700",
      progress: "bg-green-500",
    },
    cycles: 3,
  },
  3: {
    name: "去AI打磨",
    description: "去AI感+调节奏",
    color: {
      bg: "from-purple-500 to-purple-600",
      bgLight: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-700 dark:text-purple-300",
      border: "border-purple-200 dark:border-purple-700",
      progress: "bg-purple-500",
    },
    cycles: 2,
  },
};

export const CycleProgress: React.FC = () => {
  const { generation } = useStore();
  const { completedCycles, isGenerating } = generation;

  // 计算每个阶段完成次数 - 简化逻辑，直接用全局索引
  const getStageCompleted = (stage: number) => {
    return CYCLE_SCHEDULE.filter((item, globalIndex) => {
      return item.stage === stage && globalIndex < completedCycles;
    }).length;
  };

  const progressPercent = (completedCycles / 7) * 100;

  // 判断阶段状态
  const getStageStatus = (stage: number) => {
    const totalCycles = STAGE_INFO[stage].cycles;
    const completed = getStageCompleted(stage);
    
    if (completed === totalCycles) return "completed";
    if (completed > 0) return "in-progress";
    return "pending";
  };

  return (
    <div className="fixed right-6 top-24 w-80 z-30">
      <div className="bg-white/90 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-slate-700/50 p-5 transition-all duration-300 hover:shadow-2xl">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            {isGenerating && <Loader2 size={16} className="animate-spin text-primary" />}
            创作进度
          </h3>
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {completedCycles}/7
          </div>
        </div>

        {/* 总体进度条 */}
        <div className="mb-5">
          <div className="h-2 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-right">
            {Math.round(progressPercent)}% 完成
          </div>
        </div>

        {/* 三个阶段水平卡片 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[1, 2, 3].map(stage => {
            const info = STAGE_INFO[stage];
            const status = getStageStatus(stage);
            const completed = getStageCompleted(stage);
            const total = info.cycles;
            const stageProgress = (completed / total) * 100;

            let cardClasses = "relative p-3 rounded-xl border transition-all duration-300";
            
            if (status === "completed") {
              cardClasses += ` ${info.color.bgLight} ${info.color.border} ${info.color.text}`;
            } else if (status === "in-progress") {
              cardClasses += ` bg-white dark:bg-slate-700/50 ${info.color.border} ${info.color.text} shadow-md scale-105`;
            } else {
              cardClasses += " bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-400 dark:text-gray-500";
            }

            return (
              <div key={stage} className={cardClasses}>
                <div className="text-xs font-bold mb-1">
                  阶段{stage}
                </div>
                <div className="text-[10px] mb-2 opacity-80">
                  {info.name}
                </div>
                
                {/* 阶段内进度条 */}
                <div className="h-1.5 rounded-full bg-gray-200 dark:bg-slate-600 overflow-hidden mb-1">
                  <div 
                    className={`h-full transition-all duration-500 ease-out ${
                      status !== "pending" ? info.color.progress : "bg-gray-300 dark:bg-slate-500"
                    }`}
                    style={{ width: `${stageProgress}%` }}
                  />
                </div>

                <div className="text-[10px] text-right font-medium">
                  {completed}/{total}
                </div>

                {/* 状态指示器 */}
                {status === "completed" && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle size={10} className="text-white" />
                  </div>
                )}
                {status === "in-progress" && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                    <Loader2 size={10} className="text-white animate-spin" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 循环节点指示器 */}
        <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
          <div className="text-xs font-medium text-gray-600 dark:text-gray-300 mb-2">
            详细循环节点
          </div>
          <div className="flex gap-1">
            {CYCLE_SCHEDULE.map((item, index) => {
              const isCompleted = index < completedCycles;
              const isCurrent = index === completedCycles;
              const info = STAGE_INFO[item.stage];
              
              let bgClass = "bg-gray-200 dark:bg-slate-600";
              if (isCompleted) {
                bgClass = info.color.progress;
              }
              
              return (
                <div 
                  key={index} 
                  className={`flex-1 h-2 rounded-full transition-all duration-300 ${bgClass} ${
                    isCurrent ? "ring-2 ring-offset-1 ring-primary dark:ring-primary/50" : ""
                  }`}
                  title={`阶段${item.stage} 第${item.cycle}次循环`}
                />
              );
            })}
          </div>

          {/* 当前状态文字 */}
          {completedCycles < 7 && (
            <div className="mt-3 text-xs text-gray-600 dark:text-gray-400">
              {isGenerating ? (
                <span className="flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" />
                  正在生成第 {completedCycles + 1} 次循环...
                </span>
              ) : (
                `等待开始第 ${completedCycles + 1} 次循环`
              )}
            </div>
          )}

          {completedCycles >= 7 && (
            <div className="mt-3 text-xs text-green-600 dark:text-green-400 font-medium flex items-center gap-1">
              <CheckCircle size={12} />
              全部循环完成！创作已结束
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
