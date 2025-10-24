"use client";

import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type Message = {
  from: string;
  message: string;
};

const socket: Socket = io("http://localhost:8000", {
  path: "/ws", // match backend mount (or /ws if you use that)
});

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [chatId, setChatId] = useState<string>(""); // store Telegram chat_id

  useEffect(() => {
    // Listen for messages from backend
    console.log("Setting up socket listener for telegram_message");

    socket.on("connect", () => {
      console.log("Connected to WebSocket server with ID:", socket.id);
      setChatId(socket.id); // reset chatId on new connection
    });

    socket.on("telegram_message", (data: Message & { from: string }) => {
      console.log("Received message:", data);
      setMessages((prev) => [
        ...prev,
        { from: data.from, message: data.message },
      ]);

      setChatId(data.from); // store chat_id automatically for replies
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server");
    });

    return () => {
      socket.off("telegram_message");
    };
  }, []);

  const sendMessage = () => {
    console.log("Sending message to chat ID:", chatId);
    if (!chatId || input.trim() === "") return;
    socket.emit("send_message", { chat_id: chatId, message: input });
    setMessages((prev) => [...prev, { from: "Me", message: input }]);
    setInput("");
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded shadow-md bg-white">
      <h2 className="text-xl font-bold mb-4">Telegram Chat Test</h2>
      <div className="h-64 overflow-y-auto border p-2 mb-4 space-y-2">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`p-2 rounded ${
              msg.from === "Me" ? "bg-blue-100 text-right" : "bg-gray-100"
            }`}
          >
            <strong>{msg.from}:</strong> {msg.message}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 p-2 border rounded"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded"
          onClick={sendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
}
