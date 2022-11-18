import { PartialEmitter } from "../../components/particleEmitter.js";
import { Component, NetComponent } from "../../entity/component.js";
import { Routine } from "../../routine/routine.js";

@NetComponent
class ExplosionEffect extends Component {
	private emitter: PartialEmitter;
	public override awake(): void {
		this.emitter = new PartialEmitter({
			rate: 0,
			lifetime: 1,
			lifetimeJitter: 0.5,
			angle: 0,
			angleJitter: 360,
			speed: 100,
			speedJitter: 50,

			color: [255, 0, 0, 255],
			fadeTo: 50,
			deceleration: 0.985
		});
		this.emitter.enabled = false;
		this.entity.addComponent(this.emitter);

		this.engine.on("mouse_down", (action) => {
			this.entity.transform.position.set(action.position);
			Routine.startCoroutine(this.explosionRoutine());
		});
	}

	private *explosionRoutine() {
		this.emitter.enabled = true;
		yield Routine.wait(0.1);
		this.emitter.enabled = false;
	}
}

export { ExplosionEffect };