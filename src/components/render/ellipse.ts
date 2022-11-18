import { Component, NetComponent } from "../../entity/component.js";
import { ColorValue } from "../../render/color.js";

@NetComponent
class Ellipse extends Component {
	public width: number;
	public height: number;
	public fillColor: ColorValue;
	public strokeColor: ColorValue;

	constructor(width: number, height: number, fillColor: ColorValue | null = null, strokeColor: ColorValue | null = null) {
		super();
		this.fillColor = fillColor;
		this.strokeColor = strokeColor;
		this.width = width;
		this.height = height;
	}

	public override update(dt: number): void {
		const pos = this.entity.transform.position;
		if (this.fillColor != null) this.engine.renderer.ellipse(pos.x, pos.y, this.width / 2, this.height / 2, this.fillColor);
		if (this.strokeColor != null) this.engine.renderer.strokeEllipse(pos.x, pos.y, this.width / 2, this.height / 2, this.fillColor);
	}
}

export { Ellipse };