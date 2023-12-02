const { app, BrowserWindow, ipcMain } = require("electron");

module.exports = function () {
	ipcMain.handle("canvasWindow:enterDrawMode", function () {
		cnf.recordingWindow.hide();

		if (typeof cnf.canvasWindow != "undefined") {
			cnf.canvasWindow.show();
			return true;
		}

		const window = new BrowserWindow({
			frame: false,
			...cnf.displaySize,
			transparent: true,
			fullscreenable: false,
			resizable: false,
			alwaysOnTop: true,
			minimizable: false,
			webPreferences: {
				preload: cnf.preloadScriptPath + "/canvasWindowPreload.js",
			},
		});

		window.loadFile(cnf.webContentPath + "/html/canvasWindow.html");

		window.on('close', function (){
			app.quit();
		});

		cnf.canvasWindow = window;
	});

	ipcMain.handle("canvasWindow:exitDrawMode", function () {
		cnf.canvasWindow.hide();
		cnf.recordingWindow.show();
	});
};
