// import { Buffer } from "buffer";

type RPCMode = "static" | "singleInstance" | "instance";
interface RPCHandler {
	type: RPCMode;
	target: string;
	name: string;
}

interface RPCPacket {
	className: string;
	method: string;
	args: any;
	id?: string;
	timestamp: number;
	callerId: string;
}

class NetInfo {
	lastPacket: RPCPacket;
	callerId: string;
	currentMethod: string;
	className: string;

	constructor(className: string) {
		this.className = className;
	}

	public update(packet: RPCPacket) {
		if (packet == null) {
			this.lastPacket = null;
			this.callerId = null;
		} else {
			this.lastPacket = packet;
			this.callerId = packet.callerId;
		}
	}

	public isLocal() {
		if (!this.lastPacket) return true;
		return this.lastPacket.className != this.className ||
			this.lastPacket.method != this.currentMethod;
	}

	public isRemote() {
		return !this.isLocal();
	}

	toString() {
		return `NetInfo<${this.className}#${this.currentMethod}>`;
	}
}

type PermissionProvider = (packet: RPCPacket, rpc: RPCHandler, client: unknown) => boolean;

class RPCController {
	static instance: RPCController = new RPCController();
	private constructor() { }

	private newInRpcs: RPCHandler[] = [];
	private rpcs: RPCHandler[] = [];

	private sendHandler: (packets: RPCPacket[] | Uint8Array) => void;
	private permissionProvider: PermissionProvider;

	private singleInstances: Record<string | number, any> = {};
	private instances: Record<string | number, any[]> = {};
	private multiNameLut: Record<string, string> = {};
	private rpcSendPool: RPCPacket[] = [];

	public static suppressRPCFindError = false;

	public static init(sendHandler: (packet: RPCPacket[]) => void) {
		this.instance.sendHandler = sendHandler;
	}

	// public static initForPooling(sendHandler: (packet: Uint8Array) => void) {
	// 	// @ts-ignore
	// 	this.instance.sendHandler = sendHandler;
	// }

	public static assignPermissionProvided(provider: PermissionProvider) {
		this.instance.permissionProvider = provider;
	}

	public registerRPCHandler<T extends { new(...args: any[]): {}; }>(constructor: T, mode: RPCMode, altNames: string[] = []) {
		// @ts-ignore
		const name = constructor.__orgName ?? constructor.name;
		altNames.forEach(altName => this.multiNameLut[altName] = name);
		if (mode != "static") {
			const self = this;
			constructor = class extends constructor {
				constructor(...args: any[]) {
					super(...args);
					// @ts-ignore
					// this.__name = name;
					// @ts-ignore
					this.netInfo = new NetInfo(name);

					if (mode == "singleInstance") {
						self.singleInstances[name] = this;
					} else {
						if (!self.instances[name]) self.instances[name] = [];
						self.instances[name].push(this);
					}
				}
			};
		}

		this.newInRpcs.forEach(rpc => rpc.type = mode);
		console.log(`Registered ${mode} RPCs on ${name}${this.newInRpcs.map(r => `\n\t- ${r.name}`)}`);
		this.rpcs.push(...this.newInRpcs);
		this.newInRpcs = [];

		return constructor;
	}

	static deregister(instance: any) {
		// Check to find it as a single instance
		const singleInstance = Object.entries(this.instance.singleInstances).find(i => i[1] == instance);
		if (singleInstance) {
			const preFilter = this.instance.rpcs.length;
			this.instance.rpcs = this.instance.rpcs.filter(rpc => rpc.target != singleInstance[0]);
			console.log(`Deregistered ${singleInstance[0]} and got rid of ${preFilter - this.instance.rpcs.length} RPCs`);
			return;
		}

		const multiInstance = Object.entries(this.instance.instances).find(i => i[1].includes(instance));
		if (multiInstance) {
			console.log(`Deregistered ${multiInstance[0]}#${instance.id}`);
			this.instance.instances[multiInstance[0]] = multiInstance[1].filter(i => i != instance);
			return;
		}
	}

	public registerRpc(target: any, propertyKey: string, descriptor: PropertyDescriptor, direction: "in" | "out" | "bi"): PropertyDescriptor {
		const rpcName = propertyKey;
		const targetName = target.constructor.name;
		if (direction == "in" || direction == "bi") {
			this.newInRpcs.push({
				name: rpcName,
				target: targetName,
				type: "static"
			});
		}
		if (direction == "out" || direction == "bi") {
			const self = this;
			const defaultFunc = descriptor.value;
			descriptor.value = function (...args: any[]) {
				const netInfo = this.netInfo as NetInfo;
				netInfo.currentMethod = rpcName;
				if (netInfo.isLocal()) {
					self.fireRPC(target, rpcName, args, this.id);
				}
				return defaultFunc.apply(this, args);
			};
		}
		return descriptor;
	}

