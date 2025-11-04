import express from "express";
//import userController from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);

//router.get("/profile", userController.getProfile);
//router.patch("/profile", userController.updateProfile);
//router.get("/balance", userController.getBalance);
//router.get("/stats", userController.getStats);

export default router;
