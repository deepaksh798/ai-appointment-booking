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
    <div className="flex h-full min-h-[460px] flex-col bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Connection Status */}
      <div className="border-b border-slate-200/80 bg-white/90 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                isConnected ? "bg-emerald-500" : "bg-rose-500"
              }`}
            />
            <span className="text-xs font-medium text-slate-600">
              {isConnected
                ? `Connected${
                    sessionId ? ` • Session ${sessionId.slice(-6)}` : ""
                  }`
                : "Connecting..."}
            </span>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(circle_at_top,_#eff6ff_0,_#ffffff_40%)] px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-slate-400">
              <svg
                className="mx-auto mb-2 h-12 w-12 opacity-50"
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
              <p className="mt-1 text-xs">Start a conversation</p>
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
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 shadow-sm ${
                  m.from === "me"
                    ? "rounded-br-md bg-blue-600 text-white"
                    : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                }`}
              >
                {m.from !== "me" && (
                  <div className="mb-1 text-xs font-semibold text-slate-500">
                    {m.from}
                  </div>
                )}
                <div className="text-sm break-words">{m.message}</div>
                {m.timestamp && (
                  <div
                    className={`text-[10px] mt-1 ${
                      m.from === "me" ? "text-blue-100" : "text-slate-400"
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
      <div className="border-t border-slate-200/80 bg-white/95 p-3 backdrop-blur">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              className="w-full rounded-full border border-slate-300 bg-white px-4 py-2.5 pr-10 text-sm text-slate-700 placeholder:text-slate-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={!isConnected}
            />
            {input && (
              <button
                onClick={() => setInput("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
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
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
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
