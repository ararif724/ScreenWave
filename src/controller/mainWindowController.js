const { BrowserWindow, ipcMain, app } = require('electron')

module.exports = function () {
    ipcMain.on('mainWindow:open', function () {
        const window = new BrowserWindow({
            frame: false,
            transparent: true,
            width: 770,
            height: 635,
            fullscreenable: false,
            resizable: false,
            webPreferences: {
                preload: app.preloadScriptPath + '/mainWindowPreload.js'
            }
        });

        window.webContents.openDevTools();

        window.loadFile(app.webContentPath + '/html/mainWindow.html');
        app.mainWindow = window;
    });
}