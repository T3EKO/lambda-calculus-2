import * as Lambda from "./core.mjs";

const DEFAULT_RES = 1;
const DEFAULT_COLOR = () => "#000000";

const presetColors = [
    "#ff3f3f",
    "#ff7f3f",
    "#ffbf3f",
    "#ffff3f",
    "#9fff3f",
    "#3fff3f",
    "#3fff9f",
    "#3fffff",
    "#3fbfff",
    "#3f7fff",
    "#3f3fff",
    "#7f3fff",
    "#bf3fff",
    "#ff3fff",
    "#ff3fbf",
    "#ff3f7f"
];
let currentPresetColorIdx = 0;
function getNextPresetColor() {
    const color = presetColors[currentPresetColorIdx];
    currentPresetColorIdx++;
    if(currentPresetColorIdx >= presetColors.length) currentPresetColorIdx = 0;
    return color;
}

function resetPresetColors() {
    currentPresetColorIdx = 0;
}

function getDiagramHeight(lambda) {
    if(typeof lambda === "number") return 0;
    if(lambda instanceof Lambda.Abstraction) return getDiagramHeight(lambda.body) + 1;
    if(lambda instanceof Lambda.Application) return Math.max(getDiagramHeight(lambda.left), getDiagramHeight(lambda.right)) + 1;
}

function getAbstractionAmountAtIndex(lambda, idx) {
    if(typeof lambda === "number") return 0;
    if(idx < 0 || idx >= Lambda.getWidth(lambda)) return;
    if(lambda instanceof Lambda.Abstraction) return getAbstractionAmountAtIndex(lambda.body, idx) + 1;
    if(lambda instanceof Lambda.Application) {
        const widthLeft = Lambda.getWidth(lambda.left);
        if(idx < widthLeft) return getAbstractionAmountAtIndex(lambda.left, idx);
        return getAbstractionAmountAtIndex(lambda.right, idx - widthLeft);
    }
}

function getApplicationHeightAtIndex(lambda, idx) {
    if(typeof lambda === "number") return 0;
    if(idx < 0 || idx >= Lambda.getWidth(lambda)) return;
    if(lambda instanceof Lambda.Abstraction) {
        if(Lambda.getWidth(lambda.body) === 1) return 0;
        return getApplicationHeightAtIndex(lambda.body, idx) + 1;
    }
    if(lambda instanceof Lambda.Application) {
        const widthLeft = Lambda.getWidth(lambda.left);
        if(idx < widthLeft) {
            if(widthLeft === 1) return getDiagramHeight(lambda) - 1;
            return getApplicationHeightAtIndex(lambda.left, idx);
        }
        if(Lambda.getWidth(lambda.right) === 1) return getDiagramHeight(lambda) - 1;
        return getApplicationHeightAtIndex(lambda.right, idx - widthLeft);
    }
}

function drawAbstraction(ctx, offsetX, offsetY, lambda, applicationHeight, res = DEFAULT_RES, color = DEFAULT_COLOR) {
    if(!(lambda instanceof Lambda.Abstraction)) return;

    const widthBody = Lambda.getWidth(lambda.body);

    ctx.fillStyle = color();
    ctx.fillRect(offsetX, offsetY, (widthBody * 4 - 1) * res, res);

    const references = lambda.getReferences();
    for(let i = 0;i < references.length;i++) {
        const currentApplicationHeight = widthBody === 1 ? applicationHeight : getApplicationHeightAtIndex(lambda, references[i]);
        ctx.fillRect(offsetX + (references[i] * 4 + 1) * res, offsetY, res, (currentApplicationHeight * 2 + 1) * res);
    }

    if(typeof lambda.body !== "number") {
        drawLambda(ctx, offsetX, offsetY + 2 * res, lambda.body, applicationHeight - 1, res, color);
    }
}

function drawApplication(ctx, offsetX, offsetY, lambda, applicationHeight, res = DEFAULT_RES, color = DEFAULT_COLOR) {
    if(!(lambda instanceof Lambda.Application)) return;

    const height = getDiagramHeight(lambda);
    const heightInner = height - 1;

    const widthLeft = Lambda.getWidth(lambda.left);
    if(typeof lambda.left !== "number") {
        drawLambda(ctx, offsetX, offsetY, lambda.left, heightInner, res, color);
    }
    if(typeof lambda.right !== "number") {
        drawLambda(ctx, offsetX + widthLeft * 4 * res, offsetY, lambda.right, heightInner, res, color);
    }

    ctx.fillStyle = color();
    ctx.fillRect(offsetX + res, offsetY + heightInner * 2 * res, (widthLeft * 4 + 1) * res, res);
    ctx.fillRect(offsetX + res, offsetY + heightInner * 2 * res, res, ((applicationHeight - height + 1) * 2 + 1) * res);
}

function drawLambda(ctx, offsetX, offsetY, lambda, applicationHeight, res = DEFAULT_RES, color = DEFAULT_COLOR) {
    if(lambda instanceof Lambda.Abstraction) {
        drawAbstraction(ctx, offsetX, offsetY, lambda, applicationHeight, res, color, applicationHeight);
        return;
    }
    if(lambda instanceof Lambda.Application) {
        drawApplication(ctx, offsetX, offsetY, lambda, applicationHeight, res, color, applicationHeight);
    }
}

function createLambdaRender(lambda, res = DEFAULT_RES, color = DEFAULT_COLOR) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const width = Lambda.getWidth(lambda);
    const height = getDiagramHeight(lambda);
    canvas.width = (width * 4 - 1) * res;
    canvas.height = (height * 2 + 1) * res;

    drawLambda(ctx, 0, 0, lambda, height, res, color);

    return canvas;
}

export {
    DEFAULT_RES, DEFAULT_COLOR, getNextPresetColor, resetPresetColors,
    getDiagramHeight, getAbstractionAmountAtIndex, getApplicationHeightAtIndex,
    drawAbstraction, drawApplication, drawLambda,
    createLambdaRender
};