	private fireRPC(target: any, propertyKey: string, args: any[], id?: string) {
		const targetName = target.constructor.name;
		const packet: RPCPacket = {
			className: targetName,
			method: propertyKey,
			args: args,
			id: id,
			timestamp: Date.now(),
			callerId: null
		};

		this.rpcSendPool.push(packet);
	}

	static flush() {
		// const compressed = compressRpcPackets(this.instance.rpcSendPool);
		// this.instance.rpcSendPool = [];
		// // @ts-ignore
		// this.instance.sendHandler(new Uint8Array(compressed));
		if (this.instance.rpcSendPool.length > 0) this.instance.sendHandler(this.instance.rpcSendPool);
		this.instance.rpcSendPool = [];
	}

	static handlePacket(message: string | RPCPacket | Buffer | ArrayBuffer | Buffer[], client?: unknown) {
		// if (message instanceof Buffer || message instanceof Uint8Array) {
		// 	throw new Error("Buffer not supported yet");
		// const arr = message instanceof Buffer ? new Uint8Array(message) : message;
		// try {
		// 	const packets = decompressRpcPackets([...arr]);
		// 	packets.forEach(packet => {
		// 		this.handlePacket(packet, client);
		// 	});
		// } catch (e) {
		// 	// console.error(e);
		// 	// console.log([...arr]);
		// }
		// return;
		// }


		let packet = message as RPCPacket;
		try {
			if (typeof message == "string") packet = JSON.parse(message);
			if (Array.isArray(packet)) {
				packet.forEach(p => this.handlePacket(p, client));
				return;
			}
		} catch (e) {
			console.log(`Error parsing RPC packet: ${e}`);
			console.log(message);
		}

		// Check alt name
		const altName = this.instance.multiNameLut[packet.className];
		if (altName) {
			packet.className = altName;
		}

		const rpc = this.instance.rpcs.find(rpc => {
			return rpc.target == packet.className && rpc.name == packet.method;
		});

		if (!rpc) {
			if (!this.suppressRPCFindError) console.log(`Cannot find RPC ${packet.className}.${packet.method} with ID ${packet.id}`);
			return;
		}

		if (this.instance.permissionProvider) {
			if (!this.instance.permissionProvider(packet, rpc, client)) {
				console.log(`RPC ${packet.className}.${packet.method} with ID ${packet.id} denied from the permission provider`);
				return;
			}
		}

		switch (rpc.type) {
			case "instance": {
				const instance = this.instance.instances[packet.className]?.find(i => i.id == packet.id);
				if (!instance) return console.warn(`No existing instance for ${packet.className} (id: ${packet.id})`, packet);
				if (!instance[packet.method]) return console.warn(`No RPC method ${packet.className}.${packet.method}`, packet);
				// instance[packet.method].apply(instance, packet.args);
				this.callMethod(instance[packet.method], instance, packet);
				break;
			}

			case "singleInstance": {
				const instance = this.instance.singleInstances[packet.className];
				if (!instance) return console.warn(`No existing instance for ${packet.className}`, packet);
				if (!instance[packet.method]) return console.warn(`No RPC method ${packet.className}.${packet.method}`, packet);
				// instance[packet.method].apply(instance, packet.args);
				this.callMethod(instance[packet.method], instance, packet);
				break;
			}

			// I don't think this is implemented lmao, this code doesn't make sense
			case "static": {
				// @ts-ignore
				const method: () => void = rpc.target[rpc.name];
				method.apply(null, packet.args);
				break;
			}
		}
	}

	private static callMethod(target: Function, thisArg: any, packet: RPCPacket) {
		thisArg.netInfo.update(packet);
		target.apply(thisArg, packet.args);
		thisArg.netInfo.update(null);
	}
}

function EnableRPCs(mode: RPCMode = "singleInstance", altNames?: string[]) {
	return function (constructor: any) {
		return RPCController.instance.registerRPCHandler(constructor, mode, altNames);
	};
}
type DecoratorReturn = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => PropertyDescriptor;

function RPC(direction: "in" | "out" | "bi" = "bi"): DecoratorReturn {
	return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
		return RPCController.instance.registerRpc(target, propertyKey, descriptor, direction);
	};
}

export {
	RPCMode,
	RPCHandler,
	RPCPacket,
	RPCController,
	NetInfo,
	EnableRPCs,
	RPC
};