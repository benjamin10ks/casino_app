import { useEffect, useState, useRef } from "react";
import { useChat } from "../hooks/useChat.js";
import { useAuth } from "../hooks/useAuth.js";

export default function Chat(gameId = null) {
  const { user } = useAuth();

  const { messages, isInRoom, connected, sendMessage } = useChat(gameId);

  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef(null);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!inputMessage.trim()) return;

    sendMessage(inputMessage, (response) => {
      if (response.success) {
        setInputMessage("");
      } else {
        alert("Failed to send message.");
      }
    });
  };

  if (!connected) {
    return <div>Connecting to chat server...</div>;
  }

  if (!isInRoom) {
    return <div>Joining room...</div>;
  }

  return (
    <div className="absolute bottom-4 left-4 w-80 text-white text-sm select-none z-50">
      {/* Chat Wrapper */}
      <div
        className={`
        bg-black/30 backdrop-blur-sm rounded-lg p-2
        transition-all duration-200
        border border-white/10
        hover:bg-black/40
        focus-within:bg-black/50
      `}
      >
        {/* Messages Container */}
        <div
          className={`
          max-h-48 overflow-y-scroll pr-2 
          scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent
          opacity-70 hover:opacity-100
          mask-gradient
        `}
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)",
          }}
        >
          {messages.length === 0 && (
            <div className="text-gray-300/70 italic">No messages yet...</div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className="mb-1">
              <span className="font-semibold text-blue-300">
                {user.username}:
              </span>{" "}
              <span className="text-gray-200">{msg.text}</span>
            </div>
          ))}

          <div ref={messagesEndRef}></div>
        </div>

        {/* Input */}
        <form onSubmit={handleSendMessage} className="mt-2">
          <input
            type="text"
            value={inputMessage}
            onChange={handleInputChange}
            onKeyDown={handleKeyPress}
            placeholder="Press Enter to chat"
            className={`
            w-full bg-black/20 border border-white/10 rounded px-2 py-1
            placeholder-gray-400 text-white
            focus:outline-none focus:bg-black/40
            transition-all
          `}
          />
        </form>
      </div>
    </div>
  );
}
