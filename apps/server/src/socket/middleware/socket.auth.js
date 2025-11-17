import jwt from "jsonwebtoken";
import userRepo from "../../repositories/user.repository.js";
import { UnauthorizedError } from "../../utils/errors.js";

export default async function socketAuthMiddleware(socket, next) {
  try {
    console.log("socket Auth Attempt:", {
      socketId: socket.id,
      query: socket.handshake.query,
      auth: socket.handshake.auth,
    });

    const token =
      socket.handshake.auth?.token ||
      socket.handshake.query?.token ||
      socket.handshake.headers?.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new UnauthorizedError("Authentication token is missing"));
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      if (jwtError.name === "TokenExpiredError") {
        return next(new UnauthorizedError("Authentication token has expired"));
      }
      return next(new UnauthorizedError("Invalid authentication token"));
    }

    const user = await userRepo.getById(decoded.userId);

    if (!user) {
      return next(new UnauthorizedError("User not found"));
    }

    socket.userId = user.id;
    socket.username = user.username;
    socket.email = user.email;
    socket.isGuest = user.isGuest;

    socket.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      balance: parseFloat(user.balance),
      isGuest: user.isGuest,
    };

    console.log("socket Auth Success:", {
      socketId: socket.id,
      userId: socket.userId,
      username: socket.username,
    });

    next();
  } catch (error) {
    console.error("socket Auth Error:", error);
    next(new UnauthorizedError("Authentication failed"));
  }
}
