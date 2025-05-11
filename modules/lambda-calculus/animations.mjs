import * as Mathc from "../mathc.mjs";
import * as Lambda from "./core.mjs";
import { appl } from "./prefabs.mjs";
import * as Rendering from "./rendering.mjs";

function getBaseLambda(lambda) {
    if(!hasReplacement(lambda)) return lambda;
    if(lambda instanceof ReplacedVariable) return lambda.variable;
    if(lambda instanceof AbstractionWithReplacement) return new Lambda.Abstraction(lambda.param, getBaseLambda(lambda.body));
    if(lambda instanceof ApplicationWithReplacement) return new Lambda.Application(getBaseLambda(lambda.left), getBaseLambda(lambda.right));
}

function getBaseLambdaAfter(lambda) {
    if(!hasReplacement(lambda)) return lambda;
    if(lambda instanceof ReplacedVariable) return lambda.argument;
    if(lambda instanceof AbstractionWithReplacement) return new Lambda.Abstraction(lambda.param, getBaseLambdaAfter(lambda.body));
    if(lambda instanceof ApplicationWithReplacement) return new Lambda.Application(getBaseLambdaAfter(lambda.left), getBaseLambdaAfter(lambda.right));
}

function getWidthAtTime(t, lambda) {
    if(hasReplacement(lambda)) return Mathc.lerp(lambda.widthBefore, lambda.widthAfter, t);
    return Lambda.getWidth(lambda);
}

function getDiagramHeightAtTime(t, lambda) {
    if(hasReplacement(lambda)) return Mathc.lerp(lambda.heightBefore, lambda.heightAfter, t);
    return Rendering.getDiagramHeight(lambda);
}

function getPosAtIndexAtTime(t, lambda, idx) {
    if(typeof lambda === "number" || lambda instanceof ReplacedVariable) return 0;
    if(idx < 0 || idx > Lambda.getWidth(getBaseLambda(lambda))) return;
    if(lambda instanceof AbstractionWithReplacement) {
        return getPosAtIndexAtTime(t, lambda.body, idx);
    }
    if(lambda instanceof ApplicationWithReplacement) {
        const widthLeft = Lambda.getWidth(getBaseLambda(lambda.left));
        if(idx < widthLeft) {
            return getPosAtIndexAtTime(t, lambda.left, idx);
        }
        const offsetLeft = getWidthAtTime(t, lambda.left);
        return getPosAtIndexAtTime(t, lambda.right, idx - widthLeft) + offsetLeft;
    }
    return idx;
}

function getApplicationHeightAtIndexAtTime(t, lambda, idx) {
    if(typeof lambda === "number" || lambda instanceof ReplacedVariable) return 0;
    if(idx < 0 || idx >= Lambda.getWidth(lambda)) return;
    if(lambda instanceof AbstractionWithReplacement) {
        if(Lambda.getWidth(getBaseLambda(lambda.body)) === 1) return 0;
        return getApplicationHeightAtIndexAtTime(t, lambda.body, idx) + 1;
    }
    if(lambda instanceof Lambda.Application) {
        const widthLeft = Lambda.getWidth(getBaseLambda(lambda.left));
        if(idx < widthLeft) {
            if(widthLeft === 1) return getDiagramHeightAtTime(t, lambda) - 1;
            return getApplicationHeightAtIndexAtTime(t, lambda.left, idx);
        }
        if(Lambda.getWidth(getBaseLambda(lambda.right)) === 1) return getDiagramHeightAtTime(t, lambda) - 1;
        return getApplicationHeightAtIndexAtTime(t, lambda.right, idx - widthLeft);
    }
    return Rendering.getApplicationHeightAtIndex(lambda, idx);
}

class ReplacedVariable {
    variable;
    argument;

    widthBefore;
    widthAfter;
    heightBefore;
    heightAfter;

    constructor(variable, argument) {
        this.variable = variable;
        this.argument = argument;

        this.widthBefore = Lambda.getWidth(variable);
        this.widthAfter = Lambda.getWidth(argument);

        this.heightBefore = Rendering.getDiagramHeight(variable);
        this.heightAfter = Rendering.getDiagramHeight(argument);
    }
}

class AbstractionWithReplacement extends Lambda.Abstraction {

    widthBefore;
    widthAfter;
    heightBefore;
    heightAfter;

    constructor(param, body) {
        super(param, body);

        this.widthBefore = Lambda.getWidth(getBaseLambda(this));
        this.widthAfter = Lambda.getWidth(getBaseLambdaAfter(this));

        this.heightBefore = Rendering.getDiagramHeight(getBaseLambda(this));
        this.heightAfter = Rendering.getDiagramHeight(getBaseLambdaAfter(this));
    }
}

class ApplicationWithReplacement extends Lambda.Application {

