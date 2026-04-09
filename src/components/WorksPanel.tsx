import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Trash2, FileText, BookOpen, Search, Edit2, FolderOpen, Clapperboard } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Work, WorkStatus } from '../types';
import { Tooltip } from './Tooltip';

interface WorkCardProps {
  work: Work;
  onSelect: () => void;
  onDelete: () => void;
}

const WorkCard: React.FC<WorkCardProps> = ({ work, onSelect, onDelete }) => {
  const navigate = useNavigate();
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  const statusLabels: Record<WorkStatus, string> = {
    drafting: '创作中',
    completed: '已完成',
    failed: '失败',
    archived: '已归档',
  };

  const statusColors: Record<WorkStatus, string> = {
    drafting: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    failed: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    archived: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  };

  const handleStoryboardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/storyboard?workId=${work.id}`);
  };

  const hasStoryboards = work.storyboardIds && work.storyboardIds.length > 0;

  return (
    <div className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all border border-gray-200 dark:border-slate-600 hover:border-primary/30 hover:shadow-md cursor-pointer" onClick={onSelect}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {work.type === 'article' ? (
            <FileText size={16} className="text-blue-500" />
          ) : (
            <BookOpen size={16} className="text-purple-500" />
          )}
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${statusColors[work.status]}`}>
            {statusLabels[work.status]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleStoryboardClick}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-all"
            title="生成视频分镜"
          >
            <Clapperboard size={14} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <Tooltip content="删除">
              <Trash2 size={14} />
            </Tooltip>
          </button>
        </div>
      </div>
      <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1">
        {work.title || '(无标题)'}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
        {work.topic || '暂无主题'}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>{work.chapterCount}章 / {work.actualWordCount.toLocaleString()}字</span>
        <span>{formatDate(work.updatedAt)}</span>
      </div>
      {hasStoryboards && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-600">
          <span className="text-xs text-pink-500 flex items-center gap-1">
            <Clapperboard size={12} />
            {work.storyboardIds.length} 个分镜
          </span>
        </div>
      )}
    </div>
  );
};

interface WorkDetailProps {
  work: Work;
  onClose: () => void;
  onLoad: () => void;
}

const WorkDetail: React.FC<WorkDetailProps> = ({ work, onClose, onLoad }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'content'>('info');

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {work.title || '(无标题)'}
            </h3>
            <span className="text-sm text-gray-500">#{work.id.slice(0, 8)}</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg">
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        
        <div className="flex border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
            作品信息
          </button>
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'content' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          >
            内容预览
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'info' ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">类型</div>
                <div className="font-medium">{work.type === 'article' ? '公众号文章' : '小说'}</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">状态</div>
                <div className="font-medium">{work.status}</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">期望字数</div>
                <div className="font-medium">{work.expectedWordCount.toLocaleString()}</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">实际字数</div>
                <div className="font-medium">{work.actualWordCount.toLocaleString()}</div>
              </div>
              <div className="col-span-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">主题</div>
                <div className="font-medium">{work.topic || '-'}</div>
              </div>
              <div className="col-span-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">关键词</div>
                <div className="font-medium">{work.keywords || '-'}</div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <FileText size={48} className="mx-auto mb-3 opacity-30" />
              <p>内容预览功能开发中...</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-slate-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            关闭
          </button>
          <button
            onClick={onLoad}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg"
          >
            <Edit2 size={16} />
            加载此作品
          </button>
        </div>
      </div>
    </div>
  );
};

export const WorksPanel: React.FC = () => {
  const { works, worksOpen, toggleWorks, setCurrentWork, deleteWork, setParams } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);
  const [filterStatus, setFilterStatus] = useState<WorkStatus | 'all'>('all');

  const filteredWorks = works.filter(work => {
    const matchSearch = !searchQuery || 
      work.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.topic?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === 'all' || work.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const handleSelectWork = (work: Work) => {
    setCurrentWork(work.id);
    setParams({
      type: work.type,
      topic: work.topic,
      title: work.title,
      keywords: work.keywords,
      wordCount: work.expectedWordCount,
    });
    toggleWorks();
  };

  if (!worksOpen) {
    return (
      <Tooltip content="作品管理">
        <button
          onClick={toggleWorks}
          className="fixed bottom-[200px] right-6 bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white rounded-full p-4 shadow-lg transition-all hover:shadow-xl z-50"
        >
          <FolderOpen size={24} />
        </button>
      </Tooltip>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-end">
      <div className="w-full max-w-md h-full bg-gray-50 dark:bg-slate-900 animate-slide-in overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl">
                <FolderOpen size={24} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                  作品管理
                </h2>
                <p className="text-sm text-gray-500">{works.length} 个作品</p>
              </div>
            </div>
            <button
              onClick={toggleWorks}
              className="p-2 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-all"
            >
              <X size={24} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="搜索作品..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-800/80 text-gray-900 dark:text-gray-100"
              />
            </div>
            
            <div className="flex gap-2">
              {(['all', 'drafting', 'completed', 'archived'] as const).map((status) => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                    filterStatus === status
                      ? 'bg-primary text-white'
                      : 'bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {status === 'all' ? '全部' : status === 'drafting' ? '创作中' : status === 'completed' ? '已完成' : '已归档'}
                </button>
              ))}
            </div>
          </div>

          {filteredWorks.length === 0 ? (
            <div className="text-center py-12">
              <FolderOpen size={64} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400 mb-2">
                {works.length === 0 ? '暂无作品' : '没有找到匹配的作品'}
              </p>
              <p className="text-sm text-gray-400">生成内容后将自动保存为作品</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredWorks.map((work) => (
                <WorkCard
                  key={work.id}
                  work={work}
                  onSelect={() => setSelectedWork(work)}
                  onDelete={() => deleteWork(work.id)}
                />
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
            <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">💡 使用提示</h4>
            <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
              <li>• 作品会在内容生成完成后自动保存</li>
              <li>• 点击作品卡片可查看详情和加载</li>
              <li>• 支持搜索和状态筛选</li>
            </ul>
          </div>
        </div>
      </div>

      {selectedWork && (
        <WorkDetail
          work={selectedWork}
          onClose={() => setSelectedWork(null)}
          onLoad={() => handleSelectWork(selectedWork)}
        />
      )}
    </div>
  );
};
