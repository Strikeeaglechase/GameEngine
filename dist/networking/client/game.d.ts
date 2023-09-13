import { EventEmitter } from "../../utils/eventEmitter.js";
import { GameData } from "../server/game.js";
declare class Game extends EventEmitter<"client_join" | "client_leave" | "game_close"> {
    id: string;
    isOpen: boolean;
    metadata: Record<string, any>;
    players: Set<string>;
    host: string;
    name: string;
    constructor(id: string);
    updateFromData(data: GameData): void;
    setMetadata(key: string, value: any): void;
    clientJoin(clientId: string): void;
    clientLeave(clientId: string): void;
    gameClose(): void;
    toString(): string;
}
export { Game };
