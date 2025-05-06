import * as Lambda from "./core.mjs";

function reduceExpression(func, arg) {
    return func.body.replaceReferencesTo(func.param, arg);
}

function recursivelyReduceAll(lambda) {
    if(typeof lambda === "number") return lambda;
    if(lambda instanceof Lambda.Function) {
        return new Lambda.Function(lambda.param, recursivelyReduceAll(lambda.body));
    }
    if(lambda instanceof Lambda.Expression) {
        if(lambda.left instanceof Lambda.Function) {
            return reduceExpression(lambda.left, lambda.right);
        }
        return new Lambda.Expression(recursivelyReduceAll(lambda.left), recursivelyReduceAll(lambda.right));
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

export { reduceExpression, recursivelyReduceAll, recursivelyReduceAndCleanup, reduceNTimes };