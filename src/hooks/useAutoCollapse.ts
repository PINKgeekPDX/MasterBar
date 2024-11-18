import { useEffect, useRef } from 'react';
import useToolbarStore from '../store/toolbarStore';

export const useAutoCollapse = (toolbarId: string) => {
  const collapseTimerRef = useRef<NodeJS.Timeout>();
  const { toolbars, updateToolbar } = useToolbarStore();

  const toolbar = toolbars.find(t => t.id === toolbarId);
  if (!toolbar) return;

  const { autoCollapse, collapseDelay, isExpanded } = toolbar;

  useEffect(() => {
    const startCollapseTimer = () => {
      if (!autoCollapse || !isExpanded) return;

      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = setTimeout(() => {
        updateToolbar(toolbarId, { isExpanded: false });
      }, collapseDelay);
    };

    const resetCollapseTimer = () => {
      if (!autoCollapse || !isExpanded) return;
      startCollapseTimer();
    };

    if (isExpanded && autoCollapse) {
      startCollapseTimer();

      // Reset timer on mouse movement
      const handleMouseMove = () => resetCollapseTimer();
      document.addEventListener('mousemove', handleMouseMove);

      return () => {
        clearTimeout(collapseTimerRef.current);
        document.removeEventListener('mousemove', handleMouseMove);
      };
    }

    return () => clearTimeout(collapseTimerRef.current);
  }, [toolbarId, autoCollapse, collapseDelay, isExpanded, updateToolbar]);
};

export default useAutoCollapse;