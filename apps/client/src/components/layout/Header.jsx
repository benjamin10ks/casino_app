import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Header() {
  const { user, isGuest, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4 text-gray-200">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-extrabold tracking-wide text-transparent bg-clip-text bg-linear-to-r from-emerald-400 to-yellow-400 hover:opacity-90 transition-opacity"
        >
          CASINO
        </Link>

        {/* Navigation */}
        <nav className="flex items-center gap-6 text-sm">
          {user ? (
            <>
              <Link
                to="/profile"
                className="text-gray-300 hover:text-emerald-400 transition-colors"
              >
                Profile
              </Link>

              <div className="flex flex-col items-end leading-tight text-xs md:text-sm">
                <span className="text-gray-400 font-medium">
                  {user.username} {isGuest && "(Guest)"}
                </span>
                <span className="text-emerald-400 font-semibold">
                  Balance: {user.balance}
                </span>
              </div>

              <button
                onClick={handleLogout}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-all"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-gray-300 hover:text-emerald-400 font-medium transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-all"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
