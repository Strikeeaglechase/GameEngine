import WebSocket from "ws";

import { EnableRPCs, NetInfo, RPC, RPCController } from "../rpc.js";

@EnableRPCs("singleInstance")
class RPCTest {
	netInfo: NetInfo;
	@RPC("bi")
	hello() {
		console.log(`Client: hello. Local: ${this.netInfo.isLocal()}`);
		if (!this.netInfo.isLocal()) this.world();
	}

	@RPC("bi")
	world() {
		console.log(`Client: world Local: ${this.netInfo.isLocal()}`);
	}
}

const inst = new RPCTest();

function connectClient() {
	const client = new WebSocket("ws://localhost:8080");

	RPCController.init((p) => {
		client.send(JSON.stringify(p));
	});

	client.on("message", (data) => {
		RPCController.handlePacket(data.toString());
	});

	client.on("open", () => {
		console.log("Client: Connected");

		setTimeout(() => inst.hello(), 1000);
	});

	setInterval(() => RPCController.flush(), 1000 / 60);
}

setTimeout(() => connectClient(), 500);