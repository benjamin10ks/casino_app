import { useState, useEffect, useCallback } from "react";
import { useSocket } from "../hooks/useSocket.js";
import { useAuth } from "../hooks/useAuth.js";

export function useGame(gameType, gameId) {
  const { socket, connected } = useSocket();
  const { user, updateBalance } = useAuth();

  const [gameState, setGameState] = useState(null);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInGame, setIsInGame] = useState(false);

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!connected || !socket || !gameId) return;

    setLoading(true);
    setError(null);

    socket.emit("game:join", { gameId }, (response) => {
      if (!response.success) {
        setError(response.error || "Failed to join game");
        setLoading(false);
        return;
      }
      console.log("Joined game successfully:", response);

      setGameState(response.gameState);
      setPlayers(response.players);
      setIsInGame(true);
      setLoading(false);
    });

    socket.on("game:update", handleGameUpdate);
    socket.on("game:playerJoined", handlePlayerJoined);
    socket.on("game:playerLeft", handlePlayerLeft);
    socket.on("game:betPlaced", handleBetPlaced);
    socket.on("game:payout", handleGameEnded);
    socket.on("game:ended", handleGameEnded);
    socket.on("game:error", handleGameError);

    return () => {
      if (socket && isInGame) {
        socket.emit("game:leave", { gameId });
      }

      socket.off("game:update", handleGameUpdate);
      socket.off("game:playerJoined", handlePlayerJoined);
      socket.off("game:playerLeft", handlePlayerLeft);
      socket.off("game:betPlaced", handleBetPlaced);
      socket.off("game:payout", handlePayout);
      socket.off("game:ended", handleGameEnded);
      socket.off("game:error", handleGameError);

      setIsInGame(false);
    };
  }, [connected, socket, gameId, isInGame]);
  /* eslint-enable react-hooks/exhaustive-deps */
  const handleGameUpdate = useCallback((data) => {
    console.log("Game update received:", data);
    setGameState(data.gameState);
  }, []);

  const handlePlayerJoined = useCallback((data) => {
    console.log("Player joined:", data);
    setPlayers((prev) => {
      if (prev.find((p) => p.id === data.userId)) return prev;
      return [...prev, data.player];
    });
  }, []);

  const handlePlayerLeft = useCallback((data) => {
    console.log("Player left:", data);
    setPlayers((prev) => prev.filter((p) => p.id !== data.userId));
  }, []);

  const handleBetPlaced = useCallback((data) => {
    console.log("Bet placed:", data);
    setGameState((prev) => ({
      currentBets: { ...prev?.currentBets, [data.userId]: data.bet },
    }));
  }, []);

  const handlePayout = useCallback(
    (data) => {
      console.log("Payout received:", data);
      updateBalance(data.newBalance);
    },
    [updateBalance],
  );

  const handleGameEnded = useCallback((data) => {
    console.log("Game ended:", data);
    setGameState((prev) => ({
      ...prev,
      status: "ended",
      result: data,
    }));
  }, []);

  const handleGameError = useCallback((data) => {
    console.error("Game error:", data);
    setError(data.error || "An unknown error occurred");
  }, []);

  const placeBet = useCallback(
    (betData, callback) => {
      if (!socket || !connected) {
        callback?.({ success: false, error: "Not connected to server" });
        return;
      }

      socket.emit("game:placeBet", betData, (response) => {
        if (response.success) {
          updateBalance(user.balance - betData.amount);
        }
        callback?.(response);
      });
    },
    [socket, connected, user?.balance, updateBalance],
  );

  const performAction = useCallback(
    (action, callback) => {
      if (!socket || !connected) {
        callback?.({ success: false, error: "Not connected to server" });
        return;
      }

      socket.emit("game:action", { action }, (response) => {
        callback?.(response);
      });
    },
    [socket, connected],
  );

  const leaveGame = useCallback(() => {
    if (socket && isInGame && isInGame) {
      socket.emit("game:leave", { gameId });
      setIsInGame(false);
    }
  }, [socket, isInGame, gameId]);

  const startNewRound = useCallback(
    (callback) => {
      if (!socket || !connected) {
        callback?.({ success: false, error: "Not connected to server" });
        return;
      }
      socket.emit("game:startNewRound", {}, (response) => {
        callback?.(response);
      });
    },
    [socket, connected],
  );

  return {
    gameState,
    players,
    loading,
    error,
    isInGame,
    connected,
    placeBet,
    performAction,
    leaveGame,
    startNewRound,

    isMyTurn: gameState?.currentPlayer === user?.id,
    myPlayerData: players.find((p) => p.id === user?.id),
  };
}
