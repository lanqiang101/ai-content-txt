import React from 'react';
import { useStore } from '../store/useStore';
import { RefreshCw } from 'lucide-react';

export const InputPanel: React.FC = () => {
  const { params, setParams, resetGeneration } = useStore();

  const handleReset = () => {
    resetGeneration();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg card-gradient p-6 mb-6 transition-all hover:shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-bold text-gray-800">内容参数</h2>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
          title="清空所有内容"
        >
          <RefreshCw size={16} />
          重置
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">内容类型</label>
          <div className="flex gap-3">
            <button
              className={`px-4 py-2 rounded-xl transition-all ${
                params.type === 'article'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setParams({ type: 'article' })}
            >
              公众号文章
            </button>
            <button
              className={`px-4 py-2 rounded-xl transition-all ${
                params.type === 'novel'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setParams({ type: 'novel' })}
            >
              小说
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">主题</label>
          <input
            type="text"
            value={params.topic}
            onChange={(e) => setParams({ topic: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white/80 backdrop-blur"
            placeholder="请输入文章或小说的主题..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">关键词（用逗号分隔）</label>
          <input
            type="text"
            value={params.keywords}
            onChange={(e) => setParams({ keywords: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white/80 backdrop-blur"
            placeholder="AI, 未来科技, 生活..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">期望字数（字）</label>
          <div className="flex gap-3 items-center">
            <input
              type="number"
              min="100"
              step="100"
              value={params.wordCount}
              onChange={(e) => setParams({ wordCount: parseInt(e.target.value) || 0 })}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white/80 backdrop-blur"
              placeholder="输入字数，支持无上限"
            />
            <span className="text-sm text-gray-500 whitespace-nowrap">支持长篇小说</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">写作风格</label>
          <div className="space-y-3">
            <input
              type="text"
              value={params.style}
              onChange={(e) => setParams({ style: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-white/80 backdrop-blur"
              placeholder="自定义写作风格，例如：轻松幽默，都市言情，悬疑惊悚..."
            />
            <div className="flex flex-wrap gap-2">
              {['专业正式', '轻松幽默', '情感细腻', '悬疑惊悚', '治愈温暖', '都市言情', '玄幻修仙'].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setParams({ style: preset })}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    params.style === preset
                      ? 'bg-primary text-white shadow-sm shadow-primary/20'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
