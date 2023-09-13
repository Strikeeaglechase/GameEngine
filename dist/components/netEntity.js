var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Component, NetComponent } from "../entity/component.js";
import { EnableRPCs, RPC } from "../networking/rpc.js";
import { Routine } from "../routine/routine.js";
let NetEntity = class NetEntity extends Component {
    constructor() {
        super();
    }
    awake() {
        if (this.entity.isLocal && this.engine.networking && this.engine.networking.ready) {
            Routine.startCoroutine(this.netSpawnRoutine());
            this.engine.networking.on("client_resync", (clientId) => {
                if (this.entity.isLocal) {
                    this.entity.emit("client_resync", clientId);
                    this.updateTransform(this.entity.position, this.entity.rotation, this.entity.width, this.entity.height);
                }
            });
        }
    }
    *netSpawnRoutine() {
        yield* this.engine.networking.instantiateEntity(this.entity);
        this.entity.netReady = true;
        this.entity.emit("net_spawn");
        this.updateTransform(this.entity.position, this.entity.rotation, this.entity.width, this.entity.height);
    }
    destroy() {
        if (this.entity.isLocal && this.engine.networking && this.engine.networking.ready) {
            this.engine.networking.netDestroy(this.entityNetworkId);
        }
    }
    updateTransform(position, rotation, width, height) {
        this.entity.transform.position.set(position);
        this.entity.transform.rotation = rotation;
        this.entity.transform.width = width;
        this.entity.transform.height = height;
    }
};
__decorate([
    RPC("bi", "remote")
], NetEntity.prototype, "updateTransform", null);
NetEntity = __decorate([
    NetComponent,
    EnableRPCs("instance")
], NetEntity);
export { NetEntity };
