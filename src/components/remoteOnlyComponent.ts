import { Component, NetComponent } from "../entity/component.js";
import { Logger } from "../logger.js";

@NetComponent
class RemoteOnlyComponent extends Component {
	public awake(): boolean {
		if (this.entity.isLocal) {
			Logger.debug(`RemoteOnlyComponent ${this} removed from remote entity ${this.entity}.`);
			this.entity.removeComponent(this);
			return false;
		}

		return true;
	}
}

export { RemoteOnlyComponent };