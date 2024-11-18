import { ButtonConfig } from '../types/toolbar';

export const executeApi = async (config: ButtonConfig['config']): Promise<any> => {
  try {
    const response = await fetch(config.url!, {
      method: config.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      },
      body: config.body ? JSON.stringify(config.body) : undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`API call failed: ${error.message}`);
  }
};