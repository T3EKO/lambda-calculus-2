import * as Lambda from "./core.mjs";
import * as Mathc from "../mathc.mjs";


function fn(p, b) {
    return new Lambda.Function(p, b);
}

function expr(l, r) {
    return new Lambda.Expression(l, r);
}

const TRUE = fn(0, fn(1, 0));
const FALSE = fn(0, fn(1, 1));

function NTH_INTEGER(n) {
    let intermediate = 1;
    for(let i = 0;i < n;i++) {
        intermediate = expr(0, intermediate);
    }
    return fn(0, fn(1, intermediate));
}

const SUCC = fn(0, fn(1, fn(2, expr(1, expr(expr(0, 1), 2)))));

const PLUS = fn(0, fn(1, fn(2, fn(3, expr(expr(0, 2), expr(expr(1, 2), 3))))));

const TIMES = fn(0, fn(1, fn(2, expr(1, expr(0, 2)))));

const EXP = fn(0, fn(1, expr(1, 0)));

const U = fn(0, fn(1, expr(0, expr(expr(1, 1), 0))));

const THETA = expr(U, U);

function randomMess(maxLayers, variables) {
    if(!variables) variables = new Array();
    const rand = Math.random();
    if(maxLayers === 0 || rand < 0.16) {
        if(variables.length >= 1) return Mathc.randomOf(variables);
        return fn(0, 0);
    }
    if(rand < 0.66) {
        const largestV = Math.max(-1, ...variables);
        const nextV = largestV + 1;
        return fn(nextV, randomMess(maxLayers - 1, [...variables, nextV]));
    }
    return expr(randomMess(maxLayers - 1, variables), randomMess(maxLayers - 1, variables));
}

function orderedMess(vWeight, fWeight, eWeight, maxLayers, minLayers, cLayers = 0, variables = new Array()) {
    if(cLayers === 0) return fn(0, orderedMess(vWeight, fWeight, eWeight, maxLayers - 1, minLayers - 1, cLayers + 1, [0]));

    let pool = fWeight + eWeight;
    if(minLayers <= 0) pool += vWeight;
    const fProb = fWeight / pool;
    const vProb = minLayers <= 0 ? vWeight / pool : 0;

    const rand = Math.random();
    if(maxLayers === 0 || rand < vProb) {
        return Mathc.randomOf(variables);
    }
    if(rand < vProb + fProb) {
        const largestV = Math.max(-1, ...variables);
        const nextV = largestV + 1;
        return fn(nextV, orderedMess(vWeight, fWeight, eWeight, maxLayers - 1, minLayers - 1, cLayers + 1, [...variables, nextV]));
    }
    return expr(orderedMess(vWeight, fWeight, eWeight, maxLayers - 1, minLayers - 1, cLayers + 1, variables), orderedMess(vWeight, fWeight, eWeight, maxLayers - 1, minLayers - 1, cLayers + 1, variables));
}


export { fn, expr, TRUE, FALSE, NTH_INTEGER, SUCC, PLUS, TIMES, EXP, U, THETA, randomMess, orderedMess };