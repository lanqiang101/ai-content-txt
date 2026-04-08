import React, { useState } from "react";
import {
  X,
  Settings,
  Plus,
  Trash2,
  Check,
  Download,
  Upload,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { ModelConfig, StageModelConfig } from "../types";
import { Tooltip } from "./Tooltip";

const generateId = () => {
  return (
    "model-" +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
};

interface ModelFormProps {
  model: ModelConfig;
  onChange: (updates: Partial<ModelConfig>) => void;
}

const ModelForm: React.FC<ModelFormProps> = ({ model, onChange }) => {
  const safeConfig = {
    ...model,
    mode: model.mode || "local",
    localUrl: model.localUrl || "http://localhost:11434",
    apiUrl:
      model.apiUrl ||
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    modelName: model.modelName || "",
    apiKey: model.apiKey || "",
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          模式
        </label>
        <div className="flex gap-3">
          <button
            type="button"
            className={`px-4 py-2 rounded-xl transition-all ${
              safeConfig.mode === "local"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
            }`}
            onClick={() => onChange({ mode: "local" })}
          >
            本地 Ollama
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-xl transition-all ${
              safeConfig.mode === "api"
                ? "bg-primary text-white shadow-md shadow-primary/20"
                : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
            }`}
            onClick={() => onChange({ mode: "api" })}
          >
            在线 API
          </button>
        </div>
      </div>

      {safeConfig.mode === "local" && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            本地地址
          </label>
          <input
            type="text"
            value={safeConfig.localUrl}
            onChange={(e) => onChange({ localUrl: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white/80 dark:bg-slate-800/80 backdrop-blur text-gray-900 dark:text-gray-100"
            placeholder="http://localhost:11434"
          />
        </div>
      )}

      {safeConfig.mode === "api" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API 路径
            </label>
            <input
              type="text"
              value={safeConfig.apiUrl}
              onChange={(e) => onChange({ apiUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white/80 dark:bg-slate-800/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="/api/v3/chat/completions"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={safeConfig.apiKey || ""}
              onChange={(e) => onChange({ apiKey: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white/80 dark:bg-slate-800/80 backdrop-blur text-gray-900 dark:text-gray-100"
              placeholder="sk-..."
            />
          </div>
        </>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {safeConfig.mode === "api" ? "Endpoint ID" : "模型名称"}
        </label>
        <input
          type="text"
          value={safeConfig.modelName}
          onChange={(e) => onChange({ modelName: e.target.value })}
          className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white/80 dark:bg-slate-800/80 backdrop-blur text-gray-900 dark:text-gray-100"
          placeholder={safeConfig.mode === "api" ? "ep-xxxxxx" : "模型名称"}
        />
        {safeConfig.mode === "api" && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            火山引擎 ARK：Endpoint ID 填在这里
          </p>
        )}
      </div>
    </div>
  );
};

interface StageConfigCardProps {
  title: string;
  stageConfig: StageModelConfig;
  onChange: (config: StageModelConfig) => void;
}

const StageConfigCard: React.FC<StageConfigCardProps> = ({
  title,
  stageConfig,
  onChange,
}) => {
  const [expanded, setExpanded] = useState(true);
  const [editingModelId, setEditingModelId] = useState<string | null>(
    stageConfig.activeModelId,
  );

  const addModel = () => {
    const models = stageConfig.models || [];
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
      ...stageConfig,
      models: [...models, newModel],
      activeModelId: newModel.id,
    });
    setEditingModelId(newModel.id);
    setExpanded(true);
  };

  const deleteModel = (modelId: string) => {
    const models = stageConfig.models || [];
    if (models.length <= 1) return;
    const newModels = models.filter((m) => m.id !== modelId);
    const newActiveId =
      stageConfig.activeModelId === modelId
        ? newModels[0].id
        : stageConfig.activeModelId;
    onChange({
      ...stageConfig,
      models: newModels,
      activeModelId: newActiveId,
    });
    if (editingModelId === modelId) {
      setEditingModelId(newActiveId);
    }
  };

  const setActiveModel = (modelId: string) => {
    onChange({
      ...stageConfig,
      activeModelId: modelId,
    });
    setEditingModelId(modelId);
  };

  const updateModel = (modelId: string, updates: Partial<ModelConfig>) => {
    const models = stageConfig.models || [];
    const newModels = models.map((m) =>
      m.id === modelId ? { ...m, ...updates } : m,
    );
    onChange({
      ...stageConfig,
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
          {(stageConfig.models || []).length} 个模型
        </span>
      </div>

      {expanded && (
        <div className="px-5 pb-5">
          {(stageConfig.models || []).map((model, index) => (
            <div
              key={model.id}
              className={`mb-4 p-4 rounded-lg border-2 transition-all ${
                stageConfig.activeModelId === model.id
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
                      stageConfig.activeModelId === model.id
                        ? "border-primary bg-primary"
                        : "border-gray-300 dark:border-slate-600"
                    }`}
                  >
                    {stageConfig.activeModelId === model.id && (
                      <Check size={12} className="text-white" />
                    )}
                  </button>
                  <span className="font-medium text-gray-800 dark:text-gray-100">
                    {model.name || `模型 ${index + 1}`}
                  </span>
                  {stageConfig.activeModelId === model.id && (
                    <span className="text-xs text-primary font-medium">
                      启用中
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {(stageConfig.models || []).length > 1 && (
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

const RandomConfigCard: React.FC = () => {
  const { config, setConfig } = useStore();
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-md mb-4 transition-all hover:shadow-lg border border-gray-100 dark:border-slate-700">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            随机生成
          </h3>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5">
          <ModelForm
            model={config.random}
            onChange={(updates) =>
              setConfig({ random: { ...config.random, ...updates } })
            }
          />
        </div>
      )}
    </div>
  );
};

export const ConfigPanel: React.FC = () => {
  const { configOpen, config, setConfig, toggleConfig } = useStore();

  const handleExport = () => {
    const data = JSON.stringify(config, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ai-content-config.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const imported = JSON.parse(e.target?.result as string);
            if (imported.stage1 && imported.stage2 && imported.stage3) {
              setConfig(imported);
              alert("配置导入成功");
            } else {
              alert("配置文件格式不正确");
            }
          } catch {
            alert("解析配置文件失败");
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  if (!configOpen) {
    return (
      <Tooltip content="配置">
        <button
          onClick={toggleConfig}
          className="fixed bottom-[140px] right-6 bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-full p-4 shadow-lg transition-all hover:shadow-xl z-50"
        >
          <Settings size={24} />
        </button>
      </Tooltip>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-md h-full bg-gray-50 dark:bg-slate-900 animate-slide-in overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              模型配置管理
            </h2>
            <div className="flex items-center gap-2">
              <Tooltip content="导出配置">
                <button
                  type="button"
                  onClick={handleExport}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-all"
                >
                  <Download
                    size={20}
                    className="text-gray-600 dark:text-gray-400"
                  />
                </button>
              </Tooltip>
              <Tooltip content="导入配置">
                <button
                  type="button"
                  onClick={handleImport}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-all"
                >
                  <Upload
                    size={20}
                  className="text-gray-600 dark:text-gray-400"
                />
                </button>
              </Tooltip>
              <button
                type="button"
                onClick={toggleConfig}
                className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-all"
              >
                <X size={24} className="text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <StageConfigCard
            title="阶段 1 - 大纲/骨架"
            stageConfig={config.stage1}
            onChange={(c) => setConfig({ stage1: c })}
          />

          <StageConfigCard
            title="阶段 2 - 血肉填充"
            stageConfig={config.stage2}
            onChange={(c) => setConfig({ stage2: c })}
          />

          <StageConfigCard
            title="阶段 3 - 最终打磨"
            stageConfig={config.stage3}
            onChange={(c) => setConfig({ stage3: c })}
          />

          <RandomConfigCard />

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-300 text-sm">
            <p className="font-medium mb-1">火山引擎配置说明</p>
            <ul className="space-y-1 mt-2 list-disc pl-4">
              <li>
                API 路径：通用对话模型用{" "}
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                  /api/v3/chat/completions
                </code>
              </li>
              <li>
                Endpoint ID：填写{" "}
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                  ep-xxxxxx
                </code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
