import pool from "../database/connection.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

class UserRepository {
  async create(user, passwordHash, balance) {
    const sql = `INTERT INTO users (username, email, password_hash, balance) VALUES ($1, $2, $3, $4) RETURNING id`;
    const res = await pool.query(sql, [
      user.username,
      user.email,
      passwordHash,
      balance,
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
