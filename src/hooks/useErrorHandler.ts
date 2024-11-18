import { useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { formatError } from '../utils/helpers';

interface ErrorHandlerOptions {
  showNotification?: boolean;
  logToConsole?: boolean;
  vibrate?: boolean;
}

export const useErrorHandler = (options: ErrorHandlerOptions = {}) => {
  const {
    showNotification = true,
    logToConsole = true,
    vibrate = false,
  } = options;

  const handleError = useCallback((error: unknown, context?: string) => {
    const errorMessage = formatError(error);
    const contextPrefix = context ? `[${context}] ` : '';
    const fullMessage = `${contextPrefix}${errorMessage}`;

    if (showNotification) {
      toast.error(fullMessage, {
        duration: 5000,
        style: {
          background: '#ef4444',
          color: '#fff',
        },
      });
    }

    if (logToConsole) {
      console.error(fullMessage, error);
    }

    if (vibrate && navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }

    // You could also add error reporting service integration here
    // e.g., Sentry, LogRocket, etc.

    return { error, message: errorMessage };
  }, [showNotification, logToConsole, vibrate]);

  return handleError;
};