    widthBefore;
    widthAfter;
    heightBefore;
    heightAfter;

    constructor(left, right) {
        super(left, right);

        this.widthBefore = Lambda.getWidth(getBaseLambda(this));
        this.widthAfter = Lambda.getWidth(getBaseLambdaAfter(this));

        this.heightBefore = Rendering.getDiagramHeight(getBaseLambda(this));
        this.heightAfter = Rendering.getDiagramHeight(getBaseLambdaAfter(this));
    }
}

class BetaReduction {
    abstraction;
    argument;

    heightBefore;
    heightAfter;

    constructor(abstraction, argument) {
        this.abstraction = abstraction;
        this.argument = argument;

        this.heightBefore = Rendering.getDiagramHeight(new Lambda.Application(getBaseLambda(abstraction), argument));
        this.heightAfter = Rendering.getDiagramHeight(getBaseLambdaAfter(abstraction));
    }
}

function hasReplacement(lambda) {
    return lambda instanceof ReplacedVariable || lambda instanceof AbstractionWithReplacement || lambda instanceof ApplicationWithReplacement;
}

function preprocessLambda(lambda, variable, argument) {
    if(typeof lambda === "number") {
        if(lambda === variable) return new ReplacedVariable(variable, argument);
        return lambda;
    }
    if(lambda instanceof Lambda.Abstraction) {
        const preprocessedBody = preprocessLambda(lambda.body, variable, argument);
        if(hasReplacement(preprocessedBody)) return new AbstractionWithReplacement(lambda.param, preprocessedBody);
        return lambda;
    }
    if(lambda instanceof Lambda.Application) {
        const preprocessedLeft = preprocessLambda(lambda.left, variable, argument);
        const preprocessedRight = preprocessLambda(lambda.right, variable, argument);
        if(hasReplacement(preprocessedLeft) || hasReplacement(preprocessedRight)) return new ApplicationWithReplacement(preprocessedLeft, preprocessedRight);
        return lambda;
    }
}

function preprocessBetaReduction(abstraction, argument) {
    if(!(abstraction instanceof Lambda.Abstraction)) return;
    const preprocessedAbstraction = preprocessLambda(abstraction, abstraction.param, argument);
    return new BetaReduction(preprocessedAbstraction, argument);
}

function drawAbstractionAtTime(t, ctx, offsetX, offsetY, lambda, applicationHeight, res = Rendering.DEFAULT_RES, color = Rendering.DEFAULT_COLOR) {
    if(!(lambda instanceof Lambda.Abstraction)) return;

    const widthBody = getWidthAtTime(t, lambda.body);

    ctx.fillStyle = color();
    ctx.fillRect(offsetX, offsetY, (widthBody * 4 - 1) * res, res);

    const references = getBaseLambda(lambda).getReferences();
    for(let i = 0;i < references.length;i++) {
        const pos = getPosAtIndexAtTime(t, lambda, references[i]);
        const currentApplicationHeight = Lambda.getWidth(getBaseLambda(lambda.body)) === 1 ? applicationHeight : getApplicationHeightAtIndexAtTime(t, lambda, references[i]);
        ctx.fillRect(offsetX + (pos * 4 + 1) * res, offsetY, res, (currentApplicationHeight * 2 + 1) * res);
    }

    if(typeof lambda.body !== "number") {
        drawLambdaAtTime(t, ctx, offsetX, offsetY + 2 * res, lambda.body, applicationHeight - 1, res, color);
    }
}

function drawApplicationAtTime(t, ctx, offsetX, offsetY, lambda, applicationHeight, res = Rendering.DEFAULT_RES, color = Rendering.DEFAULT_COLOR) {
    if(!(lambda instanceof Lambda.Application)) return;

    const height = getDiagramHeightAtTime(t, lambda);
    const heightInner = height - 1;

    const widthLeft = getWidthAtTime(t, lambda.left);
    if(typeof lambda.left !== "number") {
        drawLambdaAtTime(t, ctx, offsetX, offsetY, lambda.left, heightInner, res, color);
    }
    if(typeof lambda.right !== "number") {
        drawLambdaAtTime(t, ctx, offsetX + widthLeft * 4 * res, offsetY, lambda.right, heightInner, res, color);
    }

    ctx.fillStyle = color();
    ctx.fillRect(offsetX + res, offsetY + heightInner * 2 * res, (widthLeft * 4 + 1) * res, res);
    ctx.fillRect(offsetX + res, offsetY + heightInner * 2 * res, res, ((applicationHeight - height + 1) * 2 + 1) * res);
    
}

