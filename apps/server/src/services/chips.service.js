import pool from "../database/connection.js";
import userRepository from "../repositories/user.repository.js";
import transactionRepository from "../repositories/transaction.repository.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

class ChipsService {
  async placeBet(userId, amount, gameId, client) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const balanceBefore = parseFloat(user.balance);

    if (balanceBefore < amount) {
      throw new BadRequestError("Insufficient balance");
    }

    await client.query(
      "UPDATE users SET balance = balance - $1 WHERE id = $2 updated_at = CURRENT_TIMESTAMP",
      [amount, userId],
    );

    const balanceAfter = balanceBefore - amount;

    await transactionRepository.create(
      {
        user_id: userId,
        amount: -amount,
        type: "BET",
        status: "completeted",
        game_id: gameId,
        description: `Bet placed in game ${gameId}`,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
      },
      client,
    );

    return { success: true, newBalance: balanceAfter };
  }

  async addBalance(userId, amount, gameId, betId, client) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const balanceBefore = parseFloat(user.balance);

    await client.query(
      "UPDATE users SET balance = balance + $1 WHERE id = $2 updated_at = CURRENT_TIMESTAMP",
      [amount, userId],
    );

    const balanceAfter = balanceBefore + amount;

    await transactionRepository.create(
      {
        user_id: userId,
        amount: amount,
        type: "WIN",
        status: "completeted",
        game_id: gameId,
        bet_id: betId,
        description: `Winnings added from game ${gameId}`,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
      },
      client,
    );

    return { success: true, newBalance: balanceAfter };
  }
}

export default new ChipsService();
