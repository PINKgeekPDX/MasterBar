export type ToolbarPosition = 'top' | 'left' | 'right';

export interface ToolbarState {
  position: ToolbarPosition;
  isPinned: boolean;
  isExpanded: boolean;
  isDragging: boolean;
  customIcons: Record<string, string>;
  theme: 'light' | 'dark';
  
  setPosition: (position: ToolbarPosition) => void;
  setPinned: (isPinned: boolean) => void;
  setExpanded: (isExpanded: boolean) => void;
  setDragging: (isDragging: boolean) => void;
  setCustomIcon: (buttonId: string, icon: string) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export interface ToolbarButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
  customizable?: boolean;
  buttonId?: string;
}