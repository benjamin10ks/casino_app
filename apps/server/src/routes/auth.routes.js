import express from "express";
import authController from "../controllers/auth.controller.js";
import { validateRequest } from "../middleware/validation.middleware.js";
import { authenticate } from "../middlewares/authenticate.middleware.js";
import {
  loginSchema,
  registerSchema,
  convertGuestSchema,
} from "../utils/auth.validators.js";

const router = express.Router();

router.post(
  "/register",
  validateRequest(registerSchema),
  authController.register,
);
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/logout", authController.logout);
router.post("/guest-login", authController.guestLogin);

router.post(
  "/convert",
  authenticate,
  validateRequest(convertGuestSchema),
  authController.convertGuest,
);
router.get("/me", authenticate, authController.getCurrentUser);

export default router;
