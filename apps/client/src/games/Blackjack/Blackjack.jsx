import { useState } from "react";

export default function Blackjack({
  gameState,
  onPlaceBet,
  onAction,
  onNewRound,
  userBalance,
  isMyTurn,
}) {
  const [betAmount, setBetAmount] = useState(10);
  const [isPlacingBet, setIsPlacingBet] = useState(false);

  if (!gameState)
    return <div className="text-center p-4">Loading Blackjack game...</div>;

  const { status, dealerHand, playerHand, currentBet, result } = gameState;

  const handlePlaceBet = () => {
    if (betAmount <= 0) {
      alert(`Placing bet of $${betAmount}`);
      return;
    }
    if (betAmount > userBalance) {
      alert("Insufficient balance to place this bet.");
      return;
    }
    setIsPlacingBet(true);
    onPlaceBet({ amount: betAmount }, (response) => {
      setIsPlacingBet(false);
      if (!response.success) alert(`Error placing bet: ${response.message}`);
    });
  };

  const handleAction = (action) => {
    onAction(action, (response) => {
      if (!response.success)
        alert(`Error performing action: ${response.message}`);
    });
  };

  const handleNewRound = () => {
    onNewRound((response) => {
      if (!response.success)
        alert(`Error starting new round: ${response.message}`);
    });
  };

  const quickBet = (amount) => {
    if (amount > userBalance) setBetAmount(userBalance);
    else setBetAmount(amount);
  };

  return (
    <div className="max-w-xl mx-auto p-4 bg-gray-800 text-white rounded-xl shadow-lg space-y-6">
      {/* Dealer Section */}
      <div className="bg-gray-700 p-4 rounded-lg space-y-2">
        <h3 className="text-lg font-bold">Dealer's Hand</h3>
        <div className="flex gap-2">
          {dealerHand?.cards?.map((card, i) => (
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
          )) || <div className="text-gray-400">Waiting...</div>}
        </div>
        {dealerHand && !dealerHand.cards?.some((c) => c.hidden) && (
          <p className="font-semibold">Total: {dealerHand.total}</p>
        )}
      </div>

      {/* Player Section */}
      <div className="bg-gray-700 p-4 rounded-lg space-y-2">
        <h3 className="text-lg font-bold">Your Hand</h3>
        <div className="flex gap-2">
          {playerHand?.cards?.map((card, i) => (
            <div
              key={i}
              className="w-12 h-16 flex items-center justify-center bg-white text-black rounded-md shadow-md"
            >
              {card.rank}
              {card.suit}
            </div>
          )) || <div className="text-gray-400">No cards yet</div>}
        </div>
        {playerHand?.cards && (
          <div className="space-y-1">
            <p className="font-semibold">Total: {playerHand.total}</p>
            {playerHand.isBlackjack && (
              <p className="text-green-400 font-bold">🎉 BLACKJACK!</p>
            )}
            {playerHand.isBusted && (
              <p className="text-red-400 font-bold">💥 BUST!</p>
            )}
          </div>
        )}
      </div>

      {/* Game Actions */}
      <div className="space-y-4">
        {status === "waiting" && (
          <div className="bg-gray-700 p-4 rounded-lg space-y-3">
            <h3 className="text-lg font-bold">Place Your Bet</h3>
            <div className="flex gap-2">
              {[10, 25, 50, 100].map((amt) => (
                <button
                  key={amt}
                  onClick={() => quickBet(amt)}
                  disabled={userBalance < amt}
                  className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 disabled:opacity-50"
                >
                  {amt}
                </button>
              ))}
              <button
                onClick={() => quickBet(userBalance)}
                disabled={userBalance <= 0}
                className="px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 disabled:opacity-50"
              >
                All In
              </button>
            </div>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                min={10}
                max={userBalance}
                step={10}
                className="w-20 p-1 rounded text-black"
              />
              <button
                onClick={handlePlaceBet}
                disabled={
                  isPlacingBet || betAmount > userBalance || betAmount <= 0
                }
                className="px-3 py-1 rounded bg-green-600 hover:bg-green-500 disabled:opacity-50"
              >
                {isPlacingBet ? "Placing..." : "Place Bet"}
              </button>
            </div>
            <p className="text-sm">
              Balance: <strong>{userBalance}</strong> chips
            </p>
          </div>
        )}

        {status === "playing" && isMyTurn && (
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => handleAction("hit")}
              className="px-3 py-1 rounded bg-yellow-500 hover:bg-yellow-400"
            >
              Hit
            </button>
            <button
              onClick={() => handleAction("stand")}
              className="px-3 py-1 rounded bg-red-500 hover:bg-red-400"
            >
              Stand
            </button>
            {currentBet && playerHand?.cards?.length === 2 && (
              <>
                <button
                  onClick={() => handleAction("double")}
                  className="px-3 py-1 rounded bg-indigo-500 hover:bg-indigo-400 disabled:opacity-50"
                  disabled={userBalance < currentBet}
                >
                  Double Down
                </button>
                {playerHand.cards[0].rank === playerHand.cards[1].rank && (
                  <button
                    onClick={() => handleAction("split")}
                    className="px-3 py-1 rounded bg-pink-500 hover:bg-pink-400 disabled:opacity-50"
                    disabled={userBalance < currentBet}
                  >
                    Split
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {status === "playing" && !isMyTurn && (
          <p className="italic text-gray-300">Waiting for your turn...</p>
        )}

        {status === "finished" && (
          <div className="bg-gray-700 p-4 rounded-lg space-y-2">
            <h3
              className={`font-bold text-lg text-${result?.outcome === "win" ? "green" : result?.outcome === "lose" ? "red" : "yellow"}-400`}
            >
              {result?.message || "Round Complete"}
            </h3>
            {result?.payout > 0 && (
              <p className="font-semibold text-green-400">
                You won <strong>{result.payout}</strong> chips! 🎉
              </p>
            )}
            <button
              onClick={handleNewRound}
              className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500"
            >
              Play Again
            </button>
          </div>
        )}
      </div>

      {/* Current Bet */}
      {currentBet > 0 && (
        <p className="text-center font-semibold">
          Current Bet: <strong>{currentBet}</strong> chips
        </p>
      )}
    </div>
  );
}
