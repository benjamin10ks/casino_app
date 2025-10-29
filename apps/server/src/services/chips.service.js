import pool from "../database/connection.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

class ChipsService {
  async placeBet(userId, amount, gameId) {
    if (amount <= 0) {
      throw new BadRequestError("Bet amount must be greater than zero");
    }
    return pool.transaction(async (client) => {
      const sql = `SELECT balance FROM users WHERE id = $1 FOR UPDATE`;
      const res = await client.query(sql, [userId]);

      if (!res.rows[0]) {
        throw new NotFoundError("User not found");
      }

      const balance = res.rows[0].balance;

      if (balance < amount) {
        throw new BadRequestError("Insufficient balance");
      }

      await client.query(
        (sql = `INSERT INTO transactions (user_id, amount, type, game_id) VALUES ($1, $2, $3, $4)`),
        [userId, -amount, "BET", gameId],
      );

      return { success: true, newBalance: balance - amount };
    });
  }

  async addBalance(userId, amount) {
    if (amount <= 0) {
      throw new BadRequestError("Amount must be greater than zero");
    }

    return pool.transaction(async (client) => {
      await client.query(
        (sql = `INSERT INTO transactions (user_id, amount, type) VALUES ($1, $2, $3)`),
        [userId, amount, "WIN"],
      );

      return { success: true };
    });
  }
}

export default new ChipsService();
