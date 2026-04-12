import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, ChevronLeft, Search, Plus, Trash2, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useStore } from "../store/useStore";
import { Character } from "../types";
import { Button } from "../components/ui/Button";

const PAGE_SIZE = 12;

export const CharacterListPage: React.FC = () => {
  const navigate = useNavigate();
  const { characters, deleteCharacter } = useStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredCharacters = characters.filter((character) => {
    const matchSearch =
      !searchQuery ||
      character.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  // 分页计算
  const totalPages = Math.ceil(filteredCharacters.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const paginatedCharacters = filteredCharacters.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const handleDelete = (id: string) => {
    if (confirm("确定要删除这个角色吗？")) {
      deleteCharacter(id);
    }
  };

  const formatGender = (role: string) => {
    return role === "main" ? "主角" : "配角";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl">
            <User size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              角色管理
            </h1>
            <p className="text-sm text-gray-500">
              {filteredCharacters.length} 个角色
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => navigate("/")}>
            <ChevronLeft size={16} />
            返回
          </Button>
          <Button variant="primary" onClick={() => navigate("/characters/new")}>
            <Plus size={16} className="mr-1" />
            新建角色
          </Button>
        </div>
      </div>

      {/* 搜索 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 mb-6 border border-gray-200/50 dark:border-slate-700/50">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索角色名称..."
            className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-800/80 text-gray-900 dark:text-gray-100"
          />
        </div>
      </div>

      {/* 角色列表 */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200/50 dark:border-slate-700/50 overflow-hidden">
        {filteredCharacters.length === 0 ? (
          <div className="text-center py-16">
            <User
              size={64}
              className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
            />
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              {characters.length === 0 ? "暂无角色" : "没有找到匹配的角色"}
            </p>
            <Button variant="primary" onClick={() => navigate("/characters/new")}>
              <Plus size={16} className="mr-1" />
              创建第一个角色
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {paginatedCharacters.map((character) => (
              <div
                key={character.id}
                className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-gray-100">
                      {character.name}
                    </h3>
                    <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 rounded text-xs">
                      {formatGender(character.role)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDelete(character.id)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                {character.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                    {character.description}
                  </p>
                )}

                {character.appearance && (
                  <div className="text-xs text-gray-500 mb-1">
                    <span className="font-medium">外貌：</span> {character.appearance}
                  </div>
                )}

                <div className="text-xs text-gray-400 mt-3">
                  创建于 {new Date(character.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-slate-700">
            <div className="text-sm text-gray-500">
              显示 {startIndex + 1}-
              {Math.min(startIndex + PAGE_SIZE, filteredCharacters.length)} / 共{" "}
              {filteredCharacters.length} 个
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
      </div>

      {/* 使用提示 */}
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
        <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">
          👤 角色说明
        </h4>
        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
          <li>• 存储小说角色设定，方便复用和管理</li>
          <li>• 可以在创作时引用角色设定</li>
          <li>• 支持搜索和分页管理</li>
        </ul>
      </div>
    </div>
  );
};

export default CharacterListPage;
