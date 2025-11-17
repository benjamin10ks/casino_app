import socketAuth from "./middleware/socket.auth.js";
import chatHandler from "./handlers/chat.handler.js";

const socketHandler = (io) => {
  io.use(socketAuth);

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}, Username: ${username}`);

    chatHandler(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
    });
  });
};

export default socketHandler;