function drawLambdaAtTime(t, ctx, offsetX, offsetY, lambda, applicationHeight, res = Rendering.DEFAULT_RES, color = Rendering.DEFAULT_COLOR) {
    if(lambda instanceof Lambda.Abstraction) {
        drawAbstractionAtTime(t, ctx, offsetX, offsetY, lambda, applicationHeight, res, color);
        return;
    }
    if(lambda instanceof Lambda.Application) {
        drawApplicationAtTime(t, ctx, offsetX, offsetY, lambda, applicationHeight, res, color);
    }
}

function createBetaReductionRenderAtTime(t, betaReduction, res = Rendering.DEFAULT_RES, color = Rendering.DEFAULT_COLOR) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const abstractionBodyWidth = getWidthAtTime(t, betaReduction.abstraction.body);
    const abstractionBodyHeight = getDiagramHeightAtTime(t, betaReduction.abstraction.body);
    const argumentHeight = Rendering.getDiagramHeight(betaReduction.argument);
    const abstractionBodyWidthBefore = getWidthAtTime(0, betaReduction.abstraction.body);
    const abstractionBodyHeightBefore = getDiagramHeightAtTime(0, betaReduction.abstraction.body);
    const posXBefore = abstractionBodyWidthBefore;
    const applicationHeightBefore = Math.max(abstractionBodyHeightBefore + 1, argumentHeight);
    const applicationHeightAfter = getDiagramHeightAtTime(1, betaReduction.abstraction.body);
    const references = getBaseLambda(betaReduction.abstraction).getReferences();
    
    const width = abstractionBodyWidth + Lambda.getWidth(betaReduction.argument);
    const height = Mathc.lerp(applicationHeightBefore, applicationHeightAfter, t) + 1;
    canvas.width = (width * 4 - 1) * res;
    canvas.height = references.length === 0 ? ((applicationHeightBefore + 1) * 2 + 1) * res : (height * 2 + 1) * res;


    ctx.fillStyle = color();

    const transparentCanvas = document.createElement("canvas");
    const transparentCtx = transparentCanvas.getContext("2d");
    transparentCanvas.width = canvas.width;
    transparentCanvas.height = canvas.height;
    transparentCtx.fillStyle = ctx.fillStyle;

    transparentCtx.fillRect(0, 0, (abstractionBodyWidthBefore * 4 - 1) * res, res);
    for(let i = 0;i < references.length;i++) {
        const currentApplicationHeight = Lambda.getWidth(getBaseLambda(betaReduction.abstraction.body)) === 1 ? applicationHeightBefore : Rendering.getApplicationHeightAtIndex(getBaseLambda(betaReduction.abstraction), references[i]);
        transparentCtx.fillRect((references[i] * 4 + 1) * res, 0, res, (currentApplicationHeight * 2 + 1) * res);
    }
    if(references.length === 0) {
        Rendering.drawLambda(transparentCtx, posXBefore * 4 * res, 0, betaReduction.argument, applicationHeightBefore, res, color);
    }

    transparentCtx.fillRect(res, applicationHeightBefore * 2 * res, (abstractionBodyWidthBefore * 4 + 1) * res, res);
    transparentCtx.fillRect(res, applicationHeightBefore * 2 * res, res, 3 * res);


    ctx.globalAlpha = 1 - t;
    ctx.drawImage(transparentCanvas, 0, 0);
    ctx.globalAlpha = 1;

    drawLambdaAtTime(t, ctx, 0, Mathc.lerp(2 * res, 0, t), betaReduction.abstraction.body, Mathc.lerp(applicationHeightBefore - 1, applicationHeightAfter, t), res, color);

    for(let i = 0;i < references.length;i++) {
        const posXAfter = getPosAtIndexAtTime(1, betaReduction.abstraction.body, references[i]);
        const posYAfter = Rendering.getAbstractionAmountAtIndex(getBaseLambda(betaReduction.abstraction.body), references[i]);
        const applicationHeightAfter = (abstractionBodyWidthBefore === 1 ? getDiagramHeightAtTime(1, betaReduction.abstraction.body) : getApplicationHeightAtIndexAtTime(1, betaReduction.abstraction.body, references[i])) - Rendering.getAbstractionAmountAtIndex(getBaseLambda(betaReduction.abstraction.body), references[i]);
        Rendering.drawLambda(ctx, Mathc.lerp(posXBefore, posXAfter, t) * 4 * res, Mathc.lerp(0, posYAfter, t) * 2 * res, betaReduction.argument, Mathc.lerp(applicationHeightBefore, applicationHeightAfter, t), res, color);
    }

    return canvas;
}

export {
    getBaseLambda, getBaseLambdaAfter, getWidthAtTime, getDiagramHeightAtTime, getPosAtIndexAtTime, getApplicationHeightAtIndexAtTime,
    hasReplacement,
    preprocessBetaReduction,
    createBetaReductionRenderAtTime
};