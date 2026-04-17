import React, { useState } from "react";
import { X, FileText, Download, Plus, ChevronRight, Clock } from "lucide-react";
import { Work, Chapter } from "../../types";
import { useStore } from "../../store/useStore";
import { useChapterGeneration } from "../../hooks/useChapterGeneration";

interface WorkDetailProps {
  work: Work;
  onClose: () => void;
  onLoad: () => void;
}

export const WorkDetail: React.FC<WorkDetailProps> = ({
  work,
  onClose,
  onLoad,
}) => {
  const [activeTab, setActiveTab] = useState<"info" | "chapters">("chapters");
  const { works } = useStore();
  const { startChapterGeneration } = useChapterGeneration();
  const [isContinuing, setIsContinuing] = useState(false);

  // 🔥 下载全本小说功能
  const handleDownloadNovel = async () => {
    try {
      // 获取当前作品的所有章节
      const currentWork = works.find((w) => w.id === work.id);
      if (
        !currentWork ||
        !currentWork.chapters ||
        currentWork.chapters.length === 0
      ) {
        alert("该作品暂无章节内容");
        return;
      }

      // 按章节号排序
      const sortedChapters = [...currentWork.chapters].sort(
        (a, b) => a.chapterNumber - b.chapterNumber,
      );

      // 构建小说文本
      let novelContent = `${work.title || "未命名作品"}\n\n`;
      novelContent += `作者：AI创作助手\n`;
      novelContent += `类型：${work.type === "article" ? "公众号文章" : "小说"}\n`;
      novelContent += `总字数：${work.actualWordCount.toLocaleString()} 字\n`;
      novelContent += `生成时间：${new Date(work.createdAt).toLocaleString("zh-CN")}\n\n`;
      novelContent += "=".repeat(50) + "\n\n";

      sortedChapters.forEach((chapter, index) => {
        novelContent += `第${chapter.chapterNumber}章 ${chapter.title}\n\n`;
        novelContent += chapter.content || "";
        novelContent += "\n\n";

        // 章节之间添加分隔线（最后一章不加）
        if (index < sortedChapters.length - 1) {
          novelContent += "-".repeat(30) + "\n\n";
        }
      });

      // 创建 Blob 并下载
      const blob = new Blob([novelContent], {
        type: "text/plain;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${work.title || "未命名作品"}_完整版.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log("[WorkDetail] ✅ 小说下载成功");
    } catch (error) {
      console.error("[WorkDetail] ❌ 下载失败:", error);
      alert("下载失败，请重试");
    }
  };

  // 🔥 续写后续章节功能
  const handleContinueWriting = async (chapterCount: number = 1) => {
    if (isContinuing) {
      alert("正在生成中，请等待完成");
      return;
    }

    const confirmed = window.confirm(
      `确定要续写 ${chapterCount} 章吗？\n\n` +
        `系统将根据已有的人物设定、情节走向和世界观，\n` +
        `保持故事连贯性地继续创作。`,
    );

    if (!confirmed) return;

    setIsContinuing(true);

    try {
      // 获取当前作品的生成参数
      const currentWork = works.find((w) => w.id === work.id);
      if (!currentWork || !currentWork.generationParams) {
        alert("无法获取作品参数");
        setIsContinuing(false);
        return;
      }

      const params = currentWork.generationParams;

      // 计算续写章节的目标字数
      const wordsPerChapter = Math.ceil(
        params.wordCount / (currentWork.chapterCount || 8),
      );

      // 生成章节大纲（简化版，仅包含序号和目标字数）
      const startChapterNum = (currentWork.chapters?.length || 0) + 1;
      const outlines = [];

      for (let i = 0; i < chapterCount; i++) {
        outlines.push({
          chapterNumber: startChapterNum + i,
          title: `第${startChapterNum + i}章`,
          summary: "", // 由AI自动生成
          targetWordCount: wordsPerChapter,
          status: "pending" as const,
        });
      }

      console.log("[WorkDetail] 📝 开始续写章节:", outlines);
      console.log("[WorkDetail] 📊 使用参数:", {
        topic: params.topic,
        keywords: params.keywords,
        wordCount: params.wordCount,
        wordsPerChapter,
      });

      // 调用章节生成函数
      await startChapterGeneration(params, work.id, outlines);

      console.log("[WorkDetail] ✅ 续写完成");
    } catch (error) {
      console.error("[WorkDetail] ❌ 续写失败:", error);
      alert(
        `续写失败: ${error instanceof Error ? error.message : String(error)}`,
      );
    } finally {
      setIsContinuing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
              {work.title || "(无标题)"}
            </h3>
            <span className="text-sm text-gray-50">#{work.id.slice(0, 8)}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex border-b border-gray-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("chapters")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "chapters"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            章节列表
          </button>
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "info"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            作品信息
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === "chapters" ? (
            <div className="space-y-3">
              {/* 续写按钮 */}
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => handleContinueWriting(1)}
                  disabled={isContinuing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed rounded-lg transition-all"
                >
                  <Plus size={16} />
                  {isContinuing ? "生成中..." : "续写1章"}
                </button>
                <button
                  onClick={() => handleContinueWriting(3)}
                  disabled={isContinuing}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed rounded-lg transition-all"
                >
                  <Plus size={16} />
                  {isContinuing ? "生成中..." : "续写3章"}
                </button>
              </div>

              {/* 章节列表 */}
              {work.chapters && work.chapters.length > 0 ? (
                [...work.chapters]
                  .sort((a, b) => a.chapterNumber - b.chapterNumber)
                  .map((chapter: Chapter) => (
                    <div
                      key={chapter.id}
                      className="p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                            第{chapter.chapterNumber}章
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                            {chapter.status === "completed"
                              ? "已完成"
                              : chapter.status || "草稿"}
                          </span>
                        </div>
                        <ChevronRight size={16} className="text-gray-400" />
                      </div>

                      <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">
                        {chapter.title || `第${chapter.chapterNumber}章`}
                      </h4>

                      {chapter.summary && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {chapter.summary}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-3">
                          <span>
                            {chapter.wordCount?.toLocaleString() || 0} 字
                          </span>
                          {chapter.createdAt && (
                            <span className="flex items-center gap-1">
                              <Clock size={12} />
                              {new Date(chapter.createdAt).toLocaleDateString(
                                "zh-CN",
                                {
                                  year: "numeric",
                                  month: "2-digit",
                                  day: "2-digit",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileText size={48} className="mx-auto mb-3 opacity-30" />
                  <p>暂无章节</p>
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">类型</div>
                <div className="font-medium">
                  {work.type === "article" ? "公众号文章" : "小说"}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">状态</div>
                <div className="font-medium">{work.status}</div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">期望字数</div>
                <div className="font-medium">
                  {work.expectedWordCount.toLocaleString()}
                </div>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">实际字数</div>
                <div className="font-medium">
                  {work.actualWordCount.toLocaleString()}
                </div>
              </div>
              <div className="col-span-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="text-xs text-gray-50 mb-1">主题</div>
                <div className="font-medium">{work.topic || "-"}</div>
              </div>
              <div className="col-span-2 p-3 bg-gray-50 dark:bg-slate-70/50 rounded-lg">
                <div className="text-xs text-gray-500 mb-1">关键词</div>
                <div className="font-medium">{work.keywords || "-"}</div>
              </div>
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
            onClick={handleDownloadNovel}
            disabled={!work.chapters || work.chapters.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
            title={
              !work.chapters || work.chapters.length === 0
                ? "暂无章节内容"
                : "下载全本小说"
            }
          >
            <Download size={16} />
            下载全本
          </button>
          <button
            onClick={onLoad}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg"
          >
            <FileText size={16} />
            加载此作品
          </button>
        </div>
      </div>
    </div>
  );
};
