/* Web RTC*/
const constraints = window.constraints = {
    audio: false,
    video: true
}

function handleSuccess(stream) {
    const video = document.querySelector('video')
    const videoTracks = stream.getVideoTracks()
    console.log('Got stream with constraints:', constraints)
    console.log(`Using video device: ${videoTracks[0].label}`)
    window.stream = stream
    video.srcObject = stream
}

function handleError(error) {
    if (error.name === 'ConstraintNotSatisfiedError') {
        let v = constraints.video
        errorMsg(`The resolution ${v.width.exact}x${v.height.exact} px is not supported by your device.`)
    } else if (error.name === 'PermissionDeniedError') {
        errorMsg('Permissions have not been granted to use your camera and ' +
        'microphone, you need to allow the page access to your devices in ' +
        'order for the demo to work.')
    }
    errorMsg(`getUserMedia error: ${error.name}`, error)
}

function errorMsg(msg, error) {
    const errorElement = document.querySelector('#errorMsg')
    errorElement.innerHTML += `<p>${msg}</p>`
    if (typeof error !== 'undefined') {
        console.error(error)
    }
}

navigator.mediaDevices
    .getUserMedia(constraints)
    .then(handleSuccess)
    .catch(handleError)
