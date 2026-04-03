import React from "react";
import { X, Settings } from "lucide-react";
import { useStore } from "../store/useStore";
import { ModelConfig } from "../types";

interface ModelConfigCardProps {
  title: string;
  config: ModelConfig;
  onChange: (config: Partial<ModelConfig>) => void;
}

const ModelConfigCard: React.FC<ModelConfigCardProps> = ({
  title,
  config,
  onChange,
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-xl shadow-md p-5 mb-4 transition-all hover:shadow-lg border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            模式
          </label>
          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded-xl transition-all ${
                config.mode === "local"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => onChange({ mode: "local" })}
            >
              本地 Ollama
            </button>
            <button
              className={`px-4 py-2 rounded-xl transition-all ${
                config.mode === "api"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
              onClick={() => onChange({ mode: "api" })}
            >
              在线 API
            </button>
          </div>
        </div>

        {config.mode === "local" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              本地地址
            </label>
            <input
              type="text"
              value={config.localUrl}
              onChange={(e) => onChange({ localUrl: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white/80 backdrop-blur"
              placeholder="http://localhost:11434"
            />
          </div>
        )}

        {config.mode === "api" && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API 路径
              </label>
              <input
                type="text"
                value={config.apiUrl}
                onChange={(e) => onChange({ apiUrl: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white/80 backdrop-blur"
                placeholder="/api/v3/chat/completions"
              />
              <div className="text-xs text-gray-500 mt-1 space-y-1">
                <p>
                  • 通用对话模型填：
                  <code className="bg-gray-100 px-1 rounded">
                    /api/v3/chat/completions
                  </code>
                </p>
                <p>
                  • 代码模型填：
                  <code className="bg-gray-100 px-1 rounded">
                    /api/coding/v3/chat/completions
                  </code>
                </p>
                <p>
                  •
                  完整路径对应：https://ark.cn-beijing.volces.com/api/v3/chat/completions
                  或
                  https://ark.cn-beijing.volces.com/api/coding/v3/chat/completions
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                API Key
              </label>
              <input
                type="password"
                value={config.apiKey || ""}
                onChange={(e) => onChange({ apiKey: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white/80 backdrop-blur"
                placeholder="sk-..."
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {config.mode === "api" ? "Endpoint ID" : "模型名称"}
          </label>
          <input
            type="text"
            value={config.modelName}
            onChange={(e) => onChange({ modelName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white/80 backdrop-blur"
            placeholder={config.mode === "api" ? "ep-xxxxxx" : "模型名称"}
          />
          {config.mode === "api" && (
            <p className="text-xs text-gray-500 mt-1">
              火山引擎 ARK：Endpoint ID 填在这里（就是 ep- 开头的）
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const ConfigPanel: React.FC = () => {
  const { configOpen, config, setConfig, toggleConfig } = useStore();

  if (!configOpen) {
    return (
      <button
        onClick={toggleConfig}
        className="fixed bottom-[140px] right-6 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-4 shadow-lg transition-all hover:shadow-xl z-50"
        title="配置"
      >
        <Settings size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-md h-full bg-gray-50 animate-slide-in overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">配置中心</h2>
            <button
              onClick={toggleConfig}
              className="p-2 hover:bg-gray-200 rounded-lg transition-all"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          <ModelConfigCard
            title="阶段 1 - 大纲/标题"
            config={config.stage1}
            onChange={(c) => setConfig({ stage1: { ...config.stage1, ...c } })}
          />

          <ModelConfigCard
            title="阶段 2 - 正文初稿"
            config={config.stage2}
            onChange={(c) => setConfig({ stage2: { ...config.stage2, ...c } })}
          />

          <ModelConfigCard
            title="阶段 3 - 润色/合规"
            config={config.stage3}
            onChange={(c) => setConfig({ stage3: { ...config.stage3, ...c } })}
          />

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700 text-sm">
            <p className="font-medium mb-1">💡 火山引擎配置说明</p>
            <ul className="space-y-1 mt-2 list-disc pl-4">
              <li>
                API 路径：通用对话模型用{" "}
                <code className="bg-blue-100 px-1 rounded">
                  /api/v3/chat/completions
                </code>
                ，代码模型用{" "}
                <code className="bg-blue-100 px-1 rounded">
                  /api/coding/v3/chat/completions
                </code>
              </li>
              <li>
                Endpoint ID：模型名称框填写{" "}
                <code className="bg-blue-100 px-1 rounded">ep-xxxxxx</code>
              </li>
              <li>API Key：填写你的 ARK API Key</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
