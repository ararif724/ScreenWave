$(async function () {
	window[$("body").data("window")]();
});

function mainWindow() {
	loadMediaDevices();

	$(".close-app").click(() => app.close());

	$(".recording-mode-select").click(function () {
		$(".recording-mode-select").removeClass("active");
		$(this).addClass("active");
	});

	$("#cam-select select, #mic-select select").focus(loadMediaDevices);

	$(".start-record-btn").click(async () => {
		const recordingMode = $(".recording-mode-select.active").data(
			"recording-mode"
		);
		const videoInDeviceId = $("#cam-select select").val();
		const audioInDeviceId = $("#mic-select select").val();

		app.startRecording(recordingMode, videoInDeviceId, audioInDeviceId);
	});

	app.getRecordingMode().then((recordingMode) => {
		$(`.recording-mode-select[data-recording-mode=${recordingMode}]`).click();
	});

	async function loadMediaDevices() {
		const videoInDeviceId = await app.getVideoInDeviceId();
		const audioInDeviceId = await app.getAudioInDeviceId();

		const mediaDevices = await navigator.mediaDevices.enumerateDevices();

		$("#cam-select select").html("");
		$("#mic-select select").html("<option value=''>No Microphone</option>");

		//load audio and video input media devices list on mainWindow
		for (const mediaDevice of mediaDevices) {
			if (mediaDevice.kind == "videoinput") {
				let selectedText = "";
				if (mediaDevice.deviceId == videoInDeviceId) {
					selectedText = "selected";
				}
				$("#cam-select select").append(
					`<option value='${mediaDevice.deviceId}' ${selectedText}>${mediaDevice.label}</option>`
				);
			} else if (mediaDevice.kind == "audioinput") {
				let selectedText = "";
				if (mediaDevice.deviceId == audioInDeviceId) {
					selectedText = "selected";
				}
				$("#mic-select select").append(
					`<option value='${mediaDevice.deviceId}' ${selectedText}>${mediaDevice.label}</option>`
				);
			}
		}
	}
}

async function camWindow() {
	if (app.config.recordingMode == "screenCamera") {
		$("#cam-video").addClass("screen-camera-mode");
	} else {
		$("#cam-video").removeClass("screen-camera-mode");
	}

	const constraints = {
		video: {
			deviceId: app.config.videoInDeviceId,
		},
		audio: false,
	};

	const stream = await navigator.mediaDevices.getUserMedia(constraints);
	const camVideo = $("#cam-video")[0];
	camVideo.srcObject = stream;
	camVideo.play();

	$("#cam-video").addClass("ready");
}

function recordingWindow() {
	startRecording();

	$("#pen").removeClass("disabled");
	$("#pen").attr("title", "");
	if (app.config.recordingMode == "camera") {
		$("#pen").attr("title", "Pen not available in camera mode");
		$("#pen").addClass("disabled");
	}

	$("#pen").click(() => {
		if (app.config.recordingMode != "camera") {
			app.enterDrawMode();
		}
	});

	$("#delete").click(() => app.stopRecord());

	let timeRecorded = 0; //in seconds
	let timeRecordedIntervalId = null;

	function startTimer() {
		timeRecordedIntervalId = setInterval(() => {
			timeRecorded++;
			let minute = parseInt(timeRecorded / 60);
			if (minute < 10) {
				minute = "0" + minute;
			}

			let seconds = parseInt(timeRecorded % 60);
			if (seconds < 10) {
				seconds = "0" + seconds;
			}
			let timeString = `${minute}:${seconds}`;
			$("#timeRecorded").html(timeString);
		}, 1000);
	}

	function stopTimer() {
		clearInterval(timeRecordedIntervalId);
	}

	async function startRecording() {
		try {
			let mainStream = null;

			if (app.config.recordingMode != "camera") {
				mainStream = await navigator.mediaDevices.getUserMedia({
					audio: false,
					video: {
						mandatory: {
							chromeMediaSource: "desktop",
							chromeMediaSourceId: app.config.screenRecordSourceId,
						},
					},
				});
			} else {
				mainStream = await navigator.mediaDevices.getUserMedia({
					audio: false,
					video: {
						deviceId: app.config.videoInDeviceId,
					},
				});
			}

			if (app.config.audioInDeviceId) {
				//attach audio track to the screen stream
				const audioStream = await navigator.mediaDevices.getUserMedia({
					audio: {
						deviceId: app.config.audioInDeviceId,
					},
					video: false,
				});

				mainStream.addTrack(audioStream.getAudioTracks()[0]);
			}

			const recorder = new MediaRecorder(mainStream, {
				mimeType: "video/webm; codecs=vp9",
			});
			let recordedBlobChunks = [];

			recorder.ondataavailable = (e) => {
				recordedBlobChunks.push(e.data);
			};

			recorder.onstop = async (e) => {
				const recordedBlob = await ysFixWebmDuration(
					new Blob(recordedBlobChunks, {
						type: "video/webm; codecs=vp9",
					}),
					(timeRecorded + 1) * 1000
				);

				const arrBuffer = await recordedBlob.arrayBuffer();
				app.saveRecord(arrBuffer);
			};

			recorder.start();
			startTimer();

			$("#stop").click(function () {
				if (recorder.state === "recording" || recorder.state === "paused") {
					recorder.stop();
				}
			});

			$("#pauseResume").click(function () {
				if (recorder.state === "recording") {
					recorder.pause();
					stopTimer();
					$("#pauseResume i")
						.removeClass("fa-circle-pause")
						.addClass("fa-circle-play");
				} else if (recorder.state === "paused") {
					recorder.resume();
					startTimer();
					$("#pauseResume i")
						.removeClass("fa-circle-play")
						.addClass("fa-circle-pause");
				}
			});
		} catch (e) {
			console.log(e);
			app.stopRecord();
		}
	}
}

function canvasWindow() {
	$(".canvas-window .how-to-exit-message").fadeOut(2000);

	const paintCanvas = document.querySelector("#canvas-window-canvas");
	paintCanvas.width = document.body.clientWidth;
	paintCanvas.height = document.body.clientHeight;

	const context = paintCanvas.getContext("2d");

	window.addEventListener("keyup", function (e) {
		if (e.key == "Escape") {
			context.clearRect(0, 0, paintCanvas.width, paintCanvas.height);
			app.exitDrawMode();
		}
	});

	context.lineCap = "round";
	context.strokeStyle = "red";
	context.lineWidth = 5;

	let x = 0,
		y = 0;
	let isMouseDown = false;

	const stopDrawing = () => {
		isMouseDown = false;
	};
	const startDrawing = (event) => {
		isMouseDown = true;
		[x, y] = [event.offsetX, event.offsetY];
	};
	const drawLine = (event) => {
		if (isMouseDown) {
			const newX = event.offsetX;
			const newY = event.offsetY;
			context.beginPath();
			context.moveTo(x, y);
			context.lineTo(newX, newY);
			context.stroke();
			//[x, y] = [newX, newY];
			x = newX;
			y = newY;
		}
	};

	paintCanvas.addEventListener("mousedown", startDrawing);
	paintCanvas.addEventListener("mousemove", drawLine);
	paintCanvas.addEventListener("mouseup", stopDrawing);
	paintCanvas.addEventListener("mouseout", stopDrawing);
}
