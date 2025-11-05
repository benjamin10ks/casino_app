import pool from "../database/connection.js";
import { NotFoundError } from "../utils/errors.js";

class UserRepository {
  async create(userData) {
    const sql = `INSERT INTO users (username, email, password_hash, balance, is_guest) VALUES ($1, $2, $3, $4, $5) RETURNING (id, username, email, balance, is_guest, created_at)`;
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
    if (!res.rows[0]) {
      return res.rows[0] || null;
    }
  }

  async findByUsername(username) {
    const sql = `SELECT * FROM users WHERE username = $1`;
    const res = await pool.query(sql, [username]);
    if (!res.rows[0]) {
      return res.rows[0] || null;
    }
  }

  async findById(id) {
    const sql = `SELECT * FROM users WHERE id = $1`;
    const res = await pool.query(sql, [id]);
    if (!res.rows[0]) {
      return res.rows[0] || null;
    }
  }
}

export default new UserRepository();
