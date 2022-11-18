import { WebSocketServer } from "ws";

import { EnableRPCs, NetInfo, RPC, RPCController } from "../rpc.js";

// console.log(WebSocket);
const server = new WebSocketServer({ port: 8080 });

@EnableRPCs("singleInstance")
class RPCTest {
	netInfo: NetInfo;
	@RPC("bi")
	hello() {
		console.log(`Server: hello. Local: ${this.netInfo.isLocal()}`);
		if (!this.netInfo.isLocal()) this.world();
	}

	@RPC("bi")
	world() {
		console.log(`Server: world. Local: ${this.netInfo.isLocal()}`);
	}
}
const inst = new RPCTest();

server.on("listening", () => {
	console.log("Server: Listening");
});

server.on("connection", (ws) => {
	RPCController.init((p) => {
		ws.send(JSON.stringify(p));
	});

	ws.on("message", (data) => {
		RPCController.handlePacket(data.toString());
	});
	console.log(`Server: New connection`);
	inst.hello();

	setInterval(() => RPCController.flush(), 1000 / 60);
});