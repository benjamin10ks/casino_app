import chatHandler from "./handlers/chat.handler.js";

const socketHandler = (io) => {
  //io.use(socketAuth);

  io.on("connection", (socket) => {
    //temporary username from query until user service is implemented
    const username = socket.handshake.query.username || "Anonymous";
    console.log(`User connected: ${socket.id}, Username: ${username}`);
    socket.username = username;

    chatHandler(io, socket);

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
    });
  });
};

export default socketHandler;
