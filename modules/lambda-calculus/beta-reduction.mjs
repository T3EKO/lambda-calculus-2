import * as Lambda from "./core.mjs";

function reduceApplication(abstraction, arg) {
    if(typeof abstraction.body === "number") {
        if(abstraction.body === abstraction.param) return arg;
        return abstraction.body;
    }
    return abstraction.body.replaceReferencesTo(abstraction.param, arg);
}

function recursivelyReduceAll(lambda) {
    if(typeof lambda === "number") return lambda;
    if(lambda instanceof Lambda.Abstraction) {
        return new Lambda.Abstraction(lambda.param, recursivelyReduceAll(lambda.body));
    }
    if(lambda instanceof Lambda.Application) {
        if(lambda.left instanceof Lambda.Abstraction) {
            return reduceApplication(lambda.left, lambda.right);
        }
        return new Lambda.Application(recursivelyReduceAll(lambda.left), recursivelyReduceAll(lambda.right));
    }
}

function recursivelyReduceAndCleanup(lambda) {
    const reduced = recursivelyReduceAll(lambda);
    return Lambda.cleanupBindings(reduced);
}

function reduceNormalOrderWithData(lambda) {
    if(typeof lambda === "number") return { reduction: false, reducedTerm: null, pathToReduction: null, result: lambda };
    if(lambda instanceof Lambda.Abstraction) {
        const reducedBody = reduceNormalOrderWithData(lambda.body);
        return { reduction: reducedBody.reduction, reducedTerm: reducedBody.reduction ? reducedBody.reducedTerm : null, pathToReduction: reducedBody.reduction ? [0, ...reducedBody.pathToReduction] : null, result: new Lambda.Abstraction(lambda.param, reducedBody.result) };
    }
    if(lambda instanceof Lambda.Application) {
        if(lambda.left instanceof Lambda.Abstraction) {
            return { reduction: true, reducedTerm: lambda, pathToReduction: [], result: reduceApplication(lambda.left, lambda.right) };
        }
        const reducedLeft = reduceNormalOrderWithData(lambda.left);
        if(reducedLeft.reduction) {
            return { reduction: true, reducedTerm: reducedLeft.reducedTerm, pathToReduction: [0, ...reducedLeft.pathToReduction], result: new Lambda.Application(reducedLeft.result, lambda.right) };
        }
        const reducedRight = reduceNormalOrderWithData(lambda.right);
        return { reduction: reducedRight.reduction, reducedTerm: reducedRight.reduction ? reducedRight.reducedTerm : null, pathToReduction: reducedRight.reduction ? [1, ...reducedRight.pathToReduction] : null, result: new Lambda.Application(lambda.left, reducedRight.result) };
    }
}

function reduceNormalOrder(lambda) {
    return reduceNormalOrderWithData(lambda).result;
}

function reduceNormalOrderAndCleanup(lambda) {
    const reduced = reduceNormalOrder(lambda);
    return Lambda.cleanupBindings(reduced);
}

function reduceNTimes(lambda, n) {
    let intermediate = lambda;
    for(let i = 0;i < n;i++) {
        intermediate = recursivelyReduceAndCleanup(intermediate);
    }
    return intermediate;
}

function normallyReduceNTimes(lambda, n) {
    let intermediate = lambda;
    for(let i = 0;i < n;i++) {
        intermediate = reduceNormalOrderAndCleanup(intermediate);
    }
    return intermediate;
}

function normallyReduceUntilBetaNormal(lambda, maxReductions) {
    let intermediate = lambda;
    for(let i = 0;i < maxReductions;i++) {
        const reduced = reduceNormalOrderWithData(intermediate);
        if(!reduced.reduction) {
            return Lambda.cleanupBindings(reduced.result);
        }
        intermediate = Lambda.cleanupBindings(reduced.result);
    }
    return intermediate;
}

function normallyReduceUntilBetaNormalWithData(lambda, maxReductions, dataCollectionCallback) {
    const data = new Array();
    let intermediate = lambda;
    for(let i = 0;i < maxReductions;i++) {
        const reduced = reduceNormalOrderWithData(intermediate);
        const cData = dataCollectionCallback({ before: intermediate, after: reduced.result, reduction: reduced.reduction });
        data.push(cData);
        if(!reduced.reduction) {
            return { data: data, result: Lambda.cleanupBindings(reduced.result), betaNormal: true };
        }
        intermediate = Lambda.cleanupBindings(reduced.result);
    }
    return { data: data, result: intermediate, betaNormal: false };
}

export {
    reduceApplication, recursivelyReduceAll, recursivelyReduceAndCleanup,
    reduceNTimes, reduceNormalOrderWithData, reduceNormalOrder,
    reduceNormalOrderAndCleanup, normallyReduceNTimes, normallyReduceUntilBetaNormal,
    normallyReduceUntilBetaNormalWithData
};