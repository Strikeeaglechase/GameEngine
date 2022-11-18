import { Component, NetComponent } from "../../entity/component.js";

@NetComponent
class WorldBackground extends Component {
	public override awake(): void {

	}

	public override update(dt: number) {
		this.engine.renderer.clear(0);
		this.engine.renderer.debugObject({ fps: this.engine.fps }, 10, 20, 255);
	}
}

export { WorldBackground };