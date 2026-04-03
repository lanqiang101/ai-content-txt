import React from 'react';
import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { GenerationState } from '../types';

interface ProgressStepsProps {
  generation: GenerationState;
}

const steps = [
  { id: 1, name: '阶段 1', description: '生成大纲/标题' },
  { id: 2, name: '阶段 2', description: '生成正文初稿' },
  { id: 3, name: '阶段 3', description: '润色/排版/合规' },
];

export const ProgressSteps: React.FC<ProgressStepsProps> = ({ generation }) => {
  const { currentStage, isGenerating } = generation;

  const getStepStatus = (stepId: number) => {
    if (stepId < currentStage) return 'completed';
    if (stepId === currentStage && isGenerating) return 'active';
    if (stepId === currentStage && !isGenerating && generation.stage3Result) return 'completed';
    return 'pending';
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg card-gradient p-6 mb-6">
      <nav aria-label="Progress">
        <ol role="list" className="overflow-hidden">
          {steps.map((step, stepIdx) => {
            const status = getStepStatus(step.id);
            return (
              <li className={stepIdx !== steps.length - 1 ? 'pb-8 relative' : 'relative'}>
                {stepIdx !== steps.length - 1 && (
                  <div
                    className={`absolute top-4 left-4 -ml-px mt-0.5 h-full w-0.5 ${
                      status === 'completed' ? 'bg-primary' : 'bg-gray-200'
                    }`}
                    aria-hidden="true"
                  />
                )}
                <div className="group relative flex items-start">
                  <span className="flex h-9 items-center">
                    <span
                      className={`relative z-10 flex w-8 h-8 items-center justify-center rounded-full ${
                        status === 'completed'
                          ? 'bg-primary'
                          : status === 'active'
                          ? 'bg-primary/20 border-2 border-primary'
                          : 'bg-gray-100 border-2 border-gray-300'
                      }`}
                    >
                      {status === 'completed' && (
                        <CheckCircle className="w-6 h-6 text-white" />
                      )}
                      {status === 'active' && (
                        <Loader2 className="w-5 h-5 text-primary animate-spin" />
                      )}
                      {status === 'pending' && (
                        <Circle className="w-5 h-5 text-gray-400" />
                      )}
                    </span>
                  </span>
                  <span className="ml-4 flex flex-col">
                    <span
                      className={`text-sm font-medium ${
                        status === 'completed'
                          ? 'text-primary'
                          : status === 'active'
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.name}
                    </span>
                    <span className="text-sm text-gray-500">{step.description}</span>
                  </span>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
};
