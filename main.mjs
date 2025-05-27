import * as Mathc from "./modules/mathc.mjs";
import * as Lambda from "./modules/lambda-calculus/core.mjs";
import * as Beta from "./modules/lambda-calculus/beta-reduction.mjs";
import * as Prefabs from "./modules/lambda-calculus/prefabs.mjs";
import * as Rendering from "./modules/lambda-calculus/rendering.mjs";
import * as Animations from "./modules/animations.mjs";
import * as AnimRendering from "./modules/lambda-calculus/animations.mjs";
import * as Download from "./modules/files/download.mjs";
import * as ZipCanvases from "./modules/files/zip-canvases.mjs";
import "./node_modules/jszip/dist/jszip.js";




const DEBUG = true;


const canvas = document.getElementById("canvas");

function afn(p, b) {
    return new AnimRendering.AbstractionWithReplacement(p, b);
}

function aapl(l, r) {
    return new AnimRendering.ApplicationWithReplacement(l, r);
}

// function renderAnimationFrame(t) {
//     const angle = t * 2 * Math.PI;
//     const hue = Math.floor(t * 360);
//     const xPos = 250 + 200 * Math.cos(angle);
//     const yPos = 250 + 200 * Math.sin(angle);
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");
//     canvas.width = 500;
//     canvas.height = 500;

//     ctx.beginPath();
//     ctx.ellipse(xPos, yPos, 50, 50, 0, 0, 2 * Math.PI);
//     ctx.fill();

//     ctx.fillStyle = `hsl(${hue},100%,50%)`;
//     ctx.fillRect(t * 450, t * 450, 50, 50);

//     return canvas;
// }

// const lambdaToRender = Prefabs.appl(Prefabs.FALSE, Prefabs.fn(2, Prefabs.fn(3, Prefabs.appl(0, Prefabs.appl(1, Prefabs.appl(2, Prefabs.appl(3, Prefabs.appl(0, 1))))))));
// const lambdaToRender = Prefabs.appl(Prefabs.FALSE, Prefabs.NTH_INTEGER(7));
// const lambdaToRender = Prefabs.appl(Prefabs.fn(0, Prefabs.fn(1, Prefabs.fn(2, Prefabs.fn(3, 0)))), Prefabs.NTH_INTEGER(7));
// const lambdaToRender = Prefabs.appl(Prefabs.FALSE, Prefabs.NTH_INTEGER(7));
// const lambdaToRender = Prefabs.appl(Prefabs.fn(0, Prefabs.appl(0, 0)), Prefabs.NTH_INTEGER(7));
// const lambdaToRender = Prefabs.appl(Prefabs.fn(2, Prefabs.appl(0, Prefabs.appl(0, Prefabs.appl(0, 2)))), Prefabs.fn(2, 1));
// const lambdaToRender = Prefabs.OMEGA3;
// const lambdaToRender = Prefabs.appl(Prefabs.FALSE, Prefabs.TRUE);
// const lambdaToRender = Prefabs.appl(Prefabs.PLUS, Prefabs.NTH_INTEGER(7));
// const lambdaToRender = Prefabs.Y;
// const lambdaToRender = Prefabs.appl(Prefabs.NTH_INTEGER(3), Prefabs.NTH_INTEGER(2));
// const lambdaToRender = Prefabs.appl(Prefabs.orderedMess(1, 1, 2, 5, 3), Prefabs.NTH_INTEGER(5));
// const lambdaToRender = Prefabs.appl(Prefabs.fn(0, Prefabs.appl(0, 0)), Prefabs.fn(0, Prefabs.appl(0, 0)));
// const lambdaToRender = Prefabs.OMEGA3;
// const lambdaToRender = Prefabs.appl(Prefabs.NTH_INTEGER(2), Prefabs.NTH_INTEGER(4));
// (λa.((λb.(λc.(c c))) (λb.(λc.(b c)))))
// (λa.((λbc.(c c)) (λbc.(b c))))
// (λa.(λb.(a b)))
// const lambdaToRender = Prefabs.appl(Prefabs.fn(0, Prefabs.appl(Prefabs.cfn(1, 2, Prefabs.appl(2, 2)), Prefabs.cfn(1, 2, Prefabs.appl(1, 2)))), Prefabs.cfn(0, 1, Prefabs.appl(0, 1)));
// const lambdaToRender = Prefabs.appl(Prefabs.fn(0, Prefabs.fn(1, Prefabs.appl(0, 1))), Prefabs.fn(0, Prefabs.fn(1, 1)));
// const lambdaToRender = Prefabs.appl(Prefabs.fn(0, 0), Prefabs.fn(0, 0));
// const preprocessedLambda = AnimRendering.preprocessBetaReduction(lambdaToRender.left, lambdaToRender.right);

