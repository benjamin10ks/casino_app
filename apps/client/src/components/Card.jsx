export default function Card({ card, index }) {
  if (!card) return null;

  // 1. Map suit names to Unicode emojis and determine color
  const suitMap = {
    spades: { emoji: "♠", colorClass: "text-slate-900" },
    clubs: { emoji: "♣", colorClass: "text-slate-900" },
    hearts: { emoji: "♥", colorClass: "text-red-600" },
    diamonds: { emoji: "♦", colorClass: "text-red-600" },
  };

  const suitData = suitMap[card.suit?.toLowerCase()] || {};
  //const isRed = suitData.colorClass === "text-red-600";
  const suitEmoji = suitData.emoji || "?";

  // Slight offset for stacked cards look
  const style = { transform: `translateX(${index * -30}px)` };

  return (
    <div
      style={style}
      className={`relative w-14 h-20 md:w-20 md:h-28 rounded-lg border-2 shadow-xl flex flex-col items-center justify-center select-none transition-transform hover:-translate-y-2 ${
        card.hidden
          ? "bg-slate-800 border-slate-600 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')]"
          : "bg-white border-gray-200"
      }`}
    >
      {card.hidden ? (
        <div className="w-full h-full flex items-center justify-center text-slate-500 text-2xl font-serif">
          🂠
        </div>
      ) : (
        <div
          className={`flex flex-col items-center justify-center ${suitData.colorClass}`}
        >
          {/* Rank (Top) */}
          <span className={`text-lg md:text-2xl font-bold`}>{card.rank}</span>
          {/* Suit Emoji (Center) */}
          <span className={`text-xl md:text-3xl`}>{suitEmoji}</span>
        </div>
      )}
    </div>
  );
}
