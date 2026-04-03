import React from 'react';
import { Play, Square } from 'lucide-react';
import { useGeneration } from '../hooks/useGeneration';

export const GenerateButton: React.FC = () => {
  const { runFullPipeline, stopGeneration, generation } = useGeneration();
  const { error } = generation;
  const isProcessing = generation.isGenerating || generation.isGeneratingStage !== null;

  const handleClick = async () => {
    try {
      await runFullPipeline();
    } catch (err) {
      // Error is already handled in the hook
      console.error('Generation failed:', err);
    }
  };

  const handleStop = () => {
    stopGeneration();
  };

  return (
    <div className="mb-6">
      {isProcessing ? (
        <button
          onClick={handleStop}
          className="w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-lg font-semibold text-white transition-all bg-red-500 hover:bg-red-600 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
        >
          <Square size={24} fill="currentColor" />
          终止生成
        </button>
      ) : (
        <button
          onClick={handleClick}
          disabled={isProcessing}
          className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2 text-lg font-semibold text-white transition-all ${
            isProcessing
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0'
          }`}
        >
          <Play size={24} fill="currentColor" />
          开始生成流水线
        </button>
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
