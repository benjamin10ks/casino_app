import pool from "../database/connection.js";
import { NotFoundError } from "../utils/errors.js";

class BetRepository {
  async create(betData, client = pool) {
    const sql = `
      INSERT INTO bets (user_id, game_id, amount, bet_type, bet_data, round_number, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`;

    const result = await client.query(sql, [
      betData.user_id,
      betData.game_id,
      betData.amount,
      betData.bet_type || "main",
      JSON.stringify(betData.bet_data) || {},
      betData.round_number,
      "pending",
    ]);

    return result.rows[0];
  }

  async findById(betId, client = pool) {
    const sql = `SELECT * FROM bets WHERE id = $1`;
    const result = await client.query(sql, [betId]);
    return result.rows[0] || null;
  }

  async findByGameAndRound(gameId, roundNumber) {
    const sql = `
      SELECT b.*, u.username
      FROM bets b
      JOIN users u ON b.user_id = u.id
      WHERE b.game_id = $1 AND b.round_number = $2
      ORDER BY b.placed_at`;

    const result = await pool.query(sql, [gameId, roundNumber]);
    return result.rows;
  }

  async findByUserId(userId, options = {}) {
    const { limit = 20, offset = 0 } = options;

    const sql = `
      SELECT b.*, g.game_type, g.status AS game_status
      FROM bets b
      JOIN games g ON b.game_id = g.id
      WHERE b.user_id = $1
      ORDER BY b.placed_at DESC
      LIMIT $2 OFFSET $3`;

    const result = await pool.query(sql, [userId, limit, offset]);
    return result.rows;
  }

  async resolveBet(betId, outcome, client = pool) {
    const sql = `
      UPDATE bets
      SET status = $1,
          payout = $2,
          multiplier = $3,
          resolved_at = CURRENT_TIMESTAMP,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $4
      RETURNING *`;

    const result = await client.query(sql, [
      outcome.status,
      outcome.payout || 0,
      outcome.multiplier || 1.0,
      betId,
    ]);

    if (!result.rows[0]) {
      throw new NotFoundError(`Bet with ID ${betId} not found.`);
    }

    return result.rows[0];
  }

  async cancelBet(betId, client = pool) {
    const sql = `
      UPDATE bets
      SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE id = $1 AND status = 'pending'
    RETURNING *`;

    const result = await client.query(sql, [betId]);
    return result.rows[0];
  }

  async getPendingBets(gameId, userId) {
    const sql = `
      SELECT * FROM bets
      WHERE game_id = $1 AND user_id = $2 AND status = 'pending'
      ORDER BY placed_at`;

    const result = await pool.query(sql, [gameId, userId]);
    return result.rows;
  }
}

export default new BetRepository();
