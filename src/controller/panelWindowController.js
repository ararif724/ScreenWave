const { BrowserWindow, ipcMain } = require('electron')

module.exports = function () {

    const panelSize = { width: 220, height: 60 };

    ipcMain.on('panelWindow:open', function () {

        if (cnf.panelWindowPosition.x == null) {
            cnf.panelWindowPosition.x = (cnf.displaySize.width - panelSize.width) / 2;
            cnf.panelWindowPosition.y = cnf.displaySize.height - 200;
        }

        const window = new BrowserWindow({
            frame: false,
            width: panelSize.width,
            height: panelSize.height,
            x: cnf.panelWindowPosition.x,
            y: cnf.panelWindowPosition.y,
            transparent: true,
            fullscreenable: false,
            resizable: false,
            alwaysOnTop: true,
            webPreferences: {
                preload: cnf.preloadScriptPath + '/panelWindowPreload.js'
            }
        });

        window.loadFile(cnf.webContentPath + '/html/panelWindow.html');

        window.webContents.send('config', {
            recordingMode: cnf.recordingMode
        });

        window.on('move', function () {
            const bounds = window.getBounds();
            cnf.panelWindowPosition.x = bounds.x;
            cnf.panelWindowPosition.y = bounds.y;
        });

        cnf.panelWindow = window;
    });

}