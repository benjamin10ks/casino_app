import userRepository from "../repositories/user.repository.js";
import transactionRepository from "../repositories/transaction.repository.js";
import betRepository from "../repositories/bet.repository.js";
import { NotFoundError } from "../utils/errors.js";

class UserService {
  async getUserProfile(userId) {
    const user = await userRepository.findByUsername(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return sanitizedUser(user);
  }

  async updateProfile() {}

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

  async getTransactionHistory(userId, options = {}) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const { limit = 20, offset = 0, type = null } = options;

    if (limit > 100) {
      throw new Error("Limit cannot exceed 100");
    }

    const transactions = 
  }
}
