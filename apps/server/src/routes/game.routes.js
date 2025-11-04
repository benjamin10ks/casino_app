import express from "express";
//import gameController from "../controllers/game.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

//router.get("/", gameController.getAllAvailableGames);
//router.get("/:gameId", gameController.getGameById);

//router.post("/", authMiddleware, gameController.createGame);

//router.get("/:id/state", authMiddleware, gameController.getGameState);
//router.get("/:id/history", authMiddleware, gameController.getGameHistory);

export default router;
