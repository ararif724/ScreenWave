const { BrowserWindow, ipcMain } = require('electron')

module.exports = function () {
    ipcMain.on('camWindow:open', () => {
        if (typeof (cnf.camWindow) != 'undefined') {
            cnf.camWindow.close();
            delete cnf.camWindow;
        }

        if (cnf.recordingMode != 'screen') {

            let config = {
                width: 700,
                height: 600,
            };

            if (cnf.recordingMode == 'screenCamera') {
                const { screen } = require('electron');
                const camWindowHeight = 300;
                config = {
                    width: 300,
                    height: camWindowHeight,
                    x: 0,
                    y: screen.getPrimaryDisplay().bounds.height - camWindowHeight,
                };
            }

            const window = new BrowserWindow({
                ...config,
                frame: false,
                transparent: true,
                alwaysOnTop: true,
                webPreferences: {
                    preload: cnf.preloadScriptPath + '/camWindowPreload.js'
                }
            });

            window.loadFile(cnf.webContentPath + '/html/camWindow.html');

            window.webContents.send('config', {
                recordingMode: cnf.recordingMode,
                videoInDeviceId: cnf.videoInDeviceId,
                audioInDeviceId: cnf.audioInDeviceId,
            });

            //window.webContents.openDevTools();

            cnf.camWindow = window;
        }

    });
};