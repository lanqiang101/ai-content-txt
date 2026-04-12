import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clapperboard,
  ChevronLeft,
  Search,
  Trash2,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExternalLink,
} from "lucide-react";
import { useStore } from "../store/useStore";
import { Button } from "../components/ui/Button";
import type { StoryboardResult, Work } from "../types";

const PAGE_SIZE = 10;

type FilterType = 'all' | 'drama' | 'comic';

export const StoryboardManagementPage: React.FC = () => {
  const navigate = useNavigate();
  const { storyboards, works, deleteStoryboard } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // 根据作品ID获取作品标题
  const getWorkTitle = (workId: string): string => {
    const work = works.find(w => w.id === workId);
    return work ? work.title : "未知作品";
  };

  // 格式化类型显示
  const formatType = (type: string): { label: string; color: string } => {
    if (type === 'drama') {
      return { label: '漫剧', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' };
    } else {
      return { label: '漫画', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' };
    }
  };

  // 筛选
  const filteredStoryboards = storyboards.filter((sb) => {
    const workTitle = getWorkTitle(sb.workId).toLowerCase();
    const matchSearch = !searchQuery || workTitle.includes(searchQuery.toLowerCase());
    const matchType = filterType === 'all' || sb.config.type === filterType;
    return matchSearch && matchType;
  });

  // 分页计算
  const totalPages = Math.ceil(filteredStoryboards.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedStoryboards = filteredStoryboards.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个分镜吗？删除后无法恢复。")) {
      deleteStoryboard(id);
    }
  };

  const handleView = (sb: StoryboardResult) => {
    navigate(`/storyboard?workId=${sb.workId}&storyboardId=${sb.id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl">
            <Clapperboard size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              分镜管理
            </h1>
            <p className="text-sm text-gray-500">
              {filteredStoryboards.length} 个分镜项目
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate("/")}>
            <ChevronLeft size={16} />
            返回
          </Button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-200/50 dark:border-slate-700/50">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索关联作品标题..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-800/80 text-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-lg border transition-all ${
                filterType === 'all'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 dark:border-slate-600"
              }`}
              onClick={() => setFilterType('all')}
            >
              全部
            </button>
            <button
              className={`px-4 py-2 rounded-lg border transition-all ${
                filterType === 'drama'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 dark:border-slate-600"
              }`}
              onClick={() => setFilterType('drama')}
            >
              漫剧
            </button>
            <button
              className={`px-4 py-2 rounded-lg border transition-all ${
                filterType === 'comic'
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gray-200 dark:border-slate-600"
              }`}
              onClick={() => setFilterType('comic')}
            >
              漫画
            </button>
          </div>
        </div>
      </div>

      {/* 分镜列表 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
        {filteredStoryboards.length === 0 ? (
          <div className="text-center py-16">
            <Clapperboard
              size={64}
              className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
            />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {storyboards.length === 0 ? "暂无分镜" : "没有找到匹配的分镜"}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50">
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                      关联作品
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                      类型
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                      美术风格
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                      章节
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                      分镜数量
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                      创建时间
                    </th>
                    <th className="text-right px-6 py-3 text-sm font-medium text-gray-600 dark:text-gray-300">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStoryboards.map((sb) => {
                    const typeInfo = formatType(sb.config.type);
                    return (
                      <tr
                        key={sb.id}
                        className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {getWorkTitle(sb.workId)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2 py-1 rounded ${typeInfo.color}`}>
                            {typeInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {sb.config.artStyle || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {sb.chapterNumber || "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {sb.scenes.length}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {new Date(sb.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleView(sb)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                              title="查看"
                            >
                              <ExternalLink size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(sb.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                              title="删除"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700">
                <div className="text-sm text-gray-500">
                  显示 {startIndex + 1}-
                  {Math.min(startIndex + PAGE_SIZE, filteredStoryboards.length)} / 共{" "}
                  {filteredStoryboards.length} 个
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                  >
                    <ChevronLeftIcon size={16} />
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
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                  >
                    下一页
                    <ChevronRightIcon size={16} />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* 使用提示 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
        <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">
          🎬 分镜说明
        </h4>
        <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
          <li>• 管理所有作品生成的漫剧/漫画分镜</li>
          <li>• 支持按类型筛选（漫剧/漫画）</li>
          <li>• 点击查看可跳转到分镜生成页面查看详情</li>
          <li>• 漫剧 = 动态视频分镜，适合生成短视频；漫画 = 静态分镜，适合生成漫画图片</li>
        </ul>
      </div>
    </div>
  );
};

export default StoryboardManagementPage;
