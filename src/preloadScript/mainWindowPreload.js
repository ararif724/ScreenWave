const { ipcRenderer, contextBridge } = require('electron')

contextBridge.exposeInMainWorld('app', {
    close: () => ipcRenderer.invoke('app:close'),
    setRecordingMode: (recordingMode) => ipcRenderer.invoke('app:setRecordingMode', recordingMode),
    setVideoInDeviceId: (videoInDeviceId) => ipcRenderer.invoke('app:setVideoInDeviceId', videoInDeviceId),
    setAudioInDeviceId: (audioInDeviceId) => ipcRenderer.invoke('app:setAudioInDeviceId', audioInDeviceId),
    getRecordingMode: () => ipcRenderer.invoke('app:getRecordingMode'),
    getVideoInDeviceId: () => ipcRenderer.invoke('app:getVideoInDeviceId'),
    getAudioInDeviceId: () => ipcRenderer.invoke('app:getAudioInDeviceId'),
});