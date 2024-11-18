export type ToolbarPosition = 'top' | 'left' | 'right';
export type ButtonType = 'script' | 'app' | 'url' | 'api' | 'macro';
export type ScriptType = 'powershell' | 'cmd' | 'python';

export interface ButtonConfig {
  id: string;
  type: ButtonType;
  label: string;
  icon: string;
  tooltip?: string;
  action?: () => void;
  config: {
    scriptType?: ScriptType;
    command?: string;
    args?: string[];
    url?: string;
    method?: 'GET' | 'POST';
    body?: string;
    headers?: Record<string, string>;
    adminRights?: boolean;
    delay?: number;
    keys?: string[];
    workingDir?: string;
    timeout?: number;
    env?: Record<string, string>;
  };
  errorHandling?: {
    retryCount?: number;
    retryDelay?: number;
    fallbackAction?: ButtonConfig;
    errorNotification?: boolean;
    logErrors?: boolean;
  };
}

export interface ToolbarConfig {
  id: string;
  position: ToolbarPosition;
  buttons: ButtonConfig[];
  isVisible: boolean;
  isPinned: boolean;
  isExpanded: boolean;
  autoCollapse: boolean;
  collapseDelay: number;
  theme: {
    background: string;
    buttonBackground: string;
    buttonHover: string;
    buttonActive: string;
    text: string;
    border: string;
    shadow: string;
    blur: string;
  };
}

export interface ExecutionResult {
  success: boolean;
  output?: string;
  error?: string;
  duration: number;
  timestamp: Date;
  type: ButtonType;
  buttonId: string;
}