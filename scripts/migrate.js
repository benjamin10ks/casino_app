import "../apps/server/config.js"; // Load environment variables

import { Pool } from "pg";
import { up as createUsersTable } from "../apps/server/src/database/migration/001_create_users_table.js"; // Adjust the path as needed

const poolConfig = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_NAME, // Assuming you set POSTGRES_NAME in your .env
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
};

async function runMigrations() {
  const pool = new Pool(poolConfig);

  try {
    console.log("Starting database migrations...");

    await createUsersTable(pool);

    console.log('"users" table created successfully.');
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exit(1);
  } finally {
    await pool.end();
    console.log("Database connection closed.");
  }
}

runMigrations();
