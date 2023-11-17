const { ipcMain } = require('electron')

module.exports = function () {
    ipcMain.handle('recording:start', function () {
        //cnf.mainWindow.hide();
    });
}