import React from "react";
import { Check } from "lucide-react";
import { ModelConfig } from "../../types";

interface SimpleModelSelectorProps {
  title: string;
  description?: string;
  models: ModelConfig[];
  activeModelId: string;
  onChange: (modelId: string) => void;
}

export const SimpleModelSelector: React.FC<SimpleModelSelectorProps> = ({
  title,
  description,
  models,
  activeModelId,
  onChange,
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-md p-6 border border-gray-100 dark:border-slate-700">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-2">
        {models.map((model) => (
          <button
            key={model.id}
            onClick={() => onChange(model.id)}
            className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
              activeModelId === model.id
                ? "border-primary bg-primary/5"
                : "border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                  activeModelId === model.id
                    ? "border-primary bg-primary"
                    : "border-gray-300 dark:border-slate-600"
                }`}
              >
                {activeModelId === model.id && (
                  <Check size={12} className="text-white" />
                )}
              </div>
              <div className="text-left">
                <div className="font-medium text-gray-800 dark:text-gray-100">
                  {model.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {model.mode === "local" ? "本地模型" : "远程API"} •{" "}
                  {model.modelName}
                </div>
              </div>
            </div>
            {activeModelId === model.id && (
              <span className="text-xs text-primary font-medium">使用中</span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
