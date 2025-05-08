import * as Mathc from "../mathc.mjs";
import * as Lambda from "./core.mjs";
import * as Rendering from "./rendering.mjs";

function getWidthAtTime(lambda, t) {
    if(isDynamic(lambda)) return Mathc.lerp(lambda.widthBefore, lambda.widthAfter, t);
    return Lambda.getWidth(lambda);
}

function getDiagramHeightAtTime(lambda, t) {
    if(isDynamic(lambda)) return Mathc.lerp(lambda.heightBefore, lambda.heightAfter, t);
    return Rendering.getDiagramHeight(lambda);
}

function getPosAtIdxAtTime(lambda, idx, t) {
    if(idx < 0) return;
    const width = Lambda.getWidth(getBaseLambda(lambda));
    if(idx >= width) return;
    if(lambda instanceof StaticAbstraction || lambda instanceof StaticApplication) return idx;
    if(lambda instanceof DynamicAbstraction) {
        if(isVariable(lambda.body)) {
            return idx;
        }
        return getPosAtIdxAtTime(lambda.body, idx, t);
    }
    if(lambda instanceof DynamicApplication) {
        const leftWidth = Lambda.getWidth(getBaseLambda(lambda).left);
        if(idx < leftWidth) {
            if(isVariable(lambda.left)) {
                return idx;
            }
            return getPosAtIdxAtTime(lambda.left, idx, t);
        }
        const leftDiagramWidth = getWidthAtTime(lambda.left, t);
        if(isVariable(lambda.right)) {
            return idx - leftWidth + leftDiagramWidth;
        }
        return getPosAtIdxAtTime(lambda.right, idx - leftWidth, t) + leftDiagramWidth;
    }
}

class StaticAbstraction extends Lambda.Abstraction {
    prerender;

    precomputeValues(res = Rendering.DEFAULT_RES, color = Rendering.DEFAULT_COLOR) {
        this.prerender = Rendering.drawAbstraction(this, res, color);
    }
}

class StaticApplication extends Lambda.Application {
    prerender;

    precomputeValues(res = Rendering.DEFAULT_RES, color = Rendering.DEFAULT_COLOR) {
        this.prerender = Rendering.drawApplication(this, res, color);
    }
}

class ReplacedVariable {
    variable;
    argument;

    widthBefore;
    heightBefore;

    widthAfter;
    heightAfter;
    
    constructor(variable, argument) {
        this.variable = variable;
        this.argument = argument;

        this.widthBefore = Lambda.getWidth(this.variable);
        this.heightBefore = Rendering.getDiagramHeight(this.variable);

        this.widthAfter = Lambda.getWidth(this.argument);
        this.heightAfter = Rendering.getDiagramHeight(this.argument);
    }

    precomputeValues(res = Rendering.DEFAULT_RES, color = Rendering.DEFAULT_COLOR) {

    }
}

class DynamicAbstraction extends Lambda.Abstraction {
    res;
    color;

    widthBefore;
    heightBefore;

    widthAfter;
    heightAfter;

    constructor(param, body) {
        super(param, body);

        const before = getBaseLambda(this);
        const after = getBaseLambdaPostReduction(this);

        this.widthBefore = Lambda.getWidth(before);
        this.heightBefore = Rendering.getDiagramHeight(before);

        this.widthAfter = Lambda.getWidth(after);
        this.heightAfter = Rendering.getDiagramHeight(after);
    }

    precomputeValues(res = Rendering.DEFAULT_RES, color = Rendering.DEFAULT_COLOR) {
        if(typeof this.body !== "number") this.body.precomputeValues(res, color);

        this.res = res;
        this.color = color;
    }
}

class DynamicApplication extends Lambda.Application {
    res;
    color;

    widthBefore;
    heightBefore;

    widthAfter;
    heightAfter;

    constructor(left, right) {
        super(left, right);

        const before = getBaseLambda(this);
        const after = getBaseLambdaPostReduction(this);

        this.widthBefore = Lambda.getWidth(before);
        this.heightBefore = Rendering.getDiagramHeight(before);

        this.widthAfter = Lambda.getWidth(after);
        this.heightAfter = Rendering.getDiagramHeight(after);
    }

    precomputeValues(res = Rendering.DEFAULT_RES, color = Rendering.DEFAULT_COLOR) {
        if(typeof this.left !== "number") this.left.precomputeValues(res, color);
        if(typeof this.right !== "number") this.right.precomputeValues(res, color);

        this.res = res;
        this.color = color;
    }
}

class BetaReductionWrapper {
    abstraction;
    argument;

    res;
    color;

    constructor(abstraction, argument) {
        this.abstraction = abstraction;
        this.argument = argument;
    }

    precomputeValues(res = Rendering.DEFAULT_RES, color = Rendering.DEFAULT_COLOR) {
        this.abstraction.precomputeValues(res, color);

        this.res = res;
        this.color = color;
    }
}

function isDynamic(lambda) {
    return lambda instanceof ReplacedVariable || lambda instanceof DynamicAbstraction || lambda instanceof DynamicApplication;
}

function isVariable(lambda) {
    return typeof lambda === "number" || lambda instanceof ReplacedVariable;
}

function preprocessBetaReduction(abstraction, argument) {
    const preprocessedAbstraction = preprocessLambda(abstraction, abstraction.param, argument);
    return new BetaReductionWrapper(preprocessedAbstraction, argument);
}

