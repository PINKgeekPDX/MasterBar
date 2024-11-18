import { ButtonConfig } from '../types/toolbar';

export const executeMacro = async (config: ButtonConfig['config']): Promise<void> => {
  try {
    await window.electron.invoke('execute-macro', config);
  } catch (error) {
    throw new Error(`Macro execution failed: ${error.message}`);
  }
};