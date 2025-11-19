import pool from "../database/connection.js";
import gameRepository from "../repositories/game.repository.js";
import gameSessionRepository from "../repositories/gameSession.repository.js";
import betRepository from "../repositories/bet.repository.js";
import userRepository from "../repositories/user.repository.js";
import chipsService from "./chips.service.js";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../utils/errors.js";

class GameService {
  async createGame({ hostId, gameData }) {
    const validTypes = [
      "poker",
      "blackjack",
      "roulette",
      "slots",
      "ride-the-bus",
    ];

    if (!validTypes.includes(gameData.gameType)) {
      throw new BadRequestError("Invalid game type");
    }

    if (gameData.maxPlayers < 1 || gameData.maxPlayers > 10) {
      throw new BadRequestError("Max players must be between 1 and 10");
    }

    if (gameData.minBet < 10) {
      throw new BadRequestError("Min bet must be at least 10 chips");
    }

    const game = await gameRepository.createGame({
      host_id: hostId,
      game_type: gameData.gameType,
      max_players: gameData.maxPlayers,
      min_bet: gameData.minBet,
    });

    await this.joinGame(game.id, hostId);

    return game;
  }

  async getAvailableGames(filters = {}) {
    const games = await gameRepository.findActiveGames(filters);

    return games.map((game) => ({
      id: game.id,
      gameType: game.game_type,
      status: game.status,
      host: game.host_username,
      playerCount: parseInt(game.player_count),
      maxPlayers: game.max_players,
      minBet: game.min_bet,
      maxBet: game.max_bet,
      createdAt: game.created_at,
    }));
  }

  async joinGame(gameId, userId) {
    return pool.transaction(async (client) => {
      const game = await gameRepository.findById(gameId);

      if (!game) {
        throw new NotFoundError("Game not found");
      }

      if (game.status === "completed") {
        throw new BadRequestError("Game has ended");
      }

      const existingSession = await gameSessionRepository.findSession(
        gameId,
        userId,
      );
      if (existingSession && existingSession.status === "active") {
        throw new BadRequestError("User already in game");
      }

      const playerCount = await gameSessionRepository.countActivePlayers(
        gameId,
        client,
      );
      if (playerCount >= game.max_players) {
        throw new ForbiddenError("Game is full");
      }

      const position = gameSessionRepository.getNextPosition(gameId, client);

      const session = await gameSessionRepository.createSession(
        {
          game_id: gameId,
          user_id: userId,
          position,
        },
        client,
      );

      return {
        success: true,
        session,
        position,
      };
    });
  }

  async leaveGame(gameId, userId) {
    return pool.transaction(async (client) => {
      const game = await gameRepository.findById(gameId);

      if (!game) {
        throw new NotFoundError("Game not found");
      }

      if (game.status === "in_progress") {
        const pendingBets = await betRepository.getPendingBets(gameId, userId);
        if (pendingBets.length > 0) {
          throw new ForbiddenError("Cannot leave game with pending bets");
        }
      }

      await gameSessionRepository.updateStatus(gameId, userId, "left", client);

      if (game.host_id === userId && game.status === "waiting") {
        await gameRepository.updateStatus(gameId, "completed", client);
      }

      return { success: true };
    });
  }

  async getGameState(gameId, userId) {
    const game = await gameRepository.getGameWithPlayers(gameId);

    if (!game) {
      throw new NotFoundError("Game not found");
    }

    const session = await gameSessionRepository.findSession(gameId, userId);
    if (!session || session.status !== "active") {
      throw new ForbiddenError("User not in game");
    }

    const bets = await betRepository.findByGameAndRound(
      gameId,
      game.current_round,
    );

    return {
      game: {
        id: game.id,
        type: game.game_type,
        status: game.status,
        currentRound: game.current_round,
        minBet: game.min_bet,
        gameState: game.game_state,
      },
      players: game.players || [],
      bets: bets.map((bet) => ({
        id: bet.id,
        userId: bet.user_id,
        username: bet.username,
        amount: parseFloat(bet.amount),
        betType: bet.bet_type,
        status: bet.status,
      })),
      mySession: {
        position: session.position,
        handsPlayed: session.hands_played,
        totalBet: parseFloat(session.total_bet),
        totalWon: parseFloat(session.total_won),
      },
    };
  }

  async placeBet(gameId, userId, betData) {
    return pool.transaction(async (client) => {
      const game = await gameRepository.findById(gameId);
      if (!game) {
        throw new NotFoundError("Game not found");
      }

      if (game.status !== "waiting" && game.status !== "in_progress") {
        throw new BadRequestError("Game is not active");
      }

      const session = await gameSessionRepository.findSession(gameId, userId);
      if (!session || session.status !== "active") {
        throw new ForbiddenError("User not in game");
      }

      if (betData.amount < game.min_bet) {
        throw new BadRequestError(`Bet must be at least ${game.min_bet} chips`);
      }

      await chipsService.placeBet(userId, betData.amount, gameId, client);
    });
  }
}

export default new GameService();
