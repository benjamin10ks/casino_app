//import gameRepository from '../repositories/game.repository.js';
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../utils/errors.js";

class GameService {
  async createGame({ hostId, gameType, maxPlayers, minBet }) {}

  async getGameById(gameId) {}

  async getAvailableGames({ gameType, status }) {}

  async getGameState(gameId, userId) {}

  async getGameHistory(gameId, options) {}

  async addPlayer(gameId, userId) {}

  async removePlayer(gameId, userId) {}
}

export default new GameService();
