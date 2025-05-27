import * as Mathc from "../mathc.mjs";
import * as Lambda from "./core.mjs";
import * as Beta from "./beta-reduction.mjs";
import * as Rendering from "./rendering.mjs";

function getBaseLambda(lambda) {
    if(lambda instanceof BetaReduction) return new Lambda.Application(getBaseLambda(lambda.abstraction), lambda.argument);
    if(!hasReplacement(lambda)) return lambda;
    if(lambda instanceof ReplacedVariable) return lambda.variable;
    if(lambda instanceof AbstractionWithReplacement) return new Lambda.Abstraction(lambda.param, getBaseLambda(lambda.body));
    if(lambda instanceof ApplicationWithReplacement) return new Lambda.Application(getBaseLambda(lambda.left), getBaseLambda(lambda.right));
}

function getBaseLambdaAfter(lambda) {
    if(lambda instanceof BetaReduction) return getBaseLambdaAfter(lambda.abstraction.body);
    if(!hasReplacement(lambda)) return lambda;
    if(lambda instanceof ReplacedVariable) return lambda.argument;
    if(lambda instanceof AbstractionWithReplacement) return new Lambda.Abstraction(lambda.param, getBaseLambdaAfter(lambda.body));
    if(lambda instanceof ApplicationWithReplacement) return new Lambda.Application(getBaseLambdaAfter(lambda.left), getBaseLambdaAfter(lambda.right));
}

function getWidthAtTime(t, lambda) {
    if(hasReplacement(lambda) || lambda instanceof BetaReduction) return Mathc.lerp(lambda.widthBefore, lambda.widthAfter, t);
    return Lambda.getWidth(lambda);
}

function getCanvasWidth(lambda) {
    if(!(hasReplacement(lambda) || lambda instanceof BetaReduction)) return Lambda.getWidth(lambda);
    return lambda.canvasWidth;
}

function getDiagramHeightAtTime(t, lambda) {
    if(hasReplacement(lambda) || lambda instanceof BetaReduction) return Mathc.lerp(lambda.heightBefore, lambda.heightAfter, t);
    return Rendering.getDiagramHeight(lambda);
}

function getCanvasHeight(lambda) {
    if(!(hasReplacement(lambda) || lambda instanceof BetaReduction)) return Rendering.getDiagramHeight(lambda);
    return lambda.canvasHeight;
}

function getPosAtIndexAtTime(t, lambda, applicationHeightAfter, idx) {
    if(typeof lambda === "number" || lambda instanceof ReplacedVariable) return 0;
    if(idx < 0 || idx > Lambda.getWidth(getBaseLambda(lambda))) return;
    if(lambda instanceof AbstractionWithReplacement) {
        const posData = getPosAtIndexAtTime(t, lambda.body, applicationHeightAfter - 1, idx);
        if(posData instanceof Object && !(posData instanceof Array)) return {substitutions: [], posXBefore: posData.posXBefore, applicationHeightBefore: posData.applicationHeightBefore + 1, additions: posData.additions + 1, betaReduction: posData.betaReduction, relativeIdx: posData.relativeIdx};
        return posData;
    }
    if(lambda instanceof ApplicationWithReplacement) {
        const widthLeft = Lambda.getWidth(getBaseLambda(lambda.left));
        const heightAfter = Rendering.getDiagramHeight(getBaseLambdaAfter(lambda));
        if(idx < widthLeft) {
            return getPosAtIndexAtTime(t, lambda.left, heightAfter - 1, idx);
        }
        const offsetLeft = getWidthAtTime(t, lambda.left);
        const posData = getPosAtIndexAtTime(t, lambda.right, heightAfter - 1, idx - widthLeft)
        if(posData instanceof Array) return posData.map(e => e + offsetLeft);
        if(posData instanceof Object) return {substitutions: [], posXBefore: posData.posXBefore + offsetLeft, applicationHeightBefore: posData.applicationHeightBefore, additions: posData.additions, betaReduction: posData.betaReduction, relativeIdx: posData.relativeIdx};
        return posData + offsetLeft;
    }
    if(lambda instanceof BetaReduction) {
        const widthAbstraction = Lambda.getWidth(getBaseLambda(lambda.abstraction));
        if(idx < widthAbstraction) {
            return getPosAtIndexAtTime(t, lambda.abstraction, applicationHeightAfter, idx);
        }
        const substitutionData = getBetaReductionSubstitutionData(lambda, {after: applicationHeightAfter});
        if(substitutionData.substitutions.length === 0) return {substitutions: [], posXBefore: substitutionData.posXBefore, applicationHeightBefore: substitutionData.applicationHeightBefore, additions: 0, betaReduction: lambda, relativeIdx: idx - widthAbstraction};
        return substitutionData.substitutions.map(e => Mathc.lerp(substitutionData.posXBefore, e.posXAfter, t) + idx - widthAbstraction);
    }
    return idx;
}

