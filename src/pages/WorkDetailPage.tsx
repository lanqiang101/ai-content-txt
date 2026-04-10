import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, FileText, Copy, Download, Check } from "lucide-react";
import { useStore } from "../store/useStore";
import { Work } from "../types";
import { Button } from "../components/ui/Button";

export const WorkDetailPage: React.FC = () => {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();
  const { works, setCurrentWork, setParams } = useStore();
  const [copied, setCopied] = useState(false);

  const work = works.find(w => w.id === workId);

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
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => navigate("/works")}>
            <ChevronLeft size={16} />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              {work.title || "(无标题)"}
            </h1>
            <p className="text-sm text-gray-500">
              ID: {work.id.slice(0, 8)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* 作品信息卡片 */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 border border-gray-200/50 dark:border-slate-700/50">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">
              作品信息
            </h3>

            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">状态</div>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${statusColor[work.status]}`}>
                  {statusText[work.status]}
                </span>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">类型</div>
                <div className="font-medium text-gray-800 dark:text-gray-100">
                  {work.type === "article" ? "公众号文章" : "小说"}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">主题</div>
                <div className="font-medium text-gray-800 dark:text-gray-100 break-words">
                  {work.topic || "-"}
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">关键词</div>
                <div className="font-medium text-gray-800 dark:text-gray-100 break-words">
                  {work.keywords || "-"}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">期望字数</div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">
                    {work.expectedWordCount.toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">实际字数</div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">
                    {work.actualWordCount.toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-gray-500 mb-1">创建时间</div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">
                    {new Date(work.createdAt).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">更新时间</div>
                  <div className="font-medium text-gray-800 dark:text-gray-100">
                    {new Date(work.updatedAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {work.generationParams && (
                <div>
                  <div className="text-xs text-gray-500 mb-1">创作参数</div>
                  <details className="text-sm">
                    <summary className="cursor-pointer text-gray-600 dark:text-gray-400 hover:text-primary">
                      查看参数详情
                    </summary>
                    <div className="mt-2 p-3 bg-gray-50 dark:bg-slate-700/50 rounded-lg text-xs text-gray-600 dark:text-gray-400 whitespace-pre-wrap max-h-48 overflow-y-auto">
                      {JSON.stringify(work.generationParams, null, 2)}
                    </div>
                  </details>
                </div>
              )}
            </div>

            <div className="mt-6 space-y-3">
              <Button className="w-full" onClick={handleLoadToEditor}>
                <FileText size={16} />
                加载到编辑器
              </Button>
            </div>
          </div>
        </div>

        {/* 内容预览 */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100">
                内容预览
              </h3>
              {work.content && (
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleCopyContent}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? "已复制" : "复制"}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleDownloadContent}
                  >
                    <Download size={16} />
                    导出
                  </Button>
                </div>
              )}
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {work.content ? (
                <div className="prose dark:prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-gray-700 dark:text-gray-300 leading-relaxed m-0 bg-transparent p-0">
                    {work.content}
                  </pre>
                </div>
              ) : (
                <div className="text-center py-16 text-gray-500">
                  <FileText size={48} className="mx-auto mb-3 opacity-30" />
                  <p>暂无内容</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkDetailPage;
