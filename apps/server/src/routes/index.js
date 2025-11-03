import express from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import gameRoutes from "./game.routes.js";
import transactionRoutes from "./transaction.routes.js";
import leaderboardRoutes from "./leaderboard.routes.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/games", gameRoutes);
router.use("/transactions", transactionRoutes);
router.use("/leaderboards", leaderboardRoutes);

export default router;
