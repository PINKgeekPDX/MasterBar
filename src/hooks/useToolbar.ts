import { useEffect } from 'react';
import useToolbarStore from '../store/toolbarStore';

export const useToolbar = () => {
  const { position, setPosition } = useToolbarStore();

  useEffect(() => {
    const updateToolbarPosition = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;

      let x = 0;
      let y = 0;

      switch (position) {
        case 'top':
          x = (width - 800) / 2;
          y = 0;
          break;
        case 'left':
          x = 0;
          y = (height - 60) / 2;
          break;
        case 'right':
          x = width - 60;
          y = (height - 60) / 2;
          break;
      }

      return { x, y };
    };

    const pos = updateToolbarPosition();
    const toolbar = document.querySelector('.neo-toolbar') as HTMLElement;
    if (toolbar) {
      toolbar.style.left = `${pos.x}px`;
      toolbar.style.top = `${pos.y}px`;
    }
  }, [position]);

  return null;
};

export default useToolbar;