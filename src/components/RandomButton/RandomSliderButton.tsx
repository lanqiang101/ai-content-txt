import React from "react";
import { Dice1 } from "lucide-react";

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
