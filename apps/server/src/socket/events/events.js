const GAME_EVENTS = {
  JOIN_GAME: 'game:join',
  LEAVE_GAME: 'game:leave',
  PLACE_BET: 'game:placeBet',
  GAME_ACTION: 'game:action',
  GAME_UPDATE: 'game:update',
  PLAYER_JOINED: 'game:playerJoined',
  PLAYER_LEFT: 'game:playerLeft',
  BET_PLACED: 'game:betPlaced',
  PAYOUT: 'game:payout'
};

const CHAT_EVENTS = {
  SEND_MESSAGE: 'chat:send',
  MESSAGE_RECEIVED: 'chat:message',
  JOIN_ROOM: 'chat:joinRoom'
};

module.exports = {
  GAME_EVENTS,
  CHAT_EVENTS
};
