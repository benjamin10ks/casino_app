import pool from "../database/connection.js";

class TransactionRepository {
  async create(transactionData, client = pool) {
    const sql = `
      INSERT INTO transactions ( 
      user_id, amount, type, status, game_id, bet_id,
      description, metadata, balance_before , balance_after)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`;

    const result = await client.query(sql, [
      transactionData.user_id,
      transactionData.amount,
      transactionData.type,
      transactionData.status || "completed",
      transactionData.game_id || null,
      transactionData.bet_id || null,
      transactionData.description || null,
      JSON.stringify(transactionData.metadata || {}),
      transactionData.balance_before || null,
      transactionData.balance_after || null,
    ]);

    return result.rows[0];
  }

  async findByUserId(userId, options = {}) {
    const { limit = 50, offset = 0, type } = options;

    let sql = `
      SELECT t.*, g.game_type
      FROM transactions t
      LEFT JOIN games g ON t.game_id = g.id
      WHERE t.user_id = $1`;

    const params = [userId];
    let paramCount = 2;

    if (type) {
      sql += ` AND t.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    sql += ` ORDER BY t.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(sql, params);
    return result.rows;
  }

  async getUserTransactionStats(userId) {
    const sql = `
      SELECT
        type,
        COUNT(*) AS count,
        SUM(amount) AS total
      FROM transactions
      WHERE user_id = $1 AND status = 'completed'
      GROUP BY type`;

    const result = await pool.query(sql, [userId]);
    return result.rows;
  }
}

export default new TransactionRepository();
