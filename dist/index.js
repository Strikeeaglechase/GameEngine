import express from "express";
import { GameServer } from "./networking/server/server.js";
const app = express();
app.use(express.static("./"));
app.listen(8000, () => {
    console.log("Server started on port 8000");
});
const gameServer = new GameServer(8001);
gameServer.init();
