import authService from "../services/auth.service";
import pool from "../database";

async function addUser(user, password) {
  const sql = `INSERT INTO users (username, password_hash, balance) RETURNING id`;
  const res = await pool.query(sql, [user.username, password, user.balance]);
  const userId = res.rows[0].id;

  return userId;
}
