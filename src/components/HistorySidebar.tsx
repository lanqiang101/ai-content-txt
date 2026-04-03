import React from 'react';
import { X, Trash2, History, FileText, BookOpen } from 'lucide-react';
import { useStore } from '../store/useStore';
import { ContentHistory } from '../types';

interface HistoryItemProps {
  item: ContentHistory;
  onLoad: () => void;
  onDelete: () => void;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item, onLoad, onDelete }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN');
  };

  return (
    <div className="group p-3 rounded-lg hover:bg-gray-100 transition-colors border border-transparent hover:border-gray-200">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
          {item.type === 'article' ? (
            <>
              <FileText size={14} />
              <span>公众号文章</span>
            </>
          ) : (
            <>
              <BookOpen size={14} />
              <span>小说</span>
            </>
          )}
        </div>
        <button
          onClick={onDelete}
          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
          title="删除"
        >
          <Trash2 size={14} />
        </button>
      </div>
      <div
        className="font-medium text-gray-800 text-sm mb-1 line-clamp-2 cursor-pointer hover:text-primary transition-colors"
        onClick={onLoad}
      >
        {item.topic || '(无标题)'}
      </div>
      <div className="text-xs text-gray-400">{formatDate(item.createdAt)}</div>
    </div>
  );
};

export const HistorySidebar: React.FC = () => {
  const { history, historyOpen, toggleHistory, loadFromHistory, deleteFromHistory } = useStore();

  if (!historyOpen) {
    return (
      <button
        onClick={toggleHistory}
        className="fixed bottom-20 right-6 bg-gray-800 hover:bg-gray-700 text-white rounded-full p-4 shadow-lg transition-all hover:shadow-xl z-50"
        title="历史记录"
      >
        <History size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-end">
      <div className="w-full max-w-sm h-full bg-white animate-slide-in overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <History size={24} />
              历史记录
            </h2>
            <button
              onClick={toggleHistory}
              className="p-2 hover:bg-gray-200 rounded-lg transition-all"
            >
              <X size={24} className="text-gray-600" />
            </button>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <History size={48} className="mx-auto mb-3 opacity-50" />
              <p>暂无生成记录</p>
            </div>
          ) : (
            <div className="space-y-2">
              {history.map((item) => (
                <HistoryItem
                  key={item.id}
                  item={item}
                  onLoad={() => {
                    loadFromHistory(item);
                    toggleHistory();
                  }}
                  onDelete={() => deleteFromHistory(item.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
