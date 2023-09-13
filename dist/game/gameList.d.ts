import { System } from "../system.js";
declare class GameList extends System {
    private gameIdToEntity;
    private entities;
    private width;
    private height;
    private networking;
    setup(): Generator<never, void, unknown>;
    private setupNewGame;
    update(dt: number): void;
    private entityToGameId;
}
export { GameList };
