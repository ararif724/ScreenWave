const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('app', {
    enterDrawMode: () => ipcRenderer.invoke('canvasWindow:enterDrawMode')
});