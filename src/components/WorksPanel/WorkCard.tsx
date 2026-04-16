import React from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, FileText, BookOpen, Clapperboard, Play, Square } from "lucide-react";
import { Work, WorkStatus } from "../../types";
import { Tooltip } from "../Tooltip";

interface WorkCardProps {
  work: Work;
  onSelect: () => void;
  onDelete: () => void;
  onStopTask?: (workId: string) => void; // 🔥 新增：终止任务回调
}

export const WorkCard: React.FC<WorkCardProps> = ({ work, onSelect, onDelete, onStopTask }) => {
  const navigate = useNavigate();
  
  // 🔥 安全的时间格式化函数
  const formatDate = (timestamp: number | undefined | null) => {
    if (!timestamp || timestamp === 0) {
      return '未知时间';
    }
    
    try {
      const date = new Date(timestamp);
      // 检查日期是否有效
      if (isNaN(date.getTime())) {
        return '未知时间';
      }
      return date.toLocaleString("zh-CN");
    } catch (error) {
      console.warn('[WorkCard] Invalid date:', timestamp, error);
      return '未知时间';
    }
  };

  const statusLabels: Record<WorkStatus, string> = {
    draft: "草稿",
    generating: "生成中",
    completed: "已完成",
    failed: "失败",
    archived: "已归档",
  };

  const statusColors: Record<WorkStatus, string> = {
    draft: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
    generating: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 animate-pulse",
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    archived: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
  };

  const handleStoryboardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/storyboard?workId=${work.id}`);
  };

  // 🔥 处理继续生成
  const handleContinueGeneration = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('/');
  };

  // 🔥 处理终止任务
  const handleStopTask = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onStopTask) {
      onStopTask(work.id);
    }
  };

  const hasStoryboards = work.storyboardIds && work.storyboardIds.length > 0;

  return (
    <div
      className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all border border-gray-200 dark:border-slate-600 hover:border-primary/30 hover:shadow-md cursor-pointer"
      onClick={onSelect}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          {work.type === "article" ? (
            <FileText size={16} className="text-blue-500" />
          ) : (
            <BookOpen size={16} className="text-purple-500" />
          )}
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              statusColors[work.status]
            }`}
          >
            {statusLabels[work.status]}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* 🔥 如果作品正在生成，显示"继续"和"终止"按钮 */}
          {work.status === 'generating' && (
            <>
              <button
                onClick={handleContinueGeneration}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-all"
                title="返回创作页面查看进度"
              >
                <Tooltip content="继续生成">
                  <Play size={14} />
                </Tooltip>
              </button>
              
              <button
                onClick={handleStopTask}
                className="opacity-0 group-hover:opacity-100 p-1.5 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="终止生成任务"
              >
                <Tooltip content="终止任务">
                  <Square size={14} fill="currentColor" />
                </Tooltip>
              </button>
            </>
          )}
          
          <button
            onClick={handleStoryboardClick}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-all"
            title="生成视频分镜"
          >
            <Clapperboard size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
          >
            <Tooltip content="删除">
              <Trash2 size={14} />
            </Tooltip>
          </button>
        </div>
      </div>
      <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-1 line-clamp-1">
        {work.title || "(无标题)"}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">
        {work.topic || "暂无主题"}
      </p>
      <div className="flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
        <span>
          {work.chapterCount} 章 / {work.actualWordCount.toLocaleString()} 字
        </span>
        <span>{formatDate(work.updatedAt)}</span>
      </div>
      {hasStoryboards && (
        <div className="mt-2 pt-2 border-t border-gray-200 dark:border-slate-600">
          <span className="text-xs text-pink-500 flex items-center gap-1">
            <Clapperboard size={12} />
            {work.storyboardIds?.length || 0} 个分镜
          </span>
        </div>
      )}
    </div>
  );
};
