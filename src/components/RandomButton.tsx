import React, { useState } from 'react';
import { Dice1, Loader2 } from 'lucide-react';
import { useRandomGenerate } from '../hooks/useRandomGenerate';

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
  count = 3,
  onSelect,
  className = '',
}) => {
  const { generateCandidates, loading } = useRandomGenerate();
  const [open, setOpen] = useState(false);
  const [candidates, setCandidates] = useState<string[]>([]);

  const handleClick = async () => {
    try {
      const results = await generateCandidates(fieldDescription, rules, count);
      setCandidates(results);
      setOpen(true);
    } catch (error) {
      console.error('Random generate failed:', error);
      alert('随机生成失败: ' + (error as Error).message);
    }
  };

  const handleSelect = (candidate: string) => {
    onSelect(candidate);
    setOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={handleClick}
        disabled={loading}
        className={`
          flex items-center justify-center w-8 h-8 rounded-full
          bg-gradient-to-br from-purple-500 to-pink-500
          hover:from-purple-600 hover:to-pink-600
          disabled:opacity-50 disabled:cursor-not-allowed
          transition-all shadow-md hover:shadow-lg
          text-white
        ${className}
        `}
        title="随机生成"
      >
        {loading ? <Loader2 size={16} className="animate-spin" /> : <Dice1 size={16} />}
      </button>

      {open && candidates.length > 0 && (
        <>
          <div
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50">
            <div className="text-sm font-medium text-gray-700 mb-2 px-1">
              选择一个填入：
            </div>
            <div className="space-y-2">
              {candidates.map((candidate, index) => (
                <button
                  key={index}
                  onClick={() => handleSelect(candidate)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-purple-50 text-sm text-gray-700 transition-all border border-transparent hover:border-purple-200"
                >
                  {candidate}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// 用于滑块随机直接生成不需要选择
interface RandomSliderButtonProps {
  onSelect: (value: number) => void;
  min: number;
  max: number;
  fieldDescription: string;
  className?: string;
}

export const RandomSliderButton: React.FC<RandomSliderButtonProps> = ({ onSelect, min, max, className = ''}) => {
  const handleClick = () => {
    // 直接随机一个数值在范围内
    const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
    onSelect(randomValue);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center justify-center w-8 h-8 rounded-full
        bg-gradient-to-br from-purple-500 to-pink-500
        hover:from-purple-600 hover:to-pink-600
        transition-all shadow-md hover:shadow-lg
        text-white
        ${className}
      `}
      title="随机生成"
    >
      <Dice1 size={16} />
    </button>
  );
};

// 用于单选直接随机选择不需要选择
interface RandomSelectButtonProps {
  options: {value: string; label: string}[];
  onSelect: (value: string) => void;
  className?: string;
}

export const RandomSelectButton: React.FC<RandomSelectButtonProps> = ({
  options,
  onSelect,
  className = '',
}) => {
  const handleClick = () => {
    const randomIndex = Math.floor(Math.random() * options.length);
    onSelect(options[randomIndex].value);
  };

  return (
    <button
      onClick={handleClick}
      className={`
        flex items-center justify-center w-8 h-8 rounded-full
        bg-gradient-to-br from-purple-500 to-pink-500
        hover:from-purple-600 hover:to-pink-600
        transition-all shadow-md hover:shadow-lg
        text-white
        ${className}
      `}
      title="随机选择"
    >
      <Dice1 size={16} />
    </button>
  );
};
