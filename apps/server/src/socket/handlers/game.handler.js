import gameService from "../../services/game.service.js";
import gameSessionRepository from "../../repositories/gameSession.repository.js";

export default function gameHandler(socket, io) {
  const { userId, username } = socket;

  console.log(`User connected to game handler: ${username} (${userId})`);

  socket.on("game:join", async (data, callback) => {
    console.log("Joining game with data:", data);
    try {
      const { gameId } = data;

      const result = await gameService.joinGame(gameId, userId);

      socket.join(`game:${gameId}`);
      socket.join(`chat:game:${gameId}`);

      socket.currentGameId = gameId;

      console.log(
        `User joined game: ${username} (${userId}) in game ${gameId} at ${result.position}`,
      );

      const gameState = await gameService.getGameState(gameId, userId);

      socket.broadcast.to(`game:${gameId}`).emit("game:playerJoined", {
        userId,
        username,
        position: result.position,
        playerCount: gameState.players.length,
      });

      io.to(`game:${gameId}`).emit("game:update", {
        game: gameState,
        players: gameState.players,
        bets: gameState.bets,
      });

      io.to("lobby").emit("lobby:gameUpdated", {
        gameId,
        playerCount: gameState.players.length,
        status: gameState.status,
      });

      if (callback) {
        callback({ success: true, position: result.position, gameState });
      }
    } catch (error) {
      console.error(
        `Error in game:join for user ${username} (${userId}):`,
        error,
      );
      if (callback) {
        callback({
          success: false,
          error: error.message || "Failed to join game.",
        });
      }
    }
  });

  socket.on("game:leave", async (data, callback) => {
    try {
      const { gameId } = data;
      const leaveGameId = gameId || socket.currentGameId;

      if (!leaveGameId) {
        throw new Error("No game to leave");
      }

      await gameService.leaveGame(leaveGameId, userId);

      socket.leave(`game:${leaveGameId}`);
      socket.leave(`chat:game:${leaveGameId}`);
      socket.currentGameId = null;

      console.log(
        `User left game: ${username} (${userId}) from game ${leaveGameId}`,
      );

      socket.broadcast.to(`game:${leaveGameId}`).emit("game:playerLeft", {
        userId,
        username,
      });

      const playerCount =
        await gameSessionRepository.countActivePlayers(leaveGameId);

      io.to("lobby").emit("lobby:gameUpdated", {
        gameId: leaveGameId,
        playerCount,
        status: playerCount > 0 ? "waiting" : "in-progress",
      });

      if (callback) {
        callback({ success: true });
      }
    } catch (error) {
      console.error(
        `error in game:leave for user ${username} (${userId}):`,
        error,
      );
      if (callback) {
        callback({
          success: false,
          error: error.message || "Failed to leave game.",
        });
      }
    }
  });

  socket.on("game:placeBet", async (data, callback) => {
    try {
      const { amount, betType, betData } = data;
      const gameId = socket.currentGameId;

      if (!gameId) {
        throw new Error("No active game");
      }

      const result = await gameService.placeBet(gameId, userId, {
        amount,
        betType,
        betData,
      });

      console.log(`${username} (${userId}) placed a bet in game ${gameId}:`);

      io.to(`game:${gameId}`).emit("game:betPlaced", {
        userId,
        username,
        amount,
        betType,
        betId: result.bet.id,
      });

      if (callback) {
        callback({ success: true, betId: result.bet.id });
      }
    } catch (error) {
      console.error("Error placing bet:", error);
      if (callback) {
        callback({
          success: false,
          error: error.message || "Failed to place bet.",
        });
      }
    }
  });

  socket.on("game:action", async (data, callback) => {
    try {
      const { action, actionData } = data;
      const gameId = socket.currentGameId;

      if (!gameId) {
        throw new Error("No active game");
      }

      console.log(
        `${username} (${userId}) performed action in game ${gameId}: ${action}`,
      );

      io.to(`game:${gameId}`).emit("game:actionPerformed", {
        userId,
        username,
        action,
        actionData,
      });

      if (callback) {
        callback({ success: true });
      }
    } catch (error) {
      console.error("Error performing action:", error);
      if (callback) {
        callback({
          success: false,
          error: error.message || "Failed to perform action.",
        });
      }
    }
  });

  socket.on("game:newRound", async (callback) => {
    try {
      const gameId = socket.currentGameId;

      if (!gameId) {
        throw new Error("No active game");
      }

      const result = await gameService.startNewRound(gameId, userId);

      console.log(`New round started in game ${gameId}`);

      io.to(`game:${gameId}`).emit("game:roundStarted", {
        roundNumber: result.currentNumber,
      });

      if (callback) {
        callback({ success: true, currentRound: result.currentRound });
      }
    } catch (error) {
      console.error("Error starting new round:", error);
      if (callback) {
        callback({
          success: false,
          error: error.message || "Failed to start new round.",
        });
      }
    }
  });

  socket.on("game:updateState", async (data, callback) => {
    try {
      const { gameState } = data;
      const gameId = socket.currentGameId;

      if (!gameId) {
        throw new Error("No active game");
      }

      io.to(`game:${gameId}`).emit("game:stateUpdated", gameState);

      if (callback) {
        callback({ success: true });
      }
    } catch (error) {
      console.error("Error updating game state:", error);
      if (callback) {
        callback({
          success: false,
          error: error.message || "Failed to update game state.",
        });
      }
    }
  });

  socket.on("disconnect", async () => {
    if (socket.currentGameId) {
      try {
        await gameService.leaveGame(socket.currentGameId, userId);

        socket.broadcast
          .to(`game:${socket.currentGameId}`)
          .emit("game:playerLeft", {
            userId,
            username,
            reason: "disconnect",
          });

        const playerCount = await gameSessionRepository.countActivePlayers(
          socket.currentGameId,
        );

        io.to("lobby").emit("lobby:gameUpdated", {
          gameId: socket.currentGameId,
          playerCount,
        });
      } catch (error) {
        console.error("Error handling disconnect:", error);
      }
    }
  });
}
