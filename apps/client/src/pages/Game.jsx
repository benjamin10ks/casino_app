import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../hooks/useGame";
import { useAuth } from "../hooks/useAuth";
import Chat from "../components/Chat.jsx";
//import games

export default function Game() {
  const { gameType, gameId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const {
    gameState,
    players,
    loading,
    error,
    connected,
    placeBet,
    performAction,
    leaveGame,
    startNewRound,
    isMyTurn,
    myPlayerData,
  } = useGame(gameType, gameId);

  const handleLeaveGame = () => {
    leaveGame();
    navigate("/lobby");
  };

  if (loading) {
    return <div>Loading game...</div>;
  }

  if (error) {
    <div>
      <h2>Error loading game</h2>
      <p>Error: {error}</p>;
      <button onClick={handleLeaveGame}>Return to Lobby</button>
    </div>;
  }

  if (!connected) {
    return <div>Connecting to game server...</div>;
  }

  return (
    <div>
      <div>
        <h2>
          {gameType.toUpperCase()} (Table #{gameId})
        </h2>
        <span>{gameState?.status}</span>
        <button onClick={handleLeaveGame}>Leave Game</button>
      </div>
      <div>
        <h3>Players:({players.length})</h3>
        <ul>
          {players.map((player) => (
            <li
              key={player.userId}
              className={player.userId === user.id ? "current-player" : ""}
            >
              <span className="player-username">
                {player.username}
                {player.userId === user.id && " (You)"}
              </span>
              {player.balance !== undefined && (
                <span className="player-balance">{player.balance} chips</span>
              )}
              {player.currentBet > 0 && (
                <span className="player-bet">Bet: {player.currentBet}</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="user-game-info">
        <h4>Your Info:</h4>
        <p>Balance: {myPlayerData?.balance} chips</p>
        {myPlayerData?.currentBet > 0 && (
          <p>Current Bet: {myPlayerData.currentBet}</p>
        )}
        {isMyTurn && <p>It's your turn!</p>}
      </div>

      <div className="game-actions">
        {gameType === "poker" && <div>Poker</div>}
        {gameType === "blackjack" && <div>blackjack</div>}
        {gameType === "roulette" && <div>roulette</div>}
        {gameType === "ride-the-bus" && <div>ride-the-bus</div>}
        {gameType === "slots" && <div>SLOTS</div>}
      </div>
      <Chat gameId={gameId} />
    </div>
  );
}
