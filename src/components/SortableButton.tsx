import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from './ui/button';

interface SortableButtonProps {
  id: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

export const SortableButton: React.FC<SortableButtonProps> = ({ id, icon, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Button
        size="icon"
        variant="ghost"
        className="toolbar-button"
        onClick={onClick}
      >
        {icon}
      </Button>
    </div>
  );
};