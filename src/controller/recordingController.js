const { ipcMain } = require('electron')

module.exports = function () {
    ipcMain.handle('recording:start', function () {
        ipcMain.emit('panelWindow:open');
        cnf.mainWindow.hide();
    });
}