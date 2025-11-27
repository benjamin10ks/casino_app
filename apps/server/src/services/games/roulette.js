import { createBaseGame } from './baseGame.js';

export function createRoulette(options = {}) {
  const game = createBaseGame(options);
  game._internal.table = null; // TODO: configure bets types and odds

  function start() {
    game.start();
    // TODO: accept bets for a period, then spin
    return game.getState();
  }

  function spin() {
    // TODO: randomize result using cryptographically secure RNG if needed
    const pockets = Array.from({ length: 37 }, (_, i) => i); // 0-36 (European)
    const result = pockets[Math.floor(Math.random() * pockets.length)];
    game._internal.lastResult = result;
    return result;
  }

  function handleAction(playerId, action) {
    // action types: 'bet' (payload includes bet type and amount)
    // TODO: store bets and validate funds
    return game.getState();
  }

  function resolveRound() {
    const result = spin();
    // TODO: evaluate all bets and pay winners
    return game.resolveRound();
  }

  return {
    ...game,
    start,
    spin,
    handleAction,
    resolveRound,
  };
}
