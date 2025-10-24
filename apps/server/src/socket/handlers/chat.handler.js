const chatHandler = (io, socket) => {
  const username = socket.username;

  //need to implement client side join event

  //socket.on("chat:join", () => {
  // console.log(`${username} joined the chat`);
  //socket.join("chatroom");
  //socket.broadcast.to("chatroom").emit("chat:message", {
  //   username: "System",
  //   message: `${username} joined the chat`,
  //  });
  //});

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

  socket.on("chat:leave", handleChatLeave);
  socket.on("disconnect", handleChatLeave);
};

function handleChatLeave() {
  socket.broadcast.emit("chat:message", {
    username: "System",
    message: `${username} left the chat`,
  });
}

export default chatHandler;
