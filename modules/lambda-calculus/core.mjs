
const variableNamePlaceholders = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

function stringifyLambda(lambda) {
    if(typeof lambda === "number") {
        const n = Math.floor(lambda / variableNamePlaceholders.length);
        if(n === 0) return variableNamePlaceholders[lambda % variableNamePlaceholders.length];
        return `${variableNamePlaceholders[lambda % variableNamePlaceholders.length]}${n}`;
    }
    return lambda.toString();
}

function getWidth(lambda) {
    if(typeof lambda === "number") return 1;
    if(lambda instanceof Function) return getWidth(lambda.body);
    if(lambda instanceof Expression) return getWidth(lambda.left) + getWidth(lambda.right);
}

class Function {
    param;
    body;

    constructor(param, body) {
        this.param = param;
        this.body = body;
    }

    getReferences() {
        if(typeof this.body === "number") {
            if(this.body === this.param) return [0];
            return [];
        }
        return this.body.getReferencesTo(this.param);
    }

    getReferencesTo(variable) {
        if(typeof this.body === "number") {
            if(this.body === variable) return [0];
            return [];
        }
        return this.body.getReferencesTo(variable);
    }
    
    toString() { return `λ${stringifyLambda(this.param)}.${stringifyLambda(this.body)}`; };
}

class Expression {
    left;
    right;

    constructor(left, right) {
        this.left = left;
        this.right = right;
    }

    getReferencesTo(variable) {
        const references = new Array();
        if(this.left === variable) references.push(0);
        else if(typeof this.left !== "number") {
            const subRefs = this.left.getReferencesTo(variable);
            references.push(...subRefs);
        }
        const leftWidth = getWidth(this.left);
        if(this.right === variable) references.push(leftWidth);
        else if(typeof this.right !== "number") {
            const subRefs = this.right.getReferencesTo(variable).map(idx => leftWidth + idx);
            references.push(...subRefs);
        }
        return references;
    }

    toString() { return `(${stringifyLambda(this.left)} ${stringifyLambda(this.right)})`; }
}

export { Function, Expression, getWidth };