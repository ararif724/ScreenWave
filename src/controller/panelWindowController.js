const { BrowserWindow, ipcMain } = require('electron')

module.exports = function () {
    ipcMain.on('panelWindow:open', function () {

        const { screen } = require('electron');
        const displaySize = screen.getPrimaryDisplay().bounds;

        const window = new BrowserWindow({
            frame: false,
            parent: cnf.mainWindow,
            transparent: true,
            width: displaySize.width,
            height: displaySize.height,
            fullscreenable: false,
            resizable: false,
            alwaysOnTop: false,
            webPreferences: {
                //preload: cnf.preloadScriptPath + '/mainWindowPreload.js'
            }
        });

        window.loadFile(cnf.webContentPath + '/html/panelWindow.html');
        window.webContents.openDevTools();
        cnf.panelWindow = window;
    });

}