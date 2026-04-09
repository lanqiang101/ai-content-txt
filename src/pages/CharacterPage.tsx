import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, Plus, Trash2, User, Loader2, Check, Sparkles,
  Save, X, ChevronDown, ChevronRight
} from "lucide-react";
import { useStore } from "../store/useStore";
import { useRandomGenerate } from "../hooks/useRandomGenerate";
import { Character } from "../types";
import { Tooltip } from "./Tooltip";

export const CharacterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workId = searchParams.get('workId');
  
  const { works, characters, addCharacter, updateCharacter, deleteCharacter } = useStore();
  const { generateCandidates, loading } = useRandomGenerate();
  
  const work = workId ? works.find(w => w.id === workId) : null;
  const workCharacters = characters.filter(c => c.workId === workId);
  
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    appearance: '',
    personality: '',
    outfit: '',
    role: 'supporting' as 'main' | 'supporting',
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) return;
    
    const character: Character = {
      id: editingId || 'char-' + Date.now(),
      workId: workId || '',
      name: formData.name,
      description: formData.description,
      appearance: formData.appearance,
      personality: formData.personality,
      outfit: formData.outfit,
      role: formData.role,
      createdAt: editingId ? workCharacters.find(c => c.id === editingId)?.createdAt || Date.now() : Date.now(),
      updatedAt: Date.now(),
    };
    
    if (editingId) {
      updateCharacter(editingId, character);
    } else {
      addCharacter(character);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      appearance: '',
      personality: '',
      outfit: '',
      role: 'supporting',
    });
  };

  const handleEdit = (char: Character) => {
    setFormData({
      name: char.name,
      description: char.description,
      appearance: char.appearance,
      personality: char.personality,
      outfit: char.outfit,
      role: char.role,
    });
    setEditingId(char.id);
    setShowForm(true);
  };

  const handleSmartGenerate = async (field: keyof typeof formData) => {
    if (!work) return;
    
    const prompt = `根据小说《${work.title}》的内容，智能生成角色${formData.name || '角色'}的${field}描述。`;
    const rules = `请生成适合AI视频生成的${field}描述，要求描述具体、生动、适合视觉化呈现。`;
    
    try {
      const results = await generateCandidates(prompt, rules, 1);
      if (results[0]) {
        setFormData(prev => ({ ...prev, [field]: results[0] }));
      }
    } catch (error) {
      console.error('Smart generate failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-100 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/storyboard' + (workId ? `?workId=${workId}` : ''))}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <ArrowLeft size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                <User className="text-purple-500" />
                角色管理
              </h1>
              <p className="text-gray-500 dark:text-gray-400">{work?.title || '全局角色'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {workCharacters.length === 0 && !showForm ? (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-8 text-center border border-gray-200/50 dark:border-slate-700/50">
              <User size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">暂无角色信息</p>
              <button
                onClick={() => setShowForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all"
              >
                添加角色
              </button>
            </div>
          ) : (
            <>
              {workCharacters.map(char => (
                <div
                  key={char.id}
                  className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-4 border border-gray-200/50 dark:border-slate-700/50"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${
                        char.role === 'main' 
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                          : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300'
                      }`}>
                        {char.role === 'main' ? '主角' : '配角'}
                      </span>
                      <h3 className="font-semibold text-gray-800 dark:text-white">{char.name}</h3>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(char)}
                        className="p-1.5 text-gray-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg"
                      >
                        <Sparkles size={14} />
                      </button>
                      <button
                        onClick={() => deleteCharacter(char.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  
                  {char.description && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">角色描述：</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{char.description}</p>
                    </div>
                  )}
                  {char.appearance && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">外貌特征：</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{char.appearance}</p>
                    </div>
                  )}
                  {char.personality && (
                    <div className="mb-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">性格特点：</span>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{char.personality}</p>
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {showForm && (
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-5 border border-gray-200/50 dark:border-slate-700/50">
              <h3 className="font-semibold text-gray-800 dark:text-white mb-4">
                {editingId ? '编辑角色' : '添加角色'}
              </h3>
              
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      角色名称
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                      placeholder="角色名称"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      角色类型
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as 'main' | 'supporting' }))}
                      className="px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    >
                      <option value="main">主角</option>
                      <option value="supporting">配角</option>
                    </select>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      角色描述
                    </label>
                    <button
                      onClick={() => handleSmartGenerate('description')}
                      disabled={loading}
                      className="text-xs text-purple-500 hover:text-purple-600 flex items-center gap-1"
                    >
                      {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      智能生成
                    </button>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 resize-none"
                    placeholder="角色在故事中的定位和作用..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      外貌特征
                    </label>
                    <button
                      onClick={() => handleSmartGenerate('appearance')}
                      disabled={loading}
                      className="text-xs text-purple-500 hover:text-purple-600 flex items-center gap-1"
                    >
                      {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      智能生成
                    </button>
                  </div>
                  <textarea
                    value={formData.appearance}
                    onChange={(e) => setFormData(prev => ({ ...prev, appearance: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 resize-none"
                    placeholder="身高、着装、外貌特点..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      性格特点
                    </label>
                    <button
                      onClick={() => handleSmartGenerate('personality')}
                      disabled={loading}
                      className="text-xs text-purple-500 hover:text-purple-600 flex items-center gap-1"
                    >
                      {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      智能生成
                    </button>
                  </div>
                  <textarea
                    value={formData.personality}
                    onChange={(e) => setFormData(prev => ({ ...prev, personality: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 resize-none"
                    placeholder="性格、行为习惯、口头禅..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    服装造型（可选）
                  </label>
                  <input
                    type="text"
                    value={formData.outfit}
                    onChange={(e) => setFormData(prev => ({ ...prev, outfit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                    placeholder="服装风格、配色..."
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
                  >
                    取消
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 text-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          )}

          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-slate-600 rounded-xl text-gray-500 dark:text-gray-400 hover:border-purple-500 hover:text-purple-500 transition-all flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              添加角色
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterPage;