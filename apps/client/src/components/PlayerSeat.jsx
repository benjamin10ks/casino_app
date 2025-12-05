import Card from "./Card";
import ChipDisplay from "./ChipDisplay";

export default function PlayerSeat({ player, isMe, status }) {
  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center h-48 w-32 border-2 border-dashed border-emerald-700 rounded-xl bg-emerald-800/30 opacity-50">
        <span className="text-emerald-400 text-sm font-semibold">
          OPEN SEAT
        </span>
      </div>
    );
  }

  // Determine border color based on status
  let borderColor = "border-transparent";
  if (player.status === "blackjack") borderColor = "border-yellow-400";
  if (player.status === "busted") borderColor = "border-red-500";
  if (isMe && status === "playing")
    borderColor = "border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)]";

  // Safe ID slicing
  const displayName = isMe
    ? "YOU"
    : `Player ${player.id ? player.id.toString().slice(0, 4) : "?"}`;

  // Determine Score Color
  let scoreColor = "text-white";
  if (player.value > 21) scoreColor = "text-red-500"; // Busted
  if (player.value === 21) scoreColor = "text-yellow-400"; // Blackjack/21

  return (
    <div
      className={`relative flex flex-col items-center transition-all ${player.status === "playing" ? "scale-105" : "opacity-90"}`}
    >
      {/* 1. Cards Container */}
      <div className="flex items-center justify-center pl-8 mb-2 min-h-[120px]">
        {player.hand?.map((card, i) => (
          <Card key={i} card={card} index={i} />
        ))}
      </div>

      {/* 2. NEW: Score Badge (Floating under cards) */}
      {player.hand && player.hand.length > 0 && (
        <div className="-mt-6 mb-2 z-20 relative">
          <div className="bg-slate-900 border border-slate-600 px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
            <span className="text-[10px] text-slate-400 uppercase font-bold">
              Total:
            </span>
            <span className={`font-mono font-bold text-sm ${scoreColor}`}>
              {player.value}
            </span>
          </div>
        </div>
      )}

      {/* 3. Bet Chip (Floating Top Right) */}
      {player.bet > 0 && (
        <div className="absolute -top-5 right-0 z-10">
          <ChipDisplay amount={player.bet} />
        </div>
      )}

      {/* 4. Player Info Box (Name & Status) */}
      <div
        className={`bg-slate-900/90 backdrop-blur-sm p-2 rounded-xl border-2 ${borderColor} w-40 text-center shadow-lg`}
      >
        <div className="text-xs text-slate-300 font-bold uppercase truncate mb-1">
          {displayName}
        </div>

        <div className="h-5 flex items-center justify-center font-bold text-xs tracking-wide">
          {player.status === "blackjack" && (
            <span className="text-yellow-400 animate-pulse">BLACKJACK!</span>
          )}
          {player.status === "busted" && (
            <span className="text-red-500">BUSTED</span>
          )}
          {player.status === "standing" && (
            <span className="text-slate-400">STAND</span>
          )}
          {player.status === "playing" && (
            <span className="text-blue-400">THINKING...</span>
          )}
          {player.status === "waiting" && (
            <span className="text-slate-600">WAITING</span>
          )}
        </div>
      </div>
    </div>
  );
}
