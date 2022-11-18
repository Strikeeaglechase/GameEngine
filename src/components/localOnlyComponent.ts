import { Component, NetComponent } from "../entity/component.js";
import { Logger } from "../logger.js";

@NetComponent
class LocalOnlyComponent extends Component {
	public awake(): boolean {
		if (!this.entity.isLocal) {
			Logger.debug(`LocalOnlyComponent ${this} removed from remote entity ${this.entity}.`);
			this.entity.removeComponent(this);
			return false;
		}

		return true;
	}
}

export { LocalOnlyComponent };