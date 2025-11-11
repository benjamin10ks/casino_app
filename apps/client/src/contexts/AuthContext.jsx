import { createContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/auth/me");
      setUser(response.data.data.user);
      setIsGuest(response.data.data.isGuest || false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      localStorage.removeItem("token");
    } finally {
      setLoading(false);
    }
  };

  const register = async (username, email, password) => {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
    });

    const { user, token } = response.data.data;

    localStorage.setItem("token", token);
    setUser(user);
    setIsGuest(false);

    return user;
  };

  const login = async (email, password) => {
    const response = await api.post("/auth/login", { email, password });

    const { user, token } = response.data.data;

    localStorage.setItem("token", token);
    setUser(user);
    setIsGuest(false);

    return user;
  };

  const guestLogin = async () => {
    const response = await api.post("/auth/guest-login");

    const { user, token } = response.data.data;

    localStorage.setItem("token", token);
    setUser(user);
    setIsGuest(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setIsGuest(false);
  };

  const updateBalance = (newBalance) => {
    setUser((prevUser) => ({ ...prevUser, balance: newBalance }));
  };

  const value = {
    user,
    loading,
    isGuest,
    register,
    login,
    guestLogin,
    logout,
    updateBalance,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
