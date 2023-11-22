const { BrowserWindow, ipcMain, desktopCapturer, dialog } = require('electron');
const { writeFile } = require('fs');

module.exports = function () {

    const recordingControlPanelSize = { width: 220, height: 60 };

    ipcMain.handle('recording:start', async function () {
        const screenRecordSource = await desktopCapturer.getSources({ types: ['screen'] });
        cnf.screenRecordSourceId = screenRecordSource[0].id;
        ipcMain.emit('recordingWindow:open');
        cnf.mainWindow.hide();
    });

    ipcMain.handle('recording:stop', async function (e, arrBuffer) {
        const buffer = Buffer.from(arrBuffer);
        const { filePath } = await dialog.showSaveDialog({
            buttonLabel: 'Save video',
            defaultPath: `vid-${Date.now()}.webm`
        });
        if (filePath) {
            writeFile(filePath, buffer, () => console.log('video saved successfully!'));
        }
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
            recordingMode: cnf.recordingMode,
            screenRecordSourceId: cnf.screenRecordSourceId,
            videoInDeviceId: cnf.videoInDeviceId,
            audioInDeviceId: cnf.audioInDeviceId
        });

        window.on('move', function () {
            const bounds = window.getBounds();
            cnf.recordingWindowPosition.x = bounds.x;
            cnf.recordingWindowPosition.y = bounds.y;
        });

        window.webContents.openDevTools();

        cnf.recordingWindow = window;
    });

}