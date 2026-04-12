import React from "react";
import { Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import type { ModelListProps } from "./types";
import type { ModelConfig } from "../../types";

export const ModelList: React.FC<ModelListProps> = ({
  models,
  loading,
  error,
  onEdit,
  onDelete,
  formatMode,
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin text-gray-500 mr-2">⚪</div>
        <span className="text-gray-500">加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
        <p className="text-red-700 dark:text-red-300">加载失败: {error}</p>
        <p className="text-sm text-red-600 dark:text-red-400 mt-1">
          请确保后端服务已启动: cd server && node index.js
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">名称</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">模型标识</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">温度</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">最大Tokens</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">模式</th>
              <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">状态</th>
              <th className="text-right px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">操作</th>
            </tr>
          </thead>
          <tbody>
            {models.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center py-12 text-gray-500 dark:text-gray-400">
                  还没有添加任何模型，点击右上角&quot;添加模型&quot;开始
                </td>
              </tr>
            )}
            {models.map((model: ModelConfig) => (
              <tr
                key={model.id}
                className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {model.name}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {model.modelName}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {model.temperature}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {model.maxTokens}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {formatMode(model.mode)}
                </td>
                <td className="px-6 py-4">
                  {model.enabled ? (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <CheckCircle size={16} />
                      <span className="text-sm">启用</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <XCircle size={16} />
                      <span className="text-sm">禁用</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onEdit(model)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="编辑"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(model.id!)}
                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      title="删除"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};