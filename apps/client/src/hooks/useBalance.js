import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../hooks/useAuth.js";
import { useSocket } from "../hooks/useSocket.js";
import api from "../services/api";

export function useBalance() {
  const { user, updateBalance: updateAuthBalance } = useAuth();
  const { socket, connected } = useSocket();

  // Sync local state with auth context
  const [balance, setBalance] = useState(user?.balance || 0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // sync with user context
  useEffect(() => {
    if (user?.balance !== undefined) {
      setBalance(user.balance);
    }
  }, [user?.balance]);

  // Listen for balance updates from server
  useEffect(() => {
    if (!socket || !connected) return;

    const handleBalanceUpdate = (data) => {
      console.log("Balance updated from server:", data);
      const newBalance = data.newBalance || data.balance;
      setBalance(newBalance);
      updateAuthBalance(newBalance);
    };

    socket.on("balance:updated", handleBalanceUpdate);
    socket.on("game:payout", handleBalanceUpdate);

    return () => {
      socket.off("balance:updated", handleBalanceUpdate);
      socket.off("game:payout", handleBalanceUpdate);
    };
  }, [socket, connected, updateAuthBalance]);

  // Refresh balance from server
  const refreshBalance = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/users/balance");
      const newBalance = response.data.data.balance;

      setBalance(newBalance);
      updateAuthBalance(newBalance);

      return newBalance;
    } catch (err) {
      const errorMsg =
        err.response?.data?.error?.message || "Failed to fetch balance";
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [updateAuthBalance]);

  // Check if user can afford amount
  const canAfford = useCallback(
    (amount) => {
      return balance >= amount;
    },
    [balance],
  );

  // Format balance for display
  const formattedBalance = useCallback(
    (decimals = 0) => {
      return balance.toLocaleString("en-US", {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      });
    },
    [balance],
  );

  const updateBalance = useCallback(
    (newBalanceOrUpdater) => {
      if (typeof newBalanceOrUpdater === "function") {
        setBalance((prev) => {
          const newBalance = newBalanceOrUpdater(prev);
          updateAuthBalance(newBalance);
          return newBalance;
        });
      } else {
        setBalance(newBalanceOrUpdater);
        updateAuthBalance(newBalanceOrUpdater);
      }
    },
    [updateAuthBalance],
  );

  return {
    balance,
    loading,
    error,
    refreshBalance,
    canAfford,
    formattedBalance,
    updateBalance,
    hasChips: balance > 0,
    isLow: balance < 100,
  };
}
