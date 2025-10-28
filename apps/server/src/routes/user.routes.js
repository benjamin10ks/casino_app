import express from "express";
import userController from "../controllers/user.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.use(authMiddleware);

router.get("/profile", userController.getProfile);
router.patch("/profile", userController.updateProfile);
router.get("/balance", userController.getBalance);
router.get("/stats", userController.getStats);

export default router;
