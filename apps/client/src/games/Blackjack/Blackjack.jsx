import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useBalance } from "../../hooks/useBalance";
import Card from "../../components/Card";
import PlayerSeat from "../../components/PlayerSeat";

export default function Blackjack({
  gameState,
  onPlaceBet,
  onAction,
  onNewRound,
  isMyTurn,
}) {
  const { user } = useAuth();
  const { canAfford, formattedBalance } = useBalance();

  const [betAmount, setBetAmount] = useState(10);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  // --- Logic Extraction ---
  if (!gameState)
    return (
      <div className="h-96 flex items-center justify-center text-emerald-500">
        Initializing Table...
      </div>
    );

  const innerState = gameState.game?.gameState || gameState.gameState || {};
  const currentUserId = user?.id?.toString();
  const dealer = innerState.dealer || null;
  const status = gameState.game?.status || gameState.status || "waiting";
  const roundActive = innerState.roundActive || false;

  const activePlayers = Object.entries(innerState.players || {}).map(
    ([key, value]) => ({
      ...value,
      id: key,
    }),
  );

  const seats = [...activePlayers];
  while (seats.length < 5) {
    seats.push(null);
  }

  // Find "My" specific player object for logic checks
  const myPlayer = innerState.players?.[currentUserId] || null;

  // Check if round is finished
  const roundFinished =
    !roundActive &&
    myPlayer?.status &&
    ["won", "lost", "push", "busted", "blackjack"].includes(myPlayer.status);

  return (
    <div className="w-full min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 lg:p-8 font-sans">
      {/* --- TABLE SURFACE --- */}
      <div className="relative w-full max-w-6xl aspect-4/3 md:aspect-video bg-emerald-900 rounded-[3rem] md:rounded-[100px] border-16 border-amber-900 shadow-2xl overflow-hidden flex flex-col">
        {/* Table Felt Texture Overlay */}
        <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white via-transparent to-black mix-blend-overlay"></div>

        {/* 1. DEALER SECTION (Top Center) */}
        <div className="flex-1 flex flex-col items-center pt-8 md:pt-12 z-10">
          <div className="mb-4 text-emerald-200/50 font-bold tracking-widest text-sm uppercase">
            Dealer
          </div>
          <div className="flex items-center justify-center pl-8">
            {dealer?.hand?.length > 0 ? (
              dealer.hand.map((card, i) => (
                <Card key={i} card={card} index={i} />
              ))
            ) : (
              <div className="w-20 h-28 rounded-lg border-2 border-dashed border-emerald-700 flex items-center justify-center opacity-30">
                🂠
              </div>
            )}
          </div>
          {dealer?.value && !dealer.hand?.some((c) => c.hidden) && (
            <div className="mt-2 bg-black/40 px-3 py-1 rounded-full text-emerald-100 text-sm font-mono">
              Total: {dealer.value}
            </div>
          )}
        </div>

        {/* 2. CENTER TEXT / NOTIFICATIONS */}
        <div className="h-16 flex items-center justify-center z-10">
          {status === "waiting" && myPlayer?.hasBet && (
            <div className="text-yellow-400 font-bold text-lg animate-pulse">
              ⏳ Waiting for other players...
            </div>
          )}
          {roundFinished && (
            <div className="text-center space-y-2">
              <p className="text-2xl font-bold drop-shadow-md">
                {myPlayer.status === "busted" && "💥 Busted!"}
                {myPlayer.status === "blackjack" && "🎉 Blackjack!"}
                {myPlayer.status === "won" && "🎉 You Won!"}
                {myPlayer.status === "lost" && "😢 You Lost"}
                {myPlayer.status === "push" && "🤝 Push - Bet Returned"}
              </p>
            </div>
          )}
        </div>

        {/* 3. PLAYERS SECTION (Bottom Row) */}
        <div className="flex-1 flex items-end justify-center gap-2 md:gap-8 pb-8 md:pb-12 px-4 z-10 overflow-x-auto">
          {seats.map((seatPlayer, index) => {
            // Check if this seat belongs to the current user
            // We can now safely access .id because we injected it in activePlayers
            const isMe =
              seatPlayer &&
              seatPlayer.id &&
              seatPlayer.id.toString() === currentUserId;

            return (
              <PlayerSeat
                key={index}
                player={seatPlayer}
                isMe={isMe}
                status={status}
              />
            );
          })}
        </div>
      </div>

      {/* --- CONTROLS / HUD (Below Table) --- */}
      <div className="w-full max-w-4xl mt-6 space-y-4">
        {/* Balance Bar */}
        <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-xl border border-slate-700 shadow-lg">
          <div className="flex flex-col">
            <span className="text-slate-400 text-xs uppercase tracking-wider">
              Balance
            </span>
            <span className="text-2xl font-bold text-emerald-400">
              {formattedBalance()}
            </span>
          </div>

          {/* GAME OVER / RESTART */}
          {roundFinished && (
            <button
              onClick={() => onNewRound((r) => !r.success && alert(r.error))}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold shadow-lg transition-colors"
            >
              Place New Bet
            </button>
          )}
        </div>

        {/* ACTION AREA */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-2xl min-h-[100px] flex items-center justify-center">
          {/* BETTING CONTROLS */}
          {status === "waiting" && !myPlayer?.hasBet && (
            <div className="w-full flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex gap-2">
                {[10, 25, 50, 100].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setBetAmount(amt)}
                    disabled={!canAfford(amt)}
                    className={`w-12 h-12 rounded-full font-bold text-xs border-2 transition-all ${betAmount === amt ? "bg-yellow-500 text-black border-yellow-300 scale-110" : "bg-slate-700 text-slate-300 border-slate-500 hover:bg-slate-600"}`}
                  >
                    {amt}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Number(e.target.value))}
                  className="bg-slate-900 border border-slate-600 text-white rounded-lg px-4 py-2 w-24 text-center font-bold outline-none focus:border-blue-500"
                />
                <button
                  onClick={() => {
                    if (!canAfford(betAmount)) return;
                    setIsPlacingBet(true);
                    onPlaceBet({ amount: betAmount }, (response) => {
                      setIsPlacingBet(false);
                      if (!response.success) alert(response.error);
                    });
                  }}
                  disabled={isPlacingBet || !canAfford(betAmount)}
                  className="flex-1 md:flex-none px-8 py-3 bg-linear-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                >
                  {isPlacingBet ? "Dealing..." : "Deal"}
                </button>
              </div>
            </div>
          )}

          {/* PLAYING CONTROLS */}
          {roundActive && isMyTurn && myPlayer?.status === "playing" && (
            <div className="flex gap-6">
              <button
                onClick={() =>
                  onAction("hit", {}, (r) => !r.success && alert(r.error))
                }
                className="w-32 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xl shadow-[0_4px_0_rgb(6,95,70)] active:shadow-none active:translate-y-1 transition-all uppercase"
              >
                Hit
              </button>
              <button
                onClick={() =>
                  onAction("stand", {}, (r) => !r.success && alert(r.error))
                }
                className="w-32 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xl shadow-[0_4px_0_rgb(153,27,27)] active:shadow-none active:translate-y-1 transition-all uppercase"
              >
                Stand
              </button>
            </div>
          )}

          {/* IDLE MESSAGES */}
          {roundActive && !isMyTurn && myPlayer?.status === "playing" && (
            <span className="text-slate-400 animate-pulse">
              Waiting for other players...
            </span>
          )}

          {status === "waiting" && myPlayer?.hasBet && (
            <span className="text-slate-400">
              Bets placed. Waiting for round to start...
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
