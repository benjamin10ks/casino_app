const socketHandler = (io) => {
  //io.use(socketAuth);

  io.on("connection", (socket) => {
    const username = socket.handshake.query.username || "Anonymous";
    console.log(`User connected: ${socket.id}, Username: ${username}`);
    //lobbyHandler(io, socket);
    //gameHandler(io, socket);
    //chatHandler(io, socket);
    socket.username = username;

    socket.broadcast.emit("chat:message", {
      username: "System",
      message: `${username} joined the chat`,
    });
    socket.on("chat:message", (message) => {
      console.log(`Message from ${username}: ${message}`);

      socket.broadcast.emit("chat:message", {
        username: socket.username,
        message,
      });
    });

    socket.on("disconnect", (reason) => {
      console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
      socket.broadcast.emit("chat:message", {
        username: "System",
        message: `${username} left the chat`,
      });
    });
  });
};

export default socketHandler;
