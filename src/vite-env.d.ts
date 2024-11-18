/// <reference types="vite/client" />

interface Window {
  electron: {
    invoke: (channel: string, data?: any) => Promise<any>;
    send: (channel: string, data?: any) => void;
    on: (channel: string, func: (...args: any[]) => void) => void;
    removeAllListeners: (channel: string) => void;
    screen: {
      getPrimaryDisplay: () => {
        workAreaSize: { width: number; height: number };
      };
    };
  };
}

declare module 'react' {
  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    // Add support for custom className strings
    className?: string;
  }
}