export const up = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS games (
    id SERIAL PRIMARY KEY,
    creator_id INT REFERENCES users(id) ON DELETE CASCADE,
    game_type VARCHAR(50) NOT NULL,
    max_players INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    
    CREATE INDEX idx_games_game_type ON games(game_type);
    CREATE INDEX idx_games_creator_id ON games(creator_id);
`);
};

export const down = async (pool) => {
  await pool.query(`DROP TABLE IF EXISTS games CASCADE;`);
};
