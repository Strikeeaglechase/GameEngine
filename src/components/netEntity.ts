import { IVector2 } from "utils/vector2.js";
import { Component, NetComponent } from "../entity/component.js";
import { EnableRPCs, RPC } from "../networking/rpc.js";
import { Routine } from "../routine/routine.js";

@NetComponent
@EnableRPCs("instance")
class NetEntity extends Component {
	public entityNetworkId: number;
	public ownerId: string;

	constructor() {
		super();
	}

	public override awake() {
		if (this.entity.isLocal && this.engine.networking && this.engine.networking.ready) {
			Routine.startCoroutine(this.netSpawnRoutine());
			this.engine.networking.on("client_resync", (clientId: string) => {
				if (this.entity.isLocal) {
					this.entity.emit("client_resync", clientId);
					this.updateTransform(this.entity.position, this.entity.rotation, this.entity.width, this.entity.height);
				}
			});
		}
	}

	private *netSpawnRoutine() {
		yield* this.engine.networking.instantiateEntity(this.entity);
		this.entity.netReady = true;
		this.entity.emit("net_spawn");
		this.updateTransform(this.entity.position, this.entity.rotation, this.entity.width, this.entity.height);
	}

	public override destroy() {
		if (this.entity.isLocal && this.engine.networking && this.engine.networking.ready) {
			this.engine.networking.netDestroy(this.entityNetworkId);
		}
	}

	@RPC("bi", "remote")
	private updateTransform(position: IVector2, rotation: number, width: number, height: number) {
		this.entity.transform.position.set(position);
		this.entity.transform.rotation = rotation;
		this.entity.transform.width = width;
		this.entity.transform.height = height;
	}
}


export { NetEntity };