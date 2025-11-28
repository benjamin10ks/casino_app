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

  const normalizePayload = (payload) => {
    const gp = payload?.gameState;
    if (gp && gp.game) {
      const wrapper = gp.game;
      const innerState = wrapper.gameState || wrapper.game_state || {};
      const playersList = gp.players || [];
      const bets = gp.bets || [];
      const mySession = gp.mySession || null;

      const normalized = {
        id: wrapper.id ?? null,
        status: wrapper.status ?? innerState.status ?? null,
        type: wrapper.type ?? wrapper.game_type ?? null,
        currentRound: wrapper.currentRound ?? wrapper.current_round ?? null,
        minBet: wrapper.minBet
          ? parseFloat(wrapper.minBet)
          : wrapper.min_bet
            ? parseFloat(wrapper.min_bet)
            : null,
        ...(innerState || {}),
        bets,
      };

      return { normalized, players: playersList, mySession };
    }

    // Fallback to older shapes
    const wrapper = payload?.game || payload || {};
    const players = payload?.players || payload?.game?.players || [];
    const mySession = payload?.mySession || null;

    const innerState =
      wrapper.gameState ||
      wrapper.game_state ||
      payload?.gameState ||
      payload?.game_state ||
      wrapper;

    const normalized = {
      id: wrapper.id ?? wrapper.gameId ?? null,
      status: wrapper.status ?? innerState.status ?? null,
      type: wrapper.game_type ?? wrapper.type ?? null,
      currentRound: wrapper.current_round ?? wrapper.currentRound ?? null,
      minBet: wrapper.min_bet ?? wrapper.minBet ?? null,
      ...(innerState || {}),
    };

    return { normalized, players, mySession };
  };

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!connected || !socket || !gameId) return;

    setLoading(true);
    setError(null);

    socket.joiningGameId = gameId;
    // join the game and persist the current game id locally and on the socket
    socket.emit("game:join", { gameId }, (response) => {
      try {
        delete socket.joiningGameId;
      } catch (e) {}

      if (!response.success) {
        setError(response.error || "Failed to join game");
        setLoading(false);
        return;
      }
      console.log("Joined game successfully:", response);

      // normalize and store game state returned from server
      const {
        normalized,
        players: payloadPlayers,
        mySession,
      } = normalizePayload(response.gameState || response);
      setGameState(normalized);
      setPlayers(payloadPlayers || []);
      setIsInGame(true);
      setLoading(false);

      // store current game id for reconnection and convenience
      try {
        socket.currentGameId = gameId;
        localStorage.setItem("currentGameId", gameId);
      } catch (err) {
        console.warn("Failed to persist currentGameId:", err);
      }
    });

    socket.on("game:update", handleGameUpdate);
    socket.on("game:playerJoined", handlePlayerJoined);
    socket.on("game:playerLeft", handlePlayerLeft);
    socket.on("game:betPlaced", handleBetPlaced);
    socket.on("game:betResolved", handleBetResolved);
    socket.on("game:payout", handlePayout);
    socket.on("game:ended", handleGameEnded);
    socket.on("game:error", handleGameError);
    socket.on("game:stateUpdated", handleGameUpdate);

    return () => {
      if (socket && isInGame) {
        socket.emit("game:leave", { gameId });
        try {
          localStorage.removeItem("currentGameId");
        } catch (err) {
          console.warn("Failed to remove currentGameId", err);
        }
      }

      socket.off("game:update", handleGameUpdate);
      socket.off("game:playerJoined", handlePlayerJoined);
      socket.off("game:playerLeft", handlePlayerLeft);
      socket.off("game:betPlaced", handleBetPlaced);
      socket.off("game:payout", handlePayout);
      socket.off("game:ended", handleGameEnded);
      socket.off("game:error", handleGameError);
      socket.off("game:stateUpdated", handleGameUpdate);

      setIsInGame(false);
    };
  }, [connected, socket, gameId]);
  /* eslint-enable react-hooks/exhaustive-deps */
  const handleGameUpdate = useCallback((data) => {
    console.log("Game update received:", data);
    const payload = data?.gameState ? data : { game: data };
    const { normalized, players: payloadPlayers } = normalizePayload(payload);
    setGameState(normalized);
    if (payloadPlayers && payloadPlayers.length) setPlayers(payloadPlayers);
  }, []);

  const handlePlayerJoined = useCallback((data) => {
    console.log("Player joined:", data);
    setPlayers((prev = []) => {
      if (prev.find((p) => p.userId === data.userId)) return prev;
      return [
        ...prev,
        {
          id: data.userId,
          userId: data.userId,
          username: data.username,
          position: data.position,
          status: "active",
          handsPlayed: 0,
          totalBet: 0,
          totalWon: 0,
        },
      ];
    });
  }, []);

  const handlePlayerLeft = useCallback((data) => {
    console.log("Player left:", data);
    setPlayers((prev = []) => prev.filter((p) => p.userId !== data.userId));
  }, []);

  const handleBetPlaced = useCallback((data) => {
    console.log("Bet placed:", data);
    setGameState((prev) => {
      const next = { ...(prev || {}) };
      const bets = Array.isArray(next.bets) ? [...next.bets] : [];
      bets.push({
        id: data.betId,
        userId: data.userId,
        username: data.username,
        amount: data.amount,
        betType: data.betType || "main",
        status: "pending",
      });
      next.bets = bets;
      return next;
    });
  }, []);

  const handlePayout = useCallback(
    (data) => {
      console.log("Payout received:", data);
      updateBalance(data.newBalance);
    },
    [updateBalance],
  );

  // update local state when a bet resolution happens; server will emit payout separately
  const handleBetResolved = useCallback(
    (data) => {
      console.log("Bet resolved:", data);
      // if this resolution affects the current user, update their balance
      const uid = user?.id ?? user?.userId;
      if (data.outcome && uid === data.userId) {
        // outcome.payout should be added to existing balance
        const payout = data.outcome.payout || 0;
        updateBalance((user?.balance || 0) + payout);
      }

      // Also update gameState to mark bet as resolved if present
      setGameState((prev) => {
        if (!prev) return prev;
        const next = { ...prev };
        if (next.bets) {
          next.bets = next.bets.map((b) =>
            b.id === data.betId
              ? { ...b, resolved: true, outcome: data.outcome }
              : b,
          );
        }
        return next;
      });
    },
    [updateBalance, user],
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

      socket.emit("game:placeBet", { ...betData, gameId }, (response) => {
        if (response.success) {
          updateBalance((user?.balance || 0) - betData.amount);
        }
        callback?.(response);
      });
    },
    [socket, connected, user?.balance, updateBalance],
  );

  const performAction = useCallback(
    (action, actionData = null, callback) => {
      if (!socket || !connected) {
        callback?.({ success: false, error: "Not connected to server" });
        return;
      }

      socket.emit("game:action", { gameId, action, actionData }, (response) => {
        callback?.(response);
      });
    },
    [socket, connected, gameId],
  );

  const leaveGame = useCallback(() => {
    if (socket && isInGame && isInGame) {
      socket.emit("game:leave", { gameId });
      setIsInGame(false);
    }
  }, [connected, socket, gameId]);

  const startNewRound = useCallback(
    (callback) => {
      if (!socket || !connected) {
        callback?.({ success: false, error: "Not connected to server" });
        return;
      }
      socket.emit("game:newRound", { gameId }, (response) => {
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

    isMyTurn: (() => {
      const uid = user?.id ?? user?.userId ?? null;
      return gameState?.currentPlayer === uid;
    })(),
    myPlayerData: (players || []).find(
      (p) => p.id === (user?.id ?? user?.userId),
    ),
  };
}
