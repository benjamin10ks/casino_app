import socketAuth from "./middleware/socket.auth.js";
import chatHandler from "./handlers/chat.handler.js";
import lobbyHandler from "./handlers/lobby.handler.js";
import gameHandler from "./handlers/game.handler.js";

const socketHandler = (io) => {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}, Username: ${socket.username}`);

    chatHandler(socket, io);
    lobbyHandler(socket, io);
    gameHandler(socket, io);

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
    });
  });
};

export default socketHandler;
