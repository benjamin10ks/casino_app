import authService from "../services/auth.service.js";
import { ApiError } from "../utils/errors.js";

class AuthController {
  async register(req, res, next) {
    try {
      const { username, password } = req.body;

      const result = await authService.register({ username, password });

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
      const { username, password } = req.body;

      const result = await authService.login(username, password);

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
  async guestLogin(req, res, next) {}

  async getCurrentUser(req, res, next) {}
}
