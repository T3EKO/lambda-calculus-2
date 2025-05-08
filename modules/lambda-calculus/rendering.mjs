import * as Lambda from "./core.mjs";

const DEFAULT_RES = 1;
const DEFAULT_COLOR = "#000000";

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
        const leftWidth = Lambda.getWidth(lambda.left);
        if(idx < leftWidth) return getAbstractionAmountAtIndex(lambda.left, idx);
        return getAbstractionAmountAtIndex(lambda.right, idx - leftWidth);
    }
}

function drawAbstraction(lambda, res = DEFAULT_RES, color = DEFAULT_COLOR) {
    if(!(lambda instanceof Lambda.Abstraction)) return;
    const width = Lambda.getWidth(lambda);
    const height = getDiagramHeight(lambda);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = (width * 4 - 1) * res;
    canvas.height = height * 2 * res;
    ctx.fillStyle = color;

    if(typeof lambda.body !== "number") {
        const bodyCanvas = drawLambda(lambda.body, res, color);
        ctx.drawImage(bodyCanvas, 0, 2 * res);
    }

    ctx.fillRect(0, 0, canvas.width, res);

    const references = lambda.getReferences();
    for(let i = 0;i < references.length;i++) {
        const abstractionAmount = getAbstractionAmountAtIndex(lambda.body, references[i]);
        ctx.fillRect((references[i] * 4 + 1) * res, res, res, (abstractionAmount * 2 + 1) * res);
    }

    return canvas;
}

function drawApplication(lambda, res = DEFAULT_RES, color = DEFAULT_COLOR) {
    if(!(lambda instanceof Lambda.Application)) return;
    const width = Lambda.getWidth(lambda);
    const height = getDiagramHeight(lambda);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = (width * 4 - 1) * res;
    canvas.height = height * 2 * res;
    ctx.fillStyle = color;

    const leftWidth = Lambda.getWidth(lambda.left);

    if(typeof lambda.left !== "number") {
        const leftCanvas = drawLambda(lambda.left, res, color);
        ctx.drawImage(leftCanvas, 0, 0);
    }
    if(typeof lambda.right !== "number") {
        const rightCanvas = drawLambda(lambda.right, res, color);
        ctx.drawImage(rightCanvas, leftWidth * 4 * res, 0);
    }

    const leftHeight = getDiagramHeight(lambda.left);
    const rightHeight = getDiagramHeight(lambda.right);
    const diff = Math.abs(leftHeight - rightHeight);
    const xPos = (leftHeight > rightHeight ? leftWidth * 4 + 1 : 1) * res;
    ctx.fillRect(xPos, canvas.height - 2 * res, res, -diff * 2 * res);

    ctx.fillRect(res, canvas.height - 2 * res, (leftWidth * 4 + 1) * res, res);
    ctx.fillRect(res, canvas.height - res, res, res);

    return canvas;
}

function drawLambda(lambda, res = DEFAULT_RES, color = DEFAULT_COLOR) {
    if(lambda instanceof Lambda.Abstraction) return drawAbstraction(lambda, res, color);
    if(lambda instanceof Lambda.Application) return drawApplication(lambda, res, color);
}

export { DEFAULT_RES, DEFAULT_COLOR, drawLambda, drawAbstraction, drawApplication, getDiagramHeight, getAbstractionAmountAtIndex };