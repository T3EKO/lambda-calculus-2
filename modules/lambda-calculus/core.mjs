
const variableNamePlaceholders = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

function stringifyLambda(lambda) {
    if(typeof lambda === "number") {
        const n = Math.floor(lambda / variableNamePlaceholders.length);
        if(n === 0) return variableNamePlaceholders[lambda % variableNamePlaceholders.length];
        return `${variableNamePlaceholders[lambda % variableNamePlaceholders.length]}${n}`;
    }
    return lambda.toString();
}

function debruijnStringifyLambda(lambda) {
    if(typeof lambda === "number") {
        return `${lambda}`;
    }
    return lambda.toDebruijnString();
}

function getWidth(lambda) {
    if(typeof lambda === "number") return 1;
    if(lambda instanceof Abstraction) return getWidth(lambda.body);
    if(lambda instanceof Application) return getWidth(lambda.left) + getWidth(lambda.right);
}

function cleanupBindings(lambda, abstractionAmount = 0, oldBindings = [], newBindings = []) {
    if(typeof lambda === "number") {
        if(oldBindings.indexOf(lambda) !== -1) return newBindings[oldBindings.indexOf(lambda)];
    }
    if(lambda instanceof Abstraction) {
        const abstractionIdx = oldBindings.indexOf(lambda.param);
        if(abstractionIdx !== -1) {
            return new Abstraction(abstractionAmount, cleanupBindings(lambda.body, abstractionAmount + 1, oldBindings, newBindings.map((e, i) => i === abstractionIdx ? abstractionAmount : e)));
        }
        return new Abstraction(abstractionAmount, cleanupBindings(lambda.body, abstractionAmount + 1, oldBindings.concat(lambda.param), newBindings.concat(abstractionAmount)));
    }
    if(lambda instanceof Application) {
        return new Application(cleanupBindings(lambda.left, abstractionAmount, oldBindings, newBindings), cleanupBindings(lambda.right, abstractionAmount, oldBindings, newBindings));
    }
}

class Abstraction {
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
        if(this.param === variable) return [];
        if(typeof this.body === "number") {
            if(this.body === variable) return [0];
            return [];
        }
        return this.body.getReferencesTo(variable);
    }

    unsafeReplaceReferencesTo(variable, replace) {
        if(typeof this.body === "number") {
            if(this.body === variable) return new Abstraction(this.param, replace);
            return this;
        }
        return new Abstraction(this.param, this.body.unsafeReplaceReferencesTo(variable, replace));
    }

    replaceReferencesTo(variable, replace) {
        if(this.param === variable) return this;
        if(typeof this.body === "number") {
            if(this.body === variable) return new Abstraction(this.param, replace);
            return this;
        }
        return new Abstraction(this.param, this.body.replaceReferencesTo(variable, replace));
    }

    unsafeRebind(newBinding) {
        return new Abstraction(newBinding, this.body.unsafeReplaceReferencesTo(this.param, newBinding));
    }
    
    toString() { return `(λ${stringifyLambda(this.param)}.${stringifyLambda(this.body)})`; };

    toDebruijnString() { return `(λ${debruijnStringifyLambda(this.body)})`}
}

class Application {
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

    unsafeReplaceReferencesTo(variable, replace) {
        let newLeft;
        if(typeof this.left === "number") {
            if(this.left === variable) newLeft = replace;
            else newLeft = this.left;
        } else {
            newLeft = this.left.unsafeReplaceReferencesTo(variable, replace);
        }

        let newRight;
        if(typeof this.right === "number") {
            if(this.right === variable) newRight = replace;
            else newRight = this.right;
        } else {
            newRight = this.right.unsafeReplaceReferencesTo(variable, replace);
        }

        return new Application(newLeft, newRight);
    }

    replaceReferencesTo(variable, replace) {
        let newLeft;
        if(typeof this.left === "number") {
            if(this.left === variable) newLeft = replace;
            else newLeft = this.left;
        } else {
            newLeft = this.left.replaceReferencesTo(variable, replace);
        }

        let newRight;
        if(typeof this.right === "number") {
            if(this.right === variable) newRight = replace;
            else newRight = this.right;
        } else {
            newRight = this.right.replaceReferencesTo(variable, replace);
        }

        return new Application(newLeft, newRight);
    }

    toString() { return `(${stringifyLambda(this.left)} ${stringifyLambda(this.right)})`; }

    toDebruijnString() { return `(${debruijnStringifyLambda(this.left)} ${debruijnStringifyLambda(this.right)})`; }
}

export { Abstraction, Application, getWidth, cleanupBindings };