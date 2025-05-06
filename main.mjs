import * as Mathc from "./modules/mathc.mjs";
import * as Lambda from "./modules/lambda-calculus/core.mjs";
import * as Beta from "./modules/lambda-calculus/beta-reduction.mjs";
import * as Prefabs from "./modules/lambda-calculus/prefabs.mjs";
import * as Rendering from "./modules/lambda-calculus/rendering.mjs";




const DEBUG = true;














if(DEBUG) {
    window.Mathc = Mathc;
    window.Lambda = Lambda;
    window.Beta = Beta;
    window.Prefabs = Prefabs;
    window.fn = Prefabs.fn;
    window.expr = Prefabs.expr;
    window.Rendering = Rendering;
}