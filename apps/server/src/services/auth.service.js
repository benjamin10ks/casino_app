import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userRepo from "../repositories/user.repository.js";
import { sanitizeUser } from "../models/user.model.js";
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
      user: sanitizeUser(user),
      token,
    };
  }

  async guestLogin() {
    const guestId = randomBytes(4).toString("hex");
    const username = `guest_${guestId}`;

    const randomPassword = randomBytes(8).toString("hex");
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    const user = await userRepo.create({
      username,
      passwordHash: passwordHash,
      balance: 500,
      isGuest: true,
    });
  }

  async convertGuest(userId, { username, password }) {
    const user = await userRepo.findById(userId);

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    if (!user.isGuest) {
      throw new ConflictError("User is not a guest");
    }

    const existingUser = await userRepo.findByUsername(username);
    if (existingUser) {
      throw new ConflictError("Username already taken");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const updatedUser = await userRepo.update(userId, {
      username,
      passwordHash,
      isGuest: false,
    });

    return {
      user: sanitizeUser(updatedUser),
      message: "Account upgraded successfully! Your balance has been saved.",
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
      user: sanitizeUser(user),
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
