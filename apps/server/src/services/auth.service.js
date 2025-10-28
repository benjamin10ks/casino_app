import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userRepo from "../repositories/user.repository.js";
import { ConflictError, UnauthorizedError } from "../utils/errors.js";

class AuthService {
  async register({ username, password }) {
    const existingUser = await userRepo.findByUsername(username);
    if (existingUser) {
      throw new ConflictError("Username already taken");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await userRepo.create({
      username,
      passwordHash: passwordHash,
      balance: 1000,
    });

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
      },
      token,
    };
  }
  async login(username, password) {
    const user = await userRepo.findByUsername(username);
    if (!user) {
      throw new UnauthorizedError("Invalid username or password");
    }
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid username or password");
    }

    const token = this.generateToken(user);

    return {
      user: {
        id: user.id,
        username: user.username,
        balance: user.balance,
      },
      token,
    };
  }

  generateToken(userId) {
    return jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  }
}

export default new AuthService();
