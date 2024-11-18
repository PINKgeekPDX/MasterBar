export const generateId = () => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

export const validateButtonConfig = (config: any) => {
  const errors: string[] = [];

  if (!config.type) {
    errors.push('Button type is required');
  }

  if (!config.label) {
    errors.push('Button label is required');
  }

  switch (config.type) {
    case 'script':
      if (!config.config?.command) {
        errors.push('Script command is required');
      }
      break;
    case 'app':
      if (!config.config?.command) {
        errors.push('Application path is required');
      }
      break;
    case 'url':
      if (!config.config?.url) {
        errors.push('URL is required');
      }
      break;
    case 'api':
      if (!config.config?.url) {
        errors.push('API URL is required');
      }
      break;
    case 'macro':
      if (!config.config?.keys?.length) {
        errors.push('Macro keys are required');
      }
      break;
  }

  return errors;
};

export const isValidUrl = (url: string) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const sanitizeFilePath = (path: string) => {
  // Remove potentially dangerous characters
  return path.replace(/[<>:"|?*]/g, '');
};

export const formatError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
};