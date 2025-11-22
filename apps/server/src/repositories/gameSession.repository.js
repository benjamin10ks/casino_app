import pool from "../database/connection.js";
import { NotFoundError, ConflictError } from "../utils/errors.js";

class GameSessionRepository {
  async createSession(sessionData, client = pool) {
    const sql = `
      INSERT INTO game_sessions (game_id, user_id, position, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *`;

    try {
      const result = await client.query(sql, [
        sessionData.game_id,
        sessionData.user_id,
        sessionData.position || null,
        "active",
      ]);

      return result.rows[0];
    } catch (err) {
      if (err.code === "23505") {
        throw new ConflictError("User is already in the game session");
      }
      throw err;
    }
  }

  async findByGameId(gameId) {
    const sql = `
    SELECT gs.*, u.username, u.balance
    FROM game_sessions gs
    JOIN users u ON gs.user_id = u.id
    WHERE gs.game_id = $1 AND gs.status = 'active'
    ORDER BY gs.position, gs.joined_at
    `;

    const result = await pool.query(sql, [gameId]);
    return result.rows;
  }

  async findByUserId(userId) {
    const sql = `
    SELECT gs.*, g.game_type, g.status AS game_status
    FROM game_sessions gs
    JOIN games g ON gs.game_id = g.id
    WHERE gs.user_id = $1 AND gs.status = 'active'`;

    const result = await pool.query(sql, [userId]);
    return result.rows[0] || null;
  }

  async findSession(gameId, userId) {
    const sql = `
    SELECT *
    FROM game_sessions
    WHERE game_id = $1 AND user_id = $2`;

    const result = await pool.query(sql, [gameId, userId]);
    return result.rows[0] || null;
  }

  async updateStatus(gameId, userId, status, client = pool) {
    const sql = `
    UPDATE game_sessions
    SET status = $1,
      left_at = CASE WHEN $1 = 'left' THEN CURRENT_TIMESTAMP ELSE left_at END,
      updated_at = CURRENT_TIMESTAMP
    WHERE game_id = $2 AND user_id = $3
    RETURNING *`;

    const result = await client.query(sql, [status, gameId, userId]);

    if (!result.rows[0]) {
      throw new NotFoundError("Game session not found");
    }

    return result.rows[0];
  }

  async updateStats(gameId, userId, stats, client = pool) {
    const sql = `
      UPDATE game_sessions
      SET hands_played = hands_played + $1,
        total_bet = total_bet + $2,
        total_won = total_won + $3,
        updated_at = CURRENT_TIMESTAMP
      WHERE game_id = $4 AND user_id = $5
      RETURNING *`;

    const result = await client.query(sql, [
      stats.handsPlayed || 0,
      stats.totalBet || 0,
      stats.totalWon || 0,
      gameId,
      userId,
    ]);

    return result.rows[0];
  }

  async getNextPosition(gameId, client = pool) {
    const sql = `
      SELECT COALESCE(MAX(position), -1) + 1 AS next_position
      FROM game_sessions
      WHERE game_id = $1`;

    const result = await client.query(sql, [gameId]);
    return result.rows[0].next_position;
  }

  async countActivePlayers(gameId, client = pool) {
    const sql = `
      SELECT COUNT(*) AS count
      FROM game_sessions
      WHERE game_id = $1 AND status = 'active'`;

    const result = await client.query(sql, [gameId]);
    return parseInt(result.rows[0].count);
  }
}

export default new GameSessionRepository();
