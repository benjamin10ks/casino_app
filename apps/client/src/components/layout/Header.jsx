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
    <header className="header">
      <div className="container">
        <Link to="/" className="header-logo">
          CASINO
        </Link>
        <nav className="header-nav">
          {user ? (
            <>
              <Link to="/profile">Profile</Link>
              <div>
                <span className="header-username">
                  {user.username} {isGuest && "(Guest)"}
                </span>
                <span className="header-coins">Balance: {user.balance}</span>
              </div>
              <button className="header-logout" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="header-login">
                Login
              </Link>
              <Link to="/register" className="header-register">
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
