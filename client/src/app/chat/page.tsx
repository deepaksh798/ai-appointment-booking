"use client";

import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type Message = { from: string; message: string };

const WS_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const ChatFloating: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string | null>(null);

  useEffect(() => {
    // Create socket but don't auto-connect if you prefer; we connect immediately here on mount
    const s = io(WS_URL, {
      path: "/ws", // match server mount
      transports: ["websocket"],
      autoConnect: true,
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connected", s.id);
      setChatId(s.id || null);
    });

    s.on("telegram_message", (payload: Message) => {
      setMessages((prev) => [...prev, payload]);
    });

    // Optionally fetch missed messages from REST endpoint after connect
    const fetchMissed = async () => {
      try {
        const res = await fetch(`${WS_URL}/telegram-missed`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.messages)) {
            setMessages((prev) => [...data.messages, ...prev]);
          }
        }
      } catch (e) {
        console.warn("Failed to fetch missed messages", e);
      }
    };

    s.on("connect", fetchMissed);

    return () => {
      s.off("telegram_message");
      s.off("connect", fetchMissed);
      s.disconnect();
      setSocket(null);
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !socket) return;
    const payload = { chat_id: chatId || "", message: input.trim() };
    socket.emit("send_message", payload);
    setMessages((prev) => [...prev, { from: "me", message: input.trim() }]);
    setInput("");
  };

  return (
    <div className=" w-96 bg-white shadow-lg rounded-lg p-3">
      <div className="h-80 overflow-y-auto mb-2">
        {messages.map((m, i) => (
          <div key={i} className={`p-2 ${m.from === "me" ? "text-right" : ""}`}>
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
