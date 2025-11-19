export const up = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS transactions (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

      amount DECIMAL(15, 2) NOT NULL,
      type VARCHAR(50) NOT NULL,
      status VARCHAR(20) NOT NULL,

      game_id INTEGER REFERENCES games(id) ON DELETE SET NULL,
      bet_id INTEGER REFERENCES bets(id) ON DELETE SET NULL,

      description TEXT,
      metadata JSONB DEFAULT '{}',

      balance_before DECIMAL(15, 2) NOT NULL,
      balance_after DECIMAL(15, 2) NOT NULL,

      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
    CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at DESC);
  `);
};

export const down = async (pool) => {
  await pool.query(`DROP TABLE IF EXISTS transactions CASCADE;`);
};
