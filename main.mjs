import * as Mathc from "./modules/mathc.mjs";
import * as Lambda from "./modules/lambda-calculus/core.mjs";
import * as Beta from "./modules/lambda-calculus/beta-reduction.mjs";
import * as Prefabs from "./modules/lambda-calculus/prefabs.mjs";
import * as Rendering from "./modules/lambda-calculus/rendering.mjs";
import * as Animations from "./modules/animations.mjs";
import * as AnimRendering from "./modules/lambda-calculus/animations.mjs";
import * as Download from "./modules/download.mjs";




const DEBUG = true;


const canvas = document.getElementById("canvas");

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

const lambdaToRender = Prefabs.Y;
const preprocessedLambda = AnimRendering.preprocessBetaReduction(lambdaToRender.left, lambdaToRender.right);
preprocessedLambda.precomputeValues(20, "#000000");

function renderAnimationFrame(t) {
    return AnimRendering.drawBetaReductionAtTime(preprocessedLambda, t);
}

let animFrames = Animations.prerender(renderAnimationFrame, 4 * 30);











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

    window.canvas = canvas;
    window.lambdaToRender = lambdaToRender;
    window.preprocessedLambda = preprocessedLambda;
    window.renderAnimationFrame = renderAnimationFrame;
    window.animFrames = animFrames;
}