function getApplicationHeightAtIndexAtTime(t, lambda, applicationHeightAfter, idx) {
    if(typeof lambda === "number" || lambda instanceof ReplacedVariable) return 0;
    if(idx < 0 || idx >= Lambda.getWidth(lambda)) return;
    if(lambda instanceof AbstractionWithReplacement) {
        if(Lambda.getWidth(getBaseLambda(lambda.body)) === 1) return 0;
        const applicationHeightData = getApplicationHeightAtIndexAtTime(t, lambda.body, applicationHeightAfter - 1, idx);
        if(applicationHeightData instanceof Array) return applicationHeightData.map(e => e + 1);
        if(applicationHeightData instanceof Object) return {substitutions: [], posXBefore: applicationHeightData.posXBefore, applicationHeightBefore: applicationHeightData.applicationHeightBefore + 1, additions: applicationHeightData.additions + 1, betaReduction: applicationHeightData.betaReduction, relativeIdx: applicationHeightData.relativeIdx};
        return applicationHeightData + 1;
    }
    if(lambda instanceof ApplicationWithReplacement) {
        const widthLeft = Lambda.getWidth(getBaseLambda(lambda.left));
        const heightAfter = Rendering.getDiagramHeight(getBaseLambdaAfter(lambda));
        const heightBefore = getDiagramHeightAtTime(0, lambda);
        if(idx < widthLeft) {
            // if(widthLeft === 1) return getDiagramHeightAtTime(t, lambda) - 1;
            if(widthLeft === 1) return Mathc.lerp(heightBefore - 1, heightAfter - 1, t);
            return getApplicationHeightAtIndexAtTime(t, lambda.left, heightAfter - 1, idx);
        }
        // if(Lambda.getWidth(getBaseLambda(lambda.right)) === 1) return getDiagramHeightAtTime(t, lambda) - 1;
        if(Lambda.getWidth(getBaseLambda(lambda.right)) === 1) return Mathc.lerp(heightBefore - 1, heightAfter - 1, t);
        return getApplicationHeightAtIndexAtTime(t, lambda.right, heightAfter - 1, idx - widthLeft);
    }
    if(lambda instanceof BetaReduction) {
        const widthAbstraction = Lambda.getWidth(getBaseLambda(lambda.abstraction));
        const height = getDiagramHeightAtTime(t, lambda);
        const heightBefore = getDiagramHeightAtTime(0, lambda);
        if(idx < widthAbstraction) {
            if(widthAbstraction === 1) return Mathc.lerp(heightBefore, applicationHeightAfter, t);
            return getApplicationHeightAtIndexAtTime(t, lambda.abstraction, applicationHeightAfter, idx) - t;
        }
        const substitutionData = getBetaReductionSubstitutionData(lambda, {after: applicationHeightAfter});
        if(substitutionData.substitutions.length === 0) return {substitutions: [], posXBefore: substitutionData.posXBefore, applicationHeightBefore: substitutionData.applicationHeightBefore, additions: 0, betaReduction: lambda, relativeIdx: idx - widthAbstraction};
        return substitutionData.substitutions.map(e => Mathc.lerp(0, e.posYAfter, t) + (Lambda.getWidth(lambda.argument) === 1 ? Mathc.lerp(substitutionData.applicationHeightBefore, e.applicationHeightAfter, t) : Rendering.getApplicationHeightAtIndex(lambda.argument, idx - widthAbstraction)));
    }
    return Rendering.getApplicationHeightAtIndex(lambda, idx);
}

