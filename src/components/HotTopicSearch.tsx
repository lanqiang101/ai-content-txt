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
       const userInput = searchQuery.trim();
       const searchResults = await generateCandidates(
         `根据用户创意推荐2026年番茄热门小说主题`,
         `用户输入了一个关键词或创意方向：【${userInput || '热门小说'}】。
请基于这个方向，推荐**5个**当前2026年番茄小说平台热度最高、读者最喜爱的热门小说主题。
要求：
1. 必须贴合2026年最新热点，真正符合当下读者喜好
2. 不一定要把用户原话原封不动放进去，可以基于用户创意拓展出真正畅销热门主题
3. 每个主题一句话，简洁清晰，突出核心卖点和爽点
4. 必须是现在番茄读者愿意点击的热门题材

请直接返回5个主题，每行一个主题，不要其他内容。`,
         5
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
         "推荐2026年番茄热门的小说主题",
         `请推荐**5个**2026年番茄小说平台当前热度最高、读者最喜爱的热门小说主题。
要求：
1. 必须是2026年最新最畅销的热门题材
2. 具有高点击率、高完读率、高读者粘性
3. 符合当下读者喜好，突出爽点和钩子
4. 每个主题简洁一句话，直接列出

要求直接返回5个热门主题，每行一个。`,
         5
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
