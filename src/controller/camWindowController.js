const { BrowserWindow, ipcMain } = require('electron')

module.exports = function () {
    ipcMain.on('openCamWindow', (event, deviceId) => {
        if (typeof (app.camWindow) == 'undefined') {

            const { screen } = require('electron');
            const camWindowHeight = 300;

            const window = new BrowserWindow({
                parent: app.mainWindow,
                width: 300,
                height: camWindowHeight,
                x: 0,
                y: screen.getPrimaryDisplay().bounds.height - camWindowHeight,
                frame: false,
                transparent: true,
                alwaysOnTop: true,
                webPreferences: {
                    preload: app.preloadScriptPath + '/camWindowPreload.js'
                }
            });

            window.loadFile(app.webContentPath + '/html/camWindow.html');
            window.webContents.openDevTools();
            app.camWindow = window;
        }
        app.camWindow.webContents.send("loadCam", deviceId);
    });

    ipcMain.on('closeCamWindow', () => {
        if (typeof (app.camWindow) != 'undefined') {
            app.camWindow.close();
            delete app.camWindow;
        }
    });
};