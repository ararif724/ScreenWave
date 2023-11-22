const { BrowserWindow, ipcMain } = require('electron')

module.exports = function () {

    const recordingControlPanelSize = { width: 220, height: 60 };

    ipcMain.handle('recording:start', function () {
        ipcMain.emit('recordingWindow:open');
        cnf.mainWindow.hide();
    });

    ipcMain.on('recordingWindow:open', function () {

        if (cnf.recordingWindowPosition.x == null) {
            cnf.recordingWindowPosition.x = (cnf.displaySize.width - recordingControlPanelSize.width) / 2;
            cnf.recordingWindowPosition.y = cnf.displaySize.height - 200;
        }

        const window = new BrowserWindow({
            frame: false,
            width: recordingControlPanelSize.width,
            height: recordingControlPanelSize.height,
            x: cnf.recordingWindowPosition.x,
            y: cnf.recordingWindowPosition.y,
            transparent: true,
            fullscreenable: false,
            resizable: false,
            alwaysOnTop: true,
            webPreferences: {
                preload: cnf.preloadScriptPath + '/recordingWindowPreload.js'
            }
        });

        window.loadFile(cnf.webContentPath + '/html/recordingWindow.html');

        window.webContents.send('config', {
            recordingMode: cnf.recordingMode
        });

        window.on('move', function () {
            const bounds = window.getBounds();
            cnf.recordingWindowPosition.x = bounds.x;
            cnf.recordingWindowPosition.y = bounds.y;
        });

        cnf.recordingWindow = window;
    });

}