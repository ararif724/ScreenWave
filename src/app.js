const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");
const { getAllCnf } = require("electron-cnf");
const { quitApp } = require("./helper");
const mainWindowController = require("./controller/mainWindowController");
const camWindowController = require("./controller/camWindowController");
const recordingWindowController = require("./controller/recordingWindowController");
const canvasWindowController = require("./controller/canvasWindowController");

//setting variables
userCnf = getAllCnf();

global.cnf = {
	controllerPath: path.join(__dirname, "/controller"),
	preloadScriptPath: path.join(__dirname, "/preloadScript"),
	webContentPath: path.join(__dirname, "/webContent"),
	recordingSavingPath: app.getPath("home") + "/screen wave",
	recordingMode: "screenCamera",
	videoInDeviceId: null,
	audioInDeviceId: null,
	recordingWindowPosition: { x: null, y: null },
	...userCnf,
};

//loading controllers
mainWindowController();
camWindowController();
recordingWindowController();
canvasWindowController();

//root events
ipcMain.handle("app:close", () => {
	quitApp();
});

ipcMain.handle("app:getRecordingMode", () => cnf.recordingMode);
ipcMain.handle("app:getVideoInDeviceId", () => cnf.videoInDeviceId);
ipcMain.handle("app:getAudioInDeviceId", () => cnf.audioInDeviceId);

app.whenReady().then(() => {
	const { screen } = require("electron");
	cnf.displaySize = screen.getPrimaryDisplay().bounds;

	ipcMain.emit("mainWindow:open");
});

app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		quitApp();
	}
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) {
		ipcMain.emit("mainWindow:open");
	}
});
