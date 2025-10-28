import express from "express";
import authRoutes from "./authRoutes.js";
import userRoutes from "./userRoutes.js";
import gameRoutes from "./gameRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
import leaderboardRoutes from "./leaderboardRoutes.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/games", gameRoutes);
router.use("/transactions", transactionRoutes);
router.use("/leaderboards", leaderboardRoutes);

export default router;
