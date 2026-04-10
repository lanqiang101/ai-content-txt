import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FolderOpen, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useStore } from "../store/useStore";
import { Work, WorkStatus } from "../types";
import { WorkCard } from "../components/WorksPanel/WorkCard";
import { Button } from "../components/ui/Button";

const PAGE_SIZE = 10;

export const WorksListPage: React.FC = () => {
  const navigate = useNavigate();
  const { works, setCurrentWork, setParams, deleteWork } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<WorkStatus | "all">("all");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredWorks = works.filter((work) => {
    const matchSearch =
      !searchQuery ||
      work.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      work.topic?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = filterStatus === "all" || work.status === filterStatus;
    return matchSearch && matchStatus;
  });

  // 分页计算
  const totalPages = Math.ceil(filteredWorks.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedWorks = filteredWorks.slice(startIndex, startIndex + PAGE_SIZE);

  const handleSelectWork = (work: Work) => {
    setCurrentWork(work.id);
    setParams({
      type: work.type,
      topic: work.topic,
      title: work.title,
      keywords: work.keywords,
      wordCount: work.expectedWordCount,
    });
    navigate(`/works/${work.id}`);
  };

  const handleDeleteWork = (id: string) => {
    deleteWork(id);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl">
            <FolderOpen size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              作品管理
            </h1>
            <p className="text-sm text-gray-500">
              {filteredWorks.length} 个作品
            </p>
          </div>
        </div>
        <Button variant="secondary" onClick={() => navigate("/")}>
          <ChevronLeft size={16} />
          返回创作
        </Button>
      </div>

      {/* 搜索筛选 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-200/50 dark:border-slate-700/50">
        <div className="space-y-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索作品..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-800/80 text-gray-900 dark:text-gray-100"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            {(["all", "drafting", "completed", "archived"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
                  filterStatus === status
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-slate-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-700"
                }`}
              >
                {status === "all"
                  ? "全部"
                  : status === "drafting"
                    ? "创作中"
                    : status === "completed"
                      ? "已完成"
                      : "已归档"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 作品列表 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
        {filteredWorks.length === 0 ? (
          <div className="text-center py-16">
            <FolderOpen
              size={64}
              className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
            />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {works.length === 0 ? "暂无作品" : "没有找到匹配的作品"}
            </p>
            <p className="text-sm text-gray-400">生成内容后将自动保存为作品</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-slate-700">
            {paginatedWorks.map((work) => (
              <WorkCard
                key={work.id}
                work={work}
                onSelect={() => handleSelectWork(work)}
                onDelete={() => handleDeleteWork(work.id)}
              />
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <div className="text-sm text-gray-500">
              显示 {startIndex + 1}-{Math.min(startIndex + PAGE_SIZE, filteredWorks.length)} / 共 {filteredWorks.length} 条
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                <ChevronLeft size={16} />
                上一页
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                      currentPage === page
                        ? "bg-primary text-white"
                        : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
              <Button
                variant="secondary"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                下一页
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 使用提示 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
        <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
          💡 使用提示
        </h4>
        <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
          <li>• 作品会在内容生成完成后自动保存</li>
          <li>• 点击作品卡片可查看详情并加载参数到创作页</li>
          <li>• 支持搜索和状态筛选</li>
        </ul>
      </div>
    </div>
  );
};

export default WorksListPage;
