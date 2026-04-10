import React, { useState } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, Check } from "lucide-react";
import { StageModelConfig, ModelConfig } from "../../types";
import { generateId } from "./utils";
import { ModelForm } from "./ModelForm";

interface StageConfigCardProps {
  title: string;
  stageConfig: StageModelConfig;
  onChange: (config: StageModelConfig) => void;
}

export const StageConfigCard: React.FC<StageConfigCardProps> = ({
  title,
  stageConfig,
  onChange,
}) => {
  const [expanded, setExpanded] = useState(true);
  const safeStageConfig = stageConfig || { models: [], activeModelId: '' };
  const [editingModelId, setEditingModelId] = useState<string | null>(
    safeStageConfig.activeModelId,
  );

  const addModel = () => {
    const models = safeStageConfig.models || [];
    const newModel: ModelConfig = {
      id: generateId(),
      name: `模型 ${models.length + 1}`,
      mode: "api",
      localUrl: "http://localhost:11434",
      apiUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
      modelName: "",
      apiKey: "",
      enabled: false,
    };
    onChange({
      ...safeStageConfig,
      models: [...models, newModel],
      activeModelId: newModel.id,
    });
    setEditingModelId(newModel.id);
    setExpanded(true);
  };

  const deleteModel = (modelId: string) => {
    const models = safeStageConfig.models || [];
    if (models.length <= 1) return;
    const newModels = models.filter((m) => m.id !== modelId);
    const newActiveId =
      safeStageConfig.activeModelId === modelId
        ? newModels[0].id
        : safeStageConfig.activeModelId;
    onChange({
      ...safeStageConfig,
      models: newModels,
      activeModelId: newActiveId,
    });
    if (editingModelId === modelId) {
      setEditingModelId(newActiveId);
    }
  };

  const setActiveModel = (modelId: string) => {
    onChange({
      ...safeStageConfig,
      activeModelId: modelId,
    });
    setEditingModelId(modelId);
  };

  const updateModel = (modelId: string, updates: Partial<ModelConfig>) => {
    const models = safeStageConfig.models || [];
    const newModels = models.map((m) =>
      m.id === modelId ? { ...m, ...updates } : m,
    );
    onChange({
      ...safeStageConfig,
      models: newModels,
    });
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-md mb-4 transition-all hover:shadow-lg border border-gray-100 dark:border-slate-700">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            {title}
          </h3>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {(safeStageConfig.models || []).length} 个模型
        </span>
      </div>

      {expanded && (
        <div className="px-5 pb-5">
          {(safeStageConfig.models || []).map((model, index) => (
            <div
              key={model.id}
              className={`mb-4 p-4 rounded-lg border-2 transition-all ${
                safeStageConfig.activeModelId === model.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 dark:border-slate-600"
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveModel(model.id)}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      safeStageConfig.activeModelId === model.id
                        ? "border-primary bg-primary"
                        : "border-gray-300 dark:border-slate-600"
                    }`}
                  >
                    {safeStageConfig.activeModelId === model.id && (
                      <Check size={12} className="text-white" />
                    )}
                  </button>
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {model.name || `模型 ${index + 1}`}
                  </span>
                  {safeStageConfig.activeModelId === model.id && (
                    <span className="text-xs text-primary font-medium">
                      启用中
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {(safeStageConfig.models || []).length > 1 && (
                    <button
                      type="button"
                      onClick={() => deleteModel(model.id)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {editingModelId === model.id && (
                <ModelForm
                  model={model}
                  onChange={(updates) => updateModel(model.id, updates)}
                />
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={addModel}
            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            添加模型
          </button>
        </div>
      )}
    </div>
  );
};
