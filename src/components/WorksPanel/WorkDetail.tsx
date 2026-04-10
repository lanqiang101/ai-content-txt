import React, { useState } from "react";
import { X, FileText } from "lucide-react";
import { Work } from "../../types";

interface WorkDetailProps {
  work: Work;
  onClose: () => void;
  onLoad: () => void;
}

export const WorkDetail: React.FC<WorkDetailProps> = ({ work, onClose, onLoad }) => {
  const [activeTab, setActiveTab] = useState<"info" | "content">("info");

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
