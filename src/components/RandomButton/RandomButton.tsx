import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Dice1, Loader2, X, AlertCircle } from "lucide-react";
import { useRandomConfig } from "../../hooks/useRandomConfig";
import { Tooltip } from "../Tooltip";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
  const { generateCandidates, loading, hasConfig } = useRandomConfig();
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
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
    if (!hasConfig) {
      setError("未配置随机生成模型");
      setTimeout(() => {
        if (window.confirm("未配置随机生成模型\n\n是否前往系统配置？")) {
          navigate("/config");
        }
      }, 100);
      return;
    }

    try {
      setError(null);
      const results = await generateCandidates(fieldDescription, rules, count);
      setCandidates(results);
      updatePosition();
      setOpen(true);
    } catch (err) {
      console.error("Random generate failed:", err);
      setError((err as Error).message);
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleSelect = (candidate: string) => {
    onSelect(candidate);
    setOpen(false);
  };

  const handleClose = () => {
    setOpen(false);
    setError(null);
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

  // 如果未配置模型，显示提示
  if (!hasConfig) {
    return (
      <Tooltip content="未配置模型">
        <button
          ref={buttonRef}
          onClick={() => navigate("/config")}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 cursor-not-allowed transition-all shadow-md text-gray-500 dark:text-gray-400"
        >
          <AlertCircle size={16} />
        </button>
      </Tooltip>
    );
  }

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

      {/* 错误提示 */}
      {error && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-700 dark:text-red-300 whitespace-nowrap z-[101]">
          {error}
        </div>
      )}

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
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                  <Dice1 size={14} className="text-purple-500" />
                  随机候选
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-500"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
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
          document.body
        )}
    </div>
  );
};
