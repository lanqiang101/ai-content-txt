import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { CharacterDesc } from "../../types";

interface CharacterPanelProps {
  characters: CharacterDesc[];
  selectedCharacterId: string;
  onSelect: (id: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export const CharacterPanel: React.FC<CharacterPanelProps> = ({
  characters,
  selectedCharacterId,
  onSelect,
  onAdd,
  onDelete,
}) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-4 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
          人物卡
        </h3>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-all"
        >
          <Plus size={16} />
          添加
        </button>
      </div>

      <div className="space-y-2">
        {characters.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
            还没有添加人物
          </p>
        ) : (
          characters.map((char) => (
            <div
              key={char.id}
              onClick={() => onSelect(char.id)}
              className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                selectedCharacterId === char.id
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 dark:border-slate-600 hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-800 dark:text-gray-100">
                    {char.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                    {char.description}
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(char.id);
                  }}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
