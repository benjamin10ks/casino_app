import pool from "../database/connection.js";
import { NotFoundError } from "../utils/errors.js";

class GameRepository {
  async create(gameData) {
    const sql = `
      INSERT INTO games (host_id, game_type, max_players, min_bet, status)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`;

    const result = await pool.query(sql, [
      gameData.host_id,
      gameData.game_type,
      gameData.max_players,
      gameData.min_bet,
      gameData.status,
    ]);

    return result.rows[0];
  }

  async findById(gameId) {
    const sql = `SELECT * FROM games WHERE id = $1`;
    const result = await pool.query(sql, [gameId]);
    return result.rows[0] || null;
  }

  async findActiveGames(filters = {}) {
    let sql = `
    SELECT 
      g.*, 
      u.username AS host_username,
      COUNT(DISTINCT gs.user_id) AS player_count
    FROM games g
    LEFT JOIN users u ON g.host_id = u.id
    LEFT JOIN game_sessions gs ON g.id = gs.game_id AND gs.status = 'active'
    WHERE g.status IN ('waiting', 'in_progress')
  `;

    const params = [];
    let paramCount = 1;

    if (filters.gameType) {
      sql += ` AND g.game_type = $${paramCount}`;
      params.push(filters.gameType);
      paramCount++;
    }

    sql += `
    GROUP BY g.id, u.username
    ORDER BY g.created_at DESC
    LIMIT $${paramCount} OFFSET $${paramCount + 1}
  `;

    params.push(filters.limit || 50, filters.offset || 0);

    const result = await pool.query(sql, params);
    return result.rows;
  }

  async updateStatus(gameId, status, client = pool) {
    const sql = `
      UPDATE games
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *`;

    const result = await client.query(sql, [status, gameId]);

    if (!result.rows[0]) {
      throw new NotFoundError("Game not found");
    }

    return result.rows[0];
  }

  async updateGameState(gameId, gameState, client = pool) {
    const sql = `
      UPDATE games
      SET game_state = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING *`;

    const result = await client.query(sql, [JSON.stringify(gameState), gameId]);

    if (!result.rows[0]) {
      throw new NotFoundError("Game not found");
    }

    return result.rows[0];
  }

  async incrementRound(gameId, client = pool) {
    const sql = `
    UPDATE games
    SET current_round = current_round + 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *`;

    const result = await client.query(sql, [gameId]);
    return result.rows[0];
  }

  async startGame(gameId, client = pool) {
    const sql = `
    UPDATE games
    SET status = 'in_progress', started_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *`;

    const result = await client.query(sql, [gameId]);
    return result.rows[0];
  }

  async endGame(gameId, client = pool) {
    const sql = `
        UPDATE games
        SET status = 'completed', ended_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
        WHERE id = $1
        RETURNING *`;

    const result = await client.query(sql, [gameId]);
    return result.rows[0];
  }
  async getGameWithPlayers(gameId) {
    const sql = `
    SELECT g.*,
    json_agg(
      json_build_object(
        'userId', gs.user_id,
        'username', u.username,
        'balance', u.balance,
        'position', gs.position,
        'status', gs.status,
        'handsPlayed', gs.hands_played,
        'totalBet', gs.total_bet,
        'totalWon', gs.total_won
      ) ORDER BY gs.position
    ) FILTER (WHERE gs.user_id IS NOT NULL) AS players  
    FROM games g
    LEFT JOIN game_sessions gs ON g.id = gs.game_id AND gs.status = 'active'
    LEFT JOIN users u ON gs.user_id = u.id
    WHERE g.id = $1
    GROUP BY g.id`;

    const result = await pool.query(sql, [gameId]);
    return result.rows[0];
  }
}

export default new GameRepository();
