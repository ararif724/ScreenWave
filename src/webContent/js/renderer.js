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
			let recordedBlob = new Blob();
			const recorderRequestDataInterval = 5000; //in milliseconds
			const googleDriveUploadChunkSize = 262144; //in byte

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

			const createResumableUploadResponse = await axios.post(
				"https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable",
				{
					name: `screenwave-${Date.now()}.webm`,
					mimeType: "video/webm; codecs=vp9",
				},
				{
					headers: {
						Authorization:
							"Bearer ya29.a0AfB_byAGSnLLXYGNnqS3te-pYzD9OpOk0zGJwOB40GMqjwWDyl52CeuYMhSBT0IO9UIdXW6N7nhhFUtrykgYS9DHgLQFVzPRz3HceXB3zqgbyaxxBMtj7yDUnGZgsbqD_jDkTDcnmcWvOVfX3ANz850BMO-jpDE5w_9naCgYKAZMSARASFQHGX2Mi0t8_Zccv9FnSr43dc5Qclg0171",
						"Content-Type": "application/json",
					},
				}
			);

			async function uploadToGoogleDrive(fromByte = 0) {
				let toByte = fromByte + googleDriveUploadChunkSize;
				let totalByte = "*";

				if (recorder.state == "inactive") {
					totalByte = recordedBlob.size;
					toByte = recordedBlob.size;
				}

				if (
					recorder.state != "inactive" &&
					recordedBlob.size < fromByte + googleDriveUploadChunkSize
				) {
					setTimeout(() => {
						uploadToGoogleDrive(fromByte);
					}, recorderRequestDataInterval);
					return;
				}

				try {
					const blobChunkToUpload = recordedBlob.slice(fromByte, toByte);

					console.log({
						fromByte,
						toByte,
						blobChunkToUploadSize: blobChunkToUpload.size,
						contentRange: `bytes ${fromByte}-${toByte - 1}/${totalByte}`,
					});

					const resp = await axios.put(
						createResumableUploadResponse.headers.location,
						blobChunkToUpload,
						{
							headers: {
								"Content-Range": `bytes ${fromByte}-${toByte - 1}/${totalByte}`,
							},
						}
					);

					console.log("resp1", resp);
				} catch (resp) {
					console.log("resp2", resp);
					uploadToGoogleDrive(
						parseInt(resp.response.headers.range.split("-")[1]) + 1
					);
				}
			}

			const recorder = new MediaRecorder(mainStream, {
				mimeType: "video/webm; codecs=vp9",
			});

			const recorderRequestDataIntervalId = setInterval(() => {
				recorder.requestData();
			}, recorderRequestDataInterval);

			recorder.ondataavailable = (e) => {
				recordedBlob = new Blob([recordedBlob, e.data]);
			};

			recorder.onstop = async (e) => {
				clearInterval(recorderRequestDataIntervalId);
			};

			recorder.start();
			startTimer();
			uploadToGoogleDrive();
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
