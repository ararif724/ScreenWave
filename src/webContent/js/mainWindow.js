$(function () {
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
});
