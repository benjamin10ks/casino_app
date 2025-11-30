import { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useBalance } from "../../hooks/useBalance";

export default function Blackjack({
  gameState,
  onPlaceBet,
  onAction,
  onNewRound,
  isMyTurn,
}) {
  const { user } = useAuth();
  const { balance, canAfford, formattedBalance } = useBalance();

  const [betAmount, setBetAmount] = useState(10);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  if (!gameState) {
    return <div className="text-center p-4">Loading Blackjack game...</div>;
  }

  // --- Extract data from server payload ---
  const innerState = gameState.game?.gameState || gameState.gameState || {};
  const playerId = user?.id?.toString();
  const player = innerState.players?.[playerId] || null;
  const dealer = innerState.dealer || null;
  const status = gameState.game?.status || gameState.status || "waiting";
  const roundActive = innerState.roundActive || false;
  const currentBet = player?.bet || 0;
  const roundFinished =
    !roundActive && player?.status && player.status !== "waiting";

  useEffect(() => {
    console.log("==== Blackjack Debug ====");
    console.log("player:", player);
    console.log("dealer:", dealer);
    console.log("game status:", status);
    console.log("roundActive:", roundActive);
    console.log("currentBet:", currentBet);
  }, [player, dealer, status, roundActive, currentBet]);

  return (
    <div className="max-w-xl mx-auto p-4 bg-gray-800 text-white rounded-xl shadow-lg space-y-6">
      {/* Balance Display */}
      <div className="text-center">
        <p className="text-sm text-gray-300">Your Balance</p>
        <p className="text-2xl font-bold text-green-400">
          {formattedBalance()} chips
        </p>
      </div>

      {/* Dealer Section */}
      <div className="bg-gray-700 p-4 rounded-lg space-y-2">
        <h3 className="text-lg font-bold">Dealer's Hand</h3>
        <div className="flex gap-2">
          {dealer?.hand?.length > 0 ? (
            dealer.hand.map((card, i) => (
              <div
                key={i}
                className={`w-12 h-16 flex items-center justify-center rounded-md shadow-md ${
                  card.hidden
                    ? "bg-gray-600 text-gray-400"
                    : "bg-white text-black"
                }`}
              >
                {card.hidden ? "🂠" : `${card.rank}${card.suit}`}
              </div>
            ))
          ) : (
            <div className="text-gray-400">Waiting...</div>
          )}
        </div>
        {dealer?.hand &&
          !dealer.hand.some((c) => c.hidden) &&
          dealer.value != null && (
            <p className="font-semibold">Total: {dealer.value}</p>
          )}
      </div>

      {/* Player Section */}
      <div className="bg-gray-700 p-4 rounded-lg space-y-2">
        <h3 className="text-lg font-bold">Your Hand</h3>
        <div className="flex gap-2">
          {player?.hand?.length > 0 ? (
            player.hand.map((card, i) => (
              <div
                key={i}
                className="w-12 h-16 flex items-center justify-center bg-white text-black rounded-md shadow-md"
              >
                {card.rank}
                {card.suit}
              </div>
            ))
          ) : (
            <div className="text-gray-400">No cards yet</div>
          )}
        </div>
        {player?.hand?.length > 0 && (
          <div className="space-y-1">
            <p className="font-semibold">Total: {player.value}</p>
            {player.status === "blackjack" && (
              <p className="text-green-400 font-bold">🎉 BLACKJACK!</p>
            )}
            {player.status === "busted" && (
              <p className="text-red-400 font-bold">💥 BUST!</p>
            )}
          </div>
        )}
      </div>

      {/* Betting Phase */}
      {status === "waiting" && !player?.hasBet && (
        <div className="bg-gray-700 p-4 rounded-lg space-y-3">
          <h3 className="text-lg font-bold">Place Your Bet</h3>
          <div className="flex gap-2 flex-wrap">
            {[10, 25, 50, 100].map((amt) => (
              <button
                key={amt}
                onClick={() => setBetAmount(amt)}
                disabled={!canAfford(amt)}
                className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
              >
                {amt}
              </button>
            ))}
          </div>

          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              min={10}
              max={balance}
              className="w-24 p-2 rounded text-black"
            />
            <button
              onClick={() => {
                if (!canAfford(betAmount)) {
                  alert("Insufficient balance");
                  return;
                }
                setIsPlacingBet(true);
                onPlaceBet({ amount: betAmount }, (response) => {
                  setIsPlacingBet(false);
                  if (!response.success) {
                    alert(response.error);
                  }
                });
              }}
              disabled={isPlacingBet || !canAfford(betAmount)}
              className="flex-1 px-4 py-2 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50 font-bold"
            >
              {isPlacingBet ? "Placing..." : `Bet ${betAmount}`}
            </button>
          </div>
        </div>
      )}

      {/* Waiting for other players */}
      {status === "waiting" && player?.hasBet && (
        <div className="text-center text-yellow-400">
          ⏳ Waiting for other players...
        </div>
      )}

      {/* Playing Phase - Your Turn */}
      {roundActive && isMyTurn && player?.status === "playing" && (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() =>
              onAction("hit", {}, (r) => !r.success && alert(r.error))
            }
            className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 font-bold"
          >
            Hit
          </button>
          <button
            onClick={() =>
              onAction("stand", {}, (r) => !r.success && alert(r.error))
            }
            className="px-4 py-2 rounded bg-red-500 hover:bg-red-400 font-bold"
          >
            Stand
          </button>
        </div>
      )}

      {/* Round Finished */}
      {roundFinished && (
        <div className="text-center space-y-3">
          <p className="text-lg font-bold">
            {player.status === "busted" && "💥 Busted!"}
            {player.status === "blackjack" && "🎉 Blackjack!"}
            {player.status === "standing" && "Round Complete"}
          </p>
          <button
            onClick={() => onNewRound((r) => !r.success && alert(r.error))}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 font-bold"
          >
            Play Again
          </button>
        </div>
      )}

      {/* Current Bet */}
      {currentBet > 0 && (
        <p className="text-center">
          Current Bet:{" "}
          <span className="text-yellow-400 font-bold">{currentBet}</span> chips
        </p>
      )}
    </div>
  );
}
