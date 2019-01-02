if (Hls.isSupported()) {
    var hls = new Hls()
    hls.loadSource(video_src_url)
    hls.attachMedia(video)
    hls.on(Hls.Events.MANIFEST_PARSED, function() {
        // video.play()
    })
} else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = video_src_url
    video.addEventListener('loadedmetadata', function() {
        video.play()
    })
}
