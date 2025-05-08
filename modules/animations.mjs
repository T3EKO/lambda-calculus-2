
function prerender(renderCallback, frameCount) {
    const frames = new Array();
    for(let i = 0;i < frameCount;i++) {
        const t = i / (frameCount - 1);
        frames.push(renderCallback(t));
    }
    return frames;
}

function startPlayback(canvas, frames, frameRate) {
    const frameTime = 1000 / frameRate;
    const startTime = performance.now();
    requestAnimationFrame(playbackLoop.bind(null, startTime, frameTime, frames, canvas));
}

function playbackLoop(startTime, frameTime, frames, canvas) {
    const currentTime = performance.now();
    const elapsedTime = currentTime - startTime;
    const currentFrameIdx = Math.floor(elapsedTime / frameTime);
    if(currentFrameIdx >= frames.length) return;
    requestAnimationFrame(playbackLoop.bind(null, startTime, frameTime, frames, canvas));
    const currentFrame = frames[currentFrameIdx];
    canvas.width = currentFrame.width;
    canvas.height = currentFrame.height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(currentFrame, 0, 0);
}

export { prerender, startPlayback };