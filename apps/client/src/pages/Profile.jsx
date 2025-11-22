import { useAuth } from "../hooks/useAuth";

export default function Profile() {
  const { user } = useAuth();

  console.log("User data:", user);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-zinc-950 to-black text-gray-300">
        <p className="text-lg">You must be logged in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-zinc-950 to-black text-gray-200 px-6 py-12 flex justify-center">
      <div className="w-full max-w-3xl bg-zinc-900/70 border border-zinc-800 rounded-2xl p-10 shadow-xl">
        {/* HEADER */}
        <h1 className="text-4xl font-bold text-center mb-10 text-emerald-400">
          Profile
        </h1>

        <div className="flex flex-col md:flex-row gap-10">
          {/* LEFT SIDE — USER INFO */}
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-lg text-zinc-400">Username</h2>
              <p className="text-2xl font-semibold text-white">
                {user.username}
              </p>
            </div>

            <div>
              <h2 className="text-lg text-zinc-400">Balance</h2>
              <p className="text-2xl font-semibold text-emerald-400">
                {user.balance}
              </p>
            </div>

            <div>
              <h2 className="text-lg text-zinc-400">Account Type</h2>
              <p className="text-xl font-medium text-white">
                {user.is_guest ? "Guest Account" : "Registered Player"}
              </p>
            </div>
          </div>

          {/* RIGHT SIDE — GAME STATS */}
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-white mb-4">
              Lifetime Stats
            </h2>

            <div className="space-y-4">
              <div className="bg-zinc-800/70 border border-zinc-700 p-4 rounded-xl">
                <p className="text-zinc-400 text-sm">Games Played</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>

              <div className="bg-zinc-800/70 border border-zinc-700 p-4 rounded-xl">
                <p className="text-zinc-400 text-sm">Games Won</p>
                <p className="text-2xl font-bold text-white">0</p>
              </div>

              <div className="bg-zinc-800/70 border border-zinc-700 p-4 rounded-xl">
                <p className="text-zinc-400 text-sm">Total Earnings</p>
                <p className="text-2xl font-bold text-emerald-400">0</p>
              </div>

              <div className="bg-zinc-800/70 border border-zinc-700 p-4 rounded-xl">
                <p className="text-zinc-400 text-sm">Favorite Game</p>
                <p className="text-2xl font-bold text-white">—</p>
              </div>
            </div>
          </div>
        </div>

        {/* FUTURE: MATCH HISTORY OR BADGES */}
        <div className="mt-10 text-center text-zinc-500 text-sm italic">
          More profile features coming soon...
        </div>
      </div>
    </div>
  );
}
