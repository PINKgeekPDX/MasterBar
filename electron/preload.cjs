const { contextBridge, ipcRenderer } = require('electron');
const { screen } = require('@electron/remote');

contextBridge.exposeInMainWorld('electron', {
  invoke: (channel, data) => ipcRenderer.invoke(channel, data),
  send: (channel, data) => ipcRenderer.send(channel, data),
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  },
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
  screen: {
    getPrimaryDisplay: () => screen.getPrimaryDisplay()
  }
});