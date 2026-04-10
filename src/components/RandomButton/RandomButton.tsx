import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Dice1, Loader2, X } from "lucide-react";
import { useRandomGenerate } from "../../hooks/useRandomGenerate";
import { Tooltip } from "../Tooltip";

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
