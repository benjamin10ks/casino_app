import { createBaseGame } from './baseGame.js';

export function createSlots(options = {}) {
  const game = createBaseGame(options);
  game._internal.reels = options.reels || [
    ['A','K','Q','J','10','9'],
    ['A','K','Q','J','10','9'],
    ['A','K','Q','J','10','9'],
  ];

  function spin(playerId, bet) {
    // TODO: validate bet, deduct chips
    const result = game._internal.reels.map(reel => reel[Math.floor(Math.random() * reel.length)]);
    game._internal.lastSpin = { playerId, bet, result };
    // TODO: calculate payout based on paytable
    return result;
  }

  function handleAction(playerId, action) {
    // action types: 'spin','bet'
    if (action.type === 'spin') return spin(playerId, action.payload.bet);
    return game.getState();
  }

  return {
    ...game,
    spin,
    handleAction,
  };
}
