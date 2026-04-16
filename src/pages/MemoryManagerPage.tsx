import { Database, Trash2, RefreshCw } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const MemoryManagerPage = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/memory/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Failed to load memory stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompress = async () => {
    if (!confirm('确定要压缩相似记忆吗？此操作不可撤销。')) {
      return;
    }

    try {
      setCompressing(true);
      const response = await fetch('/api/memory/compress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ similarityThreshold: 0.85 }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${data.message}`);
        loadStats(); // 重新加载统计
      } else {
        alert(`❌ 压缩失败: ${data.error}`);
      }
    } catch (error) {
      console.error('Compression failed:', error);
      alert('压缩失败，请查看控制台');
    } finally {
      setCompressing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-900 dark:to-purple-950 p-6">
      <div className="max-w-4xl mx-auto">
        {/* 头部 */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Database size={32} className="text-purple-500" />
              记忆管理系统
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              管理和优化AI创作记忆库
            </p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
          >
            返回
          </button>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">总记忆数</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                  {loading ? '...' : stats?.totalMemories || 0}
                </p>
              </div>
              <Database size={32} className="text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">人物记忆</p>
                <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-1">
                  {loading ? '...' : stats?.byType?.character || 0}
                </p>
              </div>
              <Database size={32} className="text-purple-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">章节记忆</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-1">
                  {loading ? '...' : stats?.byType?.chapter || 0}
                </p>
              </div>
              <Database size={32} className="text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">伏笔记忆</p>
                <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mt-1">
                  {loading ? '...' : stats?.byType?.foreshadowing || 0}
                </p>
              </div>
              <Database size={32} className="text-orange-500" />
            </div>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <RefreshCw size={20} />
            记忆优化
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <h3 className="font-medium text-gray-900 dark:text-white">压缩相似记忆</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  自动合并相似度超过85%的记忆，减少数据库冗余
                </p>
              </div>
              <button
                onClick={handleCompress}
                disabled={compressing || !stats?.initialized}
                className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors flex items-center gap-2"
              >
                {compressing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    压缩中...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    开始压缩
                  </>
                )}
              </button>
            </div>

            {!stats?.initialized && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  ⚠️ 记忆管理系统未初始化，请检查模型文件是否正确加载
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 使用说明 */}
        <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            📖 使用说明
          </h2>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <p>• <strong>记忆检索</strong>: 在生成新章节前，系统会自动检索相关的人物设定、伏笔和前章内容</p>
            <p>• <strong>记忆存储</strong>: 每完成一个章节，系统会自动将其保存到记忆库中</p>
            <p>• <strong>记忆压缩</strong>: 定期运行可合并相似记忆，保持数据库整洁</p>
            <p>• <strong>优先级权重</strong>: 人物记忆(1.5x) &gt; 伏笔记忆(1.3x) &gt; 情节记忆(1.2x) &gt; 章节记忆(1.0x)</p>
          </div>
        </div>
      </div>
    </div>
  );
};