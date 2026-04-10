import React from "react";
import { Dice1 } from "lucide-react";
import { Tooltip } from "../Tooltip";

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
