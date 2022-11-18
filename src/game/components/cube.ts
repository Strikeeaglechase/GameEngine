import { LocalOnlyComponent } from "../../components/localOnlyComponent.js";
import { NetEntity } from "../../components/netEntity.js";
import { Ellipse } from "../../components/render/ellipse.js";
import { NetComponent } from "../../entity/component.js";
import { Vector2 } from "../../utils/vector2.js";
import { LimitedLifetime, SimpleMoverPhysics } from "./simplePhysics.js";

const accel = 900;
const fireRate = 0.25 * 1000;
const bulletSpeed = 1500;

@NetComponent
class CubeKeybinds extends LocalOnlyComponent {
	private physics: SimpleMoverPhysics;
	private lastFireTime: number = 0;

	public override awake(): boolean {
		if (!super.awake()) {
			return false;
		}

		this.physics = this.entity.getComponent(SimpleMoverPhysics);
		return true;
	}

	public override update(dt: number): void {
		const dir = Vector2.zero;
		if (this.engine.keysDown["w"]) dir.y -= 1;
		if (this.engine.keysDown["s"]) dir.y += 1;
		if (this.engine.keysDown["a"]) dir.x -= 1;
		if (this.engine.keysDown["d"]) dir.x += 1;

		this.physics.velocity.add(dir.normalize().multiply(accel * dt));

		if (this.engine.mouseButtonsDown[0] && Date.now() - this.lastFireTime > fireRate) {
			// this.fire();
		}
	}

	private fire(): void {
		const mouse = this.engine.screenToWorld(this.engine.mouse);
		const dir = mouse.subtract(this.entity.transform.position).normalize();


		const phys = new SimpleMoverPhysics(1);
		phys.velocity.set(dir.multiply(bulletSpeed));

		const bullet = this.engine.createEntity();
		bullet.addComponents(
			new NetEntity(),
			new Ellipse(3, 3, [255, 0, 0]),
			new LimitedLifetime(2),
			phys,
		);
		bullet.transform.position.set(this.entity.transform.position);
		bullet.awake();

		this.lastFireTime = Date.now();
	}
}



export { CubeKeybinds };