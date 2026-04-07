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
  // 兼容旧 localStorage 数据，默认填充缺失字段
  const safeConfig = {
    ...config,
    mode: config.mode || "local",
    localUrl: config.localUrl || "http://localhost:11434",
    apiUrl:
      config.apiUrl ||
      "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
    modelName: config.modelName || "",
    apiKey: config.apiKey || "",
  };

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-md p-5 mb-4 transition-all hover:shadow-lg border border-gray-100 dark:border-slate-700">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
        {title}
      </h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            模式
          </label>
          <div className="flex gap-3">
            <button
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
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              • Ollama 默认地址就是{" "}
              <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">
                http://localhost:11434
              </code>
              ，不需要改
            </p>
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
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-1">
                <p>
                  • 通用对话模型填：
                  <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">
                    /api/v3/chat/completions
                  </code>
                </p>
                <p>
                  • 代码模型填：
                  <code className="bg-gray-100 dark:bg-slate-700 px-1 rounded">
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
        className="fixed bottom-[140px] right-6 bg-gray-800 dark:bg-gray-700 hover:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-full p-4 shadow-lg transition-all hover:shadow-xl z-50"
        title="配置"
      >
        <Settings size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-md h-full bg-gray-50 dark:bg-slate-900 animate-slide-in overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              配置中心
            </h2>
            <button
              onClick={toggleConfig}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-all"
            >
              <X size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <ModelConfigCard
            title="阶段 1 - 大纲/骨架"
            config={config.stage1}
            onChange={(c) => setConfig({ stage1: { ...config.stage1, ...c } })}
          />

          <ModelConfigCard
            title="阶段 2 - 血肉填充"
            config={config.stage2}
            onChange={(c) => setConfig({ stage2: { ...config.stage2, ...c } })}
          />

          <ModelConfigCard
            title="阶段 3 - 最终打磨"
            config={config.stage3}
            onChange={(c) => setConfig({ stage3: { ...config.stage3, ...c } })}
          />

          <ModelConfigCard
            title="🎲 随机生成"
            config={config.random}
            onChange={(c) => setConfig({ random: { ...config.random, ...c } })}
          />

          <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl text-blue-700 dark:text-blue-300 text-sm">
            <p className="font-medium mb-1">💡 火山引擎配置说明</p>
            <ul className="space-y-1 mt-2 list-disc pl-4">
              <li>
                API 路径：通用对话模型用{" "}
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                  /api/v3/chat/completions
                </code>
                ，代码模型用{" "}
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                  /api/coding/v3/chat/completions
                </code>
              </li>
              <li>
                Endpoint ID：模型名称框填写{" "}
                <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">
                  ep-xxxxxx
                </code>
              </li>
              <li>API Key：填写你的 ARK API Key</li>
            </ul>
          </div>

          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 text-sm">
            <p className="font-medium mb-1">🖥️ 本地 Ollama 配置说明</p>
            <ul className="space-y-1 mt-2 list-disc pl-4">
              <li>
                本地地址：默认就是{" "}
                <code className="bg-green-100 dark:bg-green-800 px-1 rounded">
                  http://localhost:11434
                </code>
                ，一般不需要改
              </li>
              <li>
                模型名称：填写你已经 pull 好的模型名称，例如{" "}
                <code className="bg-green-100 dark:bg-green-800 px-1 rounded">
                  qwen2.5:7b
                </code>
                、
                <code className="bg-green-100 dark:bg-green-800 px-1 rounded">
                  llama3.1:8b
                </code>
                、
                <code className="bg-green-100 dark:bg-green-800 px-1 rounded">
                  deepseek-coder:6.7b
                </code>
              </li>
              <li>
                确保 Ollama 已经在本地运行：
                <code className="bg-green-100 dark:bg-green-800 px-1 rounded">
                  ollama pull 模型名
                </code>{" "}
                后再使用
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
