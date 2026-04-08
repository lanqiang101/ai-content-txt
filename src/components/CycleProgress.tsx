import React from "react";
import { useStore } from "../store/useStore";
import { CheckCircle, Circle } from "lucide-react";

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

const STAGE_NAMES: Record<number, string> = {
  1: "骨架搭建",
  2: "血肉填充",
  3: "去AI打磨",
};

export const CycleProgress: React.FC = () => {
  const { generation } = useStore();
  const { completedCycles, currentStage, currentCycle } = generation;
  const progressPercent = (completedCycles / 7) * 100;

  // Use direct hex values based on stage instead of reading DOM
  const STAGE_COLORS: Record<number, string> = {
    1: "#3b82f6", // blue-500
    2: "#22c55e", // green-500
    3: "#a855f7", // purple-500
  };
  const UNFINISHED_COLOR = document.documentElement.classList.contains("dark")
    ? "#334155"
    : "#e5e7eb";

  // 计算渐变色：根据已完成的阶段分配颜色
  const getProgressGradient = () => {
    const stops: string[] = [];
    const segmentWidth = 100 / 7;

    CYCLE_SCHEDULE.forEach((item, index) => {
      const start = index * segmentWidth;
      const end = (index + 1) * segmentWidth;

      if (index < completedCycles) {
        // 已完成：使用阶段颜色
        stops.push(
          `${STAGE_COLORS[item.stage]} ${start}%, ${STAGE_COLORS[item.stage]} ${end}%`,
        );
      } else {
        // 未完成：使用灰色（基于当前暗黑模式）
        stops.push(
          `${UNFINISHED_COLOR} ${start}%, ${UNFINISHED_COLOR} ${end}%`,
        );
      }
    });

    return `linear-gradient(to right, ${stops.join(", ")})`;
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg card-gradient p-4 sm:p-6 mb-6 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          创作进度
        </h2>
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {completedCycles} / 7 次循环完成
        </div>
      </div>

      {/* 可视化进度条 */}
      <div className="mb-5 h-4 rounded-full bg-gray-200 dark:bg-slate-700 overflow-hidden">
        <div
          className="h-full transition-all duration-500 ease-out"
          style={{
            width: `${progressPercent}%`,
            background: getProgressGradient(),
          }}
        />
      </div>

      {/* 当前状态 */}
      {currentStage > 0 && (
        <div
          className={`mb-4 p-3 rounded-xl ${
            currentStage === 1
              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              : currentStage === 2
                ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                : "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
          }`}
        >
          <p className="text-sm font-medium">
            当前：阶段 {currentStage}「{STAGE_NAMES[currentStage]}」 / 第{" "}
            {currentCycle} 次循环
          </p>
        </div>
      )}

      {/* 循环进度点 */}
      <div className="grid grid-cols-7 gap-2">
        {CYCLE_SCHEDULE.map((item, index) => {
          const isCompleted = index < completedCycles;
          const isCurrent = index === completedCycles;

          let bgClass =
            "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500";
          let ringClass = "";
          if (isCompleted) {
            bgClass =
              item.stage === 1
                ? "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300"
                : item.stage === 2
                  ? "bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-300"
                  : "bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-300";
          }
          if (isCurrent) {
            ringClass =
              item.stage === 1
                ? "ring-2 ring-blue-500/50"
                : item.stage === 2
                  ? "ring-2 ring-green-500/50"
                  : "ring-2 ring-purple-500/50";
            bgClass =
              item.stage === 1
                ? "bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200"
                : item.stage === 2
                  ? "bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200"
                  : "bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200";
          }

          return (
            <div
              key={index}
              className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-all ${bgClass} ${ringClass}`}
              title={`阶段${item.stage} 第${item.cycle}次循环`}
            >
              {isCompleted ? (
                <CheckCircle size={16} className="mb-1" />
              ) : (
                <Circle size={16} className="mb-1" />
              )}
              <span>
                S{item.stage}C{item.cycle}
              </span>
            </div>
          );
        })}
      </div>

      {/* 阶段说明 */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-600 dark:text-gray-400">
        <div
          className={`p-2 rounded-lg ${completedCycles >= 2 ? "bg-blue-50 dark:bg-blue-900/20" : "bg-gray-50 dark:bg-slate-700"}`}
        >
          <span className="font-medium text-blue-700 dark:text-blue-300">
            阶段1 (2次)
          </span>
          <p className="mt-1">搭框架+补漏洞</p>
        </div>
        <div
          className={`p-2 rounded-lg ${completedCycles >= 5 ? "bg-green-50 dark:bg-green-900/20" : completedCycles >= 2 ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-gray-50 dark:bg-slate-700"}`}
        >
          <span className="font-medium text-green-700 dark:text-green-300">
            阶段2 (3次)
          </span>
          <p className="mt-1">填细节+埋钩子</p>
        </div>
        <div
          className={`p-2 rounded-lg ${completedCycles >= 7 ? "bg-purple-50 dark:bg-purple-900/20" : completedCycles >= 5 ? "bg-yellow-50 dark:bg-yellow-900/20" : "bg-gray-50 dark:bg-slate-700"}`}
        >
          <span className="font-medium text-purple-700 dark:text-purple-300">
            阶段3 (2次)
          </span>
          <p className="mt-1">去AI+调节奏</p>
        </div>
      </div>
    </div>
  );
};
