import { config } from "dotenv";
import { GameServer } from "./server/server.js";
config();
const server = new GameServer(parseInt(process.env.PORT));
server.init();
