import chipsService from '../../services/chips.service';
import gameService from '../../services/game.service';

//placeBet()
export const gameHandler = (io, socket) => {
  socket.on('game:placeBet', async (data, callback) => {
    // chips.service check
    // place bet 
    // broadcast bet to other players
    // return success or error via callback
  });
}
