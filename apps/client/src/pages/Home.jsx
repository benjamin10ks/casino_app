import { useNavigate } from "react-router-dom";

export default function Home() {
  const games = ["Poker", "Blackjack", "Roulette", "Slots", "Ride the Bus"];

  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-linear-to-b from-zinc-950 via-zinc-900 to-black flex flex-col items-center justify-center text-center overflow-hidden">
      {/* Main Title */}
      <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-yellow-400 drop-shadow-lg mb-32 select-none">
        I LOVE GAMBLING
      </h1>

      {/* Fanned Card Section */}
      <div className="absolute bottom-12 flex justify-center w-full">
        <div className="relative flex justify-center gap-0">
          {games.map((game, index) => {
            // Fan effect: offset rotation and translate
            const rotation = (index - (games.length - 1) / 2) * 8; // spread cards
            const translateY = Math.abs(index - (games.length - 1) / 2) * 4; // slight depth
            return (
              <div
                key={game}
                className="relative bg-zinc-800 text-white w-28 h-40 md:w-45 md:h-67 rounded-xl border border-zinc-700 shadow-2xl cursor-pointer hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-out flex items-center justify-center font-bold text-sm md:text-base"
                onClick={() => navigate(`/lobby`)}
                style={{
                  transform: `rotate(${rotation}deg) translateY(${translateY}px)`,
                  zIndex: 100 - Math.abs(index - 2), // keep middle cards on top
                }}
              >
                {game}
              </div>
            );
          })}
        </div>
      </div>

      {/* Decorative glow */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-linear-to-t from-emerald-500/10 to-transparent pointer-events-none" />
    </div>
  );
}
