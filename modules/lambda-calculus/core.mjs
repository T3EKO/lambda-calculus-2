
const variableNamePlaceholders = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];

function stringifyLambda(lambda) {
    if(typeof lambda === "number") {
        const n = Math.floor(lambda / variableNamePlaceholders.length);
        if(n === 0) return variableNamePlaceholders[lambda % variableNamePlaceholders.length];
        return `${variableNamePlaceholders[lambda % variableNamePlaceholders.length]}${n}`;
    }
    return lambda.toString();
}

function debrujinStringifyLambda(lambda) {
    if(typeof lambda === "number") {
        return `${lambda}`;
    }
    return lambda.toDebrujinString();
}

function getWidth(lambda) {
    if(typeof lambda === "number") return 1;
    if(lambda instanceof Function) return getWidth(lambda.body);
    if(lambda instanceof Expression) return getWidth(lambda.left) + getWidth(lambda.right);
}

function cleanupBindings(lambda, abstractionAmount = 0, oldBindings = [], newBindings = []) {
    if(typeof lambda === "number") {
        if(oldBindings.indexOf(lambda) !== -1) return newBindings[oldBindings.indexOf(lambda)];
    }
    if(lambda instanceof Function) {
        const abstractionIdx = oldBindings.indexOf(lambda.param);
        if(abstractionIdx !== -1) {
            return new Function(abstractionAmount, cleanupBindings(lambda.body, abstractionAmount + 1, oldBindings, newBindings.map((e, i) => i === abstractionIdx ? abstractionAmount : e)));
        }
        return new Function(abstractionAmount, cleanupBindings(lambda.body, abstractionAmount + 1, oldBindings.concat(lambda.param), newBindings.concat(abstractionAmount)));
    }
    if(lambda instanceof Expression) {
        return new Expression(cleanupBindings(lambda.left, abstractionAmount, oldBindings, newBindings), cleanupBindings(lambda.right, abstractionAmount, oldBindings, newBindings));
    }
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

    unsafeReplaceReferencesTo(variable, replace) {
        if(typeof this.body === "number") {
            if(this.body === variable) return new Function(this.param, replace);
            return this;
        }
        return new Function(this.param, this.body.unsafeReplaceReferencesTo(variable, replace));
    }

    replaceReferencesTo(variable, replace) {
        if(this.param === variable) return this;
        if(typeof this.body === "number") {
            if(this.body === variable) return new Function(this.param, replace);
            return this;
        }
        return new Function(this.param, this.body.replaceReferencesTo(variable, replace));
    }

    unsafeRebind(newBinding) {
        return new Function(newBinding, this.body.unsafeReplaceReferencesTo(this.param, newBinding));
    }
    
    toString() { return `(λ${stringifyLambda(this.param)}.${stringifyLambda(this.body)})`; };

    toDebrujinString() { return `(λ${debrujinStringifyLambda(this.body)})`}
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

        return new Expression(newLeft, newRight);
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

        return new Expression(newLeft, newRight);
    }

    toString() { return `(${stringifyLambda(this.left)} ${stringifyLambda(this.right)})`; }

    toDebrujinString() { return `(${debrujinStringifyLambda(this.left)} ${debrujinStringifyLambda(this.right)})`; }
}

function unboundVariableInLambda(variable, lambda, currentlyBound = []) {
    return new ReferenceError(`Unbound variable ${stringifyLambda(variable)} in lambda ${lambda} (Currently bound: ${currentlyBound.map(e => stringifyLambda(e))})`);
}

export { Function, Expression, getWidth, cleanupBindings };