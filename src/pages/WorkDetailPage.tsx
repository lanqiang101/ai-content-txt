import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, FileText, Copy, Download, Check, Plus } from "lucide-react";
import { useStore } from "../store/useStore";
import { Work, Chapter } from "../types";
import { Button } from "../components/ui/Button";
import { ChapterSidebar } from "../components/WorkDetail/ChapterSidebar";
import { ChapterEditor } from "../components/WorkDetail/ChapterEditor";
import { ContinuationDialog } from "../components/WorkDetail/ContinuationDialog";
import { getWorkChapters, addChapter, updateChapter as updateChapterAPI } from "../services/db";

export const WorkDetailPage: React.FC = () => {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();
  const { works, setCurrentWork, setParams } = useStore();
  const [copied, setCopied] = useState(false);
  
  // 章节管理状态
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [currentChapterId, setCurrentChapterId] = useState<string | null>(null);
  const [showContinuationDialog, setShowContinuationDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const work = works.find(w => w.id === workId);

  // 加载章节列表
  useEffect(() => {
    if (workId) {
      loadChapters();
    }
  }, [workId]);

  const loadChapters = async () => {
    if (!workId) return;
    
    setIsLoading(true);
    try {
      const chapterList = await getWorkChapters(workId);
      setChapters(chapterList);
      
      // 默认选中第一章
      if (chapterList.length > 0 && !currentChapterId) {
        setCurrentChapterId(chapterList[0].id);
      }
    } catch (error) {
      console.error("加载章节失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 获取当前选中的章节
  const currentChapter = chapters.find(c => c.id === currentChapterId) || null;

  if (!work) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
            作品不存在
          </h2>
          <Button onClick={() => navigate("/works")}>
            <ChevronLeft size={16} />
            返回作品列表
          </Button>
        </div>
      </div>
    );
  }

  const handleLoadToEditor = () => {
    setCurrentWork(work.id);
    setParams({
      type: work.type,
      topic: work.topic,
      title: work.title,
      keywords: work.keywords,
      wordCount: work.expectedWordCount,
    });
    navigate("/");
  };

  const handleCopyContent = async () => {
    if (work.content) {
      await navigator.clipboard.writeText(work.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadContent = () => {
    if (!work.content) return;
    const blob = new Blob([work.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${work.title.replace(/\s+/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // 处理章节保存
  const handleSaveChapter = async (updatedChapter: Chapter) => {
    setChapters(prev => 
      prev.map(c => c.id === updatedChapter.id ? updatedChapter : c)
    );
  };

  // 处理AI优化（TODO: 实现实际的AI优化逻辑）
  const handleOptimizeChapter = async (chapterId: string, content: string): Promise<string> => {
    // TODO: 调用AI优化API
    console.log("优化章节:", chapterId);
    return new Promise((resolve) => {
      setTimeout(() => {
        // 模拟优化结果
        resolve(content + "\n\n[AI优化后的内容将显示在这里]");
      }, 2000);
    });
  };

  // 处理续写
  const handleContinuation = async (chapterCount: number) => {
    if (!workId) return;
    
    try {
      const lastChapter = chapters[chapters.length - 1];
      const startNumber = lastChapter ? lastChapter.chapterNumber + 1 : 1;
      
      // 批量创建新章节
      for (let i = 0; i < chapterCount; i++) {
        const newChapter: Omit<Chapter, 'id'> = {
          workId,
          chapterNumber: startNumber + i,
          title: `第${startNumber + i}章`,
          content: "",
          wordCount: 0,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        
        await addChapter(newChapter);
      }
      
      // 重新加载章节列表
      await loadChapters();
    } catch (error) {
      console.error("续写失败:", error);
      alert("续写失败，请重试");
    }
  };

  const statusText = {
    drafting: "创作中",
    completed: "已完成",
    failed: "创作失败",
    archived: "已归档",
  };

  const statusColor = {
    drafting: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
    completed: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
    archived: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-slate-900">
      {/* 顶部导航栏 */}
      <div className="flex items-center justify-between px-6 py-4 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate("/works")}>
            <ChevronLeft size={16} />
            返回
          </Button>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
              {work.title || "(无标题)"}
            </h1>
            <p className="text-xs text-gray-500">
              ID: {work.id.slice(0, 8)} • {statusText[work.status]}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={() => setShowContinuationDialog(true)}>
            <Plus size={16} />
            续写
          </Button>
          <Button variant="secondary" size="sm" onClick={handleLoadToEditor}>
            <FileText size={16} />
            加载到编辑器
          </Button>
        </div>
      </div>

      {/* 主体内容区 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧章节列表 */}
        <div className="w-64 flex-shrink-0">
          <ChapterSidebar
            chapters={chapters}
            currentChapterId={currentChapterId}
            onSelectChapter={setCurrentChapterId}
          />
        </div>

        {/* 右侧编辑器 */}
        <div className="flex-1 bg-white dark:bg-slate-800">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-500">加载中...</p>
            </div>
          ) : (
            <ChapterEditor
              chapter={currentChapter}
              workId={workId!}
              onSave={handleSaveChapter}
              onOptimize={handleOptimizeChapter}
            />
          )}
        </div>
      </div>

      {/* 续写对话框 */}
      <ContinuationDialog
        isOpen={showContinuationDialog}
        onClose={() => setShowContinuationDialog(false)}
        onConfirm={handleContinuation}
        currentChapterCount={chapters.length}
      />
    </div>
  );
};

export default WorkDetailPage;