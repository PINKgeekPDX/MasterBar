import React from 'react';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { ButtonConfig } from '../types/toolbar';
import { useButtonExecutor } from '../hooks/useButtonExecutor';

interface ToolbarButtonProps {
  config: ButtonConfig;
  className?: string;
}

export const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  config,
  className
}) => {
  const { execute, isExecuting } = useButtonExecutor();

  const handleClick = async () => {
    try {
      await execute(config);
    } catch (error) {
      console.error('Button execution failed:', error);
    }
  };

  const Icon = typeof config.icon === 'string' ? 
    () => <span className="text-lg">{config.icon}</span> :
    config.icon;

  return (
    <Button
      size="icon"
      variant="ghost"
      className={cn(
        'toolbar-button',
        isExecuting && 'animate-pulse',
        'relative group',
        className
      )}
      onClick={handleClick}
      title={config.tooltip}
    >
      <Icon className="w-4 h-4" />
      {config.label && (
        <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 
                       px-2 py-1 bg-black/90 text-white text-xs rounded
                       opacity-0 group-hover:opacity-100 transition-opacity">
          {config.label}
        </span>
      )}
    </Button>
  );
};