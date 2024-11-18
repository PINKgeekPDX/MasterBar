import { ButtonConfig } from '../types/toolbar';

export const executeScript = async (config: ButtonConfig['config']): Promise<string> => {
  try {
    const result = await window.electron.invoke('execute-script', config);
    return result;
  } catch (error) {
    throw new Error(`Script execution failed: ${error.message}`);
  }
};