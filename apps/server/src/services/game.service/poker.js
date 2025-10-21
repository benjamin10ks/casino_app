import { createBaseGame } from './baseGame.js';

export function createPoker(options = {}) {
  const game = createBaseGame(options);
  game._internal.pot = 0;
  game._internal.community = [];

  function start() {
    game.start();
    game._internal.pot = 0;
    game._internal.community = [];
    // TODO: shuffle & deal hole cards, set blinds, set betting order
    return game.getState();
  }

  function handleAction(playerId, action) {
    // action types: 'bet','call','fold','check','raise'
    // TODO: betting logic, pot updates, move to next player
    return game.getState();
  }

  function resolveRound() {
    // TODO: showdown hand evaluation and payout distribution
    return game.resolveRound();
  }

  return {
    ...game,
    start,
    handleAction,
    resolveRound,
  };
}
