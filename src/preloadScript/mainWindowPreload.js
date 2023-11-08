const { ipcRenderer } = require('electron')

window.addEventListener('load', function () {
    document.querySelector(".close").addEventListener('click', function () {
        ipcRenderer.send('app:close');
    });

    document.querySelector(".btn-cam-select").addEventListener('click', showCamList);
});

async function showCamList() {
    const camListEL = document.querySelector(".cam-list")
    if (camListEL.style.display == "none" || camListEL.style.display == "") {
        camListEL.innerHTML = ""
        const li = document.createElement('li')
        li.append("No Camera")
        li.onclick = () => {
            selectCam({
                "deviceId": "",
                "label": "No Camera"
            })
        }
        camListEL.append(li)
        const mediaDevices = await navigator.mediaDevices.enumerateDevices()
        for (const mediaDevice of mediaDevices) {
            if (mediaDevice.kind == 'videoinput') {
                const li = document.createElement('li')
                li.append(mediaDevice.label)
                li.onclick = () => {
                    selectCam(mediaDevice)
                }
                camListEL.append(li)
            }
        }
        camListEL.style.display = "block"
    } else {
        camListEL.style.display = "none"
    }
}

function selectCam(device) {
    if (device.deviceId != "") {
        ipcRenderer.send('openCamWindow', device.deviceId)
    } else {
        ipcRenderer.send('closeCamWindow')
    }
    document.querySelector(".cam-list").style.display = "none"
    document.querySelector(".btn-cam-select").innerHTML = device.label
}