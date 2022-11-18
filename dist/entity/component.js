import { GameEngine } from "../engine.js";
import { BiMap } from "../utils/biMap.js";
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
}
Component.components = new BiMap();
function NetComponent(target) {
    let name = target.name;
    if ("netInfo" in target) {
        const netInfo = target.netInfo;
        console.log(`Component ${name} has a netInfo property, so using name ${netInfo.className}`);
        name = netInfo.className;
    }
    if (Component.components.hasKey(name)) {
        console.error(`Component with name ${name} already exists!`);
    }
    Component.components.set(name, target);
    target = class extends target {
        constructor(...args) {
            super(...args);
            this.__netInitArgs = args;
        }
    };
    target.__orgName = name;
}
;
export { Component, NetComponent };
