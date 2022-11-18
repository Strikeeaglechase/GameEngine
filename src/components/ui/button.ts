import { MouseDownEvent } from "../../engineEvents.js";
import { Component, NetComponent } from "../../entity/component.js";
import { Text } from "./text.js";

@NetComponent
class Button extends Component {
	constructor(private onClick: () => void, public updateToText = false) {
		super();
	}

	public override awake() {
		this.engine.on("mouse_down", (e: MouseDownEvent) => {
			const pos = this.entity.transform.position;
			const width = this.entity.transform.width / 2;
			const height = this.entity.transform.height / 2;
			if (e.button == 0 && pos.x > e.position.x - width && pos.x < e.position.x + width && pos.y > e.position.y - height && pos.y < e.position.y + height) {
				this.onClick();
			}
		}).disableWhen(() => !this.entity.isActive);
	}

	public override update(dt: number) {
		if (this.updateToText) {
			const text = this.entity.getComponent(Text);
			if (text) {
				this.entity.transform.width = text.getTextWidth() + 10;
				this.entity.transform.height = text.getTextHeight() + 5;
			}
		}
	}
}

export { Button };