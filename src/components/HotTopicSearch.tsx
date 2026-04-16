import React, { useState } from "react";
import { Search, TrendingUp, Sparkles, Loader2, X, AlertCircle } from "lucide-react";
import { Tooltip } from "./Tooltip";
import { useHotTopics } from "../hooks/useHotTopics";
import { useNavigate } from "react-router-dom";

interface HotTopicSearchProps {
  onSelectTopic: (topic: string) => void;
}

const DEFAULT_HOT_TOPICS = [
  "废柴逆袭：获得神级系统，一路开挂",
  "穿越重生：回到过去改写人生",
  "都市修仙：隐世高手重返都市",
  "甜宠娇妻：霸总老公轻点宠",
  "悬疑推理：连环谜案背后的真相"
];

export const HotTopicSearch: React.FC<HotTopicSearchProps> = ({ onSelectTopic }) => {
  const navigate = useNavigate();
  const { generateHotTopics, loading, hasConfig } = useHotTopics();
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (loading) return;

    if (!hasConfig) {
      alert("未配置热门主题推荐模型\n\n请前往：系统配置 > 热门主题 > 选择一个模型");
      navigate("/config");
      return;
    }

    try {
      const userInput = searchQuery.trim();
      const searchResults = await generateHotTopics(userInput || undefined);
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

    if (!hasConfig) {
      alert("未配置热门主题推荐模型\n\n请前往：系统配置 > 热门主题 > 选择一个模型");
      navigate("/config");
      return;
    }

    try {
      const hotTopics = await generateHotTopics();
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

  // 如果未配置模型，显示提示
  if (!hasConfig) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-2 px-4 py-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <AlertCircle size={16} className="text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            未配置热门主题模型，请前往{" "}
            <button
              onClick={() => navigate("/config")}
              className="underline hover:text-yellow-800 dark:hover:text-yellow-200 font-medium"
            >
              系统配置
            </button>
            {" "}设置
          </p>
        </div>
      </div>
    );
  }

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
