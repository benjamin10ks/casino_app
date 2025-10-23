import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function Chat() {
  const [username, setUsername] = useState("");
  const [socket, setSocket] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  const connect = () => {
    if (!username.trim()) {
      alert("Please enter a username");
      return;
    }

    const newSocket = io("http://localhost:5173", {
      query: { username },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log(`Connected as ${username}`);
      setIsConnected(true);
    });

    newSocket.on("chat:message", (data) => {
      console.log("Received message:", data);
      setMessages((prev) => [...prev, `${data.username}: ${data.message}`]);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected");
      setIsConnected(false);
    });
  };

  const sendMessage = () => {
    if (socket && message.trim() !== "") {
      // Emit the message
      socket.emit("chat:message", message);

      // Add your own message to the list (since broadcast doesn't send to sender)
      setMessages((prev) => [...prev, `${username}: ${message}`]);

      setMessage("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [socket]);

  return (
    <div style={{ padding: "2rem", maxWidth: "600px", margin: "0 auto" }}>
      <h1>Socket.io Chat Test</h1>

      {!isConnected ? (
        <div style={{ marginTop: "1rem" }}>
          <input
            placeholder="Enter username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && connect()}
            style={{ padding: "0.5rem", marginRight: "0.5rem", width: "200px" }}
          />
          <button onClick={connect} style={{ padding: "0.5rem 1rem" }}>
            Join Chat
          </button>
        </div>
      ) : (
        <div style={{ marginTop: "1rem" }}>
          <div style={{ marginBottom: "1rem" }}>
            <strong>Connected as: {username}</strong>
          </div>

          <div
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              height: "300px",
              overflowY: "auto",
              marginBottom: "1rem",
              backgroundColor: "#f5f5f5",
            }}
          >
            {messages.length === 0 ? (
              <p style={{ color: "#999" }}>No messages yet...</p>
            ) : (
              <ul style={{ listStyle: "none", padding: 0 }}>
                {messages.map((m, i) => (
                  <li key={i} style={{ marginBottom: "0.5rem" }}>
                    {m}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              style={{
                padding: "0.5rem",
                flex: 1,
                fontSize: "1rem",
              }}
            />
            <button
              onClick={sendMessage}
              style={{
                padding: "0.5rem 1.5rem",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
