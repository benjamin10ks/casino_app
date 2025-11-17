export function formatGameResponse(game) {
  return {
    id: game.id,
    type: game.type,
    players: game.players,
    maxPlayers: game.maxPlayers,
  };
}
