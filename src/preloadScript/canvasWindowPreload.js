const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('app', {
    exitDrawMode: () => ipcRenderer.invoke('canvasWindow:exitDrawMode')
});