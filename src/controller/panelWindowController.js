const { BrowserWindow, ipcMain } = require('electron')

module.exports = function () {

    const panelSize = { width: 220, height: 60 };

    ipcMain.on('panelWindow:open', function () {

        if (cnf.panelWindowPosition.x == 0) {
            cnf.panelWindowPosition.x = (cnf.displaySize.width - panelSize.width) / 2;
        }

        const window = new BrowserWindow({
            frame: false,
            parent: cnf.mainWindow,
            width: panelSize.width,
            height: panelSize.height,
            x: cnf.panelWindowPosition.x,
            y: 0,
            transparent: true,
            fullscreenable: false,
            resizable: false,
            alwaysOnTop: true,
            webPreferences: {
                preload: cnf.preloadScriptPath + '/panelWindowPreload.js'
            }
        });

        window.loadFile(cnf.webContentPath + '/html/panelWindow.html');

        window.on('move', function () {
            const bounds = window.getBounds();
            cnf.panelWindowPosition.x = bounds.x;
            cnf.panelWindowPosition.y = bounds.y;
        });

        cnf.panelWindow = window;
    });

}