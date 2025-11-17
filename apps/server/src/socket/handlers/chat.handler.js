export default function chatHandler(io, socket) {
  const { userId, username, isGuest } = socket;

  console.log(`Chat handler initialized for user: ${username} (${userId})`);

  socket.on("chat:join", (data, callback) => {
    try {
      const { gameId } = socket.handshake.query;
      if (!gameId) {
        throw new Error("gameId is required");
      }

      const roomName = `chat:game:${gameId}`;

      socket.join(roomName);

      if (!socket.gameChats) {
        socket.gameChats = new Set();
      }
      socket.gameChats.add(roomName);

      console.log(`${username} joined chat room: ${roomName}`);

      socket.broadcast.to(roomName).emit("chat:message", {
        userId,
        username,
        gameId,
        timestamp: new Date().toISOString(),
      });

      if (callback) {
        callback({
          status: "ok",
          message: `joined game ${gameId} chat`,
          room: roomName,
        });
      }
    } catch (err) {
      console.error("Error joining chat room:", err);
      if (callback) {
        callback({ status: "error", message: err.message });
      }
    }
  });

  socket.broadcast.emit("chat:message", (data, callback) => {
    try {
      const { gameId, message } = data;

      if (!gameId) {
        throw new Error("gameId is required");
      }

      if (!message || typeof message !== "string" || message.trim() === "") {
        throw new Error("Message cannot be empty");
      }

      if (message.length > 500) {
        throw new Error("Message exceeds maximum length of 500 characters");
      }

      const roomName = `chat:game:${gameId}`;

      const chatMessage = {
        userId,
        username,
        message: message.trim(),
        gameId,
        isGuest,
        timestamp: new Date().toISOString(),
      };

      io.to(roomName).emit("chat:message", chatMessage);

      console.log(`Game ${gameId} | ${username}: ${message.trim()}`);

      if (callback) {
        callback({ status: "ok", messageId: chatMessage.id });
      }
    } catch (err) {
      console.error("Error sending chat message:", err);
      if (callback) {
        callback({ status: "error", message: err.message });
      }
    }
  });

  socket.on("chat:leave", handleChatLeave);
  socket.on("disconnect", handleChatLeave);

  function handleChatLeave() {
    const username = socket.username;

    socket.broadcast.emit("chat:message", {
      username,
      message: `${username} has left the chat.`,
    });
  }
}
