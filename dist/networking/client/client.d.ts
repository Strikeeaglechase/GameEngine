import { EventEmitter } from "../../utils/eventEmitter.js";
import { GameData } from "../server/game.js";
import { Game } from "./game.js";
import { NetworkManager } from "./networkManager.js";
declare class Client extends EventEmitter<"game_list" | "join_game_result"> {
    id: string;
    private networkManager;
    isJoiningGame: boolean;
    connectedGame: Game | null;
    constructor(id: string, networkManager: NetworkManager);
    ping(): void;
    pong(): void;
    joinGame(gameId: string): void;
    joinGameResult(success: boolean): void;
    createGame(name: string): void;
    gameList(games: GameData[]): void;
}
export { Client };
