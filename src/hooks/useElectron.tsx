import { useEffect } from 'react';
import useToolbarStore from '../store/toolbarStore';
import { toast } from 'react-hot-toast';

const useElectron = () => {
  const { toolbars } = useToolbarStore();
  const currentToolbar = toolbars[0];

  useEffect(() => {
    const handleUpdateAvailable = () => {
      toast('A new update is available!', {
        icon: '🔄',
        duration: 5000,
      });
    };

    const handleUpdateDownloaded = () => {
      toast.custom((t) => (
        <div className="flex flex-col gap-2">
          <span className="text-sm">Update is ready to install!</span>
          <button
            className="neo-button mt-2 px-4 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            onClick={() => {
              if (window.electron) {
                window.electron.send('install-update');
                toast.dismiss(t.id);
              }
            }}
          >
            Restart Now
          </button>
        </div>
      ), { duration: Infinity });
    };

    if (window.electron) {
      window.electron.on('update-available', handleUpdateAvailable);
      window.electron.on('update-downloaded', handleUpdateDownloaded);
    }

    return () => {
      if (window.electron) {
        window.electron.removeAllListeners('update-available');
        window.electron.removeAllListeners('update-downloaded');
      }
    };
  }, []);

  useEffect(() => {
    if (window.electron && currentToolbar) {
      const updateWindowPosition = () => {
        const { width, height } = window.electron.screen.getPrimaryDisplay().workAreaSize;
        let x = 0;
        let y = 0;

        switch (currentToolbar.position) {
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
  }, [currentToolbar]);

  return null;
};

export default useElectron;