import pool from "../database/connection.js";
import gameRepository from "../repositories/game.repository.js";
import gameSessionRepository from "../repositories/gameSession.repository.js";
import betRepository from "../repositories/bet.repository.js";
import chipsService from "./chips.service.js";
import {
  NotFoundError,
  BadRequestError,
  ForbiddenError,
} from "../utils/errors.js";

import BlackjackGame from "./games/blackjack.js";
//import pokerService from "./games/poker.js";
//import rouletteService from "./games/roulette.js";
//import slotsService from "./games/slots.js";
//import rideTheBusService from "./games/rideTheBus.js";

class GameService {
  constructor() {
    this.gameServices = {
      blackjack: BlackjackGame,
      //    poker: pokerService,
      //   roulette: rouletteService,
      //  slots: slotsService,
      //  "ride-the-bus": rideTheBusService,
    };
  }

  getGameService(gameType) {
    const service = this.gameServices[gameType];
    if (!service) {
      throw new BadRequestError("Unsupported game type");
    }
    return service;
  }

  async createGame({ hostId, gameData }) {
    const validTypes = Object.keys(this.gameServices);
    if (!validTypes.includes(gameData.gameType)) {
      throw new BadRequestError("Invalid game type");
    }

    if (!validTypes.includes(gameData.gameType)) {
      throw new BadRequestError("Invalid game type");
    }

    if (gameData.maxPlayers < 1 || gameData.maxPlayers > 6) {
      throw new BadRequestError("Max players must be between 1 and 10");
    }

    const gameService = this.getGameService(gameData.gameType);

    const initialState = gameService.createInitialState(gameData);

    const game = await gameRepository.create({
      host_id: hostId,
      game_type: gameData.gameType,
      max_players: gameData.maxPlayers,
      min_bet: gameData.minBet,
      status: initialState.status || "waiting",
    });

    await gameRepository.updateGameState(game.id, initialState);

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

  async getGameById(gameId) {
    const game = await gameRepository.findById(gameId);

    if (!game) {
      throw new NotFoundError("Game not found");
    }

    return game;
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
        return {
          success: true,
          session: existingSession,
          position: existingSession.position,
          alreadyInGame: true,
        };
      }

      const playerCount = await gameSessionRepository.countActivePlayers(
        gameId,
        client,
      );
      if (playerCount >= game.max_players) {
        throw new ForbiddenError("Game is full");
      }

      const position = await gameSessionRepository.getNextPosition(
        gameId,
        client,
      );

      const session = await gameSessionRepository.createSession(
        {
          game_id: gameId,
          user_id: userId,
          position,
        },
        client,
      );

      const gameService = this.getGameService(game.game_type);
      const updatedState = await gameService.onPlayerJoined(
        game.game_state,
        userId,
        position,
      );

      await gameRepository.updateGameState(gameId, updatedState, client);

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

    const gameService = this.getGameService(game.game_type);
    const playerSpecificState = await gameService.getPlayerView(
      game.game_state,
      userId,
    );

    return {
      game: {
        id: game.id,
        type: game.game_type,
        status: game.status,
        currentRound: game.current_round,
        minBet: game.min_bet,
        gameState: playerSpecificState,
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

      const gameService = this.getGameService(game.game_type);
      await gameService.validateBet(game.game_state, userId, betData);

      await chipsService.placeBet(userId, betData.amount, gameId, client);

      const bet = await betRepository.create(
        {
          user_id: userId,
          game_id: gameId,
          amount: betData.amount,
          bet_type: betData.betType || "main",
          bet_data: betData.betData || {},
          round_number: game.current_round,
        },
        client,
      );

      await gameSessionRepository.updateStats(
        gameId,
        userId,
        {
          total_bet: betData.amount,
        },
        client,
      );

      const updatedState = await gameService.onBetPlaced(
        game.game_state,
        userId,
        bet.id,
        betData,
      );

      // If game logic started a round (e.g. dealt cards), advance DB round and status
      if (updatedState.roundActive) {
        await gameRepository.incrementRound(gameId, client);
        if (game.status === "waiting") {
          await gameRepository.startGame(gameId, client);
        }
      }

      await gameRepository.updateGameState(gameId, updatedState, client);

      return {
        success: true,
        bet: {
          id: bet.id,
          amount: parseFloat(bet.amount),
          betType: bet.bet_type,
        },
      };
    });
  }

  async performAction(gameId, userId, action, actionData = {}) {
    return pool.transaction(async (client) => {
      const game = await gameRepository.findById(gameId);

      if (!game) {
        throw new NotFoundError("Game not found");
      }

      if (game.status !== "in_progress") {
        throw new BadRequestError("Game is not in progress");
      }

      const session = await gameSessionRepository.findSession(gameId, userId);
      if (!session || session.status !== "active") {
        throw new ForbiddenError("User not in game");
      }

      const gameService = this.getGameService(game.game_type);
      const result = await gameService.processAction(
        game.game_state,
        userId,
        action,
        actionData,
      );

      await gameRepository.updateGameState(gameId, result.gameState, client);

      if (result.resolutions && result.resolutions.length > 0) {
        for (const resolution of result.resolutions) {
          await this.resolveBet(resolution.betId, resolution.outcome, client);
        }
      }

      return {
        success: true,
        result: result.playerResult,
      };
    });
  }

  async resolveBet(betId, outcome, client) {
    const bet = await betRepository.findById(betId);

    if (!bet) {
      throw new NotFoundError("Bet not found");
    }

    if (bet.status !== "pending") {
      throw new BadRequestError("Bet already resolved");
    }

    const resolvedBet = await betRepository.resolveBet(betId, outcome, client);

    if (outcome.status === "win" && outcome.payout > 0) {
      await chipsService.addBalance(
        bet.user_id,
        outcome.payout,
        bet.game_id,
        bet.id,
        client,
      );

      await gameSessionRepository.updateStats(
        bet.game_id,
        bet.user_id,
        {
          hands_played: 1,
          total_won: outcome.payout,
        },
        client,
      );
    } else if (outcome.status === "push") {
      await chipsService.refundBet(
        bet.user_id,
        bet.amount,
        bet.game_id,
        betId,
        client,
      );
    }

    return {
      success: true,
      bet: resolvedBet,
    };
  }

  async startNewRound(gameId) {
    return pool.transaction(async (client) => {
      const game = await gameRepository.findById(gameId);
      if (!game) {
        throw new NotFoundError("Game not found");
      }

      const gameService = this.getGameService(game.game_type);

      const newRoundState = await gameService.startNewRound(game.game_state);

      const updatedGame = await gameRepository.incrementRound(gameId, client);

      await gameRepository.updateGameState(gameId, newRoundState, client);

      await gameRepository.updateStatus(gameId, "waiting", client);

      if (game.status === "waiting") {
        await gameRepository.startGame(gameId, client);
      }

      return {
        success: true,
        currentRound: updatedGame.current_round,
      };
    });
  }

  async endGame(gameId) {
    return pool.transaction(async (client) => {
      await gameRepository.endGame(gameId, client);

      const sessions = await gameSessionRepository.findByGameId(gameId);
      for (const session of sessions) {
        if (session.status === "active") {
          await gameSessionRepository.updateStatus(
            gameId,
            session.user_id,
            "left",
            client,
          );
        }
      }

      return { success: true };
    });
  }
}

export default new GameService();
