import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./useSocket.js";
import { useAuth } from "./useAuth.js";

export function useGame(gameId, gameType) {
  const { socket, connected } = useSocket();
  const { user, updateBalance: updateAuthBalance } = useAuth();

  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInGame, setIsInGame] = useState(false);

  // Join game
  useEffect(() => {
    if (!socket || !connected || !gameId) return;

    setLoading(true);
    setError(null);

    console.log("Joining game:", gameId);

    socket.emit("game:join", { gameId }, (response) => {
      console.log("Join response:", response);

      if (!response.success) {
        setError(response.error || "Failed to join game");
        setLoading(false);
        return;
      }

      // Extract data from server response
      // Server sends: { success: true, gameState: { game: {...}, players: [...], bets: [...] } }
      const serverGameState = response.gameState;

      if (serverGameState) {
        // Set the inner game state (what the game component needs)
        setGameState(serverGameState.game);
        setPlayers(serverGameState.players || []);
      }

      setIsInGame(true);
      setLoading(false);

      // Store for reconnection
      try {
        socket.currentGameId = gameId;
        localStorage.setItem("currentGameId", gameId);
      } catch (err) {
        console.warn("Failed to persist currentGameId:", err);
      }
    });

    // Listen for game events
    socket.on("game:stateUpdate", handleGameStateUpdate);
    socket.on("game:playerJoined", handlePlayerJoined);
    socket.on("game:playerLeft", handlePlayerLeft);
    socket.on("game:betPlaced", handleBetPlaced);
    socket.on("game:payout", handlePayout);
    socket.on("game:ended", handleGameEnded);
    socket.on("game:error", handleGameError);

    // Cleanup
    return () => {
      if (socket && isInGame) {
        socket.emit("game:leave", { gameId });
        try {
          localStorage.removeItem("currentGameId");
          delete socket.currentGameId;
        } catch (err) {
          console.warn("Cleanup error:", err);
        }
      }

      socket.off("game:stateUpdate", handleGameStateUpdate);
      socket.off("game:playerJoined", handlePlayerJoined);
      socket.off("game:playerLeft", handlePlayerLeft);
      socket.off("game:betPlaced", handleBetPlaced);
      socket.off("game:payout", handlePayout);
      socket.off("game:ended", handleGameEnded);
      socket.off("game:error", handleGameError);

      setIsInGame(false);
    };
  }, [socket, connected, gameId]);

  // Handle game state update from server
  const handleGameStateUpdate = useCallback((data) => {
    console.log("Game state update received:", data);

    // Server sends: { game: {...}, players: [...], bets: [...] }
    if (data.game) {
      setGameState(data.game);
    }

    if (data.players) {
      setPlayers(data.players);
    }
  }, []);

  // Handle player joined
  const handlePlayerJoined = useCallback((data) => {
    console.log("Player joined:", data);

    setPlayers((prev) => {
      // Don't add duplicate
      if (prev.find((p) => p.userId === data.userId)) {
        return prev;
      }

      return [
        ...prev,
        {
          userId: data.userId,
          username: data.username,
          position: data.position,
          balance: 0,
          handsPlayed: 0,
          totalBet: 0,
          totalWon: 0,
        },
      ];
    });
  }, []);

  // Handle player left
  const handlePlayerLeft = useCallback((data) => {
    console.log("Player left:", data);
    setPlayers((prev) => prev.filter((p) => p.userId !== data.userId));
  }, []);

  // Handle bet placed
  const handleBetPlaced = useCallback((data) => {
    console.log("Bet placed:", data);
    // State will be updated via game:stateUpdate
    // This is just for notifications/animations
  }, []);

  const handlePayout = useCallback(
    (data) => {
      console.log("Payout received:", data);

      if (data.amount && data.amount > 0) {
        updateAuthBalance((prevBalance) => {
          const newBalance = prevBalance + data.amount;
          console.log("Balance after payout:", prevBalance, "->", newBalance);
          return newBalance;
        });
      } else if (data.newBalance !== undefined) {
        console.log("Setting balance to:", data.newBalance);
        updateAuthBalance(data.newBalance);
      }
    },
    [updateAuthBalance],
  );

  // Handle game ended
  const handleGameEnded = useCallback((data) => {
    console.log("Game ended:", data);
    setGameState((prev) => ({
      ...prev,
      status: "completed",
      result: data,
    }));
  }, []);

  // Handle game error
  const handleGameError = useCallback((data) => {
    console.error("Game error:", data);
    setError(data.message || data.error || "An error occurred");
  }, []);

  const placeBet = useCallback(
    (betData, callback) => {
      if (!socket || !connected) {
        callback?.({ success: false, error: "Not connected" });
        return;
      }

      console.log("Placing bet:", betData);

      socket.emit("game:placeBet", betData, (response) => {
        console.log("Bet response:", response);

        if (response.success) {
          updateAuthBalance((prevBalance) => {
            const newBalance = prevBalance - betData.amount;
            console.log("Balance updated:", prevBalance, "->", newBalance);
            return newBalance;
          });
        }

        callback?.(response);
      });
    },
    [socket, connected, updateAuthBalance],
  );

  // Perform action (hit, stand, spin, etc.)
  const performAction = useCallback(
    (action, actionData = {}, callback) => {
      if (!socket || !connected) {
        callback?.({ success: false, error: "Not connected" });
        return;
      }

      console.log("Performing action:", action, actionData);

      socket.emit("game:action", { action, actionData }, (response) => {
        console.log("Action response:", response);
        callback?.(response);
      });
    },
    [socket, connected],
  );

  // Leave game
  const leaveGame = useCallback(() => {
    if (socket && connected && isInGame) {
      socket.emit("game:leave", { gameId });
      setIsInGame(false);
    }
  }, [socket, connected, gameId, isInGame]);

  // Start new round
  const startNewRound = useCallback(
    (callback) => {
      if (!socket || !connected) {
        callback?.({ success: false, error: "Not connected" });
        return;
      }

      console.log("Starting new round");

      socket.emit("game:newRound", {}, (response) => {
        console.log("New round response:", response);
        callback?.(response);
      });
    },
    [socket, connected],
  );

  // Get player-specific data from gameState
  const getMyPlayerData = useCallback(() => {
    if (!gameState?.gameState?.players || !user?.id) {
      return null;
    }

    const playerId = user.id.toString();
    return gameState.gameState.players[playerId] || null;
  }, [gameState, user?.id]);

  // Check if it's my turn
  const isMyTurn = useCallback(() => {
    if (!gameState?.gameState || !user?.id) {
      return false;
    }

    const playerId = user.id.toString();
    const myPlayer = gameState.gameState.players?.[playerId];

    // In blackjack, it's your turn if:
    // 1. Round is active
    // 2. Your status is 'playing'
    return (
      gameState.gameState.roundActive === true && myPlayer?.status === "playing"
    );
  }, [gameState, user?.id]);

  return {
    // State
    gameState,
    players,
    loading,
    error,
    isInGame,
    connected,

    // Actions
    placeBet,
    performAction,
    leaveGame,
    startNewRound,

    // Computed values
    isMyTurn: isMyTurn(),
    myPlayerData: getMyPlayerData(),
  };
}
