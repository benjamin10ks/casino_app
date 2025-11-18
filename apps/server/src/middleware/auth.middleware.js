import jwt from "jsonwebtoken";
import { ApiError } from "../utils/errors.js";
import userRepo from "../repositories/user.repository.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Authentication token is missing");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userRepo.findById(decoded.user.id);

    if (!user) {
      throw new ApiError(401, "User not found");
    }

    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
    };
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      next(new ApiError(401, "Invalid authentication token"));
    } else {
      next(error);
    }
  }
};
