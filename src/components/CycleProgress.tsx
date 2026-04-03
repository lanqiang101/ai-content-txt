import React from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle, Circle } from 'lucide-react';

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
  1: '骨架搭建',
  2: '血肉填充',
  3: '去AI打磨',
};

export const CycleProgress: React.FC = () => {
  const { generation } = useStore();
  const { completedCycles, currentStage, currentCycle } = generation;

  return (
    <div className="bg-white rounded-2xl shadow-lg card-gradient p-6 mb-6 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">创作进度</h2>
        <div className="text-sm text-gray-600">
          {completedCycles} / 7 次循环完成
        </div>
      </div>

      {/* 当前状态 */}
      {currentStage > 0 && (
        <div className="mb-4 p-3 bg-primary/10 rounded-xl">
          <p className="text-sm font-medium text-primary">
            当前：阶段 {currentStage}「{STAGE_NAMES[currentStage]}」 / 第 {currentCycle} 次循环
          </p>
        </div>
      )}

      {/* 循环进度点 */}
      <div className="grid grid-cols-7 gap-2">
        {CYCLE_SCHEDULE.map((item, index) => {
          const isCompleted = index < completedCycles;
          const isCurrent = index === completedCycles;
          
          let bgClass = 'bg-gray-100 text-gray-400';
          if (isCompleted) bgClass = 'bg-green-100 text-green-600';
          if (isCurrent) bgClass = 'bg-primary/20 text-primary ring-2 ring-primary/50';

          return (
            <div
              key={index}
              className={`flex flex-col items-center justify-center p-2 rounded-lg text-xs font-medium transition-all ${bgClass}`}
              title={`阶段${item.stage} 第${item.cycle}次循环`}
            >
              {isCompleted ? (
                <CheckCircle size={16} className="mb-1" />
              ) : (
                <Circle size={16} className="mb-1" />
              )}
              <span>S{item.stage}C{item.cycle}</span>
            </div>
          );
        })}
      </div>

      {/* 阶段说明 */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-gray-600">
        <div className={`p-2 rounded-lg ${completedCycles >= 2 ? 'bg-green-50' : 'bg-gray-50'}`}>
          <span className="font-medium">阶段1 (2次)</span>
          <p className="mt-1">搭框架+补漏洞</p>
        </div>
        <div className={`p-2 rounded-lg ${completedCycles >= 5 ? 'bg-green-50' : completedCycles >= 2 ? 'bg-yellow-50' : 'bg-gray-50'}`}>
          <span className="font-medium">阶段2 (3次)</span>
          <p className="mt-1">填细节+埋钩子</p>
        </div>
        <div className={`p-2 rounded-lg ${completedCycles >= 7 ? 'bg-green-50' : completedCycles >= 5 ? 'bg-yellow-50' : 'bg-gray-50'}`}>
          <span className="font-medium">阶段3 (2次)</span>
          <p className="mt-1">去AI+调节奏</p>
        </div>
      </div>
    </div>
  );
};