function lookForBetaReduction(lambda, applicationHeightAfter) {
    if(lambda instanceof ReplacedVariable || !hasReplacement(lambda)) return;
    if(lambda instanceof AbstractionWithReplacement) {
        return lookForBetaReduction(lambda.body, applicationHeightAfter - 1);
    }
    if(lambda instanceof ApplicationWithReplacement) {
        const heightAfter = Rendering.getDiagramHeight(getBaseLambdaAfter(lambda));
        const left = lookForBetaReduction(lambda.left, heightAfter - 1);
        if(!left) {
            return lookForBetaReduction(lambda.right, heightAfter - 1);
        }
        return left;
    }
    if(lambda instanceof BetaReduction) return {betaReduction: lambda, applicationHeightAfter: applicationHeightAfter};
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

    canvasWidth;
    canvasHeight;

    constructor(param, body) {
        super(param, body);

        this.widthBefore = Lambda.getWidth(getBaseLambda(this));
        this.widthAfter = Lambda.getWidth(getBaseLambdaAfter(this));

        this.heightBefore = Rendering.getDiagramHeight(getBaseLambda(this));
        this.heightAfter = Rendering.getDiagramHeight(getBaseLambdaAfter(this));

        this.canvasWidth = Math.max(this.widthBefore, this.widthAfter);
        this.canvasHeight = Math.max(this.heightBefore, this.heightAfter);
    }
}

class ApplicationWithReplacement extends Lambda.Application {

    widthBefore;
    widthAfter;
    heightBefore;
    heightAfter;

    canvasWidth;
    canvasHeight;

    constructor(left, right) {
        super(left, right);

        this.widthBefore = Lambda.getWidth(getBaseLambda(this));
        this.widthAfter = Lambda.getWidth(getBaseLambdaAfter(this));

        this.heightBefore = Rendering.getDiagramHeight(getBaseLambda(this));
        this.heightAfter = Rendering.getDiagramHeight(getBaseLambdaAfter(this));

        this.canvasWidth = Math.max(this.widthBefore, this.widthAfter);
        this.canvasHeight = Math.max(this.heightBefore, this.heightAfter);
    }
}

class BetaReduction {
    abstraction;
    argument;

    widthBefore;
    widthAfter;
    heightBefore;
    heightAfter;

    canvasWidth;
    canvasHeight;

