const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');
require('@electron/remote/main').initialize();

const store = new Store();
let mainWindow;
let tray;
let isQuitting = false;

const isDev = process.env.NODE_ENV === 'development';

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 60,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
    },
    skipTaskbar: true,
    alwaysOnTop: store.get('alwaysOnTop', false)
  });

  require('@electron/remote/main').enable(mainWindow.webContents);

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.setVisibleOnAllWorkspaces(true);
  mainWindow.setAlwaysOnTop(store.get('alwaysOnTop', false));

  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow.hide();
    }
  });
};

const createTray = () => {
  const iconPath = isDev 
    ? path.join(process.cwd(), 'public', 'tray-icon.png')
    : path.join(process.resourcesPath, 'public', 'tray-icon.png');

  try {
    tray = new Tray(iconPath);
    
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Show Toolbar', click: () => mainWindow.show() },
      { label: 'Always on Top', type: 'checkbox', checked: store.get('alwaysOnTop', false), 
        click: (item) => {
          store.set('alwaysOnTop', item.checked);
          mainWindow.setAlwaysOnTop(item.checked);
        }
      },
      { type: 'separator' },
      { label: 'Check for Updates', click: () => autoUpdater.checkForUpdates() },
      { type: 'separator' },
      { label: 'Quit', click: () => {
        isQuitting = true;
        app.quit();
      }}
    ]);

    tray.setToolTip('Professional Toolbar');
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    });
  } catch (error) {
    console.error('Failed to create tray:', error);
  }
};

// IPC handlers for script execution
ipcMain.handle('execute-script', async (event, config) => {
  return new Promise((resolve, reject) => {
    const { command, scriptType, adminRights } = config;
    let proc;

    try {
      switch (scriptType) {
        case 'powershell':
          proc = spawn('powershell.exe', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-Command', command]);
          break;
        case 'cmd':
          proc = spawn('cmd.exe', ['/c', command]);
          break;
        case 'python':
          proc = spawn('python', ['-c', command]);
          break;
        default:
          reject(new Error('Unsupported script type'));
          return;
      }

      let output = '';
      let error = '';

      proc.stdout.on('data', (data) => {
        output += data.toString();
      });

      proc.stderr.on('data', (data) => {
        error += data.toString();
      });

      proc.on('close', (code) => {
        if (code === 0) {
          resolve(output);
        } else {
          reject(new Error(error || `Process exited with code ${code}`));
        }
      });
    } catch (error) {
      reject(error);
    }
  });
});

// Auto-updater events
autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('update-available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('update-downloaded');
});

// IPC events
ipcMain.on('install-update', () => {
  autoUpdater.quitAndInstall();
});

ipcMain.on('window-position', (event, { x, y }) => {
  mainWindow.setPosition(x, y);
});

// Handle errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// App events
app.whenReady().then(() => {
  createWindow();
  createTray();
  
  if (!isDev) {
    autoUpdater.checkForUpdatesAndNotify();
  }
}).catch((error) => {
  console.error('Failed to initialize app:', error);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});