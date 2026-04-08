import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Dice1, Loader2, X, Sparkles } from "lucide-react";
import { useRandomGenerate } from "../hooks/useRandomGenerate";
import { Tooltip } from "./Tooltip";

interface RandomButtonProps {
  fieldDescription: string;
  rules: string;
  count?: number;
  onSelect: (value: string) => void;
  className?: string;
}

export const RandomButton: React.FC<RandomButtonProps> = ({
  fieldDescription,
  rules,
  count = 10,
  onSelect,
  className = "",
}) => {
  const { generateCandidates, loading } = useRandomGenerate();
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState<string[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });

  const updatePosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      // 弹窗向右对齐，在按钮下方
      setPosition({
        top: rect.bottom + 8, // 8px margin
        left: rect.right - 256, // 256px is popup width, align right
        width: 256,
      });
    }
  };

  const handleClick = async () => {
    try {
      const results = await generateCandidates(fieldDescription, rules, count);
      setCandidates(results);
      updatePosition();
      setOpen(true);
    } catch (error) {
      console.error("Random generate failed:", error);
      alert("随机生成失败: " + (error as Error).message);
    }
  };

  const handleSelect = (candidate: string) => {
    onSelect(candidate);
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

  return (
    <div className={`relative inline-block ${className}`}>
      <Tooltip content="随机生成">
        <button
          ref={buttonRef}
          onClick={handleClick}
          disabled={loading}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg text-white"
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Dice1 size={16} />
          )}
        </button>
      </Tooltip>

      {open &&
        candidates.length > 0 &&
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
                  选择一个填入：
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-2">
                {candidates.map((candidate, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(candidate)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-700 text-sm text-gray-700 dark:text-gray-300 transition-all border border-transparent hover:border-purple-200 dark:hover:border-purple-500/30"
                  >
                    {candidate}
                  </button>
                ))}
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};

// 新增：带联想功能的组合按钮 - 包含随机生成和基于当前内容联想
interface RandomInspireButtonProps {
  fieldDescription: string;
  rules: string;
  currentValue: string;
  count?: number;
  onSelect: (value: string) => void;
  className?: string;
}

export const RandomInspireButton: React.FC<RandomInspireButtonProps> = ({
  fieldDescription,
  rules,
  currentValue,
  count = 10,
  onSelect,
  className = "",
}) => {
  const { generateCandidates, loading } = useRandomGenerate();
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0, width: 256 });

  const updatePosition = () => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      // 弹窗向右对齐，在按钮下方
      setPosition({
        top: rect.bottom + 8,
        left: rect.right - 256,
        width: 256,
      });
    }
  };

  const handleGenerate = async (inspire: boolean) => {
    try {
      let finalDescription = fieldDescription;
      let finalRules = rules;

      if (inspire && currentValue.trim()) {
        // 携带当前内容进行联想优化
        finalDescription = `${fieldDescription}，当前已有内容是："${currentValue.trim()}"，请基于已有内容进行联想和优化`;
        finalRules = `${rules}，请基于已有内容联想生成更好的结果，给出 ${count} 个候选`;
      }

      const results = await generateCandidates(
        finalDescription,
        finalRules,
        count,
      );
      setCandidates(results);
      updatePosition();
      setOpen(true);
    } catch (error) {
      console.error("Random generate failed:", error);
      alert("随机生成失败: " + (error as Error).message);
    }
  };

  const handleSelect = (candidate: string) => {
    onSelect(candidate);
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

  return (
    <div
      className={`relative inline-flex items-center gap-1 ${className}`}
      ref={containerRef}
    >
      <Tooltip content="重新生成">
        <button
          onClick={() => handleGenerate(false)}
          disabled={isLoading}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md text-white"
        >
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Dice1 size={14} />
          )}
        </button>
      </Tooltip>

      <Tooltip content="基于当前内容联想优化">
        <button
          onClick={() => handleGenerate(true)}
          disabled={isLoading || !currentValue.trim()}
          className="flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md text-white"
        >
        {isLoading ? (
          <Loader2 size={14} className="animate-spin" />
        ) : (
          <Sparkles size={14} />
        )}
      </button>
      </Tooltip>

      {open &&
        candidates.length > 0 &&
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
                  选择一个填入：
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500 dark:text-gray-400 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-2">
                {candidates.map((candidate, index) => (
                  <button
                    key={index}
                    onClick={() => handleSelect(candidate)}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 dark:hover:bg-slate-700 text-sm text-gray-700 dark:text-gray-300 transition-all border border-transparent hover:border-purple-200 dark:hover:border-purple-500/30"
                  >
                    {candidate}
                  </button>
                ))}
              </div>
            </div>
          </>,
          document.body,
        )}
    </div>
  );
};

// 用于滑块随机直接生成不需要选择
interface RandomSliderButtonProps {
  onSelect: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  fieldDescription: string;
  className?: string;
}

export const RandomSliderButton: React.FC<RandomSliderButtonProps> = ({
  onSelect,
  min,
  max,
  step = 1,
  className = "",
}) => {
  const handleClick = () => {
    // 直接随机一个数值在范围内
    const steps = Math.floor((max - min) / step);
    const randomStep = Math.floor(Math.random() * (steps + 1));
    const randomValue = min + randomStep * step;
    onSelect(randomValue);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center justify-center w-7 h-7 rounded-full
        bg-gradient-to-br from-purple-500 to-pink-500
        hover:from-purple-600 hover:to-pink-600
        transition-all shadow-sm hover:shadow-md
        text-white
        ${className}
      `}
      title="随机生成"
    >
      <Dice1 size={14} />
    </button>
  );
};

// 用于单选直接随机选择不需要选择
interface RandomSelectButtonProps {
  options: { value: string; label: string }[];
  onSelect: (value: string) => void;
  className?: string;
}

export const RandomSelectButton: React.FC<RandomSelectButtonProps> = ({
  options,
  onSelect,
  className = "",
}) => {
  const handleClick = () => {
    const randomIndex = Math.floor(Math.random() * options.length);
    onSelect(options[randomIndex].value);
  };

  return (
    <Tooltip content="随机选择">
      <button
        onClick={handleClick}
        className={`flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 transition-all shadow-sm hover:shadow-md text-white ${className}`}
      >
        <Dice1 size={14} />
      </button>
    </Tooltip>
  );
};
