const { ipcRenderer, contextBridge } = require('electron')

ipcRenderer.on('config', (event, config) => {
    contextBridge.exposeInMainWorld('app', { config: config });
});