import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Move, Settings, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { ButtonConfig } from '../../types/toolbar';

interface SortableConfigButtonProps {
  button: ButtonConfig;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export const SortableConfigButton: React.FC<SortableConfigButtonProps> = ({
  button,
  isSelected,
  onSelect,
  onRemove,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: button.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 p-2 rounded-md bg-gray-800 
        ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
    >
      <div {...attributes} {...listeners}>
        <Move className="w-4 h-4 text-gray-400 cursor-grab" />
      </div>
      <span className="text-lg">{button.icon}</span>
      <span className="flex-1 text-sm text-gray-200">{button.label}</span>
      <Button
        size="icon"
        variant="ghost"
        onClick={onSelect}
      >
        <Settings className="w-4 h-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        onClick={onRemove}
      >
        <Trash2 className="w-4 h-4" />
      </Button>
    </div>
  );
};