import React, { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  ArrowLeft, Plus, Trash2, User, Loader2, Check, Sparkles,
  Save, X, ChevronDown, ChevronRight, AlertCircle
} from "lucide-react";
import { useStore } from "../store/useStore";
import { useRandomConfig } from "../hooks/useRandomConfig";
import { Character } from "../types";
import { Tooltip } from "../components/Tooltip";
import { Button } from "../components/ui/Button";

export const CharacterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workId = searchParams.get('workId');
  
  const { addCharacter, deleteCharacter, characters } = useStore();
  const { generateCandidates, loading, hasConfig } = useRandomConfig();
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Character, 'id' | 'workId' | 'createdAt' | 'updatedAt'>>({
    name: '',
    description: '',
    appearance: '',
    personality: '',
    outfit: '',
    role: 'main',
  });

  const workCharacters = characters.filter(c => c.workId === workId);

  const handleSubmit = () => {
    if (!workId) {
      alert('请先选择作品');
      return;
    }

    if (!formData.name.trim()) {
      alert('角色名称不能为空');
      return;
    }

    const now = Date.now();
    if (editingId) {
      // 更新角色（实际项目中 store 应该有 updateCharacter，这里简化）
      // 先删除再添加保持类型简单
      deleteCharacter(editingId);
      addCharacter({
        ...formData,
        id: editingId,
        workId,
        createdAt: now,
        updatedAt: now,
      });
      setEditingId(null);
    } else {
      const newId = `char_${now}`;
      addCharacter({
        ...formData,
        id: newId,
        workId,
        createdAt: now,
        updatedAt: now,
      });
    }

    // 重置表单
    setFormData({
      name: '',
      description: '',
      appearance: '',
      personality: '',
      outfit: '',
      role: 'main',
    });
  };

  const handleEdit = (char: Character) => {
    setEditingId(char.id);
    setFormData({
      name: char.name,
      description: char.description,
      appearance: char.appearance,
      personality: char.personality,
      outfit: char.outfit,
      role: char.role,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      description: '',
      appearance: '',
      personality: '',
      outfit: '',
      role: 'main',
    });
  };

  const handleGenerateRandom = async () => {
    if (!workId) {
      alert('请先选择作品');
      return;
    }

    if (!hasConfig) {
      setError("未配置随机生成模型");
      setTimeout(() => {
        if (window.confirm("未配置随机生成模型\n\n是否前往系统配置？")) {
          navigate("/config");
        }
      }, 100);
      return;
    }

    setIsGenerating(true);
    try {
      setError(null);
      // 生成随机名称
      const names = await generateCandidates(
        '小说角色名称',
        '要求符合网文/短剧风格，每个名称简洁好记，适合中国读者'
      );
      
      if (names.length > 0) {
        setFormData(prev => ({
          ...prev,
          name: names[0],
        }));
      }
      
      // 生成外貌描述
      const appearances = await generateCandidates(
        '小说角色外貌特征描述',
        '要求简洁有力，突出一个核心外貌特点，适合网文读者快速建立印象，长度控制在20-30字',
        1
      );
      
      if (appearances.length > 0) {
        setFormData(prev => ({
          ...prev,
          appearance: appearances[0],
        }));
      }
      
      // 生成性格描述
      const personalities = await generateCandidates(
        '小说角色性格特征描述',
        '要求突出一个核心性格缺点或者亮点，不要太平庸，长度控制在20-30字',
        1
      );
      
      if (personalities.length > 0) {
        setFormData(prev => ({
          ...prev,
          personality: personalities[0],
        }));
      }
      
      // 生成服饰描述
      const outfits = await generateCandidates(
        '小说角色服饰穿着描述',
        '要求符合角色身份和时代背景，简洁1-2句话',
        1
      );
      
      if (outfits.length > 0) {
        setFormData(prev => ({
          ...prev,
          outfit: outfits[0],
        }));
      }
      
      // 生成总体描述
      const descriptions = await generateCandidates(
        '小说角色背景故事和核心动机简述',
        '要求简洁有力，突出角色的核心驱动力，长度控制在50-80字',
        1
      );
      
      if (descriptions.length > 0) {
        setFormData(prev => ({
          ...prev,
          description: descriptions[0],
        }));
      }
      
    } catch (err) {
      console.error('Random character generation failed:', err);
      setError((err as Error).message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => workId ? navigate(`/work/${workId}`) : navigate('/')}>
            <ArrowLeft size={16} />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">角色管理</h1>
            <p className="text-sm text-gray-500">{workCharacters.length} 个角色</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 表单区域 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-slate-700/50">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
            {editingId ? '编辑角色' : '添加新角色'}
          </h2>

          {/* 错误提示 */}
          {error && (
            <div className="mb-4 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                角色名称
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                placeholder="输入角色名称"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                角色定位
              </label>
              <div className="flex gap-2">
                {(['main', 'supporting'] as const).map((role) => (
                  <button
                    key={role}
                    onClick={() => setFormData({ ...formData, role })}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                      formData.role === role
                        ? "bg-primary text-white"
                        : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                    }`}
                  >
                    {role === 'main' ? '主角' : '配角'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                外貌描述
              </label>
              <textarea
                value={formData.appearance}
                onChange={(e) => setFormData({ ...formData, appearance: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                placeholder="描述角色的外貌特征..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                性格描述
              </label>
              <textarea
                value={formData.personality}
                onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                placeholder="描述角色的性格特点..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                服饰描述
              </label>
              <textarea
                value={formData.outfit}
                onChange={(e) => setFormData({ ...formData, outfit: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                placeholder="描述角色的穿着打扮..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                角色描述
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
                placeholder="总体描述角色的背景、故事、动机..."
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="primary"
                onClick={handleSubmit}
                className="flex-1"
              >
                <Save size={16} className="mr-1" />
                {editingId ? '保存修改' : '添加角色'}
              </Button>

              <Tooltip content={!hasConfig ? "未配置模型" : "AI随机生成一个角色"}>
                <button
                  onClick={hasConfig ? handleGenerateRandom : () => navigate("/config")}
                  disabled={loading || !hasConfig}
                  className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-base ${
                    !hasConfig 
                      ? "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed" 
                      : "bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700"
                  }`}
                >
                  {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : !hasConfig ? (
                    <AlertCircle size={16} />
                  ) : (
                    <Sparkles size={16} />
                  )}
                  {!hasConfig ? "未配置" : "生成"}
                </button>
              </Tooltip>

              {editingId && (
                <Button
                  variant="secondary"
                  onClick={handleCancelEdit}
                >
                  <X size={16} />
                  取消
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* 角色列表 */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-slate-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">已有角色</h3>
          </div>

          {workCharacters.length === 0 ? (
            <div className="text-center py-16">
              <User size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">还没有添加角色</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-slate-700">
              {workCharacters.map((char) => (
                <div key={char.id} className="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {char.name}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs rounded ${
                          char.role === 'main'
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                        }`}>
                          {char.role === 'main' ? '主角' : '配角'}
                        </span>
                      </div>
                      {char.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {char.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(char)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="编辑"
                      >
                        <Sparkles size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('确定要删除这个角色吗？')) {
                            deleteCharacter(char.id);
                          }
                        }}
                        className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="删除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {char.appearance && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="font-medium">外貌：</span> {char.appearance.slice(0, 60)}
                      {char.appearance.length > 60 && '...'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CharacterPage;
