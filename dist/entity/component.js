import { GameEngine } from "../engine.js";
class Component {
    constructor() {
        this.engine = GameEngine.instance;
    }
    awake() { }
    update(dt) { }
    destroy() { }
    toString() {
        var _a;
        // @ts-ignore
        return (_a = this.__orgName) !== null && _a !== void 0 ? _a : this.constructor.name;
    }
    static getComponentByName(name) {
        return this.components.find(c => c.__orgName == name);
    }
    static getComponentName(ctor) {
        // @ts-ignore
        if (ctor instanceof Component)
            return ctor.constructor.__orgName;
        // @ts-ignore
        return ctor.__orgName;
    }
}
// static components: BiMap<string, Ctor<Component>> = new BiMap();
Component.components = [];
function NetComponent(target) {
    let name = target.name;
    if ("__name" in target) {
        const preNetInfoName = target.__name;
        console.log(`Component ${name} has a __name property, so using name ${target.__name}`);
        name = preNetInfoName;
        // console.error(`Component ${target.__name} has been registered as an RPC before registering as a componen. This is not supported.`);
        // return;
    }
    if (Component.getComponentByName(name)) {
        console.error(`Component with name ${name} already exists!`);
    }
    target = class extends target {
        constructor(...args) {
            super(...args);
            this.__netInitArgs = args;
        }
    };
    target.__orgName = name;
    Component.components.push(target);
    return target;
}
;
export { Component, NetComponent };
