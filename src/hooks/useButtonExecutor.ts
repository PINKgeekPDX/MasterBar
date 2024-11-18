import { useState, useCallback } from 'react';
import { ButtonConfig, ExecutionResult } from '../types/toolbar';
import { executeScript } from '../utils/scriptExecutor.ts';
import { executeApp } from '../utils/appExecutor.ts';
import { executeApi } from '../utils/apiExecutor.ts';
import { executeMacro } from '../utils/macroExecutor.ts';
import { useErrorHandler } from './useErrorHandler';

export const useButtonExecutor = () => {
  const [isExecuting, setIsExecuting] = useState(false);
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);
  const handleError = useErrorHandler();

  const execute = useCallback(async (config: ButtonConfig): Promise<ExecutionResult> => {
    if (isExecuting) {
      throw new Error('Another action is already executing');
    }

    const startTime = Date.now();
    setIsExecuting(true);

    try {
      let output: any;
      switch (config.type) {
        case 'script':
          output = await executeScript(config.config);
          break;
        case 'app':
          output = await executeApp(config.config);
          break;
        case 'url':
          output = await window.electron?.send('open-external', config.config.url);
          break;
        case 'api':
          output = await executeApi(config.config);
          break;
        case 'macro':
          output = await executeMacro(config.config);
          break;
        default:
          throw new Error(`Unsupported button type: ${config.type}`);
      }

      const result: ExecutionResult = {
        success: true,
        output: typeof output === 'string' ? output : JSON.stringify(output),
        duration: Date.now() - startTime,
        timestamp: new Date(),
        type: config.type,
        buttonId: config.id
      };

      setLastResult(result);
      return result;

    } catch (error) {
      const result: ExecutionResult = {
        success: false,
        error: error.message,
        duration: Date.now() - startTime,
        timestamp: new Date(),
        type: config.type,
        buttonId: config.id
      };

      setLastResult(result);

      if (config.errorHandling?.retryCount && config.errorHandling.retryCount > 0) {
        for (let i = 0; i < config.errorHandling.retryCount; i++) {
          try {
            await new Promise(resolve => 
              setTimeout(resolve, config.errorHandling?.retryDelay || 1000)
            );
            return await execute(config);
          } catch (retryError) {
            if (i === config.errorHandling.retryCount - 1) {
              throw retryError;
            }
          }
        }
      }

      if (config.errorHandling?.fallbackAction) {
        return await execute(config.errorHandling.fallbackAction);
      }

      handleError(error, `Button execution failed: ${config.label}`);
      throw error;

    } finally {
      setIsExecuting(false);
    }
  }, [isExecuting, handleError]);

  return { 
    execute, 
    isExecuting, 
    lastResult 
  };
};

export default useButtonExecutor;