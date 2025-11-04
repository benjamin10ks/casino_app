import "../config.js";
import http from "http";
import { Server } from "socket.io";
import socketHandler from "./socket/socketServer.js";
import app from "./app.js";

console.log(process.env.DB_PASSWORD);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    //vite server origin
    origin: [process.env.VITE_SERVER_URL || "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

socketHandler(io);

//node server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
