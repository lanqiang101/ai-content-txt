import React from 'react';
import { Play, Square, StepForward } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useGeneration } from '../hooks/useGeneration';

export const GenerateButton: React.FC = () => {
  const { generation } = useStore();
  const { generateNextCycle, runAllCycles, stopGeneration, isComplete, currentProgress } = useGeneration();
  const { error } = generation;
  const isProcessing = generation.isGenerating;

  const handleNext = async () => {
    try {
      await generateNextCycle();
    } catch (err) {
      // Error is already handled in the hook
      console.error('Generation failed:', err);
    }
  };

  const handleRunAll = async () => {
    try {
      await runAllCycles();
    } catch (err) {
      console.error('Generation failed:', err);
    }
  };

  const handleStop = () => {
    stopGeneration();
  };

  return (
    <div className="mb-6 space-y-3">
      {isProcessing ? (
        <button
          onClick={handleStop}
          className="w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-lg font-semibold text-white transition-all bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          <Square size={24} fill="currentColor" />
          终止生成
        </button>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleNext}
            disabled={isProcessing || isComplete}
            className={`py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-lg font-semibold text-white transition-all ${
              isProcessing || isComplete
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            <StepForward size={22} fill="currentColor" />
            下一步 ({currentProgress.completed}/7)
          </button>
          <button
            onClick={handleRunAll}
            disabled={isProcessing || isComplete}
            className={`py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-lg font-semibold text-white transition-all ${
              isProcessing || isComplete
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            <Play size={24} fill="currentColor" />
            生成全部{isComplete ? ' (已完成)' : ''}
          </button>
        </div>
      )}
      {error && error !== '生成已终止' && (
        <div className="mt-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          {error}
        </div>
      )}
      {error === '生成已终止' && (
        <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-yellow-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};
