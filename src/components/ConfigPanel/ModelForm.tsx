import React from "react";
import { ModelConfig } from "../../types";

interface ModelFormProps {
  model: ModelConfig;
  onChange: (updates: Partial<ModelConfig>) => void;
}

export const ModelForm: React.FC<ModelFormProps> = ({ model, onChange }) => {
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
