const { BrowserWindow, ipcMain } = require("electron");

module.exports = function () {
	ipcMain.on("camWindow:open", () => {

		if (cnf.recordingMode != "screen") {
			let config = {
				width: 700,
				height: 600,
			};

			if (cnf.recordingMode == "screenCamera") {
				const camWindowHeight = 300;
				config = {
					width: 300,
					height: camWindowHeight,
					x: 0,
					y: cnf.displaySize.height - camWindowHeight,
					alwaysOnTop: true,
				};
			}

			const window = new BrowserWindow({
				...config,
				parent: recordingWindow,
				frame: false,
				transparent: true,
				resizable: false,
				webPreferences: {
					preload: cnf.preloadScriptPath + "/camWindowPreload.js",
				},
			});

			window.loadFile(cnf.webContentPath + "/html/camWindow.html");

			window.webContents.send("config", {
				recordingMode: cnf.recordingMode,
				videoInDeviceId: cnf.videoInDeviceId,
				audioInDeviceId: cnf.audioInDeviceId,
			});

			global.camWindow = window;
		}
	});
};
