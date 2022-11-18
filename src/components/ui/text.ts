import { Component, NetComponent } from "../../entity/component.js";
import { ColorValue } from "../../render/color.js";

@NetComponent
class Text extends Component {
	constructor(public text: string, public color: ColorValue, public size: number) {
		super();
	}

	public update(dt: number): void {
		const renderer = this.engine.renderer;
		const textWidth = renderer.measureText(this.text, this.size);
		const textHeight = this.size;

		renderer.text(
			this.text,
			this.entity.transform.position.x - textWidth / 2,
			this.entity.transform.position.y + textHeight / 2,
			this.color,
			this.size
		);
	}

	public getTextWidth() {
		return this.engine.renderer.measureText(this.text, this.size);
	}

	public getTextHeight() {
		return this.size;
	}
}

export { Text };