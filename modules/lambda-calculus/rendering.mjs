import * as Lambda from "./core.mjs";

const DEFAULT_RES = 1;
const DEFAULT_COLOR = "#000000";

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

function getTotalApplicationAmount(lambda) {
    if(typeof lambda === "number") return 0;
    if(lambda instanceof Lambda.Abstraction) return getTotalApplicationAmount(lambda.body);
    if(lambda instanceof Lambda.Application) return getTotalApplicationAmount(lambda.left) + getTotalApplicationAmount(lambda.right);
}

function getApplicationAmountAtIndex(lambda, idx) {
    if(typeof lambda === "number") return 0;
    if(idx < 0 || idx >= Lambda.getWidth(lambda)) return;
    if(lambda instanceof Lambda.Abstraction) return getApplicationAmountAtIndex(lambda.body, idx);
    if(lambda instanceof Lambda.Application) {
        const widthLeft = Lambda.getWidth(lambda.left);
        if(idx < widthLeft) return getApplicationAmountAtIndex(lambda.left, idx) + 1;
        return getApplicationAmountAtIndex(lambda.right, idx - widthLeft) + 1;
    }
}

function getApplicationHeightAtIndex(lambda, idx) {
    if(typeof lambda === "number") return;
    if(idx < 0 || idx >= Lambda.getWidth(lambda)) return;
    if(lambda instanceof Lambda.Abstraction) {
        if(Lambda.getWidth(lambda.body) === 1) return;
        return getApplicationHeightAtIndex(lambda.body, idx);
    }
    if(lambda instanceof Lambda.Application) {
        const widthLeft = Lambda.getWidth(lambda.left);
        if(idx < widthLeft) {
            if(widthLeft === 1) return getDiagramHeight(lambda) - 1 - getAbstractionAmountAtIndex(lambda.left, idx);
            return getApplicationHeightAtIndex(lambda.left, idx);
        }
        if(Lambda.getWidth(lambda.right) === 1) return getDiagramHeight(lambda) - 1 - getAbstractionAmountAtIndex(lambda.right, idx - widthLeft);
        return getApplicationHeightAtIndex(lambda.right, idx - widthLeft);
    }
}

function getHighestApplicationHeight(lambda) {
    if(typeof lambda === "number") return;
    if(lambda instanceof Lambda.Abstraction) {
        if(Lambda.getWidth(lambda.body) === 1) return;
        return getHighestApplicationHeight(lambda.body);
    }
    if(lambda instanceof Lambda.Application) {
        return getDiagramHeight(lambda) - 1;
    }
}

function drawAbstraction(ctx, offsetX, offsetY, lambda, res = DEFAULT_RES, color = DEFAULT_COLOR, lastApplicationHeight = null) {
    if(!(lambda instanceof Lambda.Abstraction)) return;
    ctx.fillStyle = color;
    
    ctx.fillRect(offsetX, offsetY, (Lambda.getWidth(lambda) * 4 - 1) * res, res);

    const wrappingApplicationHeight = lastApplicationHeight === null ? null : lastApplicationHeight - 1;

    const references = lambda.getReferences();
    const abstractionAmounts = references.map(typeof lambda.body === "number" ? (e => 0) : (e => getAbstractionAmountAtIndex(lambda.body, e)));
    const applicationHeights = references.map(Lambda.getWidth(lambda.body) === 1 ? (e => wrappingApplicationHeight) : (e => getApplicationHeightAtIndex(lambda, e)));
    for(let i = 0;i < references.length;i++) {
        ctx.fillRect(offsetX + (references[i] * 4 + 1) * res, offsetY, res, ((abstractionAmounts[i] + applicationHeights[i]) * 2 + 3) * res);
    }

    if(typeof lambda.body !== "number") {
        drawLambda(ctx, offsetX, offsetY + 2 * res, lambda.body, res, color, wrappingApplicationHeight);
    }
}

function drawApplication(ctx, offsetX, offsetY, lambda, res = DEFAULT_RES, color = DEFAULT_COLOR, lastApplicationHeight = null) {
    if(!(lambda instanceof Lambda.Application)) return;
    ctx.fillStyle = color;

    const widthLeft = Lambda.getWidth(lambda.left);
    const height = getDiagramHeight(lambda);
    const wrappingApplicationHeight = lastApplicationHeight === null ? null : lastApplicationHeight - height;
    
    if(typeof lambda.left !== "number") {
        drawLambda(ctx, offsetX, offsetY, lambda.left, res, color, height - 1);
    }
    if(typeof lambda.right !== "number") {
        drawLambda(ctx, offsetX + widthLeft * 4 * res, offsetY, lambda.right, res, color, height - 1);
    }

    ctx.fillRect(offsetX + res, offsetY + (height - 1) * 2 * res, (widthLeft * 4 + 1) * res, res);
    ctx.fillRect(offsetX + res, offsetY + (height - 1) * 2 * res, res, (wrappingApplicationHeight * 2 + 3) * res);
}

function drawLambda(ctx, offsetX, offsetY, lambda, res = DEFAULT_RES, color = DEFAULT_COLOR, lastApplicationHeight = null) {
    if(lambda instanceof Lambda.Abstraction) {
        drawAbstraction(ctx, offsetX, offsetY, lambda, res, color, lastApplicationHeight);
        return;
    }
    if(lambda instanceof Lambda.Application) {
        drawApplication(ctx, offsetX, offsetY, lambda, res, color, lastApplicationHeight);
    }
}

function createLambdaRender(lambda, res = DEFAULT_RES, color = DEFAULT_COLOR) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const width = Lambda.getWidth(lambda);
    const height = getDiagramHeight(lambda);
    canvas.width = (width * 4 - 1) * res;
    canvas.height = (height * 2 + 1) * res;

    drawLambda(ctx, 0, 0, lambda, res, color);

    return canvas;
}

export {
    DEFAULT_RES, DEFAULT_COLOR,
    getDiagramHeight, getAbstractionAmountAtIndex, getTotalApplicationAmount, getApplicationAmountAtIndex, getApplicationHeightAtIndex, getHighestApplicationHeight,
    drawAbstraction, drawApplication, drawLambda,
    createLambdaRender
};