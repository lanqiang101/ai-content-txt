import React, { useState, useEffect } from "react";
import { useStore } from "../store/useStore";
import { Chapter } from "../types";
import {
  BookOpen,
  Trash2,
  RefreshCw,
  Eye,
  Edit3,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";

interface ChapterListProps {
  workId: string;
  onChapterClick?: (chapter: Chapter) => void;
  selectedChapterId?: string; // 🔥 选中的章节ID
}

export const ChapterList: React.FC<ChapterListProps> = ({
  workId,
  onChapterClick,
  selectedChapterId,
}) => {
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取章节列表
  useEffect(() => {
    const fetchChapters = async () => {
      try {
        setLoading(true);
        console.log("[ChapterList] Fetching chapters for workId:", workId);

        const response = await fetch(`/api/chapters?workId=${workId}`);

        console.log("[ChapterList] Response status:", response.status);

        if (!response.ok) {
          throw new Error("Failed to fetch chapters");
        }

        const data = await response.json();
        console.log("[ChapterList] API response:", data);

        const chaptersData = data.chapters || [];
        console.log(`[ChapterList] Chapters count: ${chaptersData.length}`);

        if (chaptersData.length > 0) {
          console.log("[ChapterList] First chapter sample:", {
            id: chaptersData[0].id,
            chapterNumber: chaptersData[0].chapterNumber,
            title: chaptersData[0].title,
            wordCount: chaptersData[0].wordCount,
            contentLength: chaptersData[0].content?.length || 0,
            hasContent: !!chaptersData[0].content,
            contentPreview: chaptersData[0].content?.substring(0, 100),
          });
        }

        setChapters(chaptersData);
        setError(null);
      } catch (err) {
        console.error("[ChapterList] Fetch error:", err);
        setError("加载章节失败，请重试");
      } finally {
        setLoading(false);
      }
    };

    if (workId) {
      fetchChapters();
    }
  }, [workId]);

  // 删除章节
  const handleDelete = async (chapterNumber: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!confirm(`确定要删除第${chapterNumber}章吗？此操作不可恢复。`)) {
      return;
    }

    try {
      const response = await fetch(`/api/chapters`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workId,
          chapterNumber,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete chapter");
      }

      // 从本地状态中移除
      setChapters((prev) =>
        prev.filter((ch) => ch.chapterNumber !== chapterNumber),
      );
    } catch (err) {
      console.error("[ChapterList] Delete error:", err);
      alert("删除失败，请重试");
    }
  };

  // 重新生成章节（占位）
  const handleRegenerate = async (chapter: Chapter, e: React.MouseEvent) => {
    e.stopPropagation();
    alert("重新生成功能开发中...");
    // TODO: 调用 useChapterGeneration 的 generateChapter
  };

  // 获取状态图标和颜色
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "completed":
        return {
          icon: CheckCircle,
          color: "text-green-500",
          bg: "bg-green-50 dark:bg-green-900/20",
        };
      case "generating":
        return {
          icon: Clock,
          color: "text-blue-500",
          bg: "bg-blue-50 dark:bg-blue-900/20",
        };
      case "failed":
        return {
          icon: AlertCircle,
          color: "text-red-500",
          bg: "bg-red-50 dark:bg-red-900/20",
        };
      default:
        return {
          icon: Clock,
          color: "text-gray-500",
          bg: "bg-gray-50 dark:bg-gray-800",
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-3 text-gray-600 dark:text-gray-400">加载中...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-3" />
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          重试
        </button>
      </div>
    );
  }

  if (chapters.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-3" />
        <p className="text-gray-600 dark:text-gray-400">暂无章节</p>
        <p className="text-sm text-gray-500 mt-1">开始生成您的长篇小说吧！</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-[450px] overflow-y-auto pr-2">
      {chapters.map((chapter) => {
        const StatusIcon = getStatusInfo(chapter.status || "draft").icon;
        const statusColor = getStatusInfo(chapter.status || "draft").color;
        const statusBg = getStatusInfo(chapter.status || "draft").bg;

        return (
          <div
            key={chapter.id}
            onClick={() => onChapterClick?.(chapter)}
            className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer ${
              // 🔥 选中状态的高亮样式
              selectedChapterId === chapter.id
                ? "border-primary bg-primary/5 dark:bg-primary/10 shadow-lg ring-2 ring-primary/30"
                : `hover:shadow-md ${statusBg} ${
                    chapter.status === "completed"
                      ? "border-green-200 dark:border-green-800 hover:border-green-300 dark:hover:border-green-700"
                      : chapter.status === "generating"
                        ? "border-blue-200 dark:border-blue-800 hover:border-blue-300 dark:hover:border-blue-700"
                        : chapter.status === "failed"
                          ? "border-red-200 dark:border-red-800 hover:border-red-300 dark:hover:border-red-700"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`
            }`}
          >
            {/* 章节头部 */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  第{chapter.chapterNumber}章
                </span>
                <StatusIcon className={`h-4 w-4 ${statusColor}`} />
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleRegenerate(chapter, e)}
                  className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                  title="重新生成"
                >
                  <RefreshCw className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </button>
                <button
                  onClick={(e) => handleDelete(chapter.chapterNumber, e)}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                  title="删除"
                >
                  <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                </button>
              </div>
            </div>

            {/* 章节标题 */}
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2">
              {chapter.title || `第${chapter.chapterNumber}章`}
            </h3>

            {/* 章节摘要 */}
            {chapter.summary && (
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                {chapter.summary}
              </p>
            )}

            {/* 底部信息 */}
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-3">
                <span>{chapter.wordCount || 0} 字</span>
                {chapter.updatedAt && (
                  <span>
                    {new Date(chapter.updatedAt).toLocaleDateString("zh-CN")}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>查看</span>
              </div>
            </div>

            {/* 生成中标记 */}
            {chapter.status === "generating" && (
              <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                  <span className="text-sm font-medium text-primary">
                    生成中...
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
