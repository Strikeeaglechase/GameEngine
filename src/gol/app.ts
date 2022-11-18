import { GameEngine } from "../engine.js";
import { WorldBackground, WorldInteractions } from "./components/world.js";

window.onload = () => {
	const engine = GameEngine.instance;
	engine.init("render-target");
	engine.world.addComponents(new WorldBackground(), new WorldInteractions());
	resize();
	window.onresize = () => {
		resize();
	};
};


function resize() {
	GameEngine.instance.resize(window.innerWidth, window.innerHeight);
}