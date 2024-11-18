import React, { useState } from 'react';
import { X, Plus, Trash2, Settings, Move } from 'lucide-react';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { ButtonConfig, ButtonType, ScriptType } from '../../types/toolbar';
import { validateButtonConfig } from '../../utils/helpers';
import { toast } from 'react-hot-toast';
import { SortableConfigButton } from './SortableConfigButton';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  toolbarId: string;
  buttons: ButtonConfig[];
  onSave: (buttons: ButtonConfig[]) => void;
}

export const ToolbarConfigDialog: React.FC<Props> = ({
  isOpen,
  onClose,
  toolbarId,
  buttons,
  onSave,
}) => {
  const [currentButtons, setCurrentButtons] = useState<ButtonConfig[]>(buttons);
  const [selectedButton, setSelectedButton] = useState<ButtonConfig | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleAddButton = () => {
    if (currentButtons.length >= 15) {
      toast.error('Maximum 15 buttons allowed');
      return;
    }

    const newButton: ButtonConfig = {
      id: Math.random().toString(36).slice(2),
      type: 'script',
      label: 'New Button',
      icon: '🔵',
      config: {
        scriptType: 'cmd',
        command: '',
      },
    };

    setCurrentButtons(prev => [...prev, newButton]);
    setSelectedButton(newButton);
  };

  const handleRemoveButton = (id: string) => {
    setCurrentButtons(prev => prev.filter(b => b.id !== id));
    if (selectedButton?.id === id) {
      setSelectedButton(null);
    }
  };

  const handleButtonChange = (id: string, changes: Partial<ButtonConfig>) => {
    setCurrentButtons(buttons => 
      buttons.map(b => b.id === id ? { ...b, ...changes } : b)
    );
    
    if (selectedButton?.id === id) {
      setSelectedButton(prev => prev ? { ...prev, ...changes } : prev);
    }
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCurrentButtons((buttons) => {
      const oldIndex = buttons.findIndex((b) => b.id === active.id);
      const newIndex = buttons.findIndex((b) => b.id === over.id);
      return arrayMove(buttons, oldIndex, newIndex);
    });
  };

  const handleSave = () => {
    const errors = currentButtons.flatMap(validateButtonConfig);
    if (errors.length > 0) {
      toast.error(`Configuration errors:\n${errors.join('\n')}`);
      return;
    }

    onSave(currentButtons);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg shadow-xl w-[900px] max-h-[80vh] flex">
        {/* Button List */}
        <div className="w-1/3 border-r border-gray-700 p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Buttons</h3>
            <Button size="sm" onClick={handleAddButton}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={currentButtons.map(b => b.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {currentButtons.map((button) => (
                  <SortableConfigButton
                    key={button.id}
                    button={button}
                    isSelected={selectedButton?.id === button.id}
                    onSelect={() => setSelectedButton(button)}
                    onRemove={() => handleRemoveButton(button.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

        {/* Button Configuration */}
        <div className="flex-1 p-4">
          {selectedButton ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Configure Button</h3>
                <Button size="icon" variant="ghost" onClick={() => setSelectedButton(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Label</label>
                    <input
                      type="text"
                      value={selectedButton.label}
                      onChange={e => handleButtonChange(selectedButton.id, { label: e.target.value })}
                      className="w-full bg-gray-800 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Icon</label>
                    <input
                      type="text"
                      value={selectedButton.icon}
                      onChange={e => handleButtonChange(selectedButton.id, { icon: e.target.value })}
                      className="w-full bg-gray-800 rounded-md px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm text-gray-400">Type</label>
                  <select
                    value={selectedButton.type}
                    onChange={e => handleButtonChange(selectedButton.id, { 
                      type: e.target.value as ButtonType,
                      config: {} // Reset config when type changes
                    })}
                    className="w-full bg-gray-800 rounded-md px-3 py-2 text-white"
                  >
                    <option value="script">Script</option>
                    <option value="app">Application</option>
                    <option value="url">URL</option>
                    <option value="api">API</option>
                    <option value="macro">Macro</option>
                  </select>
                </div>

                {selectedButton.type === 'script' && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400">Script Type</label>
                      <select
                        value={selectedButton.config.scriptType}
                        onChange={e => handleButtonChange(selectedButton.id, {
                          config: { ...selectedButton.config, scriptType: e.target.value as ScriptType }
                        })}
                        className="w-full bg-gray-800 rounded-md px-3 py-2 text-white"
                      >
                        <option value="powershell">PowerShell</option>
                        <option value="cmd">Command Prompt</option>
                        <option value="python">Python</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400">Command</label>
                      <textarea
                        value={selectedButton.config.command}
                        onChange={e => handleButtonChange(selectedButton.id, {
                          config: { ...selectedButton.config, command: e.target.value }
                        })}
                        className="w-full bg-gray-800 rounded-md px-3 py-2 text-white h-32"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={selectedButton.config.adminRights}
                        onCheckedChange={checked => handleButtonChange(selectedButton.id, {
                          config: { ...selectedButton.config, adminRights: checked }
                        })}
                      />
                      <span className="text-sm text-gray-400">Run with admin rights</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500">
              Select a button to configure
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 right-4 space-x-2">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
};