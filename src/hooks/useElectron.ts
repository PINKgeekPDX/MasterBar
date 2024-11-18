import { useEffect } from 'react';
import useToolbarStore from '../store/toolbarStore';
import toast from 'react-hot-toast';

const useElectron = () => {
  const { position } = useToolbarStore();

  useEffect(() => {
    if (window.electron) {
      window.electron.on('update-available', () => {
        toast('A new update is available!', {
          icon: '🔄',
          duration: 5000,
        });
      });

      window.electron.on('update-downloaded', () => {
        toast((t) => (
          <div className="flex flex-col gap-2">
            <span className="text-sm">Update is ready to install!</span>
            <button
              className="neo-button mt-2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              onClick={() => {
                window.electron.send('install-update');
                toast.dismiss(t.id);
              }}
            >
              Restart Now
            </button>
          </div>
        ), { duration: Infinity });
      });
    }

    return () => {
      if (window.electron) {
        window.electron.removeAllListeners('update-available');
        window.electron.removeAllListeners('update-downloaded');
      }
    };
  }, []);

  useEffect(() => {
    if (window.electron) {
      const updateWindowPosition = () => {
        const { width, height } = window.electron.screen.getPrimaryDisplay().workAreaSize;
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

        window.electron.send('window-position', { x, y });
      };

      updateWindowPosition();
    }
  }, [position]);

  return null;
};

export default useElectron;