import React from "react";
import { X, Settings, Download, Upload } from "lucide-react";
import { useStore } from "../store/useStore";
import { Tooltip } from "./Tooltip";
import { StageConfigCard, RandomConfigCard } from "./ConfigPanel/index";

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

          <StageConfigCard
            title="视频分镜生成"
            stageConfig={config.storyboard}
            onChange={(c) => setConfig({ storyboard: c })}
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
