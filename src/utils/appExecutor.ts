import { ButtonConfig } from '../types/toolbar';

export const executeApp = async (config: ButtonConfig['config']): Promise<void> => {
  try {
    await window.electron.invoke('execute-app', config);
  } catch (error) {
    throw new Error(`Application launch failed: ${error.message}`);
  }
};