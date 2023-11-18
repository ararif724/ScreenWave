const { BrowserWindow, ipcMain } = require('electron')

module.exports = function () {

    ipcMain.handle('canvasWindow:enterDrawMode', function () {

        if (typeof (cnf.canvasWindow) != 'undefined') {
            cnf.canvasWindow.show();
            return true;
        }

        const window = new BrowserWindow({
            frame: false,
            parent: cnf.mainWindow,
            ...cnf.displaySize,
            transparent: true,
            fullscreenable: false,
            resizable: false,
            alwaysOnTop: true,
            webPreferences: {
                preload: cnf.preloadScriptPath + '/canvasWindowPreload.js'
            }
        });

        window.loadFile(cnf.webContentPath + '/html/canvasWindow.html');

        cnf.canvasWindow = window;
    });

    ipcMain.handle('canvasWindow:exitDrawMode', function () {
        cnf.canvasWindow.hide();
    });

}