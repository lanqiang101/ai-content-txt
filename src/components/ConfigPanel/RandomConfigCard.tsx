import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useStore } from "../../store/useStore";
import { ModelForm } from "./ModelForm";

export const RandomConfigCard: React.FC = () => {
  const { config, setConfig } = useStore();
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-md mb-4 transition-all hover:shadow-lg border border-gray-100 dark:border-slate-700">
      <div
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
            随机生成
          </h3>
        </div>
      </div>

      {expanded && (
        <div className="px-5 pb-5">
          <ModelForm
            model={config.random}
            onChange={(updates) =>
              setConfig({ random: { ...config.random, ...updates } })
            }
          />
        </div>
      )}
    </div>
  );
};
