const { ipcRenderer } = require('electron')

ipcRenderer.on('loadCam', (event, deviceId) => {
    if (document.readyState == 'complete') {
        loadCam(deviceId)
    } else {
        window.addEventListener('load', function () {
            loadCam(deviceId)
        })
    }
})

async function loadCam(deviceId) {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId }, audio: false });
    const camVideo = document.querySelector("#camVideo");
    camVideo.srcObject = stream;
    camVideo.play();
}