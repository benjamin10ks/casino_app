import express from "express";
import http from "http";
import { Server } from "socket.io";
import socketHandler from "./socket/socketServer.js";

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

socketHandler(io);

const PORT = process.env.PORT || 5173;

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
