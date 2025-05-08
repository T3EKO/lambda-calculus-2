import * as Lambda from "./core.mjs";

function reduceApplication(abstraction, arg) {
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

function reduceNTimes(lambda, n) {
    let intermediate = lambda;
    for(let i = 0;i < n;i++) {
        intermediate = recursivelyReduceAndCleanup(intermediate);
    }
    return intermediate;
}

export { reduceApplication, recursivelyReduceAll, recursivelyReduceAndCleanup, reduceNTimes };