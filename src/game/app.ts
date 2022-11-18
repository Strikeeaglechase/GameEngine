import { NetEntity } from "../components/netEntity.js";
import { Rect } from "../components/render/rect.js";
import { Button } from "../components/ui/button.js";
import { Text } from "../components/ui/text.js";
import { GameEngine } from "../engine.js";
import { Routine } from "../routine/routine.js";
import { CubeKeybinds } from "./components/cube.js";
import { SimpleMoverPhysics } from "./components/simplePhysics.js";
import { WorldBackground } from "./components/world.js";
import { GameList } from "./gameList.js";

const decel = 0.985;

window.onload = () => {
	const engine = GameEngine.instance;
	engine.init("render-target");
	// engine.debugEntityPos = true;
	engine.world.addComponents(
		new WorldBackground(),
	);
	engine.addSystem(new GameList());

	Routine.startCoroutine(setup(engine));

	resize();
	window.onresize = () => {
		resize();
	};
};

let name = "Chase";
function* setup(engine: GameEngine) {
	engine.initializeNetworking(`ws://localhost:8001`);
	yield Routine.waitForEvent(engine.networking, "ready");
	createGameButton();
	Routine.startCoroutine(engine.getSystem(GameList).setup());

	yield Routine.waitForEvent(engine.networking.client, "join_game_result");
	createPlayer();


	// yield Routine.waitForEvent(engine.networking.client, "game_join_result");
	// clearGameList();

}

function createGameButton() {
	const button = GameEngine.instance.createEntity();
	button.addComponents(
		new Rect(null, 255),
		new Text("Create Game", 255, 16),
		new Button(() => {
			GameEngine.instance.networking.client.createGame(name);
			button.destroy();
		}, true)
	);

	button.position.set(100, 50);
	button.width = 100;
	button.height = 20;

	button.awake();
}

function createPlayer() {
	const cube = GameEngine.instance.createEntity();
	cube.addComponents(
		new NetEntity(),
		new SimpleMoverPhysics(decel),
		new Rect(255),
		new CubeKeybinds(),
	);
	cube.transform.position.set(100, 100);
	cube.transform.width = 16;
	cube.transform.height = 16;
	cube.awake();
}

// function makeObj(pos: Vector2) {
// 	const entity = GameEngine.instance.createEntity();
// 	entity.addComponents(
// 		new Ellipse(8, 8, 255),
// 		// new Rect(16, 16, null, [255, 0, 0]),
// 		new SimpleMoverPhysics(1),
// 		new Gravity(10),
// 		new PartialEmitter({
// 			angle: 0,
// 			angleJitter: 360,
// 			color: [255, 0, 0],
// 			fadeTo: 50,
// 			lifetime: 1.5,
// 			lifetimeJitter: 0.5,
// 			size: 2,
// 			sizeJitter: 1,
// 			speed: 1,
// 			rate: 0.25
// 		})
// 	);
// 	entity.transform.position.set(pos);
// 	entity.awake();
// 	return entity;
// }


function resize() {
	GameEngine.instance.resize(window.innerWidth, window.innerHeight);
}