function preprocessLambda(lambda, variable, argument) {
    if(typeof lambda === "number") {
        if(lambda === variable) {
            return new ReplacedVariable(variable, argument);
        }
        return lambda;
    }
    if(lambda instanceof Lambda.Abstraction) {
        const preprocessedBody = preprocessLambda(lambda.body, variable, argument);
        if(isDynamic(preprocessedBody)) {
            return new DynamicAbstraction(lambda.param, preprocessedBody);
        }
        return new StaticAbstraction(lambda.param, lambda.body);
    }
    if(lambda instanceof Lambda.Application) {
        const preprocessedLeft = preprocessLambda(lambda.left, variable, argument);
        const preprocessedRight = preprocessLambda(lambda.right, variable, argument);
        if(isDynamic(preprocessedLeft) || isDynamic(preprocessedRight)) {
            return new DynamicApplication(preprocessedLeft, preprocessedRight);
        }
        return new StaticApplication(lambda.left, lambda.right);
    }
}

function getBaseLambda(lambda) {
    if(typeof lambda === "number") return lambda;
    if(lambda instanceof ReplacedVariable) return lambda.variable;
    if(lambda instanceof StaticAbstraction) return new Lambda.Abstraction(lambda.param, lambda.body);
    if(lambda instanceof StaticApplication) return new Lambda.Application(lambda.left, lambda.right);
    if(lambda instanceof DynamicAbstraction) return new Lambda.Abstraction(lambda.param, getBaseLambda(lambda.body));
    if(lambda instanceof DynamicApplication) return new Lambda.Application(getBaseLambda(lambda.left), getBaseLambda(lambda.right));
}

function getBaseLambdaPostReduction(lambda) {
    if(typeof lambda === "number") return lambda;
    if(lambda instanceof ReplacedVariable) return lambda.argument;
    if(lambda instanceof StaticAbstraction) return new Lambda.Abstraction(lambda.param, lambda.body);
    if(lambda instanceof StaticApplication) return new Lambda.Application(lambda.left, lambda.right);
    if(lambda instanceof DynamicAbstraction) return new Lambda.Abstraction(lambda.param, getBaseLambdaPostReduction(lambda.body));
    if(lambda instanceof DynamicApplication) return new Lambda.Application(getBaseLambdaPostReduction(lambda.left), getBaseLambdaPostReduction(lambda.right));
}

function drawBetaReductionAtTime(betaReductionWrapper, t) {
    const body = drawLambdaAtTime(betaReductionWrapper.func.body, t);
    return body;
}

function drawLambdaAtTime(lambda, t) {
    if(lambda instanceof StaticAbstraction || lambda instanceof StaticApplication) return lambda.prerender;
    if(lambda instanceof DynamicAbstraction) return drawDynamicAbstractionAtTime(lambda, t);
    if(lambda instanceof DynamicApplication) return drawDynamicApplicationAtTime(lambda, t);
}

function drawDynamicAbstractionAtTime(lambda, t) {
    if(!(lambda instanceof DynamicAbstraction)) return;
    const diagramWidth = getWidthAtTime(lambda, t);
    const diagramHeight = getDiagramHeightAtTime(lambda, t);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = (diagramWidth * 4 - 1) * lambda.res;
    canvas.height = diagramHeight * 2 * lambda.res;
    ctx.fillStyle = lambda.color;

    if(!isVariable(lambda.body)) {
        const bodyCanvas = drawLambdaAtTime(lambda.body, t);
        ctx.drawImage(bodyCanvas, 0, 2 * lambda.res);
    }

    ctx.fillRect(0, 0, canvas.width, lambda.res);

    const references = getBaseLambda(lambda).getReferences();
    const referencePoses = references.map(e => getPosAtIdxAtTime(lambda, e, t));
    for(let i = 0;i < references.length;i++) {
        const abstractionAmount = Rendering.getAbstractionAmountAtIndex(getBaseLambda(lambda), references[i]);
        ctx.fillRect((referencePoses[i] * 4 + 1) * lambda.res, lambda.res, lambda.res, (abstractionAmount * 2 + 1) * lambda.res);
    }

    return canvas;
}

function drawDynamicApplicationAtTime(lambda, t) {
    if(!(lambda instanceof DynamicApplication)) return;
    const diagramWidth = getWidthAtTime(lambda, t);
    const diagramHeight = getDiagramHeightAtTime(lambda, t);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = (diagramWidth * 4 - 1) * lambda.res;
    canvas.height = diagramHeight * 2 * lambda.res;
    ctx.fillStyle = lambda.color;

    const leftWidth = getWidthAtTime(lambda.left, t);

    if(!isVariable(lambda.left)) {
        const leftCanvas = drawLambdaAtTime(lambda.left, t);
        ctx.drawImage(leftCanvas, 0, 0);
    }
    if(!(lambda.left instanceof ReplacedVariable)) {
        const leftHeight = getDiagramHeightAtTime(lambda.left, t);
        const heightDifference = diagramHeight - leftHeight;
        ctx.fillRect(lambda.res, canvas.height - 2 * lambda.res, lambda.res, -heightDifference * 2 * lambda.res);
    }
    if(!isVariable(lambda.right)) {
        const rightCanvas = drawLambdaAtTime(lambda.right, t);
        ctx.drawImage(rightCanvas, leftWidth * 4 * lambda.res, 0);
    }
    if(!(lambda.right instanceof ReplacedVariable)) {
        const rightHeight = getDiagramHeightAtTime(lambda.right, t);
        const heightDifference = diagramHeight - rightHeight;
        ctx.fillRect((leftWidth * 4 + 1) * lambda.res, canvas.height - 2 * lambda.res, lambda.res, -heightDifference * 2 * lambda.res);
    }

    ctx.fillRect(lambda.res, canvas.height - 2 * lambda.res, (leftWidth * 4 + 1) * lambda.res, lambda.res);
    ctx.fillRect(lambda.res, canvas.height - lambda.res, lambda.res, lambda.res);

    return canvas;
}

export { preprocessBetaReduction, drawBetaReductionAtTime };