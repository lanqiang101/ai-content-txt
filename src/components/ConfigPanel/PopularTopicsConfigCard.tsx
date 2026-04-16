import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, Edit2, Save, X } from "lucide-react";
import { getPopularTopics, addPopularTopic, updatePopularTopic, deletePopularTopic } from "../../services/db";

interface TopicItem {
  id: number;
  topic: string;
  description: string;
  sortOrder: number;
}

interface PopularTopicsData {
  [category: string]: TopicItem[];
}

export const PopularTopicsConfigCard: React.FC = () => {
  const [expanded, setExpanded] = useState(true);
  const [topics, setTopics] = useState<PopularTopicsData>({});
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{ topic: string; description: string }>({ topic: "", description: "" });
  const [addingCategory, setAddingCategory] = useState("");
  const [newTopic, setNewTopic] = useState({ topic: "", description: "" });

  // 加载热门主题
  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      setLoading(true);
      const result = await getPopularTopics();
      if (result.success) {
        setTopics(result.data);
      }
    } catch (error) {
      console.error("加载热门主题失败:", error);
    } finally {
      setLoading(false);
    }
  };

  // 添加新主题
  const handleAddTopic = async (category: string) => {
    if (!newTopic.topic.trim()) {
      alert("主题不能为空");
      return;
    }

    try {
      await addPopularTopic({
        category,
        topic: newTopic.topic,
        description: newTopic.description,
        sortOrder: 0,
      });
      setNewTopic({ topic: "", description: "" });
      setAddingCategory("");
      await loadTopics();
    } catch (error) {
      console.error("添加主题失败:", error);
      alert("添加失败，请重试");
    }
  };

  // 删除主题
  const handleDeleteTopic = async (id: number) => {
    if (!confirm("确定要删除这个主题吗？")) return;

    try {
      await deletePopularTopic(id);
      await loadTopics();
    } catch (error) {
      console.error("删除主题失败:", error);
      alert("删除失败，请重试");
    }
  };

  // 开始编辑
  const startEdit = (topic: TopicItem) => {
    setEditingId(topic.id);
    setEditForm({ topic: topic.topic, description: topic.description });
  };

  // 保存编辑
  const handleSaveEdit = async (id: number) => {
    if (!editForm.topic.trim()) {
      alert("主题不能为空");
      return;
    }

    try {
      await updatePopularTopic(id, editForm);
      setEditingId(null);
      await loadTopics();
    } catch (error) {
      console.error("更新主题失败:", error);
      alert("更新失败，请重试");
    }
  };

  // 取消编辑
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ topic: "", description: "" });
  };

  const categories = Object.keys(topics).sort();

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-md mb-4 transition-all hover:shadow-lg border border-gray-100 dark:border-slate-700">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            热门主题推荐
          </h3>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {categories.length} 个分类
        </span>
      </div>

      {expanded && (
        <div className="px-5 pb-5">
          {loading ? (
            <div className="text-center py-8 text-gray-500">加载中...</div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">暂无热门主题</div>
          ) : (
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category} className="border border-gray-200 dark:border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-800 dark:text-gray-100">
                      {category}
                    </h4>
                    {addingCategory !== category && (
                      <button
                        type="button"
                        onClick={() => setAddingCategory(category)}
                        className="text-sm text-primary hover:text-primary/80 flex items-center gap-1"
                      >
                        <Plus size={14} />
                        添加
                      </button>
                    )}
                  </div>

                  {/* 添加新主题表单 */}
                  {addingCategory === category && (
                    <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <input
                        type="text"
                        placeholder="主题名称"
                        value={newTopic.topic}
                        onChange={(e) => setNewTopic({ ...newTopic, topic: e.target.value })}
                        className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100"
                      />
                      <textarea
                        placeholder="描述（可选）"
                        value={newTopic.description}
                        onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                        className="w-full px-3 py-2 mb-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100"
                        rows={2}
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleAddTopic(category)}
                          className="px-3 py-1 bg-primary text-white rounded hover:bg-primary/90"
                        >
                          保存
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingCategory("");
                            setNewTopic({ topic: "", description: "" });
                          }}
                          className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-slate-600"
                        >
                          取消
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 主题列表 */}
                  <div className="space-y-2">
                    {topics[category].map((item) => (
                      <div
                        key={item.id}
                        className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                      >
                        {editingId === item.id ? (
                          // 编辑模式
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editForm.topic}
                              onChange={(e) => setEditForm({ ...editForm, topic: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100"
                            />
                            <textarea
                              value={editForm.description}
                              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-100"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveEdit(item.id)}
                                className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1"
                              >
                                <Save size={14} />
                                保存
                              </button>
                              <button
                                type="button"
                                onClick={cancelEdit}
                                className="px-3 py-1 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-slate-600 flex items-center gap-1"
                              >
                                <X size={14} />
                                取消
                              </button>
                            </div>
                          </div>
                        ) : (
                          // 查看模式
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-gray-800 dark:text-gray-100">
                                {item.topic}
                              </div>
                              {item.description && (
                                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  {item.description}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <button
                                type="button"
                                onClick={() => startEdit(item)}
                                className="p-1 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                              >
                                <Edit2 size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteTopic(item.id)}
                                className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