    constructor(abstraction, argument) {
        this.abstraction = abstraction;
        this.argument = argument;

        this.widthBefore = Lambda.getWidth(getBaseLambda(this));
        this.widthAfter = Lambda.getWidth(getBaseLambdaAfter(this));
        this.heightBefore = Rendering.getDiagramHeight(getBaseLambda(this));
        this.heightAfter = Rendering.getDiagramHeight(getBaseLambdaAfter(this));

        this.canvasWidth = Math.max(this.widthBefore, this.widthAfter);
        this.canvasHeight = Math.max(this.heightBefore, this.heightAfter);
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

function preproccessOuter(lambda, pathToReduction, preproccessedReduction) {
    if(pathToReduction === null) return lambda;
    if(typeof lambda === "number") return lambda;
    if(lambda instanceof Lambda.Abstraction) return new AbstractionWithReplacement(lambda.param, preproccessOuter(lambda.body, pathToReduction.slice(1), preproccessedReduction));
    if(lambda instanceof Lambda.Application) {
        if(pathToReduction.length === 0) return preproccessedReduction;
        const preproccessedLeft = preproccessOuter(lambda.left, pathToReduction[0] === 0 ? pathToReduction.slice(1) : null, preproccessedReduction);
        const preproccessedRight = preproccessOuter(lambda.right, pathToReduction[0] === 1 ? pathToReduction.slice(1) : null, preproccessedReduction);
        return new ApplicationWithReplacement(preproccessedLeft, preproccessedRight);
    }
}

function betaReduceAndPreproccess(lambda) {
    const reduction = Beta.reduceNormalOrderWithData(lambda);
    const preproccessedReduction = preprocessBetaReduction(reduction.reducedTerm.left, reduction.reducedTerm.right);
    const preproccessedLambda = preproccessOuter(lambda, reduction.pathToReduction, preproccessedReduction);
    return preproccessedLambda;
}

function drawAbstractionAtTime(t, ctx, transparentCtx, offsetX, offsetY, lambda, applicationHeightData, res = Rendering.DEFAULT_RES, color = Rendering.DEFAULT_COLOR) {
    if(!(lambda instanceof Lambda.Abstraction)) return;

    const applicationHeight = applicationHeightData.now;

    const widthBody = getWidthAtTime(t, lambda.body);

    ctx.fillStyle = color();
    transparentCtx.fillStyle = ctx.fillStyle;
    ctx.fillRect(offsetX, offsetY, (widthBody * 4 - 1) * res, res);

    const references = getBaseLambda(lambda).getReferences();
    for(let i = 0;i < references.length;i++) {
        const pos = getPosAtIndexAtTime(t, lambda, applicationHeightData.after, references[i]);
        if(pos instanceof Array) {
            const currentApplicationHeights = getApplicationHeightAtIndexAtTime(t, lambda, applicationHeightData.after, references[i]);
            for(let j = 0;j < pos.length;j++) {
                ctx.fillRect(offsetX + (pos[j] * 4 + 1) * res, offsetY, res, (currentApplicationHeights[j] * 2 + 1) * res);
            }
            continue;
        }
        if(pos instanceof Object) {
            const cPos = references[i];
            const currentApplicationHeight = Lambda.getWidth(pos.betaReduction.argument) === 1 ? pos.applicationHeightBefore : (Rendering.getApplicationHeightAtIndex(pos.betaReduction.argument, pos.relativeIdx) + pos.additions);
            transparentCtx.fillRect(offsetX + (cPos * 4 + 1) * res, offsetY, res, (currentApplicationHeight * 2 + 1) * res);
            continue;
        }
        const currentApplicationHeight = Lambda.getWidth(getBaseLambda(lambda.body)) === 1 ? applicationHeight : getApplicationHeightAtIndexAtTime(t, lambda, applicationHeightData.after, references[i]);
        ctx.fillRect(offsetX + (pos * 4 + 1) * res, offsetY, res, (currentApplicationHeight * 2 + 1) * res);
    }

    if(typeof lambda.body !== "number") {
        drawLambdaAtTime(t, ctx, transparentCtx, offsetX, offsetY + 2 * res, lambda.body, {before: applicationHeightData.before - 1, after: applicationHeightData.after - 1, now: applicationHeight - 1}, res, color);
    }
}

function drawApplicationAtTime(t, ctx, transparentCtx, offsetX, offsetY, lambda, applicationHeightData, res = Rendering.DEFAULT_RES, color = Rendering.DEFAULT_COLOR) {
    if(!(lambda instanceof Lambda.Application)) return;

    const applicationHeight = applicationHeightData.now;

    const height = getDiagramHeightAtTime(t, lambda);
    const heightInner = height - 1;

    const heightInnerBefore = getDiagramHeightAtTime(0, lambda) - 1;
    const heightInnerAfter = getDiagramHeightAtTime(1, lambda) - 1;

    const widthLeft = getWidthAtTime(t, lambda.left);
    if(typeof lambda.left !== "number") {
        drawLambdaAtTime(t, ctx, transparentCtx, offsetX, offsetY, lambda.left, {before: heightInnerBefore, after: heightInnerAfter, now: heightInner}, res, color);
    }
    if(typeof lambda.right !== "number") {
        drawLambdaAtTime(t, ctx, transparentCtx, offsetX + widthLeft * 4 * res, offsetY, lambda.right, {before: heightInnerBefore, after: heightInnerAfter, now: heightInner}, res, color);
    }

    ctx.fillStyle = color();
    ctx.fillRect(offsetX + res, offsetY + heightInner * 2 * res, (widthLeft * 4 + 1) * res, res);
    ctx.fillRect(offsetX + res, offsetY + heightInner * 2 * res, res, ((applicationHeight - height + 1) * 2 + 1) * res);
}

function drawLambdaAtTime(t, ctx, transparentCtx, offsetX, offsetY, lambda, applicationHeightData, res = Rendering.DEFAULT_RES, color = Rendering.DEFAULT_COLOR) {
    if(lambda instanceof BetaReduction) {
        drawBetaReductionAtTime(t, ctx, transparentCtx, offsetX, offsetY, lambda, applicationHeightData, res, color);
        return;
    }
    if(lambda instanceof Lambda.Abstraction) {
        drawAbstractionAtTime(t, ctx, transparentCtx, offsetX, offsetY, lambda, applicationHeightData, res, color);
        return;
    }
    if(lambda instanceof Lambda.Application) {
        drawApplicationAtTime(t, ctx, transparentCtx, offsetX, offsetY, lambda, applicationHeightData, res, color);
    }
}

function getBetaReductionSubstitutionData(betaReduction, applicationHeightData) {
    const abstractionBodyWidthBefore = getWidthAtTime(0, betaReduction.abstraction.body);
    const abstractionBodyHeightBefore = getDiagramHeightAtTime(0, betaReduction.abstraction.body);
    const argumentHeight = Rendering.getDiagramHeight(betaReduction.argument);
    const applicationHeightBefore = Math.max(abstractionBodyHeightBefore + 1, argumentHeight);
    const references = getBaseLambda(betaReduction.abstraction).getReferences();
    const substitutionData = references.map(ref => {
        return {
            posXAfter: getPosAtIndexAtTime(1, betaReduction.abstraction.body, applicationHeightData.after, ref),
            posYAfter: Rendering.getAbstractionAmountAtIndex(getBaseLambda(betaReduction.abstraction.body), ref),
            applicationHeightAfter: (abstractionBodyWidthBefore === 1 ? Math.max(getDiagramHeightAtTime(1, betaReduction.abstraction.body), applicationHeightData.after) : getApplicationHeightAtIndexAtTime(1, betaReduction.abstraction.body, applicationHeightData.after, ref)) - Rendering.getAbstractionAmountAtIndex(getBaseLambda(betaReduction.abstraction.body), ref)
        };
    });
    return {
        posXBefore: abstractionBodyWidthBefore,
        applicationHeightBefore: applicationHeightBefore,
        substitutions: substitutionData
    };
}

function drawBetaReductionAtTime(t, ctx, transparentCtx, offsetX, offsetY, betaReduction, applicationHeightData, res = Rendering.DEFAULT_RES, color = Rendering.DEFAULT_COLOR) {
    const abstractionBodyWidth = getWidthAtTime(t, betaReduction.abstraction.body);
    const abstractionBodyHeight = getDiagramHeightAtTime(t, betaReduction.abstraction.body);
    const argumentHeight = Rendering.getDiagramHeight(betaReduction.argument);
    const abstractionBodyWidthBefore = getWidthAtTime(0, betaReduction.abstraction.body);
    const abstractionBodyHeightBefore = getDiagramHeightAtTime(0, betaReduction.abstraction.body);
    const posXBefore = abstractionBodyWidthBefore;
    const applicationHeightBefore = Math.max(abstractionBodyHeightBefore + 1, argumentHeight);
    const outerApplicationHeightBefore = applicationHeightData.before;
    const applicationHeightAfter = applicationHeightData.after;
    const references = getBaseLambda(betaReduction.abstraction).getReferences();
    
    const width = abstractionBodyWidth + Lambda.getWidth(betaReduction.argument);
    const height = Mathc.lerp(applicationHeightBefore, applicationHeightAfter, t) + 1;

    ctx.fillStyle = color();

    transparentCtx.fillStyle = ctx.fillStyle;

    transparentCtx.fillRect(offsetX, offsetY, (abstractionBodyWidthBefore * 4 - 1) * res, res);
    for(let i = 0;i < references.length;i++) {
        const currentApplicationHeight = Lambda.getWidth(getBaseLambda(betaReduction.abstraction.body)) === 1 ? applicationHeightBefore : Rendering.getApplicationHeightAtIndex(getBaseLambda(betaReduction.abstraction), references[i]);
        transparentCtx.fillRect((references[i] * 4 + 1) * res + offsetX, offsetY, res, (currentApplicationHeight * 2 + 1) * res);
    }
    if(references.length === 0) {
        Rendering.drawLambda(transparentCtx, posXBefore * 4 * res + offsetX, offsetY, betaReduction.argument, applicationHeightBefore, res, color);
    }

    transparentCtx.fillRect(res + offsetX, applicationHeightBefore * 2 * res + offsetY, (abstractionBodyWidthBefore * 4 + 1) * res, res);
    transparentCtx.fillRect(res + offsetX, applicationHeightBefore * 2 * res + offsetY, res, ((outerApplicationHeightBefore - applicationHeightBefore) * 2 + 1) * res);

    drawLambdaAtTime(t, ctx, transparentCtx, offsetX, Mathc.lerp(2 * res, 0, t) + offsetY, betaReduction.abstraction.body, {before: applicationHeightBefore, after: getDiagramHeightAtTime(1, betaReduction.abstraction.body), now: Mathc.lerp(applicationHeightBefore - 1, applicationHeightAfter, t)}, res, color);

    const substitutionData = getBetaReductionSubstitutionData(betaReduction, applicationHeightData);
    for(let i = 0;i < substitutionData.substitutions.length;i++) {
        Rendering.drawLambda(ctx, Mathc.lerp(substitutionData.posXBefore, substitutionData.substitutions[i].posXAfter, t) * 4 * res + offsetX, Mathc.lerp(0, substitutionData.substitutions[i].posYAfter, t) * 2 * res + offsetY, betaReduction.argument, Mathc.lerp(substitutionData.applicationHeightBefore, substitutionData.substitutions[i].applicationHeightAfter, t), res, color);
    }
}

function createBetaReductionRenderAtTime(t, betaReduction, res = Rendering.DEFAULT_RES, color = Rendering.DEFAULT_COLOR) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const transparentCanvas = document.createElement("canvas");
    const transparentCtx = transparentCanvas.getContext("2d");
    const abstractionBodyWidth = getWidthAtTime(t, betaReduction.abstraction.body);
    const argumentHeight = Rendering.getDiagramHeight(betaReduction.argument);
    const abstractionBodyHeightBefore = getDiagramHeightAtTime(0, betaReduction.abstraction.body);
    const applicationHeightBefore = Math.max(abstractionBodyHeightBefore + 1, argumentHeight);
    const applicationHeightAfter = getDiagramHeightAtTime(1, betaReduction.abstraction.body);
    const references = getBaseLambda(betaReduction.abstraction).getReferences();
    
    const width = abstractionBodyWidth + Lambda.getWidth(betaReduction.argument);
    const height = Mathc.lerp(applicationHeightBefore, applicationHeightAfter, t) + 1;
    const canvasWidth = getCanvasWidth(betaReduction);
    const canvasHeight = getCanvasHeight(betaReduction);
    canvas.width = (canvasWidth * 4 - 1) * res;
    canvas.height = (canvasHeight * 2 + 1) * res;
    transparentCanvas.width = canvas.width;
    transparentCanvas.height = canvas.height;

    drawBetaReductionAtTime(t, ctx, transparentCtx, 0, 0, betaReduction, {before: applicationHeightBefore + 1, after: applicationHeightAfter, now: height}, res, color);
    ctx.globalAlpha = 1 - t;
    ctx.drawImage(transparentCanvas, 0, 0);
    ctx.globalAlpha = 1;

    return canvas;
}

function createLambdaRenderAtTime(t, lambda, res = Rendering.DEFAULT_RES, color = Rendering.DEFAULT_COLOR) {
    if(lambda instanceof BetaReduction) return createBetaReductionRenderAtTime(t, lambda, res, color);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const transparentCanvas = document.createElement("canvas");
    const transparentCtx = transparentCanvas.getContext("2d");

    const width = getWidthAtTime(t, lambda);
    const height = getDiagramHeightAtTime(t, lambda);
    const heightBefore = getDiagramHeightAtTime(0, lambda);
    const heightAfter = getDiagramHeightAtTime(1, lambda);
    const canvasWidth = getCanvasWidth(lambda);
    const canvasHeight = getCanvasHeight(lambda);
    canvas.width = (canvasWidth * 4 - 1) * res;
    canvas.height = (canvasHeight * 2 + 1) * res;
    transparentCanvas.width = canvas.width;
    transparentCanvas.height = canvas.height;

    drawLambdaAtTime(t, ctx, transparentCtx, 0, 0, lambda, {before: heightBefore, after: heightAfter, now: height}, res, color);
    ctx.globalAlpha = 1 - t;
    ctx.drawImage(transparentCanvas, 0, 0);
    ctx.globalAlpha = 1;

    return canvas;
}

export {
    ReplacedVariable, AbstractionWithReplacement, ApplicationWithReplacement, BetaReduction,
    getBaseLambda, getBaseLambdaAfter, getWidthAtTime, getDiagramHeightAtTime, getPosAtIndexAtTime, getApplicationHeightAtIndexAtTime, lookForBetaReduction,
    hasReplacement,
    preprocessBetaReduction, betaReduceAndPreproccess,
    drawLambdaAtTime,
    createBetaReductionRenderAtTime, createLambdaRenderAtTime
};