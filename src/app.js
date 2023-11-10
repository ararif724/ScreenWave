const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const mainWindowController = require('./controller/mainWindowController');
const camWindowController = require('./controller/camWindowController');

//setting variables
userCnf = {
    recordingModes: 'screen'
};

global.cnf = {
    controllerPath: path.join(__dirname, '/controller'),
    preloadScriptPath: path.join(__dirname, '/preloadScript'),
    webContentPath: path.join(__dirname, '/webContent'),
    recordingMode: 'screenCamera',
    ...userCnf
};

//loading controllers
mainWindowController();
camWindowController();

//root events
ipcMain.on('app:close', () => {
    app.quit()
});

ipcMain.on('app:setRecordingMode', (e, recordingMode) => {
    cnf.recordingMode = recordingMode;
    if (recordingMode !== "screen") {
        ipcMain.emit('camWindow:open');
    }
});

app.whenReady().then(() => {
    ipcMain.emit('mainWindow:open');
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        ipcMain.emit('mainWindow:open');
    }
});