import { Rect } from "../components/render/rect.js";
import { Button } from "../components/ui/button.js";
import { Text } from "../components/ui/text.js";
import { GameEngine } from "../engine.js";
import { System } from "../system.js";
class GameList extends System {
    constructor() {
        super(...arguments);
        this.gameIdToEntity = new Map();
        this.entities = [];
        this.width = 0;
        this.height = 25;
    }
    *setup() {
        this.networking = this.engine.networking;
        this.networking.games.forEach(game => this.setupNewGame(game));
        this.networking.on("new_game", (game) => {
            this.setupNewGame(game);
        });
        this.networking.on("game_closed", (game) => {
            const entity = this.gameIdToEntity.get(game.id);
            this.entities.splice(this.entities.indexOf(entity), 1);
            entity.destroy();
        });
        super.setup();
    }
    setupNewGame(game) {
        const entity = this.engine.createEntity();
        entity.addComponents(new Text(game.name, 255, 12), new Button(() => {
            if (game.host != this.networking.client.id)
                this.networking.client.joinGame(game.id);
        }), new Rect(null, 255));
        entity.transform.width = 100;
        entity.transform.height = 20;
        entity.awake();
        this.gameIdToEntity.set(game.id, entity);
        this.entities.push(entity);
    }
    update(dt) {
        super.update(dt);
        let x = this.width / 2 + 10;
        let y = 150;
        this.entities.forEach(entity => {
            const game = this.entityToGameId(entity);
            entity.x = x;
            entity.y = y;
            entity.width = this.width;
            entity.height = this.height;
            const text = entity.getComponent(Text);
            text.text = `${game.name} (${game.players.size})`;
            this.width = Math.max(this.width, text.getTextWidth() + 20);
            this.height = Math.max(this.height, text.getTextHeight() + 5);
            y += this.height + 5;
        });
    }
    entityToGameId(entity) {
        for (const [id, e] of this.gameIdToEntity) {
            if (e === entity) {
                return GameEngine.instance.networking.getGameById(id);
            }
        }
    }
}
export { GameList };
