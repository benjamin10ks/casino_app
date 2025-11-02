export const up = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) UNIQUE NOT NULL,
      password_hash VARCHAR(255) NOT NULL,
      balance NUMERIC(15, 2) DEFAULT 0,
      is_guest BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_users_username ON users(username);
    CREATE INDEX idx_users_is_guest ON users(created_at);
  `);
};

export const down = async (pool) => {
  await pool.query(`DROP TABLE IF EXISTS users CASCADE;`);
};
