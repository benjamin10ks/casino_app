export default function ChipDisplay({ amount }) {
  return (
    <div className="flex flex-col items-center animate-bounce-short">
      <div className="w-10 h-10 rounded-full border-4 border-dashed border-white bg-yellow-500 shadow-lg flex items-center justify-center text-xs font-bold text-black">
        {amount}
      </div>
      <span className="text-xs text-yellow-200 font-mono mt-1">BET</span>
    </div>
  );
}
