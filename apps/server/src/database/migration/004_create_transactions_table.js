export const up = async (pool) => {
  await pool.query(``);
};

export const down = async (pool) => {
  await pool.query(`DROP TABLE IF EXISTS transactions CASCADE;`);
};
