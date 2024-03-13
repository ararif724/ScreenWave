$(function () {
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
							"Bearer ya29.a0AfB_byDvniEhRzhHImSy1v-DcrlCc7tbNtb2zFZJoyLhVtHYxeLm1i4wVAf0LGAwjNRZOElOgjlSREocJGOMIvmDSPNXlEw5VtDBPNge_NeSr7sThyvrEFMBEIK-jjJKvwS3q4ykSTWxAtdVUvj16POZVh3PMV58GGqcaCgYKAeQSARASFQHGX2Mi6XnGDPgpr7KJSG_dGLL0fA0171",
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
			//app.stopRecord();
		}
	}
});
