import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, ChevronLeft, Plus, Trash2 } from "lucide-react";
import { useStore } from "../store/useStore";
import { Button } from "../components/ui/Button";
import { StageConfigCard } from "../components/ConfigPanel/StageConfigCard";

export const ConfigPage: React.FC = () => {
  const navigate = useNavigate();
  const { config, addModel, removeModel, updateModel } = useStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
            <Settings size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              模型配置
            </h1>
            <p className="text-sm text-gray-500">
              配置三阶段生成模型
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => navigate("/")}>
          <ChevronLeft size={16} />
          返回创作
        </Button>
      </div>

      {/* 模型列表 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-slate-700/50 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            阶段模型配置
          </h3>
          <Button
            onClick={() => {
              addModel("stage1");
            }}
          >
            <Plus size={16} />
            添加模型
          </Button>
        </div>

        <div className="space-y-4">
          {/* 阶段1: 骨架搭建 */}
          <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                阶段1 - 骨架搭建
              </h4>
              <p className="text-xs text-gray-500">
                搭建小说整体框架大纲
              </p>
            </div>
            <div className="p-4 space-y-3">
              {config.stage1.models.map((model) => (
                <StageConfigCard
                  key={model.id}
                  stage="stage1"
                  model={model}
                  isExpanded={expandedId === model.id}
                  onToggle={() => setExpandedId(
                    expandedId === model.id ? null : model.id
                  )}
                  onUpdate={(updates) => updateModel("stage1", model.id, updates)}
                  onDelete={() => removeModel("stage1", model.id)}
                />
              ))}
            </div>
          </div>

          {/* 阶段2: 血肉填充 */}
          <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                阶段2 - 血肉填充
              </h4>
              <p className="text-xs text-gray-500">
                根据大纲填充细节内容
              </p>
            </div>
            <div className="p-4 space-y-3">
              {config.stage2.models.map((model) => (
                <StageConfigCard
                  key={model.id}
                  stage="stage2"
                  model={model}
                  isExpanded={expandedId === model.id}
                  onToggle={() => setExpandedId(
                    expandedId === model.id ? null : model.id
                  )}
                  onUpdate={(updates) => updateModel("stage2", model.id, updates)}
                  onDelete={() => removeModel("stage2", model.id)}
                />
              ))}
            </div>
          </div>

          {/* 阶段3: 去AI打磨 */}
          <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                阶段3 - 去AI打磨
              </h4>
              <p className="text-xs text-gray-500">
                优化语言质感，去除AI痕迹
              </p>
            </div>
            <div className="p-4 space-y-3">
              {config.stage3.models.map((model) => (
                <StageConfigCard
                  key={model.id}
                  stage="stage3"
                  model={model}
                  isExpanded={expandedId === model.id}
                  onToggle={() => setExpandedId(
                    expandedId === model.id ? null : model.id
                  )}
                  onUpdate={(updates) => updateModel("stage3", model.id, updates)}
                  onDelete={() => removeModel("stage3", model.id)}
                />
              ))}
            </div>
          </div>

          {/* 随机候选词模型 */}
          <div className="border border-gray-200 dark:border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-gray-50 dark:bg-slate-700/50 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
              <h4 className="font-semibold text-gray-800 dark:text-gray-100">
                随机候选词模型
              </h4>
              <p className="text-xs text-gray-500">
                用于关键词、文风等随机生成
              </p>
            </div>
            <div className="p-4 space-y-3">
              <StageConfigCard
                key={config.random.id}
                stage="random"
                model={config.random}
                isExpanded={expandedId === config.random.id}
                onToggle={() => setExpandedId(
                  expandedId === config.random.id ? null : config.random.id
                )}
                onUpdate={(updates) => updateModel("random", config.random.id, updates)}
                onDelete={() => removeModel("random", config.random.id)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 使用提示 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          ⚙️ 配置说明
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• 每个阶段可以配置多个模型，系统会随机选择使用</li>
          <li>• 支持本地 Ollama 和远程 API 两种模式</li>
          <li>• API 模式需要填写 API Key 和 API 地址</li>
          <li>• 配置会自动保存到浏览器本地存储</li>
        </ul>
      </div>
    </div>
  );
};

export default ConfigPage;
