import { useParams, useNavigate } from "react-router-dom";
import { useGame } from "../hooks/useGame";
import { useAuth } from "../hooks/useAuth";
import Chat from "../components/Chat.jsx";
import Poker from "../games/Poker/Poker.jsx";
import Blackjack from "../games/Blackjack/Blackjack.jsx";
import Roulette from "../games/Roulette/Roulette.jsx";
import RideTheBus from "../games/Ridethebus/Ridethebus.jsx";
import Slots from "../games/Slots/Slots.jsx";

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
  } = useGame(gameId, gameType);

  const handleLeaveGame = () => {
    leaveGame();
    navigate("/lobby");
  };

  if (loading)
    return <div className="text-center text-lg p-6">Loading game...</div>;

  if (error)
    return (
      <div className="max-w-md mx-auto mt-10 p-6 bg-red-100 rounded-xl shadow text-center">
        <h2 className="text-xl font-semibold mb-2">Error loading game</h2>
        <p className="mb-4">{error}</p>
        <button
          onClick={handleLeaveGame}
          className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        >
          Return to Lobby
        </button>
      </div>
    );

  if (!connected)
    return (
      <div className="text-center text-lg p-6">
        Connecting to game server...
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-900 text-white p-4 rounded-xl shadow">
        <div>
          <h2 className="text-2xl font-bold">{gameType.toUpperCase()}</h2>
          <span className="opacity-80">Table #{gameId}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm bg-gray-700 px-3 py-1 rounded-full">
            {gameState?.status}
          </span>
          <button
            onClick={handleLeaveGame}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg"
          >
            Leave Game
          </button>
        </div>
      </div>

      {/* Players List */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h3 className="text-lg font-semibold mb-2">
          Players ({players.length})
        </h3>
        <ul className="space-y-2">
          {players.map((player) => (
            <li
              key={player.userId}
              className={`p-3 rounded-lg flex justify-between items-center border
              ${player.userId === user.id ? "bg-green-100 border-green-400" : "bg-gray-100"}`}
            >
              <div className="font-medium">
                {player.username}
                {player.userId === user.id && " (You)"}
              </div>
              <div className="text-sm flex gap-3">
                {player.balance !== undefined && (
                  <span>{player.balance} chips</span>
                )}
                {player.currentBet > 0 && <span>Bet: {player.currentBet}</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* User Info */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h4 className="text-lg font-semibold mb-2">Your Info</h4>
        <p>Balance: {myPlayerData?.balance} chips</p>
        {myPlayerData?.currentBet > 0 && (
          <p>Current Bet: {myPlayerData.currentBet}</p>
        )}
        {isMyTurn && (
          <p className="text-green-600 font-bold mt-2">It's your turn!</p>
        )}
      </div>

      {/* Game Display */}
      <div className="bg-gray-100 p-4 rounded-xl shadow min-h-[300px]">
        {gameType === "poker" && <Poker />}
        {gameType === "blackjack" && (
          <Blackjack
            gameState={gameState}
            onPlaceBet={placeBet}
            onAction={performAction}
            onNewRound={startNewRound}
            isMyTurn={isMyTurn}
          />
        )}
        {gameType === "roulette" && <Roulette />}
        {gameType === "ride-the-bus" && <RideTheBus />}
        {gameType === "slots" && <Slots />}

        {!["poker", "blackjack", "roulette", "ride-the-bus", "slots"].includes(
          gameType,
        ) && (
          <div className="text-center text-red-600 font-semibold">
            Unknown game type: {gameType}
          </div>
        )}
      </div>

      {/* Chat */}
      <Chat gameId={gameId} />
    </div>
  );
}
