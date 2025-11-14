import userService from "../services/user.service.js";

class UserController {
  async getProfile(req, res, next) {
    try {
      const { username } = req.user;

      const userProfile = await userService.getUserProfile(username);

      res.status(200).json({
        success: true,
        data: { user: userProfile },
      });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const updates = req.body;

      const updatedUser = await userService.updateProfile(userId, updates);

      res.json({
        success: true,
        data: { user: updatedUser },
        message: "Profile updated successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async getBalance(req, res, next) {
    try {
      const userId = req.user.id;

      const balance = await userService.getUserBalance(userId);

      res.json({
        success: true,
        data: balance,
      });
    } catch (error) {
      next(error);
    }
  }

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

export default new UserController();
