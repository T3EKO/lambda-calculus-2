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

const lambdaToReduce = Prefabs.cappl(Prefabs.PLUS, Prefabs.NTH_INTEGER(2), Prefabs.NTH_INTEGER(2));

// const preproccessedBetaReduction0 = AnimRendering.betaReduceAndPreproccess(lambdaToReduce);
// const lambdaReduced0 = Beta.reduceNormalOrderAndCleanup(lambdaToReduce);

// const preproccessedBetaReduction1 = AnimRendering.betaReduceAndPreproccess(lambdaReduced0);
// const lambdaReduced1 = Beta.reduceNormalOrderAndCleanup(lambdaReduced0);

// const preproccessedBetaReduction2 = AnimRendering.betaReduceAndPreproccess(lambdaReduced1);
// const lambdaReduced2 = Beta.reduceNormalOrderAndCleanup(lambdaReduced1);

// const preproccessedBetaReduction3 = AnimRendering.betaReduceAndPreproccess(lambdaReduced2);
// const lambdaReduced3 = Beta.reduceNormalOrderAndCleanup(lambdaReduced2);

// const preproccessedBetaReduction4 = AnimRendering.betaReduceAndPreproccess(lambdaReduced3);
// const lambdaReduced4 = Beta.reduceNormalOrderAndCleanup(lambdaReduced3);

// const preproccessedBetaReduction5 = AnimRendering.betaReduceAndPreproccess(lambdaReduced4);
// const lambdaReduced5 = Beta.reduceNormalOrderAndCleanup(lambdaReduced4);

// function renderAnimationFrame0(t) {
//     // return AnimRendering.createBetaReductionRenderAtTime(Mathc.smoothstep(t), preprocessedLambda, 32, () => "#ffffff");
//     // return AnimRendering.createLambdaRenderAtTime(Mathc.smoothstep(t), embeddedPreprocessedLambda, 32, () => "#ffffff");
//     return AnimRendering.createLambdaRenderAtTime(Mathc.smoothstep(t), preproccessedBetaReduction0, 32, () => "#ffffff");
// }

// function renderAnimationFrame1(t) {
//     return AnimRendering.createLambdaRenderAtTime(Mathc.smoothstep(t), preproccessedBetaReduction1, 32, () => "#ffffff");
// }

// function renderAnimationFrame2(t) {
//     return AnimRendering.createLambdaRenderAtTime(Mathc.smoothstep(t), preproccessedBetaReduction2, 32, () => "#ffffff");
// }

// function renderAnimationFrame3(t) {
//     return AnimRendering.createLambdaRenderAtTime(Mathc.smoothstep(t), preproccessedBetaReduction3, 32, () => "#ffffff");
// }

// function renderAnimationFrame4(t) {
//     return AnimRendering.createLambdaRenderAtTime(Mathc.smoothstep(t), preproccessedBetaReduction4, 32, () => "#ffffff");
// }

// function renderAnimationFrame5(t) {
//     return AnimRendering.createLambdaRenderAtTime(Mathc.smoothstep(t), preproccessedBetaReduction5, 32, () => "#ffffff");
// }

// let animFrames0 = Animations.fixFrameSize(Animations.prerender(renderAnimationFrame0, 1 * 30));
// let animFrames1 = Animations.fixFrameSize(Animations.prerender(renderAnimationFrame1, 1 * 30));
// let animFrames2 = Animations.fixFrameSize(Animations.prerender(renderAnimationFrame2, 1 * 30));
// let animFrames3 = Animations.fixFrameSize(Animations.prerender(renderAnimationFrame3, 1 * 30));
// let animFrames4 = Animations.fixFrameSize(Animations.prerender(renderAnimationFrame4, 1 * 30));
// let animFrames5 = Animations.fixFrameSize(Animations.prerender(renderAnimationFrame5, 1 * 30));

function incrementallyReduceRenderAndDownload(lambdaToReduce, maxReductions, res, color, framesPerReduction, framePrefix, zipPrefix) {
    let intermediate = lambdaToReduce;
    for(let i = 0;i < maxReductions;i++) {
        const reduced = Beta.reduceNormalOrderWithData(intermediate);
        if(!reduced.reduction) break;
        const preproccessed = AnimRendering.betaReduceAndPreproccess(intermediate);
        const frames = Animations.prerender((t) => AnimRendering.createLambdaRenderAtTime(Mathc.smoothstep(t), preproccessed, res, color), framesPerReduction);
        ZipCanvases.zipAndDownloadCanvases(frames, `${framePrefix}${i}-`, `${zipPrefix}${i}`);
        intermediate = Beta.reduceNormalOrderAndCleanup(intermediate);
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
    window.lambdaToReduce = lambdaToReduce;
    // window.preprocessedLambda = preprocessedLambda;
    // window.embeddedPreprocessedLambda = embeddedPreprocessedLambda;
    // window.renderAnimationFrame = renderAnimationFrame;
    // window.animFrames0 = animFrames0;
    // window.animFrames1 = animFrames1;
    // window.animFrames2 = animFrames2;
    // window.animFrames3 = animFrames3;
    // window.animFrames4 = animFrames4;
    // window.animFrames5 = animFrames5;

    window.incrementallyReduceRenderAndDownload = incrementallyReduceRenderAndDownload;
}