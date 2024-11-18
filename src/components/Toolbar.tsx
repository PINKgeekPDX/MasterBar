import React, { useEffect, useRef, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Pin, Settings, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { ToolbarConfigDialog } from './dialogs/ToolbarConfigDialog';
import { cn } from '../lib/utils';
import { ToolbarConfig, ToolbarPosition } from '../types/toolbar';
import useToolbarStore from '../store/toolbarStore';
import ToolbarButton from './ToolbarButton';

interface ToolbarProps {
  config: ToolbarConfig;
  onConfigChange?: (config: Partial<ToolbarConfig>) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({ config, onConfigChange }) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const { updateToolbar, moveButton } = useToolbarStore();
  const [showConfig, setShowConfig] = useState(false);

  // ... rest of the component implementation remains the same ...

  return (
    <>
      <div
        ref={toolbarRef}
        className={cn(
          'toolbar',
          isVertical && 'vertical',
          config.isExpanded && 'expanded'
        )}
        onMouseDown={handleDragStart}
      >
        {/* ... existing toolbar UI ... */}
        
        <Button
          size="icon"
          variant="ghost"
          className="toolbar-button"
          onClick={() => setShowConfig(true)}
        >
          <Settings className="w-4 h-4" />
        </Button>
      </div>

      <ToolbarConfigDialog
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        toolbarId={config.id}
        buttons={config.buttons}
        onSave={(buttons) => {
          updateToolbar(config.id, { buttons });
          setShowConfig(false);
        }}
      />
    </>
  );
};

export default Toolbar;