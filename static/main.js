var my_cocoSsd_model = undefined

cocoSsd.load().then(model => {
    console.log('tensorflow model loaded, now start classification')
    my_cocoSsd_model = model
}, msg => {
    const errorElement = document.querySelector('#errorMsg')
    errorElement.innerHTML += `<p>${msg}</p>`
})

var detect_canvas = document.createElement('canvas')
detect_canvas.id = 'someId'
detect_canvas.width = video.width
detect_canvas.height = video.height
document.body.appendChild(detect_canvas)
var ctx = detect_canvas.getContext("2d")

video.addEventListener('playing', () => {
    setInterval(() => {
        if (my_cocoSsd_model !== undefined) {
            my_cocoSsd_model.detect(video).then(predictions => {
                let len = predictions.length
                ctx.clearRect(0, 0, detect_canvas.width, detect_canvas.height);
                if (len == 0) {
                    console.log('Fail to find anything.')
                } else {
                    for (let i = 0; i < len; i++) {
                        let p = predictions[i]
                        let log = `Find (${i+1}/${len}): ${p['class']}\nbbox: [x, y, width, height]: ${p['bbox']}\nscore: ${p['score']}`
                        console.log(log)
                        
                        let bbox = p['bbox']

                        // box
                        ctx.beginPath()
                        ctx.lineWidth = "4"
                        ctx.strokeStyle = "red"
                        ctx.strokeRect(bbox[0], bbox[1], bbox[2], bbox[3])

                        // text
                        ctx.beginPath()
                        ctx.font = '16pt Calibri'
                        ctx.fillStyle = 'red'
                        ctx.fillText(`${p['class']} ${Math.round(p['score'] * 100)}%`, bbox[0] + 5, bbox[1] + 20);

                    }
                }
            })
        } else {
            console.log('tensorflow model is loading...')
        }
    }, detect_rate)
})
