export const up = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    host_id INT REFERENCES NOT NULL users(id) ON DELETE CASCADE,
    game_type VARCHAR(50) DEFAULT -- 'blackjack', 'roulette', 'poker'
    status VARCHAR(20) NOT NULL DEFAULT 'waiting', -- 'waiting', 'in_progress', 'completed'
    max_players INT NOT NULL DEFAULT 6,
    min_bet DECIMAL(15, 2) NOT NULL DEFAULT 10.00,
    current_round INTEGER DEFAULT 0,

    game_state JSONB DEFAULT '{}',

    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE INDEX idx_games_status ON games(status);
    CREATE INDEX idx_games_game_type ON games(game_type);
    CREATE INDEX idx_games_host_id ON games(host_id);
    CREATE INDEX idx_games_created_at ON games(created_at DESC);
`);
};

export const down = async (pool) => {
  await pool.query(`DROP TABLE IF EXISTS games CASCADE;`);
};
