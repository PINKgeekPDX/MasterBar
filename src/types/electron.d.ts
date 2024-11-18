export interface IpcRenderer {
  invoke(channel: string, ...args: any[]): Promise<any>;
  send(channel: string, ...args: any[]): void;
  on(channel: string, func: (...args: any[]) => void): void;
  removeAllListeners(channel: string): void;
}

export interface Screen {
  getPrimaryDisplay(): {
    workAreaSize: { width: number; height: number };
  };
}

declare global {
  interface Window {
    electron: {
      invoke: IpcRenderer['invoke'];
      send: IpcRenderer['send'];
      on: IpcRenderer['on'];
      removeAllListeners: IpcRenderer['removeAllListeners'];
      screen: Screen;
    };
  }
}