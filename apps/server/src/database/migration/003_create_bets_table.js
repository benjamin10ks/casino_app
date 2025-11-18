export const up = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS bets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    
    amount DECIMAL(15, 2) NOT NULL,
    bet_type VARCHAR(50), -- 'main', 'side', 'split', etc.
    bet_data JSONB, -- Additional data specific to the bet type
    
    status VARCHAR(20) NOT NULL, -- 'pending', 'won', 'lost', 'voided'
    payout DECIMAL(15, 2) DEFAULT 0.00,
    multiplier DECIMAL(5, 2) DEFAULT 1.00,

    round_number INTEGER,
    placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX idx_bets_user_id ON bets(user_id);
    CREATE INDEX idx_bets_game_id ON bets(game_id);
    CREATE INDEX idx_bets_status ON bets(status);
    CREATE INDEX idx_bets_placed_at ON bets(placed_at DESC);

`);
};

export const down = async (pool) => {
  await pool.query(`DROP TABLE IF EXISTS transactions CASCADE;`);
};
