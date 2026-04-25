"use client";

import React, { useEffect, useState, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { getToken } from "@/_utils/cookies";

type Message = { from: string; message: string; timestamp?: number };
const API_BASE_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(
    /\/+$/,
    ""
  );

const ChatFloating: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = getToken();
    const s = io(API_BASE_URL, {
      path: "/ws",
      transports: ["websocket"],
      autoConnect: true,
      auth: { token },
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("Socket connected", s.id);
      setIsConnected(true);
    });

    s.on("disconnect", () => {
      setIsConnected(false);
    });

    s.on("session_ready", (payload: { session_id?: string }) => {
      setSessionId(payload?.session_id || null);
    });

    s.on("chat_message", (payload: any) => {
      if (!payload?.message) return;
      setMessages((prev) => [
        ...prev,
        {
          from: payload?.from || "admin",
          message: payload.message,
          timestamp: payload?.created_at
            ? new Date(payload.created_at).getTime()
            : Date.now(),
        },
      ]);
    });

    const fetchHistory = async () => {
      try {
        if (!token) return;
        const res = await fetch(`${API_BASE_URL}/chat/history`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.messages)) {
            setMessages(
              data.messages.map((m: any) => ({
                from: m.from,
                message: m.message,
                timestamp: m.created_at
                  ? new Date(m.created_at).getTime()
                  : Date.now(),
              }))
            );
          }
        }
      } catch (e) {
        console.warn("Failed to fetch chat history", e);
      }
    };

    fetchHistory();

    return () => {
      s.off("session_ready");
      s.off("chat_message");
      s.off("disconnect");
      s.disconnect();
      setSocket(null);
    };
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || !socket) return;
    socket.emit("send_message", { message: input.trim() });
    setInput("");
    inputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-gray-50 to-white">
      {/* Connection Status */}
      <div className="px-4 py-2 bg-white border-b">
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          />
          <span className="text-xs text-gray-600">
            {isConnected
              ? `Connected${sessionId ? ` • Session ${sessionId.slice(-6)}` : ""}`
              : "Connecting..."}
          </span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-400">
              <svg
                className="w-12 h-12 mx-auto mb-2 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start a conversation</p>
            </div>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.from === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                  m.from === "me"
                    ? "bg-blue-600 text-white rounded-br-md"
                    : "bg-gray-200 text-gray-800 rounded-bl-md"
                }`}
              >
                {m.from !== "me" && (
                  <div className="text-xs font-semibold mb-1 opacity-80">
                    {m.from}
                  </div>
                )}
                <div className="text-sm break-words">{m.message}</div>
                {m.timestamp && (
                  <div
                    className={`text-[10px] mt-1 ${
                      m.from === "me" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {formatTime(m.timestamp)}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-3">
        <div className="flex gap-2 items-end">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={!isConnected}
            />
            {input && (
              <button
                onClick={() => setInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            )}
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || !isConnected}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatFloating;
