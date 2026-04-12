import type { ModelConfig } from "../../types";

export interface ModelListProps {
  models: ModelConfig[];
  loading: boolean;
  error: string | null;
  onEdit: (model: ModelConfig) => void;
  onDelete: (id: number) => void;
  formatMode: (mode: string | undefined) => string;
}

export interface ModelDialogProps {
  open: boolean;
  isEditing: boolean;
  currentModel: Partial<ModelConfig>;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
  onCurrentModelChange: (model: Partial<ModelConfig>) => void;
}