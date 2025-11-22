import { useEffect, useState } from "react";
import { useSocket } from "../hooks/useSocket";

export default function Lobby() {
  const { socket, connected } = useSocket();
  const [games, setGames] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Modal form state
  const [gameType, setGameType] = useState("poker");
  const [minBet, setMinBet] = useState(10);
  const [maxPlayers, setMaxPlayers] = useState(6);

  useEffect(() => {
    if (!socket || !connected) return;

    socket.emit("lobby:join", (response) => {
      if (response?.success) {
        setGames(response.games || []);
      } else {
        console.error("Failed to join lobby:", response?.error);
      }
    });

    const onGameCreated = (newGame) => {
      setGames((prev) => [...prev, newGame]);
    };

    socket.on("lobby:gameCreated", onGameCreated);

    return () => {
      socket.emit("lobby:leave");
      socket.off("lobby:gameCreated", onGameCreated);
    };
  }, [socket, connected]);

  function handleJoinGame(gameId) {
    console.log("Joining game", gameId);
  }

  function handleCreateLobby(e) {
    e.preventDefault();
    console.log("Creating lobby", { gameType, minBet, maxPlayers });

    socket.emit(
      "lobby:createGame",
      {
        gameType,
        maxPlayers: parseInt(maxPlayers),
        minBet: parseFloat(minBet),
      },
      (response) => {
        if (response.success) {
          setShowModal(false);
          console.log("Lobby created");
        } else {
          alert(response.error || "Failed to create lobby");
        }
      },
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-gray-200 flex flex-col items-center py-10 px-4">
      {/* Header Row */}
      <div className="w-full max-w-3xl mb-8 flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-wide text-emerald-400">
          Available Lobbies
        </h1>

        <button
          onClick={() => setShowModal(true)}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold shadow transition"
        >
          + Create Lobby
        </button>
      </div>

      {/* Lobby Table */}
      <div className="w-full max-w-3xl bg-zinc-900/70 rounded-2xl shadow-xl overflow-hidden border border-zinc-800/80">
        <div className="grid grid-cols-5 text-sm font-semibold uppercase tracking-wide text-zinc-400 border-b border-zinc-800 p-3">
          <span>Type</span>
          <span>Players</span>
          <span>Host</span>
          <span>Min Bet</span>
          <span>Action</span>
        </div>

        {games.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">
            No active lobbies
          </div>
        ) : (
          games.map((game) => (
            <div
              key={game.id}
              className="grid grid-cols-5 items-center text-sm p-4 border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors"
            >
              <div className="font-medium">{game.gameType}</div>

              <div>
                {game.playerCount}/{game.maxPlayers}
              </div>

              <div className="truncate">{game.host}</div>

              <div>${game.minBet}</div>

              <div>
                <button
                  onClick={() => handleJoinGame(game.id)}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                >
                  Join
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Lobby Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-emerald-400">
              Create New Lobby
            </h2>

            <form onSubmit={handleCreateLobby} className="space-y-4">
              {/* Game Type */}
              <div>
                <label className="block mb-1 text-sm text-gray-300">
                  Game Type
                </label>
                <select
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                  value={gameType}
                  onChange={(e) => setGameType(e.target.value)}
                >
                  <option value="poker">Poker</option>
                  <option value="blackjack">Blackjack</option>
                  <option value="roulette">Roulette</option>
                  <option value="slots">Slots</option>
                  <option value="ride-the-bus">Ride the Bus</option>
                </select>
              </div>

              {/* Min Bet */}
              <div>
                <label className="block mb-1 text-sm text-gray-300">
                  Minimum Bet
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                  value={minBet}
                  onChange={(e) => setMinBet(e.target.value)}
                />
              </div>

              {/* Max Players */}
              <div>
                <label className="block mb-1 text-sm text-gray-300">
                  Max Players
                </label>
                <input
                  type="number"
                  min="2"
                  max="12"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={!connected}
                  className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow transition"
                >
                  Create Lobby
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
