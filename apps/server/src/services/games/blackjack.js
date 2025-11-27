import { createBaseGame } from './baseGame.js';

export function createBlackjack(options = {}) {
  const game = createBaseGame(options);
  game._internal.deck = null; // TODO: implement deck creation

  function start() {
    game.start();
    // TODO: shuffle deck, deal two cards to each player and dealer
    return game.getState();
  }

  function handleAction(playerId, action) {
    // action types: 'hit', 'stand', 'double', 'split', 'bet'
    // TODO: validate action, update hands, check busts
    return game.getState();
  }

  function resolveRound() {
    // TODO: dealer logic, payouts
    return game.resolveRound();
  }

  return {
    ...game,
    start,
    handleAction,
    resolveRound,
  };
}
