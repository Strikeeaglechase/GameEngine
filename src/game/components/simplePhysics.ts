import { PartialEmitter } from "../../components/particleEmitter.js";
import { Component, NetComponent } from "../../entity/component.js";
import { Vector2 } from "../../utils/vector2.js";

@NetComponent
class LimitedLifetime extends Component {
	private awakeAt: number = 0;
	constructor(private lifetime: number) {
		super();
	}

	public override awake() {
		this.awakeAt = Date.now();
	}

	public override update(dt: number): void {
		if (Date.now() > this.awakeAt + this.lifetime * 1000) {
			this.entity.destroy();
		}
	}
}

@NetComponent
class SimpleMoverPhysics extends Component {
	public velocity = Vector2.zero;

	constructor(public decel: number) { super(); }

	public override update(dt: number): void {
		const pos = this.entity.transform.position;
		const vel = this.velocity;
		pos.add(vel.clone().multiply(dt));
		vel.multiply(this.decel);

		const emitter = this.entity.getComponent(PartialEmitter);
		if (emitter) {
			emitter.options.size = Math.max(vel.length() / 10, 1);
		}
	}
}

export { SimpleMoverPhysics, LimitedLifetime };