import { useEffect, useState } from "react";

export default function Lobby() {
  const [games, setGames] = useState([]);

  useEffect(() => {
    // Example fetch from your backend — replace with your actual endpoint
    fetch("/api/lobbies")
      .then((res) => res.json())
      .then((data) => setGames(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-[#0b0b0b] text-gray-200 flex flex-col items-center py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 tracking-wide text-emerald-400">
        Available {games[0]?.type || "Games"}
      </h1>

      <div className="w-full max-w-3xl bg-zinc-900/70 rounded-2xl shadow-xl overflow-hidden border border-zinc-800/80">
        <div className="grid grid-cols-4 text-sm font-semibold uppercase tracking-wide text-zinc-400 border-b border-zinc-800 p-3">
          <span>Lobby</span>
          <span>Players</span>
          <span>Creator</span>
          <span>Action</span>
        </div>

        {games.length === 0 ? (
          <div className="text-center text-zinc-500 py-8">
            No active lobbies
          </div>
        ) : (
          games.map((game, i) => (
            <div
              key={i}
              className="grid grid-cols-4 items-center text-sm p-4 border-b border-zinc-800 hover:bg-zinc-800/40 transition-colors"
            >
              <div className="truncate font-medium">
                {game.name || game.type}
              </div>
              <div>
                {game.playerCount}/{game.maxPlayers}
              </div>
              <div className="truncate">{game.creator}</div>
              <div>
                <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all">
                  Join
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
