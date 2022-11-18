import { Component, NetComponent } from "../../entity/component.js";
import { ColorValue } from "../../render/color.js";

@NetComponent
class Rect extends Component {
	public center = true;

	constructor(public fillColor: ColorValue | null = null, public strokeColor: ColorValue | null = null, public round = 0) {
		super();
	}

	public override update(dt: number): void {
		const pos = this.entity.transform.position.clone();
		const width = this.entity.transform.width;
		const height = this.entity.transform.height;
		if (this.center) {
			pos.x -= width / 2;
			pos.y -= height / 2;
		}
		if (this.fillColor != null) this.engine.renderer.rect(pos.x, pos.y, width, height, this.fillColor);
		if (this.strokeColor != null) this.engine.renderer.strokeRect(pos.x, pos.y, width, height, this.strokeColor);
	}
}

export { Rect };