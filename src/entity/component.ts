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

	static components: BiMap<string, Ctor<Component>> = new BiMap();
}

function NetComponent(target: any) {
	let name = target.name;
	if ("netInfo" in target) {
		const netInfo = target.netInfo as NetInfo;
		console.log(`Component ${name} has a netInfo property, so using name ${netInfo.className}`);
		name = netInfo.className;
	}

	if (Component.components.hasKey(name)) {
		console.error(`Component with name ${name} already exists!`);
	}

	Component.components.set(name, target);


	target = class extends target {
		constructor(...args: any[]) {
			super(...args);
			this.__netInitArgs = args;
		}
	};
	target.__orgName = name;
};

export { Component, NetComponent };