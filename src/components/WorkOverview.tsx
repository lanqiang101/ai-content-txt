import React from 'react';
import { Work } from '../types';
import { BookOpen, FileText, Clock, Target, TrendingUp } from 'lucide-react';

interface WorkOverviewProps {
  work: Work;
}

export const WorkOverview: React.FC<WorkOverviewProps> = ({ work }) => {
  // 计算进度
  const progress = work.expectedWordCount > 0 
    ? Math.min(100, Math.round((work.actualWordCount / work.expectedWordCount) * 100))
    : 0;

  // 计算平均每章字数
  const avgWordsPerChapter = work.chapterCount > 0
    ? Math.round(work.actualWordCount / work.chapterCount)
    : 0;

  // 格式化时间
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-slate-700/50">
      {/* 标题 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          {work.title || work.topic}
        </h2>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <BookOpen className="h-4 w-4" />
          <span>{work.type === 'novel' ? '小说' : '文章'}</span>
          <span>•</span>
          <span className={`px-2 py-0.5 rounded-full text-xs ${
            work.status === 'completed' 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
              : work.status === 'generating'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
          }`}>
            {work.status === 'completed' ? '已完成' : work.status === 'generating' ? '生成中' : '草稿'}
          </span>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* 总字数 */}
        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">总字数</span>
          </div>
          <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">
            {work.actualWordCount.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            / {work.expectedWordCount.toLocaleString()} 目标
          </div>
        </div>

        {/* 章节数 */}
        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">章节数</span>
          </div>
          <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
            {work.chapterCount}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            章
          </div>
        </div>

        {/* 平均每章 */}
        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">平均每章</span>
          </div>
          <div className="text-2xl font-bold text-green-900 dark:text-green-100">
            {avgWordsPerChapter.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            字
          </div>
        </div>

        {/* 完成进度 */}
        <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Target className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">完成度</span>
          </div>
          <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">
            {progress}%
          </div>
          <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
            <div 
              className="bg-orange-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 详细信息 */}
      <div className="space-y-3 text-sm">
        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
          <span className="text-gray-600 dark:text-gray-400">主题</span>
          <span className="text-gray-900 dark:text-gray-100 font-medium">{work.topic}</span>
        </div>
        
        {work.keywords && (
          <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
            <span className="text-gray-600 dark:text-gray-400">关键词</span>
            <span className="text-gray-900 dark:text-gray-100">{work.keywords}</span>
          </div>
        )}

        <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-slate-700">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            创建时间
          </span>
          <span className="text-gray-900 dark:text-gray-100">{formatDate(work.createdAt)}</span>
        </div>

        <div className="flex items-center justify-between py-2">
          <span className="text-gray-600 dark:text-gray-400 flex items-center gap-1">
            <Clock className="h-4 w-4" />
            更新时间
          </span>
          <span className="text-gray-900 dark:text-gray-100">{formatDate(work.updatedAt)}</span>
        </div>
      </div>

      {/* 操作提示 */}
      {work.status === 'generating' && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            ⏳ 作品正在生成中，请稍候...
          </p>
        </div>
      )}
    </div>
  );
};
