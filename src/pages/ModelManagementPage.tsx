import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Settings, ChevronLeft, Plus } from "lucide-react";
import { Button } from "../components/ui/Button";
import { dbService } from "../services/db";
import type { ModelConfig } from "../types";
import { ModelList } from "./ModelManagementPage/ModelList";
import { ModelDialog } from "./ModelManagementPage/ModelDialog";

export const ModelManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const [models, setModels] = useState<ModelConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentModel, setCurrentModel] = useState<Partial<ModelConfig>>({});

  // 加载模型列表
  const loadModels = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dbService.getModels();
      setModels(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  // 打开新增对话框
  const handleAdd = () => {
    setIsEditing(false);
    setCurrentModel({
      name: "",
      modelName: "",
      mode: "api",
      apiKey: "",
      baseUrl: "https://ark.cn-beijing.volces.com/api/v3/chat/completions",
      maxTokens: 4096,
      temperature: 0.7,
      enabled: true,
    });
    setDialogOpen(true);
  };

  // 打开编辑对话框
  const handleEdit = (model: ModelConfig) => {
    setIsEditing(true);
    setCurrentModel({ ...model });
    setDialogOpen(true);
  };

  // 保存模型
  const handleSave = async () => {
    try {
      if (!currentModel.name || !currentModel.modelName) {
        alert("模型名称和模型标识不能为空");
        return;
      }

      if (isEditing && currentModel.id !== undefined) {
        await dbService.updateModel(currentModel.id, currentModel);
      } else {
        await dbService.addModel(currentModel);
      }

      setDialogOpen(false);
      loadModels();
    } catch (err) {
      console.error("保存失败:", err);
      alert("保存失败: " + (err as Error).message);
    }
  };

  // 删除模型
  const handleDelete = async (id: number) => {
    if (!confirm("确定要删除这个模型吗？删除后无法恢复。")) return;
    try {
      await dbService.deleteModel(id);
      loadModels();
    } catch (err) {
      console.error("删除失败:", err);
      alert("删除失败: " + (err as Error).message);
    }
  };

  const formatMode = (mode: string | undefined) => {
    return mode === "api" ? "API" : "本地";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl">
            <Settings size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              模型管理
            </h1>
            <p className="text-sm text-gray-500">管理所有可用的 AI 模型</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="primary" onClick={handleAdd}>
            <Plus size={16} className="mr-1" />
            添加模型
          </Button>
          <Button variant="secondary" onClick={() => navigate("/config")}>
            <ChevronLeft size={16} />
            返回配置
          </Button>
        </div>
      </div>

      {/* 模型列表抽离到子组件 */}
      <ModelList
        models={models}
        loading={loading}
        error={error}
        onEdit={handleEdit}
        onDelete={handleDelete}
        formatMode={formatMode}
      />

      {/* 对话框抽离到子组件 */}
      <ModelDialog
        open={dialogOpen}
        isEditing={isEditing}
        currentModel={currentModel}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        onCurrentModelChange={setCurrentModel}
      />

      {/* 使用提示 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
          💡 使用说明
        </h4>
        <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
          <li>• 所有模型统一在这里管理，增删改查都在这里完成</li>
          <li>• 禁用的模型不会出现在系统配置的下拉选择列表中</li>
          <li>• 在系统配置页面选择每个生成阶段使用哪个模型</li>
        </ul>
      </div>
    </div>
  );
};

export default ModelManagementPage;