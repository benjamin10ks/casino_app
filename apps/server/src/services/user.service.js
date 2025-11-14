import userRepository from "../repositories/user.repository.js";
//import transactionRepository from "../repositories/transaction.repository.js";
//import betRepository from "../repositories/bet.repository.js";
import { NotFoundError } from "../utils/errors.js";

class UserService {
  async getUserProfile(userId) {
    const user = await userRepository.findByUsername(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return sanitizedUser(user);
  }

  async updateProfile(userId, updates) {
    if (updates.username) {
      const existingUser = await userRepository.findByUsername(
        updates.username,
      );
      if (existingUser && existingUser.id !== userId) {
        throw new Error("Username already taken");
      }
    }
    if (updates.email) {
      const existingUser = await userRepository.findByEmail(updates.email);
      if (existingUser && existingUser.id !== userId) {
        throw new Error("Email already in use");
      }
    }

    const user = await userRepository.findById(userId, updates);
    if (user.isGuest) {
      throw new Error("Guest users cannot update profile");
    }

    const updatedUser = await userRepository.update(userId, updates);

    return sanitizedUser(updatedUser);
  }

  async getUserStats(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const stats = await userRepository.getUserStats(userId);

    const winRate =
      stats.total_bets > 0
        ? ((stats.total_wins / stats.total_bets) * 100).toFixed(2)
        : 0;

    const profitLoss =
      parseFloat(stats.total_wins_amount) - parseFloat(stats.total_bets_amount);

    return {
      user: {
        id: user.id,
        username: user.username,
        balance: parseFloat(user.balance),
      },
      gambling: {
        totalBets: parseInt(stats.total_bets, 10),
        wins: parseInt(stats.total_wins, 10),
        losses: parseInt(stats.total_losses, 10),
        winRate: parseFloat(winRate),
        totalAmountBet: parseFloat(stats.total_bets_amount),
        totalAmountWon: parseFloat(stats.total_wins_amount),
        profitLoss: parseFloat(profitLoss.toFixed(2)),
      },
      memberSince: user.created_at,
    };
  }

  async getUserBalance(userId) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return {
      balance: parseFloat(user.balance),
      username: user.username,
      isGuest: user.is_guest,
    };
  }

  async getTransactionHistory(userId, options = {}) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { limit = 20, offset = 0, type = null } = options;

    if (limit > 100) {
      throw new Error("Limit cannot exceed 100");
    }

    const transactions = await transactionRepository.getByUserId(userId, {
      limit,
      offset,
      type,
    });

    return {
      transactions: transactions.map((t) => ({
        id: t.id,
        amount: parseFloat(t.amount),
        type: t.type,
        description: t.description,
        gameId: t.game_id,
        createdAt: t.created_at,
      })),
      pagination: {
        limit,
        offset,
        hasMore: transactions.length === limit,
      },
    };
  }

  async getRecentGames(userId, limit = 10) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const bets = await betRepository.getRecentByUserId(userId, { limit });

    return bets.map((b) => ({
      id: b.id,
      gameType: b.game_type,
      amount: parseFloat(b.amount),
      payout: parseFloat(b.payout),
      status: b.status,
      result: b.result,
      profit: parseFloat(b.payout) - parseFloat(b.amount),
      placedAt: b.created_at,
    }));
  }

  async canAffordBet(userId, amount) {
    if (amount <= 0) {
      return { canAfford: false, reason: "Invalid bet amount" };
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const balance = parseFloat(user.balance);
    const canAfford = balance >= amount;

    return {
      canAfford,
      balance,
      shortfall: canAfford ? 0 : amount - balance,
      reason: canAfford ? null : "Insufficient balance",
    };
  }
}

export default new UserService();
