import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";
import { useAuth } from "./useAuth";

export function useChat(gameId = null) {
  const { socket, connected } = useSocket();
  const { user } = useAuth();

  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isInRoom, setIsInRoom] = useState(false);
  const [error, setError] = useState(null);
  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    if (!socket || !connected || !user) return;

    if (gameId) {
      socket.emit("chat:join", { gameId }, (response) => {
        if (response && response.status === "ok") {
          setIsInRoom(true);
          console.log("Joined chat room for game:", gameId);
        } else {
          setError(
            (response && response.message) || "Failed to join chat room",
          );
        }
      });
    }

    socket.on("chat:message", handleNewMessage);
    socket.on("chat:join", handleUserJoined);
    socket.on("chat:leave", handleUserLeft);

    return () => {
      if (gameId) {
        socket.emit("chat:leave", { gameId });
      }
      socket.off("chat:message", handleNewMessage);
      socket.off("chat:join", handleUserJoined);
      socket.off("chat:leave", handleUserLeft);

      setIsInRoom(false);
    };
  }, [socket, connected, user, gameId]);
  /* eslint-enable react-hooks/exhaustive-deps */
  const handleNewMessage = useCallback((message) => {
    setMessages((prevMessages) => [...prevMessages, message]);
  }, []);

  const handleUserJoined = useCallback((data) => {
    console.log("User joined chat:", data.username);
    setMessages((prevMessages) => [
      ...prevMessages,
      { type: "system", message: `${data.username} has joined the chat.` },
    ]);
  }, []);

  const handleUserLeft = useCallback((data) => {
    console.log("User left chat:", data.username);
    setMessages((prevMessages) => [
      ...prevMessages,
      {
        type: "system",
        message: `${data.username} has left the chat.`,
      },
    ]);
  }, []);

  const sendMessage = useCallback(
    (message, callback) => {
      if (!socket || !isInRoom) {
        callback?.({ success: false, error: "Not connected to chat room" });
        return;
      }
      if (!message || message.trim() === "") {
        callback?.({ success: false, error: "Message cannot be empty" });
        return;
      }

      if (gameId) {
        socket.emit("chat:message", { gameId, message }, (resp) => {
          const success =
            resp && (resp.success === true || resp.status === "ok");
          if (success) {
            callback?.({ success: true, resp });
          } else {
            callback?.({ success: false, error: resp && resp.message });
          }
        });
      }
    },
    [socket, isInRoom, gameId],
  );

  return {
    messages,
    onlineUsers,
    isInRoom,
    connected,
    error,
    sendMessage,
  };
}
