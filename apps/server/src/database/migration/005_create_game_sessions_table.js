export const up = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS game_sessions (
    id SERIAL PRIMARY KEY,
    game_id INTEGER NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    position VARCHAR(50) NOT NULL, -- e.g., 'dealer', 'player1', 'player2', etc.
    status VARCHAR(20) NOT NULL, -- 'active', 'completed', 'abandoned'
    
    hands_played INTEGER DEFAULT 0,
    total_bet DECIMAL(15, 2) DEFAULT 0.00,
    total_won DECIMAL(15, 2) DEFAULT 0.00,

    session_data JSONB DEFAULT '{}', -- Additional session-specific data

    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    unique(game_id, user_id)
);

  CREATE INDEX idx_game_sessions_game_id ON game_sessions(game_id);
  CREATE INDEX idx_game_sessions_user_id ON game_sessions(user_id);
  CREATE INDEX idx_game_sessions_status ON game_sessions(status);
`);
};

export const down = async (pool) => {
  await pool.query(`DROP TABLE IF EXISTS game_sessions CASCADE;`);
};
