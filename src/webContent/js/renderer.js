$(async function () {
    window[$("body").data("window")]();
});

function mainWindow() {
    $(".close-app").click(function () {
        app.close();
    });

    $(".recording-mode-select").click(function () {
        $(".recording-mode-select").removeClass('active');
        $(this).addClass('active');
        app.setRecordingMode($(this).data('recording-mode'));
    });
    loadMediaDevices();

    $("#cam-select select, #mic-select select").focus(loadMediaDevices);
    $("#cam-select select, #mic-select select").change(function () {
        app.setVideoInDeviceId($("#cam-select select").val());
        app.setAudioInDeviceId($("#mic-select select").val());
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
            if (mediaDevice.kind == 'videoinput') {
                let selectedText = "";
                if (mediaDevice.deviceId == videoInDeviceId) {
                    selectedText = "selected";
                }
                $("#cam-select select").append(`<option value='${mediaDevice.deviceId}' ${selectedText}>${mediaDevice.label}</option>`);
            } else if (mediaDevice.kind == 'audioinput') {
                let selectedText = "";
                if (mediaDevice.deviceId == audioInDeviceId) {
                    selectedText = "selected";
                }
                $("#mic-select select").append(`<option value='${mediaDevice.deviceId}' ${selectedText}>${mediaDevice.label}</option>`);
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

    let constraints = {
        video: {
            deviceId: app.config.videoInDeviceId
        },
        audio: false
    };

    if (app.config.audioInDeviceId) {
        constraints.audio = {
            deviceId:
                app.config.audioInDeviceId
        };
    }

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const camVideo = $("#cam-video")[0];
    camVideo.srcObject = stream;
    camVideo.play();

}