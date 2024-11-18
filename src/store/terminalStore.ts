import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Position {
  x: number;
  y: number;
}

interface Size {
  width: number;
  height: number;
}

interface TerminalState {
  isVisible: boolean;
  position: Position;
  size: Size;
  verbosity: {
    info: boolean;
    script: boolean;
    warning: boolean;
    error: boolean;
  };
  settings: {
    keepTopmost: boolean;
    autoScroll: boolean;
    vibrateOnErrors: boolean;
  };
  messages: Array<{
    id: string;
    text: string;
    type: "ERROR" | "WARNING" | "INFO" | "SCRIPT";
    timestamp: Date;
  }>;
  toggleVisibility: () => void;
  updatePosition: (position: Position) => void;
  updateSize: (size: Size) => void;
  addMessage: (message: Omit<TerminalState['messages'][0], 'id' | 'timestamp'>) => void;
  clearMessages: () => void;
  updateVerbosity: (key: keyof TerminalState['verbosity'], value: boolean) => void;
  updateSettings: (key: keyof TerminalState['settings'], value: boolean) => void;
  saveLogs: () => void;
}

const useTerminalStore = create<TerminalState>()(
  persist(
    (set) => ({
      isVisible: false,
      position: { x: 20, y: 20 },
      size: { width: 600, height: 400 },
      verbosity: {
        info: true,
        script: true,
        warning: true,
        error: true,
      },
      settings: {
        keepTopmost: false,
        autoScroll: true,
        vibrateOnErrors: true,
      },
      messages: [],
      toggleVisibility: () => set((state) => ({ isVisible: !state.isVisible })),
      updatePosition: (position) => set({ position }),
      updateSize: (size) => set({ size }),
      addMessage: (message) => set((state) => {
        const newMessage = {
          ...message,
          id: Math.random().toString(36).slice(2),
          timestamp: new Date(),
        };

        if (message.type === 'ERROR' && state.settings.vibrateOnErrors && navigator.vibrate) {
          navigator.vibrate([100, 50, 100]);
        }

        return {
          messages: [...state.messages, newMessage],
          isVisible: message.type === 'ERROR' ? true : state.isVisible,
        };
      }),
      clearMessages: () => set({ messages: [] }),
      updateVerbosity: (key, value) => set((state) => ({
        verbosity: { ...state.verbosity, [key]: value }
      })),
      updateSettings: (key, value) => set((state) => ({
        settings: { ...state.settings, [key]: value }
      })),
      saveLogs: () => {
        // Implementation for saving logs
        console.log('Saving logs...');
      }
    }),
    {
      name: 'terminal-storage',
    }
  )
);

export default useTerminalStore;