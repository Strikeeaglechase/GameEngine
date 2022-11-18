import { Component, NetComponent } from "../../entity/component.js";
import { SimpleMoverPhysics } from "./simplePhysics.js";

const G_MULT = 10000;

@NetComponent
class Gravity extends Component {
	constructor(public mass: number) {
		super();
	}

	public override update(dt: number) {
		const massObjects = this.engine.getEntitiesWithComponent(Gravity);
		for (const massObject of massObjects) {
			if (massObject === this.entity) continue;

			const distance = this.entity.transform.position.clone().subtract(massObject.transform.position).length();
			if (distance < 5) continue;
			const otherMass = massObject.getComponent(Gravity).mass;
			const force = G_MULT * otherMass / (distance * distance);

			const direction = this.entity.transform.position.clone().subtract(massObject.transform.position).normalize();
			this.entity.getComponent(SimpleMoverPhysics).velocity.add(direction.multiply(-force).multiply(dt));
		}
	};
}

export { Gravity };