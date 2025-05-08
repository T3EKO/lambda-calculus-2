import * as Lambda from "./core.mjs";
import * as Mathc from "../mathc.mjs";

function fn(p, b) {
    return new Lambda.Abstraction(p, b);
}

function appl(l, r) {
    return new Lambda.Application(l, r);
}

const TRUE = fn(0, fn(1, 0));
const FALSE = fn(0, fn(1, 1));

function NTH_INTEGER(n) {
    let intermediate = 1;
    for(let i = 0;i < n;i++) {
        intermediate = appl(0, intermediate);
    }
    return fn(0, fn(1, intermediate));
}

const SUCC = fn(0, fn(1, fn(2, appl(1, appl(appl(0, 1), 2)))));

const PRED = fn(0, fn(1, fn(2, appl(appl(appl(0, fn(3, fn(4, appl(4, appl(3, 1))))), fn(3, 2)), fn(3, 3)))));

const PLUS = fn(0, fn(1, fn(2, fn(3, appl(appl(0, 2), appl(appl(1, 2), 3))))));

const TIMES = fn(0, fn(1, fn(2, appl(1, appl(0, 2)))));

const EXP = fn(0, fn(1, appl(1, 0)));

const ISZERO = fn(0, fn(1, fn(2, appl(appl(0, fn(3, 2)), 1))));

const U = fn(0, fn(1, appl(1, appl(appl(0, 0), 1))));

const Y = appl(U, U);

const FAC = appl(Y, fn(0, fn(1, appl(appl(appl(ISZERO, 1), NTH_INTEGER(1)), appl(appl(TIMES, 1), appl(0, appl(PRED, 1)))))));

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
    return appl(randomMess(maxLayers - 1, variables), randomMess(maxLayers - 1, variables));
}

function orderedMess(variableWeight, abstractionWeight, applicationWeight, maxLayers, minLayers, cLayers = 0, variables = new Array()) {
    if(cLayers === 0) return fn(0, orderedMess(variableWeight, abstractionWeight, applicationWeight, maxLayers - 1, minLayers - 1, cLayers + 1, [0]));

    let pool = abstractionWeight + applicationWeight;
    if(minLayers <= 0) pool += variableWeight;
    const fProb = abstractionWeight / pool;
    const vProb = minLayers <= 0 ? variableWeight / pool : 0;

    const rand = Math.random();
    if(maxLayers === 0 || rand < vProb) {
        return Mathc.randomOf(variables);
    }
    if(rand < vProb + fProb) {
        const largestV = Math.max(-1, ...variables);
        const nextV = largestV + 1;
        return fn(nextV, orderedMess(variableWeight, abstractionWeight, applicationWeight, maxLayers - 1, minLayers - 1, cLayers + 1, [...variables, nextV]));
    }
    return appl(orderedMess(variableWeight, abstractionWeight, applicationWeight, maxLayers - 1, minLayers - 1, cLayers + 1, variables), orderedMess(variableWeight, abstractionWeight, applicationWeight, maxLayers - 1, minLayers - 1, cLayers + 1, variables));
}

export { fn, appl, TRUE, FALSE, NTH_INTEGER, SUCC, PRED, PLUS, TIMES, EXP, ISZERO, U, Y, FAC, randomMess, orderedMess };