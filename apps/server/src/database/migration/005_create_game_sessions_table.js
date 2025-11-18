export const up = async (pool) => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS game_sessions (
      
)
`);
};

export const down = async (pool) => {
  await pool.query(`DROP TABLE IF EXISTS game_sessions CASCADE;`);
};
