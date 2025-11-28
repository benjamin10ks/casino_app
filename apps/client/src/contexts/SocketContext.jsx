import { createContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "../hooks/useAuth";

const SocketContext = createContext(null);

export default function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // If no user is present, clean up any existing socket
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const token = localStorage.getItem("token");

    // Create a new socket connection with auth and username
    const newSocket = io(
      import.meta.env.VITE_SOCKET_URL || "http://localhost:3000",
      {
        auth: { token },
        query: { username: user.username },
        autoConnect: true,
      },
    );

    // Update local connection flag on connect
    newSocket.on("connect", () => {
      console.log("Socket connected");
      setConnected(true);

      // If a previous game id was persisted, set it locally but do not auto-emit join
      // to avoid duplicate join flows; let the Game hook perform the authoritative join
      const pendingGameId = localStorage.getItem("currentGameId");
      if (pendingGameId) {
        newSocket.currentGameId = pendingGameId;
        console.log("Found pendingGameId, will not auto-rejoin:", pendingGameId);
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
      setConnected(false);
    });

    newSocket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      if (
        err.message &&
        (err.message.includes("Authentication") ||
          err.message.includes("token"))
      ) {
        console.log("Authentication failed, login again.");
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const value = {
    socket,
    connected,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export { SocketContext };
