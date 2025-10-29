import pool from "../database/connection.js";
import { BadRequestError, NotFoundError } from "../utils/errors.js";

class UserRepository {
  async create(user, passwordHash, balance) {
    const sql = `INTERT INTO users (username, password_hash, balance) RETURNING id`;
    const res = await pool.query(sql, [user.username, passwordHash, balance]);

    if (!res.rows[0]) {
      throw new NotFoundError("Failed to create user");
    }
    return res.rows[0];
  }

  async findByUsername(username) {
    const sql = `SELECT * FROM users WHERE username = $1`;
    const res = await pool.query(sql, [username]);
    if (!res.rows[0]) {
      return res.rows[0] || null;
    }
  }
}

export default new UserRepository();
