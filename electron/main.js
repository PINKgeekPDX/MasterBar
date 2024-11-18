const { app, BrowserWindow, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { autoUpdater } = require('electron-updater');
require('@electron/remote/main').initialize();

// Initialize store
const store = new Store();
let mainWindow;
let tray;
let isQuitting = false;

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 60,
    frame: false,
    transparent: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    skipTaskbar: true,
    alwaysOnTop: store.get('alwaysOnTop', false)
  });

  require('@electron/remote/main').enable(mainWindow.webContents);

  if (process.env.NODE_ENV === 'development') {
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
  tray = new Tray(path.join(__dirname, '../public/tray-icon.png'));
  
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
};

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

// App events
app.whenReady().then(() => {
  createWindow();
  createTray();
  autoUpdater.checkForUpdatesAndNotify();
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