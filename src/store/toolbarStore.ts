import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ToolbarPosition, ButtonConfig } from '../types/toolbar';
import { generateId } from '../lib/utils';

interface ToolbarState {
  toolbars: {
    id: string;
    position: ToolbarPosition;
    isPinned: boolean;
    isExpanded: boolean;
    autoCollapse: boolean;
    collapseDelay: number;
    buttons: ButtonConfig[];
  }[];
  addToolbar: (position: ToolbarPosition) => void;
  removeToolbar: (id: string) => void;
  updateToolbar: (id: string, updates: Partial<ToolbarState['toolbars'][0]>) => void;
  updateButton: (toolbarId: string, buttonId: string, updates: Partial<ButtonConfig>) => void;
}

const useToolbarStore = create<ToolbarState>()(
  persist(
    (set) => ({
      toolbars: [],
      
      addToolbar: (position) => {
        set((state) => {
          if (state.toolbars.length >= 3) {
            throw new Error('Maximum of 3 toolbars allowed');
          }

          if (state.toolbars.some(t => t.position === position)) {
            throw new Error(`A toolbar already exists at position ${position}`);
          }

          return {
            toolbars: [
              ...state.toolbars,
              {
                id: generateId(),
                position,
                isPinned: false,
                isExpanded: false,
                autoCollapse: true,
                collapseDelay: 3000,
                buttons: []
              }
            ]
          };
        });
      },

      removeToolbar: (id) => {
        set((state) => ({
          toolbars: state.toolbars.filter(t => t.id !== id)
        }));
      },

      updateToolbar: (id, updates) => {
        set((state) => ({
          toolbars: state.toolbars.map(toolbar =>
            toolbar.id === id ? { ...toolbar, ...updates } : toolbar
          )
        }));
      },

      updateButton: (toolbarId, buttonId, updates) => {
        set((state) => ({
          toolbars: state.toolbars.map(toolbar =>
            toolbar.id === toolbarId
              ? {
                  ...toolbar,
                  buttons: toolbar.buttons.map(button =>
                    button.id === buttonId ? { ...button, ...updates } : button
                  )
                }
              : toolbar
          )
        }));
      }
    }),
    {
      name: 'toolbar-storage',
      version: 1
    }
  )
);

export default useToolbarStore;