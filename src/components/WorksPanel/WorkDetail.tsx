import React, { useState } from "react";
import { X, FileText, Download } from "lucide-react";
import { Work } from "../../types";
import { useStore } from "../../store/useStore";

interface WorkDetailProps {
  work: Work;
  onClose: () => void;
  onLoad: () => void;
}

export const WorkDetail: React.FC<WorkDetailProps> = ({ work, onClose, onLoad }) => {
  const [activeTab, setActiveTab] = useState<"info" | "content">("info");
  const { works } = useStore();

  // 🔥 下载全本小说功能
  const handleDownloadNovel = async () => {
    try {
      // 获取当前作品的所有章节
      const currentWork = works.find(w => w.id === work.id);
      if (!currentWork || !currentWork.chapters || currentWork.chapters.length === 0) {
        alert('该作品暂无章节内容');
        return;
      }

      // 按章节号排序
      const sortedChapters = [...currentWork.chapters].sort((a, b) => 
        a.chapterNumber - b.chapterNumber
      );

      // 构建小说文本
      let novelContent = `${work.title || '未命名作品'}\n\n`;
      novelContent += `作者：AI创作助手\n`;
      novelContent += `类型：${work.type === 'article' ? '公众号文章' : '小说'}\n`;
      novelContent += `总字数：${work.actualWordCount.toLocaleString()} 字\n`;
      novelContent += `生成时间：${new Date(work.createdAt).toLocaleString('zh-CN')}\n\n`;
      novelContent += '='.repeat(50) + '\n\n';

      sortedChapters.forEach((chapter, index) => {
        novelContent += `第${chapter.chapterNumber}章 ${chapter.title}\n\n`;
        novelContent += chapter.content || '';
        novelContent += '\n\n';
        
        // 章节之间添加分隔线（最后一章不加）
        if (index < sortedChapters.length - 1) {
          novelContent += '-'.repeat(30) + '\n\n';
        }
      });

      // 创建 Blob 并下载
      const blob = new Blob([novelContent], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${work.title || '未命名作品'}_完整版.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('[WorkDetail] ✅ 小说下载成功');
    } catch (error) {
      console.error('[WorkDetail] ❌ 下载失败:', error);
      alert('下载失败，请重试');
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
            onClick={() => setActiveTab("info")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "info"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            作品信息
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === "content"
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            内容预览
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === "info" ? (
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
            onClick={handleDownloadNovel}
            disabled={!work.chapters || work.chapters.length === 0}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg transition-colors"
            title={!work.chapters || work.chapters.length === 0 ? '暂无章节内容' : '下载全本小说'}
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