// const embeddedPreprocessedLambda = new AnimRendering.ApplicationWithReplacement(Prefabs.NTH_INTEGER(3), preprocessedLambda);
// const embeddedPreprocessedLambda = new AnimRendering.AbstractionWithReplacement(5, new AnimRendering.ApplicationWithReplacement(preprocessedLambda, Prefabs.appl(5, 5)));
// const embeddedPreprocessedLambda = afn(0, afn(1, aapl(aapl(Prefabs.OMEGA3, preprocessedLambda), Prefabs.appl(Prefabs.OMEGA3, Prefabs.appl(Prefabs.appl(0, 1), 0)))));
// const embeddedPreprocessedLambda = aapl(preprocessedLambda, Prefabs.NTH_INTEGER(3));
// const embeddedPreprocessedLambda = afn(0, afn(1, aapl(preprocessedLambda, afn(2, afn(3, aapl(2, aapl(2, aapl(2, aapl(2, aapl(2, aapl(2, 3)))))))))));

// const lambdaToReduce = Prefabs.cappl(Prefabs.PLUS, Prefabs.NTH_INTEGER(2), Prefabs.NTH_INTEGER(2));

// const lambda = preprocessedLambda;


// function renderAnimationFrame(t, ctx, transparentCtx) {
//     const width = AnimRendering.getWidthAtTime(t, lambda);
//     const height = AnimRendering.getDiagramHeightAtTime(t, lambda);
//     const heightBefore = AnimRendering.getDiagramHeightAtTime(0, lambda);
//     const heightAfter = AnimRendering.getDiagramHeightAtTime(1, lambda);

//     const tileWidth = width * 4 - 1;
//     const screenWidth = 1920;
//     const minWidth = 64 * 3;
//     const widthK = 1 - Math.pow(Math.E, (1 - tileWidth) / 64);
//     const currentWidth = Mathc.lerp(minWidth, screenWidth, widthK);

//     AnimRendering.drawLambdaAtTime(t, ctx, transparentCtx, (screenWidth - currentWidth) * 0.5, 0, lambda, {before: heightBefore, now: height, after: heightAfter}, currentWidth / (width * 4 - 1), () => "#ffffff");
//     ctx.globalAlpha = 1 - t;
//     ctx.drawImage(transparentCtx.canvas, 0, 0);
//     ctx.globalAlpha = 1;
// }

// function renderAndDownloadFrames(width, height, frameCount, renderCallback, framePrefix, zipName) {
//     const zip = new JSZip();
//     const canvas = document.createElement("canvas");
//     const ctx = canvas.getContext("2d");
//     canvas.width = width;
//     canvas.height = height;
//     const transparentCanvas = document.createElement("canvas");
//     const transparentCtx = transparentCanvas.getContext("2d");
//     transparentCanvas.width = width;
//     transparentCanvas.height = height;

//     renderAndZipFrame(ctx, transparentCtx, zip, 0, frameCount, renderCallback, framePrefix, zipName);
// }

// async function renderAndZipFrame(ctx, transparentCtx, zip, i, frameCount, renderCallback, framePrefix, zipName) {
//     ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
//     transparentCtx.clearRect(0, 0, transparentCtx.canvas.width, transparentCtx.canvas.height);
//     renderCallback(i / (frameCount - 1), ctx, transparentCtx);
//     ctx.canvas.toBlob(async blob => {
//         await zip.file(`${framePrefix}${i}.png`, blob);
//         if(i < frameCount - 1) {
//             renderAndZipFrame(ctx, transparentCtx, zip, i + 1, frameCount, renderCallback, framePrefix, zipName);
//             return;
//         }

//         zip.generateAsync({ type: "blob" }).then(blob => Download.downloadURL(URL.createObjectURL(blob), `${zipName}.zip`));
//     });
// }

