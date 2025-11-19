import "../apps/server/config.js";
import { Pool } from "pg";

import { up as createUsersTable } from "../apps/server/src/database/migration/001_create_users_table.js";
import { up as createGamesTable } from "../apps/server/src/database/migration/002_create_games_table.js";
import { up as createBetsTable } from "../apps/server/src/database/migration/003_create_bets_table.js";
import { up as createTransactionsTable } from "../apps/server/src/database/migration/004_create_transactions_table.js";
import { up as createGameSessionsTable } from "../apps/server/src/database/migration/005_create_game_sessions_table.js";

const poolConfig = {
  user: process.env.POSTGRES_USER,
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_NAME,
  password: process.env.POSTGRES_PASSWORD,
  port: process.env.POSTGRES_PORT,
};

async function runStep(name, migrationFn, pool) {
  console.log(`Running migration: ${name}...`);
  try {
    await migrationFn(pool);
    console.log(`${name} completed.`);
  } catch (error) {
    console.error(`Migration failed: ${name}`);
    console.error("Full error:\n", error);
    throw error;
  }
}

async function runMigrations() {
  const pool = new Pool(poolConfig);

  try {
    console.log("Starting database migrations...");

    await runStep("Create Users Table", createUsersTable, pool);
    await runStep("Create Games Table", createGamesTable, pool);
    await runStep("Create Bets Table", createBetsTable, pool);
    await runStep("Create Transactions Table", createTransactionsTable, pool);
    await runStep("Create Game Sessions Table", createGameSessionsTable, pool);

    console.log("\n All migrations completed successfully.");
  } catch (error) {
    console.error("\n Migration process aborted.");
  } finally {
    await pool.end();
    console.log(" Database connection closed.");
  }
}

runMigrations();
