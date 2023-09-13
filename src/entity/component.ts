import { GameEngine } from "../engine.js";
import { NetInfo } from "../networking/rpc.js";
import { BiMap } from "../utils/biMap.js";
import { Ctor, Entity } from "./entity.js";

abstract class Component {
	protected engine: GameEngine;
	public entity: Entity;
	public id: number;
	public __netInitArgs: any[];

	constructor() {
		this.engine = GameEngine.instance;
	}

	public awake() { }
	public update(dt: number) { }
	public destroy() { }

	toString() {
		// @ts-ignore
		return this.__orgName ?? this.constructor.name;
	}

	// static components: BiMap<string, Ctor<Component>> = new BiMap();
	static components: (Ctor<Component> & { __orgName: string; })[] = [];

	public static getComponentByName(name: string) {
		return this.components.find(c => c.__orgName == name);
	}

	public static getComponentName(ctor: Ctor<Component> | Component): string {
		// @ts-ignore
		if (ctor instanceof Component) return ctor.constructor.__orgName;
		// @ts-ignore
		return ctor.__orgName;
	}
}

function NetComponent(target: any) {
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
		constructor(...args: any[]) {
			super(...args);
			this.__netInitArgs = args;
		}
	};
	target.__orgName = name;
	Component.components.push(target);
	return target;
};

export { Component, NetComponent };