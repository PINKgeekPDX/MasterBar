import React, { useEffect, useRef, useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Pin, Settings, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { ToolbarConfigDialog } from './dialogs/ToolbarConfigDialog';
import { SortableButton } from './SortableButton';
import { cn } from '../lib/utils';
import { ToolbarPosition } from '../types';
import useToolbarStore from '../store/toolbarStore';
import useAutoCollapse from '../hooks/useAutoCollapse';

interface EnhancedToolbarProps {
  toolbarId: string;
  position?: ToolbarPosition;
  className?: string;
}

export const EnhancedToolbar = React.forwardRef<HTMLDivElement, EnhancedToolbarProps>(({
  toolbarId,
  position = 'top',
  className
}, ref) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [showConfig, setShowConfig] = useState(false);
  const EDGE_THRESHOLD = 80;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { toolbars, updateToolbar } = useToolbarStore();
  const toolbar = toolbars.find(t => t.id === toolbarId);

  useAutoCollapse(toolbarId);

  if (!toolbar) return null;

  const handleDragStart = (e: React.MouseEvent) => {
    if (toolbar.isPinned || (e.target as HTMLElement).closest('button')) return;
    
    setIsDragging(true);
    const rect = toolbarRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    setStartPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    
    if (toolbarRef.current) {
      toolbarRef.current.style.transition = 'none';
      toolbarRef.current.style.cursor = 'grabbing';
    }
  };

  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging || !toolbarRef.current) return;
    
    let x = e.clientX - startPos.x;
    let y = e.clientY - startPos.y;
    
    const rect = toolbarRef.current.getBoundingClientRect();
    const edge = getClosestEdge(e.clientX, e.clientY);
    
    if (edge === 'top') {
      y = 0;
      x = Math.max(0, Math.min(x, window.innerWidth - rect.width));
    } else if (edge === 'left') {
      x = 0;
      y = Math.max(0, Math.min(y, window.innerHeight - rect.height));
    } else if (edge === 'right') {
      x = window.innerWidth - rect.width;
      y = Math.max(0, Math.min(y, window.innerHeight - rect.height));
    }
    
    toolbarRef.current.style.left = `${x}px`;
    toolbarRef.current.style.top = `${y}px`;
    
    if (edge !== toolbar.position) {
      updateToolbar(toolbarId, { position: edge });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setIsDragging(false);
    if (toolbarRef.current) {
      toolbarRef.current.style.cursor = toolbar.isPinned ? 'default' : 'move';
      toolbarRef.current.style.transition = 'all 0.3s ease';
    }

    if (!event.over || !event.active) return;

    const oldIndex = toolbar.buttons.findIndex(button => button.id === event.active.id);
    const newIndex = toolbar.buttons.findIndex(button => button.id === event.over.id);
    
    if (oldIndex !== newIndex) {
      const newButtons = arrayMove(toolbar.buttons, oldIndex, newIndex);
      updateToolbar(toolbarId, { buttons: newButtons });
    }
  };

  const getClosestEdge = (mouseX: number, mouseY: number): ToolbarPosition => {
    if (mouseY < EDGE_THRESHOLD) return 'top';
    if (mouseX < EDGE_THRESHOLD) return 'left';
    if (window.innerWidth - mouseX < EDGE_THRESHOLD) return 'right';
    return toolbar.position;
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', () => setIsDragging(false));
    }
    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', () => setIsDragging(false));
    };
  }, [isDragging]);

  const isVertical = toolbar.position === 'left' || toolbar.position === 'right';
  const visibleButtons = toolbar.buttons.slice(0, 10);
  const expandedButtons = toolbar.buttons.slice(10);

  return (
    <>
      <div
        ref={toolbarRef}
        className={cn(
          'toolbar',
          isVertical && 'vertical',
          toolbar.isExpanded && 'expanded',
          className
        )}
        onMouseDown={handleDragStart}
        style={{
          position: 'fixed',
          left: toolbar.position === 'right' ? 'auto' : 0,
          right: toolbar.position === 'right' ? 0 : 'auto',
          top: toolbar.position === 'top' ? 0 : 'auto',
          transform: toolbar.position === 'top' ? 'translateX(-50%)' : 'none',
          marginLeft: toolbar.position === 'top' ? '50%' : 0
        }}
      >
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <div
            className={cn(
              "buttons-container",
              isVertical ? "flex-col" : "flex-row",
              "flex gap-2"
            )}
          >
            <SortableContext
              items={visibleButtons.map(b => b.id)}
              strategy={isVertical ? verticalListSortingStrategy : horizontalListSortingStrategy}
            >
              <div className={cn(
                "main-buttons",
                isVertical ? "flex-col" : "flex-row",
                "flex gap-2"
              )}>
                {visibleButtons.map((button) => (
                  <SortableButton
                    key={button.id}
                    id={button.id}
                    icon={button.icon}
                    onClick={button.action}
                  />
                ))}
              </div>
            </SortableContext>

            <div className={cn(
              "separator",
              isVertical ? "h-px w-full my-2" : "w-px h-full mx-2"
            )} />

            <Button
              size="icon"
              variant="ghost"
              className={cn('toolbar-button', toolbar.isPinned && 'active')}
              onClick={() => updateToolbar(toolbarId, { isPinned: !toolbar.isPinned })}
            >
              <Pin className="w-4 h-4" />
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="toolbar-button"
              onClick={() => updateToolbar(toolbarId, { isExpanded: !toolbar.isExpanded })}
            >
              {isVertical ? (
                toolbar.isExpanded ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
              ) : (
                toolbar.isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
              )}
            </Button>

            <Button
              size="icon"
              variant="ghost"
              className="toolbar-button"
              onClick={() => setShowConfig(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>

            {toolbar.isExpanded && expandedButtons.length > 0 && (
              <>
                <div className={cn(
                  "separator",
                  isVertical ? "h-px w-full my-2" : "w-px h-full mx-2"
                )} />
                <SortableContext
                  items={expandedButtons.map(b => b.id)}
                  strategy={isVertical ? verticalListSortingStrategy : horizontalListSortingStrategy}
                >
                  <div className={cn(
                    "expanded-section",
                    isVertical ? "flex-col" : "flex-row",
                    "flex gap-2"
                  )}>
                    {expandedButtons.map((button) => (
                      <SortableButton
                        key={button.id}
                        id={button.id}
                        icon={button.icon}
                        onClick={button.action}
                      />
                    ))}
                  </div>
                </SortableContext>
              </>
            )}
          </div>
        </DndContext>
      </div>

      <ToolbarConfigDialog
        isOpen={showConfig}
        onClose={() => setShowConfig(false)}
        toolbarId={toolbarId}
        buttons={toolbar.buttons}
        onSave={(buttons) => {
          updateToolbar(toolbarId, { buttons });
          setShowConfig(false);
        }}
      />
    </>
  );
});