function renderAndDownloadBetaReduction(width, height, res, color, lambdaToReduce, maxReductions, framesPerReduction, framePrefix, reductionPrefix, zipName) {
    const zip = new JSZip();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;
    const transparentCanvas = document.createElement("canvas");
    const transparentCtx = transparentCanvas.getContext("2d");
    transparentCanvas.width = width;
    transparentCanvas.height = height;

    const reductionSteps = Beta.normallyReduceUntilBetaNormalWithData(lambdaToReduce, maxReductions, (data) => data).data;
    const preprocessedReductionSteps = reductionSteps.filter(e => e.reduction).map(e => AnimRendering.betaReduceAndPreproccess(e.before));

    renderAndZipFrame(0, 0);

    function renderFrame(t, reductionStep) {
        const currentLambda = preprocessedReductionSteps[reductionStep];
        const smoothT = Mathc.smoothstep(t);

        const diagramWidth = AnimRendering.getWidthAtTime(smoothT, currentLambda);
        const diagramHeight = AnimRendering.getDiagramHeightAtTime(smoothT, currentLambda);
        const heightBefore = AnimRendering.getDiagramHeightAtTime(0, currentLambda);
        const heightAfter = AnimRendering.getDiagramHeightAtTime(1, currentLambda);

        const tileWidth = diagramWidth * 4 - 1;
        const pixelWidth = tileWidth * res;
        const hBorderPixels = (width - pixelWidth) * 0.5;
        const maxHBorderPixels = (width - res) * 0.5;
        const paddedHBorderPixels = maxHBorderPixels * Math.pow(Math.E, (hBorderPixels - maxHBorderPixels) / maxHBorderPixels);
        const widthScale = (width - 2 * paddedHBorderPixels) / pixelWidth;

        const tileHeight = diagramHeight * 2 + 1;
        const pixelHeight = tileHeight * res;
        const scaledPixelHeight = pixelHeight * widthScale;
        const vBorderPixels = (height - scaledPixelHeight) * 0.5;
        const maxVBorderPixels = (height - res) * 0.5;
        const paddedVBorderPixels = maxVBorderPixels * Math.min(Math.pow(Math.E, (vBorderPixels - maxVBorderPixels) / maxVBorderPixels), 1);
        const heightScale = Math.min((height - 2 * paddedVBorderPixels) / scaledPixelHeight, 1);

        const resScale = widthScale * heightScale;

        const currentWidth = pixelWidth * resScale;
        const currentHeight = pixelHeight * resScale;
        // const minWidth = res * 3;
        // const widthK = 1 - Math.pow(Math.E, (1 - tileWidth) / 32);
        // const currentWidth = Mathc.lerp(minWidth, width, widthK);
        // const currentRes = currentWidth / (diagramWidth * 4 - 1);
        // const currentHeight = (diagramHeight * 2 + 1) * currentRes;

        AnimRendering.drawLambdaAtTime(smoothT, ctx, transparentCtx, (width - currentWidth) * 0.5, (height - currentHeight) * 0.5, currentLambda, {before: heightBefore, now: diagramHeight, after: heightAfter}, res * resScale, color);
        ctx.globalAlpha = 1 - smoothT;
        ctx.drawImage(transparentCtx.canvas, 0, 0);
        ctx.globalAlpha = 1;
    }

    async function renderAndZipFrame(reductionStep, currentFrame) {
        ctx.clearRect(0, 0, width, height);
        transparentCtx.clearRect(0, 0, width, height);
        renderFrame(currentFrame / (framesPerReduction - 1), reductionStep);
        ctx.canvas.toBlob(async blob => {
            await zip.file(`${reductionPrefix}${reductionStep}${framePrefix}${currentFrame}.png`, blob);

            console.log(Math.floor(10000 * (reductionStep * framesPerReduction + currentFrame) / (framesPerReduction * preprocessedReductionSteps.length - 1)) / 100);

            if(currentFrame < framesPerReduction - 1) {
                renderAndZipFrame(reductionStep, currentFrame + 1);
                return;
            }

            if(reductionStep < preprocessedReductionSteps.length - 1) {
                renderAndZipFrame(reductionStep + 1, 0);
                return;
            }

            zip.generateAsync({ type: "blob" }).then(blob => Download.downloadURL(URL.createObjectURL(blob), `${zipName}.zip`));
        });
    }
}









if(DEBUG) {
    window.Mathc = Mathc;
    window.Lambda = Lambda;
    window.Beta = Beta;
    window.Prefabs = Prefabs;
    window.fn = Prefabs.fn;
    window.appl = Prefabs.appl;
    window.Rendering = Rendering;
    window.Animations = Animations;
    window.AnimRendering = AnimRendering;
    window.Download = Download;
    window.ZipCanvases = ZipCanvases;

    window.canvas = canvas;
    // window.lambdaToReduce = lambdaToReduce;
    // window.lambdaToRender = lambdaToRender;
    // window.preprocessedLambda = preprocessedLambda;
    // window.embeddedPreprocessedLambda = embeddedPreprocessedLambda;
    // window.renderAnimationFrame = renderAnimationFrame;
    // window.animFrames = animFrames;

    // window.incrementallyReduceRenderAndDownload = incrementallyReduceRenderAndDownload;
    // window.renderAndDownloadFrames = renderAndDownloadFrames;
    window.renderAndDownloadBetaReduction = renderAndDownloadBetaReduction;
}