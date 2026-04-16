import React, { useState } from "react";
import { X, Settings, Download, Upload, Sparkles, BookOpen, PenTool } from "lucide-react";
import { useStore } from "../store/useStore";
import { Tooltip } from "./Tooltip";
import { StageConfigCard, RandomConfigCard, PopularTopicsConfigCard, SimpleModelSelector } from "./ConfigPanel/index";

type ConfigTab = 'generation' | 'chapter' | 'topics' | 'system';

export const ConfigPanel: React.FC = () => {
  const { configOpen, config, setConfig, toggleConfig } = useStore();
  const [activeTab, setActiveTab] = useState<ConfigTab>('generation');

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

  const tabs = [
    { id: 'generation' as ConfigTab, label: '生成模型', icon: Sparkles },
    { id: 'chapter' as ConfigTab, label: '章节管理', icon: BookOpen },
    { id: 'topics' as ConfigTab, label: '热门主题', icon: PenTool },
    { id: 'system' as ConfigTab, label: '系统设置', icon: Settings },
  ];

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
      <div className="w-full max-w-2xl h-full bg-gray-50 dark:bg-slate-900 animate-slide-in overflow-hidden flex flex-col">
        {/* 头部 */}
        <div className="p-6 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              系统配置
            </h2>
            <div className="flex items-center gap-2">
              <Tooltip content="导出配置">
                <button
                  type="button"
                  onClick={handleExport}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-all"
                >
                  <Download size={20} className="text-gray-600 dark:text-gray-400" />
                </button>
              </Tooltip>
              <Tooltip content="导入配置">
                <button
                  type="button"
                  onClick={handleImport}
                  className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-all"
                >
                  <Upload size={20} className="text-gray-600 dark:text-gray-400" />
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

          {/* Tab导航 */}
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-md'
                      : 'bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'generation' && (
            <div className="space-y-4">
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
                stageConfig={config.storyboard || { models: [], activeModelId: "" }}
                onChange={(c) => setConfig({ storyboard: c })}
              />

              <RandomConfigCard />
            </div>
          )}

          {activeTab === 'chapter' && (
            <div className="space-y-4">
              <SimpleModelSelector
                title="章节续写模型"
                description="用于作品详情页的章节续写功能，建议选择擅长长文本生成的模型"
                models={config.stage1.models}
                activeModelId={config.chapterContinuation?.activeModelId || config.stage1.activeModelId || ""}
                onChange={(modelId) => setConfig({ 
                  chapterContinuation: { 
                    models: config.stage1.models, 
                    activeModelId: modelId 
                  } 
                })}
              />

              <SimpleModelSelector
                title="章节AI优化模型"
                description="用于章节内容的AI优化和润色，建议选择擅长文本优化的模型"
                models={config.stage3.models}
                activeModelId={config.chapterOptimization?.activeModelId || config.stage3.activeModelId || ""}
                onChange={(modelId) => setConfig({ 
                  chapterOptimization: { 
                    models: config.stage3.models, 
                    activeModelId: modelId 
                  } 
                })}
              />
            </div>
          )}

          {activeTab === 'topics' && (
            <div className="space-y-4">
              <SimpleModelSelector
                title="热门主题推荐模型"
                description="用于生成热门主题推荐内容，建议选择创意性强的模型"
                models={config.random?.models || config.stage1.models}
                activeModelId={config.popularTopics?.activeModelId || config.random?.activeModelId || config.stage1.activeModelId || ""}
                onChange={(modelId) => setConfig({ 
                  popularTopics: { 
                    models: config.random?.models || config.stage1.models, 
                    activeModelId: modelId 
                  } 
                })}
              />

              <PopularTopicsConfigCard />
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-4">
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

              <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-300 text-sm">
                <p className="font-medium mb-1">Ollama本地模型配置</p>
                <ul className="space-y-1 mt-2 list-disc pl-4">
                  <li>
                    Base URL：<code className="bg-green-100 dark:bg-green-800 px-1 rounded">http://localhost:11434</code>（不要加 /v1）
                  </li>
                  <li>
                    模式选择：local
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
