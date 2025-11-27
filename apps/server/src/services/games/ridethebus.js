import { createBaseGame } from './baseGame.js';

export function createRideTheBus(options = {}) {
  const game = createBaseGame(options);

  // game-specific state
  game._internal.deck = options.deck || null; // TODO: implement deck shuffling/draw
  game._internal.round = 0;

  function start() {
    game.start();
    game._internal.round = 1;
    // TODO: initialize deck, deal initial cards, set up player turn order
    return game.getState();
  }

  function handleAction(playerId, action) {
    // action: { type: 'guess'|'reveal'|'pass', payload: any }
    // TODO: implement ridethebus-specific actions and validations
    return game.getState();
  }

  return {
    ...game,
    start,
    handleAction,
  };
}
