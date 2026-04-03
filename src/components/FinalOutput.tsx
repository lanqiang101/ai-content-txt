import React, { useState } from 'react';
import { Copy, Download, Check } from 'lucide-react';
import { GenerationState } from '../types';
import { useStore } from '../store/useStore';

interface FinalOutputProps {
  generation: GenerationState;
}

export const FinalOutput: React.FC<FinalOutputProps> = ({ generation }) => {
  const [copied, setCopied] = useState(false);
  const { params } = useStore();
  const { stage3Result } = generation;

  if (!stage3Result) return null;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(stage3Result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fileName = `${params.type === 'article' ? 'article' : 'novel'}-${params.topic.slice(0, 20).replace(/\s+/g, '-')}.txt`;
    const blob = new Blob([stage3Result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl card-gradient overflow-hidden mb-6 border border-primary/10">
      <div className="flex items-center justify-between flex-wrap gap-2 px-4 sm:px-6 py-4 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/10">
        <h2 className="text-xl font-bold text-gray-800">最终成品</h2>
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? '已复制' : '复制全文'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-all"
          >
            <Download size={16} />
            导出TXT
          </button>
        </div>
      </div>
      <div className="p-4 sm:p-6 max-h-[600px] overflow-y-auto">
        <div className="prose prose-gray max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-gray-700 leading-relaxed m-0 bg-transparent p-0 text-[15px]">
            {stage3Result}
          </pre>
        </div>
      </div>
    </div>
  );
};
