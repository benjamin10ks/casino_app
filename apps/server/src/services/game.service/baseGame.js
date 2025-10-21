// baseGame.js
// Shared contract and helpers for game modules.

/**
 * Minimal game module contract:
 * - createGame(options) -> returns a game instance
 * - game instance methods:
 *    - join(player)
 *    - leave(playerId)
 *    - start()
 *    - handleAction(playerId, action)
 *    - getState()
 *    - serialize()/toJSON()
 *    - resolveRound()
 *
 * Each game should implement the contract and keep state contained in the instance.
 */

export function createBaseGame(options = {}) {
  const state = {
    id: options.id || `game-${Date.now()}`,
    players: [],
    phase: 'waiting', // waiting | playing | resolving | finished
    metadata: {},
    history: [],
  };

  function join(player) {
    if (!player || !player.id) throw new Error('player must have id');
    if (state.players.find(p => p.id === player.id)) return state;
    state.players.push({ ...player, chips: player.chips || 0 });
    return state;
  }

  function leave(playerId) {
    state.players = state.players.filter(p => p.id !== playerId);
    return state;
  }

  function start() {
    if (state.phase !== 'waiting') throw new Error('Game already started');
    state.phase = 'playing';
    return state;
  }

  function handleAction(playerId, action) {
    // default stub to be overridden by specific games
    throw new Error('handleAction not implemented');
  }

  function getState() {
    return { ...state };
  }

  function serialize() {
    return JSON.parse(JSON.stringify(state));
  }

  function resolveRound() {
    // default: mark finished
    state.phase = 'finished';
    state.history.push({ at: Date.now(), snapshot: serialize() });
    return state;
  }

  return {
    join,
    leave,
    start,
    handleAction,
    getState,
    serialize,
    resolveRound,
    _internal: state,
  };
}
