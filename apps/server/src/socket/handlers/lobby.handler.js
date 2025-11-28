import gameService from "../../services/game.service.js";

export default function lobbyHandler(socket, io) {
  const { userId, username } = socket;

  console.log(`User connected to lobby: ${username} (${userId})`);

  socket.on("lobby:join", async (callback) => {
    try {
      socket.join("lobby");
      console.log(`User joined lobby: ${username} (${userId})`);

      const games = await gameService.getAvailableGames();

      socket.broadcast.to("lobby").emit("lobby:userJoined", {
        userId,
        username,
        timestamp: new Date().toISOString(),
      });
      if (callback) {
        callback({ success: true, games });
      }
    } catch (error) {
      console.error(
        `Error in lobby:join for user ${username} (${userId}):`,
        error,
      );
      if (callback) {
        callback({ success: false, error: "Failed to join lobby." });
      }
    }
  });

  socket.on("lobby:leave", () => {
    socket.leave("lobby");
    socket.broadcast.to("lobby").emit("lobby:userLeft", {
      userId,
      username,
    });
  });

  socket.on("lobby:createGame", async (data, callback) => {
    console.log(
      `User ${username} (${userId}) is creating a game with data:`,
      data,
    );
    try {
      const game = await gameService.createGame({
        hostId: userId,
        gameData: data,
      });
      console.log("GAME CREATED:", game);

      console.log(`User ${username} (${userId}) created game ${game.id}`);

      io.to("lobby").emit("lobby:gameCreated", {
        id: game.id,
        gameType: game.gameType,
        host: username,
        hostId: userId,
        maxPlayers: game.maxPlayers,
        minBet: parseFloat(game.minBet),
        playerCount: 1,
        status: game.status,
        createdAt: game.createdAt,
      });

      if (callback) {
        callback({ success: true, gameId: game.id });
      }
    } catch (error) {
      console.error(
        `Error creating game by user ${username} (${userId}):`,
        error,
      );
      if (callback) {
        callback({ success: false, error: "Failed to create game." });
      }
    }
  });

  socket.on("disconnect", () => {
    socket.broadcast.to("lobby").emit("lobby:userLeft", {
      userId,
      username,
    });
  });
}
