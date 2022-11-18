var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { WebSocketServer } from "ws";
import { EnableRPCs, RPC, RPCController } from "../rpc.js";
// console.log(WebSocket);
const server = new WebSocketServer({ port: 8080 });
let RPCTest = class RPCTest {
    hello() {
        console.log(`Server: hello. Local: ${this.netInfo.isLocal()}`);
        if (!this.netInfo.isLocal())
            this.world();
    }
    world() {
        console.log(`Server: world. Local: ${this.netInfo.isLocal()}`);
    }
};
__decorate([
    RPC("bi")
], RPCTest.prototype, "hello", null);
__decorate([
    RPC("bi")
], RPCTest.prototype, "world", null);
RPCTest = __decorate([
    EnableRPCs("singleInstance")
], RPCTest);
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
