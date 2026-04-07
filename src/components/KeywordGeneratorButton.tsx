import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Dice1, Loader2, X, Sparkles, Check } from "lucide-react";
import { useRandomGenerate } from "../hooks/useRandomGenerate";

interface KeywordGeneratorButtonProps {
  topic: string;
  title: string;
  currentKeywords: string;
  onSelect: (keywords: string) => void;
  className?: string;
}

export const KeywordGeneratorButton: React.FC<KeywordGeneratorButtonProps> = ({
  topic,
  title,
  currentKeywords,
  onSelect,
  className = "",
}) => {
  const { generateCandidates, loading } = useRandomGenerate();
  const [open, setOpen] = useState(false);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [selectedKeywords, setSelectedKeywords] = useState<Set<string>>(
    new Set(),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 320 });

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // 弹窗向右对齐，在按钮下方
      setPosition({
        top: rect.bottom + 8,
        left: rect.right - position.width,
        width: position.width,
      });
    }
  };

  const parseCurrentKeywords = (): string[] => {
    if (!currentKeywords.trim()) return [];
    return currentKeywords
      .split(",")
      .map((k) => k.trim())
      .filter((k) => k.length > 0);
  };

  const handleGenerate = async (optimize: boolean) => {
    try {
      let fieldDescription = "关键词";
      let rules = `根据主题【${topic}】和标题【${title}】生成相关关键词`;

      if (optimize && currentKeywords.trim()) {
        const existing = parseCurrentKeywords();
        fieldDescription = `优化和扩展关键词，已有关键词：${existing.join(", ")}`;
        rules = `基于已有关键词，结合主题【${topic}】和标题【${title}】进行联想扩展和优化，补充更多相关关键词，总共生成10个关键词`;
      } else if (!topic.trim() && !title.trim()) {
        fieldDescription = "通用关键词";
        rules = "生成10个通用小说关键词";
      }

      rules += `\n要求：\n- 必须生成正好10个关键词\n- 每个关键词1-4个字\n- 关键词必须紧扣主题和标题\n- 每个关键词单独一个条目\n- 返回正好10个`;

      const results = await generateCandidates(fieldDescription, rules, 10);
      setKeywords(results.slice(0, 10));
      // 初始化选中为空
      setSelectedKeywords(new Set());
      updatePosition();
      setOpen(true);
    } catch (error) {
      console.error("Keyword generation failed:", error);
      alert("关键词生成失败: " + (error as Error).message);
    }
  };

  const toggleKeyword = (keyword: string) => {
    const newSelected = new Set(selectedKeywords);
    if (newSelected.has(keyword)) {
      newSelected.delete(keyword);
    } else {
      newSelected.add(keyword);
    }
    setSelectedKeywords(newSelected);
  };

  const handleConfirm = () => {
    if (selectedKeywords.size === 0) {
      alert("请至少选择一个关键词");
      return;
    }
    const selectedArray = Array.from(selectedKeywords);
    onSelect(selectedArray.join(", "));
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
  };

  // 更新位置当窗口滚动或 resize
  useEffect(() => {
    if (open) {
      const handleUpdate = () => updatePosition();
      window.addEventListener("scroll", handleUpdate, true);
      window.addEventListener("resize", handleUpdate);
      return () => {
        window.removeEventListener("scroll", handleUpdate, true);
        window.removeEventListener("resize", handleUpdate);
      };
    }
    return undefined;
  }, [open]);

  const isLoading = loading;
  const hasExistingKeywords = !!currentKeywords.trim();

  return (
    <div
      className={`relative inline-flex items-center gap-1 ${className}`}
      ref={containerRef}
    >
      {/* 重新生成按钮 */}
      <button
        onClick={() => handleGenerate(false)}
        disabled={isLoading}
        className="
          flex items-center justify-center w-7 h-7 rounded-full
          bg-gradient-to-br from-slate-500 to-slate-600
          hover:from-slate-600 hover:to-slate-700
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all shadow-sm hover:shadow-md
          text-white
        "
        title="重新生成关键词"
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Dice1 size={14} />
        )}
      </button>

      {/* 联想优化按钮 */}
      <button
        onClick={() => handleGenerate(true)}
        disabled={isLoading || !hasExistingKeywords}
        className="
          flex items-center justify-center w-7 h-7 rounded-full
          bg-gradient-to-br from-blue-500 to-purple-500
          hover:from-blue-600 hover:to-purple-600
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all shadow-sm hover:shadow-md
          text-white
        "
        title="基于已有关键词联想优化"
      >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Sparkles size={14} />
        )}
      </button>

      {open &&
        keywords.length > 0 &&
        createPortal(
          <>
            <div
              className="fixed inset-0 bg-black/20 z-[99]"
              onClick={handleClose}
            />
            <div
              className="fixed bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-600 p-3 z-[100]"
              style={{
                top: position.top,
                left: position.left,
                width: position.width,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 px-1">
                  选择关键词（可多选，{keywords.length}条）：
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2 mb-3 max-h-60 overflow-y-auto">
                {keywords.map((keyword, index) => (
                  <button
                    key={index}
                    onClick={() => toggleKeyword(keyword)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm transition-all border
                      ${
                        selectedKeywords.has(keyword)
                          ? "bg-primary/10 border-primary text-primary"
                          : "bg-gray-50 dark:bg-slate-700 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-purple-300 dark:hover:border-purple-500/30"
                      }
                    `}
                  >
                    <span className="flex items-center gap-1">
                      {selectedKeywords.has(keyword) && <Check size={14} />}
                      {keyword}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-slate-700">
                <button
                  onClick={handleConfirm}
                  disabled={selectedKeywords.size === 0}
                  className="
                    px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium
                    hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed
                    transition-all shadow-sm hover:shadow-md
                  "
                >
                  确认选择
                  {selectedKeywords.size > 0
                    ? ` (${selectedKeywords.size})`
                    : ""}
                </button>
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};
