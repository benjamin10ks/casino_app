import pool from "../database/connection.js";
import { NotFoundError } from "../utils/errors.js";

class UserRepository {
  async create(userData) {
    const sql = `INSERT INTO users (username, email, password_hash, balance, is_guest) 
                  VALUES ($1, $2, $3, $4, $5) 
                  RETURNING id, username, email, balance, is_guest, created_at`;
    const res = await pool.query(sql, [
      userData.username,
      userData.email,
      userData.passwordHash,
      userData.balance || 1000,
      userData.isGuest,
    ]);

    if (!res.rows[0]) {
      throw new NotFoundError("Failed to create user");
    }
    return res.rows[0];
  }

  async findByEmail(email) {
    const sql = `SELECT * FROM users WHERE email = $1`;
    const res = await pool.query(sql, [email]);
    return res.rows[0] || null;
  }

  async findByUsername(username) {
    const sql = `SELECT * FROM users WHERE username = $1`;
    const res = await pool.query(sql, [username]);
    return res.rows[0] || null;
  }

  async findById(id) {
    const sql = `SELECT * FROM users WHERE id = $1`;
    const res = await pool.query(sql, [id]);
    if (!res.rows[0]) {
      return res.rows[0] || null;
    }
  }

  async update(id, updateData) {
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updateData).forEach((key) => {
      fields.push(`${key} = $${paramIndex++}`);
      values.push(updateData[key]);
      paramIndex++;
    });

    values.push(id);

    const sql = `
    UPDATE users SET ${fields.join(", ")}, 
    updatated_at = NOW()
    WHERE id = $${paramIndex}
    WHERE id = $${paramIndex} 
    RETURNING id, username, email, balance, is_guest, created_at, updated_at`;

    const res = await pool.query(sql, values);

    if (!res.rows[0]) {
      throw new NotFoundError("User not found");
    }

    return res.rows[0];
  }

  async getBalanceforUpdate(userId, client) {
    const sql = `SELECT balance FROM users WHERE id = $1 FOR UPDATE`;
    const res = await client.query(sql, [userId]);

    if (!res.rows[0]) {
      throw new NotFoundError("User not found");
    }

    return res.rows[0].balance;
  }

  async delete(id) {
    const sql = `DELETE FROM users WHERE id = $1`;
    const res = await pool.query(sql, [id]);

    if (!res.rows[0]) {
      throw new NotFoundError("User not found");
    }

    return res.rows[0];
  }

  async getUserStats(userId) {
    const sql = `
    SELECT u.id, u.username, u.email, u.balance, u.is_guest, u.created_at,
    COUNT(DISTINCT g.id) AS total_bets,
    COALESCE(SUM(CASE WHEN b.status = 'WON' THEN 1 ELSE 0 END), 0) AS wins,
    COALESCE(SUM(CASE WHEN b.status = 'LOST' THEN 1 ELSE 0 END), 0) AS losses,
    COALESCE(SUM(CASE WHEN t.type = 'BET' THEN t.amount ELSE 0 END), 0) AS total_amount_bet
    COALESCE(SUM(CASE WHEN t.type = 'WIN' THEN t.amount ELSE 0 END), 0) AS total_amount_won
    `;

    const res = await pool.query(sql, [userId]);
    if (!res.rows[0]) {
      throw new NotFoundError("User not found");
    }
    return res.rows[0];
  }
}

export default new UserRepository();
