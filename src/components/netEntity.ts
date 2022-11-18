import { Component, NetComponent } from "../entity/component.js";
import { Routine } from "../routine/routine.js";

@NetComponent
class NetEntity extends Component {
	public entityNetworkId: number;
	constructor() {
		super();
	}

	public override awake() {
		if (this.entity.isLocal && this.engine.networking && this.engine.networking.ready) {
			Routine.startCoroutine(this.netSpawnRoutine());
		}
	}

	private *netSpawnRoutine() {
		yield* this.engine.networking.instantiateEntity(this.entity);
		this.entity.emit("net_spawn");
	}

	public override destroy() {
		if (this.entity.isLocal && this.engine.networking && this.engine.networking.ready) {
			this.engine.networking.netDestroy(this.entityNetworkId);
		}
	}
}

export { NetEntity };