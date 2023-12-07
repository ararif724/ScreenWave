const {
	BrowserWindow,
	ipcMain,
	desktopCapturer,
	Notification,
} = require("electron");
const { writeFile, mkdirSync, existsSync } = require("fs");

module.exports = function () {
	const recordingControlPanelSize = { width: 300, height: 60 };

	ipcMain.handle(
		"recording:start",
		async function (event, recordingMode, videoInDeviceId, audioInDeviceId) {
			cnf.recordingMode = recordingMode;
			cnf.videoInDeviceId = videoInDeviceId;
			cnf.audioInDeviceId = audioInDeviceId;

			if (cnf.recordingMode != "camera") {
				const screenRecordSource = await desktopCapturer.getSources({
					types: ["screen"],
				});
				cnf.screenRecordSourceId = screenRecordSource[0].id;
			}

			ipcMain.emit("recordingWindow:open");
			mainWindow.close();
		}
	);

	ipcMain.handle("recording:stop", function (e) {
		ipcMain.emit("mainWindow:open");
		recordingWindow.close();
	});

	ipcMain.handle("recording:save", async function (e, arrBuffer) {
		ipcMain.emit("mainWindow:open");
		recordingWindow.close();

		if (!existsSync(cnf.recordingSavingPath)) {
			mkdirSync(cnf.recordingSavingPath);
		}

		writeFile(
			`${cnf.recordingSavingPath}/sw-${Date.now()}.webm`,
			Buffer.from(arrBuffer),
			(err) => {
				if (err) {
					console.log(err);
				} else {
					new Notification({
						title: "Screen Wave",
						body: `Recording saved to ${
							cnf.recordingSavingPath
						}/sw-${Date.now()}.webm`,
					}).show();
				}
			}
		);
	});

	ipcMain.on("recordingWindow:open", function () {
		if (cnf.recordingWindowPosition.x == null) {
			cnf.recordingWindowPosition.x =
				(cnf.displaySize.width - recordingControlPanelSize.width) / 2;
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
				preload: cnf.preloadScriptPath + "/recordingWindowPreload.js",
			},
		});

		window.loadFile(cnf.webContentPath + "/html/recordingWindow.html");

		window.webContents.send("config", {
			recordingMode: cnf.recordingMode,
			screenRecordSourceId: cnf.screenRecordSourceId,
			videoInDeviceId: cnf.videoInDeviceId,
			audioInDeviceId: cnf.audioInDeviceId,
		});

		window.on("move", function () {
			const bounds = window.getBounds();
			cnf.recordingWindowPosition.x = bounds.x;
			cnf.recordingWindowPosition.y = bounds.y;
		});

		global.recordingWindow = window;
		ipcMain.emit("camWindow:open");
	});
};
