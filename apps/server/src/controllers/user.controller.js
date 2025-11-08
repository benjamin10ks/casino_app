import userService from "../services/user.service.js";
import { ApiError } from "../utils/apiError.js";

class UserController {
  async getProfile(req, res, next) {
    try {
      const { username } = req.user;

      const userProfile = await userService.getUserProfile(username);

      res.status(200).json({
        success: true,
        data: userProfile,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {}

  async getBalance(req, res, next) {}

  async getStats(req, res, next) {
    try {
      const { username } = req.user;

      const stats = await userService.getUserStats(username);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }
}
