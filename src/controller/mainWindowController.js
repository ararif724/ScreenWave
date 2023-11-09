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
                preload: cnf.preloadScriptPath + '/mainWindowPreload.js'
            }
        });

        window.webContents.openDevTools();

        window.loadFile(cnf.webContentPath + '/html/mainWindow.html');
        cnf.mainWindow = window;
    });
}