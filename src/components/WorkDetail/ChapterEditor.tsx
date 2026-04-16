import React, { useState, useEffect } from "react";
import { Save, Sparkles, Loader2 } from "lucide-react";
import { Button } from "../../components/ui/Button";
import { Chapter } from "../../types";
import { updateChapter } from "../../services/db";

interface ChapterEditorProps {
  chapter: Chapter | null;
  workId: string;
  onSave?: (chapter: Chapter) => void;
  onOptimize?: (chapterId: string, content: string) => Promise<string>;
}

export const ChapterEditor: React.FC<ChapterEditorProps> = ({
  chapter,
  workId,
  onSave,
  onOptimize,
}) => {
  const [content, setContent] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // 当章节切换时，更新编辑器内容
  useEffect(() => {
    if (chapter) {
      setContent(chapter.content || "");
      setSaveSuccess(false);
    } else {
      setContent("");
    }
  }, [chapter]);

  // 保存章节
  const handleSave = async () => {
    if (!chapter) return;

    setIsSaving(true);
    try {
      const updates = {
        content,
        wordCount: content.length,
        updatedAt: Date.now(),
      };

      await updateChapter(chapter.id, updates);
      
      const updatedChapter = {
        ...chapter,
        ...updates,
      };
      
      if (onSave) {
        onSave(updatedChapter);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (error) {
      console.error("保存章节失败:", error);
      alert("保存失败，请重试");
    } finally {
      setIsSaving(false);
    }
  };

  // AI优化章节
  const handleOptimize = async () => {
    if (!chapter || !onOptimize) return;

    if (!content.trim()) {
      alert("章节内容为空，无法优化");
      return;
    }

    setIsOptimizing(true);
    try {
      const optimizedContent = await onOptimize(chapter.id, content);
      setContent(optimizedContent);
    } catch (error) {
      console.error("AI优化失败:", error);
      alert("AI优化失败，请重试");
    } finally {
      setIsOptimizing(false);
    }
  };

  if (!chapter) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>请选择一个章节进行编辑</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 章节标题栏 */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
        <div>
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
            第{chapter.chapterNumber}章：{chapter.title || "(无标题)"}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {content.length} 字
          </p>
        </div>
        <div className="flex gap-2">
          {onOptimize && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleOptimize}
              disabled={isOptimizing || !content.trim()}
            >
              {isOptimizing ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  优化中...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  AI优化
                </>
              )}
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                保存中...
              </>
            ) : saveSuccess ? (
              <>
                <Check size={16} />
                已保存
              </>
            ) : (
              <>
                <Save size={16} />
                保存
              </>
            )}
          </Button>
        </div>
      </div>

      {/* 编辑区 */}
      <div className="flex-1 overflow-y-auto p-6">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="在此编辑章节内容..."
          className="w-full h-full min-h-[400px] resize-none bg-transparent border-0 focus:ring-0 text-gray-800 dark:text-gray-200 leading-relaxed text-base"
          style={{ fontFamily: "'Noto Serif SC', serif" }}
        />
      </div>
    </div>
  );
};
