const { ipcRenderer, contextBridge } = require('electron')

ipcRenderer.on('config', (event, config) => {
    contextBridge.exposeInMainWorld('app', {
        config: config,
        enterDrawMode: () => ipcRenderer.invoke('canvasWindow:enterDrawMode'),
        saveRecord: (arrBuffer) => ipcRenderer.invoke('recording:save', arrBuffer),
        stopRecord: () => ipcRenderer.invoke('recording:stop')
    });
});