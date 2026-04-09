import React, { useState } from "react";
import { Search, Loader2, X, Sparkles, TrendingUp } from "lucide-react";
import { Tooltip } from "./Tooltip";
import { useRandomGenerate } from "../hooks/useRandomGenerate";

interface HotTopicSearchProps {
  onSelectTopic: (topic: string) => void;
}

const DEFAULT_HOT_TOPICS = [
  "重生回到大学时代",
  "职场逆袭",
  "甜宠霸总",
  "穿越古代",
  "末世生存",
  "悬疑推理",
  "系统流",
  "战神归来",
  "医武双绝",
  "萌宝",
];

export const HotTopicSearch: React.FC<HotTopicSearchProps> = ({ onSelectTopic }) => {
  const { generateCandidates, loading } = useRandomGenerate();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (loading) return;

    try {
      const searchResults = await generateCandidates(
        `搜索热门小说话题/热点关键词：${searchQuery.trim() || '热门小说主题'}`,
        `根据用户输入的关键词【${searchQuery.trim() || '热门小说主题'}】，搜索当前网络上的热门小说话题、热点事件、流行趋势。返回10个与小说创作相关的热门话题。要求：真实、有热度、适合改编成小说，格式要求简洁，每行一个主题。`,
        10
      );
      setResults(searchResults);
      setHasSearched(true);
      setShowResults(true);
    } catch (error) {
      console.error("Hot topic search failed:", error);
      alert("搜索失败: " + (error as Error).message);
    }
  };

  const handleGetHotTopics = async () => {
    if (loading) return;

    try {
      const hotTopics = await generateCandidates(
        "推荐当前热门的小说主题",
        `搜索当前网络上最热门的10个小说话题、热点事件、流行趋势。这些主题应该是：
1. 在番茄小说、起点中文网、晋江文学城等平台当前流行的
2. 具有高点击率和高读者粘性的
3. 适合改编成小说的热门题材
4. 包含当下社会热点元素

要求返回10个热门主题，每行一个，格式简洁明了。优先推荐：重生、系统、甜宠、职场、逆袭、悬疑、穿越等热门题材。`,
        10
      );
      setResults(hotTopics);
      setHasSearched(true);
      setShowResults(true);
    } catch (error) {
      console.error("Get hot topics failed:", error);
      setResults(DEFAULT_HOT_TOPICS);
      setShowResults(true);
    }
  };

  const handleSelect = (topic: string) => {
    onSelectTopic(topic);
    setShowResults(false);
    setSearchQuery("");
  };

  const handleClose = () => {
    setShowResults(false);
  };

  return (
    <div className="relative inline-block w-full">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="w-full pl-4 pr-10 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 bg-white/80 dark:bg-slate-700/80 text-gray-900 dark:text-gray-100"
            placeholder="搜索热门话题..."
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {loading ? (
              <Loader2 size={14} className="animate-spin text-gray-400" />
            ) : (
              <Search size={14} className="text-gray-400" />
            )}
          </div>
        </div>
        <Tooltip content="搜索热门话题">
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-3 py-2 text-sm bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-sm"
          >
            搜索
          </button>
        </Tooltip>
        <Tooltip content="获取热门推荐">
          <button
            onClick={handleGetHotTopics}
            disabled={loading}
            className="px-3 py-2 text-sm bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-all shadow-sm flex items-center gap-1"
          >
            <TrendingUp size={14} />
            热门推荐
          </button>
        </Tooltip>
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-600 p-3 z-50">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
              <Sparkles size={14} className="text-pink-500" />
              {hasSearched ? "推荐结果" : "热门主题"}
            </div>
            <button
              onClick={handleClose}
              className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"
            >
              <X size={14} />
            </button>
          </div>
          {results.length === 0 ? (
            <div className="text-sm text-gray-500 text-center py-4">
              {hasSearched ? "未找到相关话题" : "点击获取热门推荐"}
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {results.map((result, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(result)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-orange-50 dark:hover:bg-slate-700 text-sm text-gray-700 dark:text-gray-300 transition-all border border-transparent hover:border-orange-200 dark:hover:border-orange-500/30 flex items-center gap-2"
                >
                  <span className="w-5 h-5 flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full text-xs">
                    {index + 1}
                  </span>
                  {result}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
