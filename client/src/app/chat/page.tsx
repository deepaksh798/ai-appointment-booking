"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type Message = { from: string; message: string };

const WS_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ChatFloating: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

  useEffect(() => {
    console.log("Connecting to WebSocket at", WS_URL);

    const s = io(WS_URL, {
      path: "/ws/socket.io", // use this if server uses app.mount("/ws", ASGIApp(sio))
      transports: ["websocket"],
      autoConnect: true,
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connected", s.id);
    });

    s.on("connect_error", (err: any) => {
      console.error("Socket connect error:", err);
    });

    s.on("disconnect", (reason: any) => {
      console.log("Socket disconnected:", reason);
    });

    s.on("telegram_message", (payload: Message) => {
      console.log("telegram_message received", payload);
      setMessages((prev) => [...prev, payload]);

      // If no chat selected, auto-select the chat id from the latest incoming message
      if (!selectedChatId) {
        setSelectedChatId(String((payload as any).from));
      }
    });

    // listen for ack/result from server after sending to telegram
    s.on("send_result", (res: any) => {
      console.log("send_result:", res);
      // Optionally show status to user
    });

    return () => {
      s.off("telegram_message");
      s.off("send_result");
      s.disconnect();
      setSocket(null);
    };
  }, []);

  const sendMessage = () => {
    if (!input.trim() || !socket) return;
    if (!selectedChatId) {
      alert("No Telegram chat selected to send the message to.");
      return;
    }

    const payload = { chat_id: selectedChatId, message: input.trim() };

    // Optionally use acknowledgement (callback) to know success/failure
    socket.emit("send_message", payload, (ack: any) => {
      console.log("send_message ack (if server sends one):", ack);
    });

    setMessages((prev) => [...prev, { from: "me", message: input.trim() }]);
    setInput("");
  };

  return (
    <div className="w-96 bg-white shadow-lg rounded-lg p-3">
      <div className="mb-2">
        <div className="text-sm text-gray-600">
          Replying to Telegram chat: {selectedChatId ?? "none"}
        </div>
        <div className="text-xs text-gray-500">
          Tip: click an incoming message to change selected chat.
        </div>
      </div>

      <div className="h-72 overflow-y-auto mb-2">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 ${m.from === "me" ? "text-right" : "text-left"}`}
            onClick={() => {
              // clicking an incoming Telegram message selects that chat id
              if (m.from !== "me") setSelectedChatId(String(m.from));
            }}
            style={{ cursor: m.from !== "me" ? "pointer" : "default" }}
          >
            <div className="inline-block bg-gray-100 p-2 rounded">
              <strong>{m.from === "me" ? "You" : m.from}:</strong> {m.message}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button
          onClick={sendMessage}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatFloating;
