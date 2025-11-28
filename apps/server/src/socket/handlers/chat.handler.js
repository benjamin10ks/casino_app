export default function chatHandler(socket, io) {
  // Coerce username to a primitive string to avoid sending objects to clients
  const { userId, isGuest } = socket;
  const username =
    typeof socket.username === "string"
      ? socket.username
      : socket.user && typeof socket.user.username === "string"
      ? socket.user.username
      : String((socket && socket.username) || "Unknown");

  console.log(`Chat handler initialized for user: ${username} (${userId})`);

  socket.on("chat:join", (data, callback) => {
    try {
      const { gameId } = data;
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

      // Broadcast a system join message so clients can render it as text
      socket.broadcast.to(roomName).emit("chat:message", {
        userId,
        username: String(username),
        gameId,
        type: "system",
        message: `${String(username)} has joined the chat.`,
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

  socket.on("chat:message", (data, callback) => {
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
        // ensure username is a string
        username: String(username),
        message: message.trim(),
        gameId,
        isGuest,
        timestamp: new Date().toISOString(),
      };

      io.to(roomName).emit("chat:message", chatMessage);

      console.log(`Game ${gameId} | ${username}: ${message.trim()}`);

      if (callback && typeof callback === "function") {
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
    // Broadcast a system leave message so clients render left notices properly
    const username = socket.username;
    // Prevent double-broadcast by taking a snapshot and clearing the set
    const rooms = Array.from(socket.gameChats || []);
    socket.gameChats = new Set();
    rooms.forEach((roomName) => {
      socket.broadcast.to(roomName).emit("chat:message", {
        userId: socket.userId,
        username,
        type: "system",
        message: `${username} has left the chat.`,
        timestamp: new Date().toISOString(),
      });
    });
  }
}
