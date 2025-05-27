
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

function fixFrameSize(frames) {
    const maxFrameSize = frames.map(e => { return { width: e.width, height: e.height }; }).reduce((a, b) => { return { width: Math.max(a.width, b.width), height: Math.max(a.height, b.height) }; });
    return frames.map(e => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = maxFrameSize.width;
        canvas.height = maxFrameSize.height;
        ctx.drawImage(e, 0, 0);
        return canvas;
    });
}

function fixWidth(frames, fromFn, toFn) {
    return frames.map((e, i) => {
        const t = i / (frames.length - 1);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = toFn(t);
        canvas.height = toFn(t);
        ctx.drawImage(e, 0, 0, e.width * toFn(t) / fromFn(t), e.height * toFn(t) / fromFn(t));
        return canvas;
    });
}

export { prerender, startPlayback, fixFrameSize, fixWidth };