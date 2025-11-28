// Interface for game modules

class BaseGame {
  createInitialState(gameConfig) {
    throw new Error(
      "createInitialState method must be implemented by subclass",
    );
  }

  async onPlayerJoined(gameState, playerId, position) {
    throw new Error("onPlayerJoined method must be implemented by subclass");
  }

  async onPlayerLeft(gameState, playerId) {
    throw new Error("onPlayerLeft method must be implemented by subclass");
  }

  getPlayerView(gameState, playerId) {
    throw new Error("getPlayerView method must be implemented by subclass");
  }

  async validateBet(gameState, playerId, betData) {
    throw new Error("validateBet method must be implemented by subclass");
  }

  async onBetPlaced(gameState, playerId, betId, betData) {
    throw new Error("onBetPlaced method must be implemented by subclass");
  }

  processAction(gameState, userId, action, actionData) {
    throw new Error("processAction method must be implemented by subclass");
  }

  async startNewRound(gameState) {
    throw new Error("startNewRound method must be implemented by subclass");
  }

  //For card games (optional)
  calculateHandView(cards) {
    return 0;
  }
}

export default BaseGame;
