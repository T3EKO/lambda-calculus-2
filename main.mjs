import * as Mathc from "./modules/mathc.mjs";
import * as Lambda from "./modules/lambda-calculus/core.mjs";
import * as Prefabs from "./modules/lambda-calculus/prefabs.mjs";
import * as Rendering from "./modules/lambda-calculus/rendering.mjs";




const DEBUG = true;














if(DEBUG) {
    window.Mathc = Mathc;
    window.Lambda = Lambda;
    window.Prefabs = Prefabs;
    window.Rendering = Rendering;
}