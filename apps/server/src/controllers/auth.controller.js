import { sanaitizeUser } from "../models/user.model.js";
import authService from "../services/auth.service.js";
import { ApiError } from "../utils/errors.js";

class AuthController {
  async register(req, res, next) {
    try {
      const { username, email, password } = req.body;

      const result = await authService.register({ username, email, password });

      res.status(201).json({
        success: true,
        data: { user: result.user, token: result.token },
      });
    } catch (error) {
      next(error);
    }
  }
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await authService.login(email, password);

      res.json({
        success: true,
        data: { user: result.user, token: result.token },
      });
    } catch (error) {
      next(error);
    }
  }
  async logout(req, res, next) {
    try {
      await authService.logout(req.user.id);
      res.json({ success: true, message: "Logged out successfully" });
    } catch (error) {
      next(error);
    }
  }
  async guestLogin(req, res, next) {
    try {
      const result = await authService.guestLogin();

      res.status(201).json({
        success: true,
        data: result,
        message: "Playing as guest user, sign in to save your progress",
      });
    } catch (error) {
      next(error);
    }
  }

  async convertGuest(req, res, next) {
    try {
      const { username, email, password } = req.body;
      const userId = req.user.id;

      const result = await authService.convertGuest(userId, {
        username,
        email,
        password,
      });

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);

      res.json({
        success: true,
        data: { user: sanaitizeUser(user), isGuest: user.isGuest },
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
