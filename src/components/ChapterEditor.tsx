import React, { useState, useEffect } from 'react';
import { Chapter } from '../types';
import { X, Save, Edit3, Eye, Type, AlignLeft } from 'lucide-react';

interface ChapterEditorProps {
  chapter: Chapter | null;
  onClose: () => void;
  onSave?: (updatedChapter: Chapter) => Promise<void>;
}

export const ChapterEditor: React.FC<ChapterEditorProps> = ({ 
  chapter, 
  onClose,
  onSave 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [saving, setSaving] = useState(false);

  // 初始化编辑器内容
  useEffect(() => {
    if (chapter) {
      setContent(chapter.content || '');
      setTitle(chapter.title || '');
      setIsEditing(false);
    }
  }, [chapter]);

  // 保存更改
  const handleSave = async () => {
    if (!chapter || !onSave) return;

    try {
      setSaving(true);
      
      const updatedChapter: Chapter = {
        ...chapter,
        title,
        content,
        wordCount: content.length,
        updatedAt: Date.now(),
      };

      await onSave(updatedChapter);
      setIsEditing(false);
    } catch (error) {
      console.error('[ChapterEditor] Save error:', error);
      alert('保存失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  // 计算字数统计
  const wordCount = content.length;
  const charCount = content.replace(/\s/g, '').length;

  if (!chapter) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        
        {/* 头部工具栏 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
              {isEditing ? (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3 py-1.5 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
                  placeholder="章节标题"
                />
              ) : (
                chapter.title || `第${chapter.chapterNumber}章`
              )}
            </h2>
            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400">
              第{chapter.chapterNumber}章
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>编辑</span>
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-3 py-1.5 rounded-lg bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors"
                  disabled={saving}
                >
                  取消
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {saving ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>保存</span>
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className="flex items-center gap-4 px-4 py-2 bg-gray-50 dark:bg-slate-900/50 border-b border-gray-200 dark:border-slate-700 text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <Type className="h-4 w-4" />
            <span>{wordCount.toLocaleString()} 字</span>
          </div>
          <div className="flex items-center gap-1">
            <AlignLeft className="h-4 w-4" />
            <span>{charCount.toLocaleString()} 字符</span>
          </div>
          <div className="flex-1"></div>
          <span className="text-xs">
            {new Date(chapter.createdAt).toLocaleString('zh-CN')}
          </span>
        </div>

        {/* 内容区域 */}
        <div className="flex-1 overflow-y-auto p-6">
          {isEditing ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-full min-h-[500px] p-4 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 font-mono text-sm leading-relaxed resize-none"
              placeholder="在此输入章节内容..."
            />
          ) : (
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div className="whitespace-pre-wrap text-gray-900 dark:text-gray-100 leading-relaxed">
                {content || <span className="text-gray-400 italic">暂无内容</span>}
              </div>
            </div>
          )}
        </div>

        {/* 底部状态栏 */}
        <div className="px-4 py-2 bg-gray-50 dark:bg-slate-900/50 border-t border-gray-200 dark:border-slate-700 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-between">
          <span>
            状态: {chapter.status === 'completed' ? '✅ 已完成' : chapter.status === 'draft' ? '📝 草稿' : '⏳ 生成中'}
          </span>
          <span>
            最后更新: {new Date(chapter.updatedAt).toLocaleString('zh-CN')}
          </span>
        </div>
      </div>
    </div>
  );
};
