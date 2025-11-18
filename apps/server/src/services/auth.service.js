import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userRepo from "../repositories/user.repository.js";
import { sanitizeUser } from "../models/user.model.js";
import { ConflictError, UnauthorizedError } from "../utils/errors.js";

class AuthService {
  async register({ username, email, password }) {
    const exitistingEmail = await userRepo.findByEmail(email);
    if (exitistingEmail) {
      throw new ConflictError("Email already in use");
    }

    const existingUser = await userRepo.findByUsername(username);
    if (existingUser) {
      throw new ConflictError("Username already taken");
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await userRepo.create({
      username,
      email,
      passwordHash: passwordHash,
      balance: 1000,
      isGuest: false,
    });

    const token = this.generateToken(user);

    return {
      user: sanitizeUser(user),
      token,
    };
  }

  async guestLogin() {
    const guestId = Math.random().toString(36).substring(2, 10);
    const username = `guest_${guestId}`;

    const randomPassword = Math.random().toString(36).substring(2, 10);
    const passwordHash = await bcrypt.hash(randomPassword, 10);

    const user = await userRepo.create({
      username,
      passwordHash: passwordHash,
      email: null,
      balance: 1000,
      isGuest: true,
    });

    const token = this.generateToken(user);

    return {
      user: sanitizeUser(user),
      token,
      isGuest: true,
    };
  }

  async convertGuest(userId, { username, email, password }) {
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
      email,
      passwordHash,
      isGuest: false,
    });

    return {
      user: sanitizeUser(updatedUser),
      message: "Account upgraded successfully! Your balance has been saved.",
    };
  }

  async login(email, password) {
    const user = await userRepo.findByEmail(email);
    console.log(user);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (user.isGuest) {
      throw new UnauthorizedError(
        "Guest users cannot login with email and password",
      );
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const token = this.generateToken(user);

    return {
      user: sanitizeUser(user),
      token,
    };
  }

  generateToken(user) {
    return jwt.sign({ user: user }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
  }
}

export default new AuthService();
