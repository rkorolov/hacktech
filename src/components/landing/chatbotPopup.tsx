"use client";

import { useState } from "react";

export default function ChatbotPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ from: "user" | "bot"; text: string }[]>([]);

  async function sendMessage() {
    if (!input.trim()) return;
    
    const userMessage = { from: "user" as const, text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    });
    const data = await res.json();
    const botMessage = { from: "bot" as const, text: data.reply };
    setMessages((prev) => [...prev, botMessage]);
  }

  return (
    <div className="fixed bottom-4 right-4">
      {isOpen ? (
        <div className="bg-white shadow-xl border rounded-lg p-4 w-80 h-96 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-2 mb-2">
            {messages.map((m, i) => (
              <div key={i} className={m.from === "user" ? "text-right" : "text-left"}>
                <span className="inline-block bg-gray-200 p-2 rounded">
                  {m.text}
                </span>
              </div>
            ))}
          </div>
          <div className="flex">
            <input
              className="border flex-1 rounded-l p-2"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
            />
            <button className="bg-blue-500 text-white px-4 rounded-r" onClick={sendMessage}>
              Send
            </button>
          </div>
        </div>
      ) : null}

      <button
        className="bg-blue-500 text-white p-4 rounded-full shadow-lg flex"
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <img src="/lumivitaDesigns/Lumi.png" className="max-w-20 max-h-20" />
      </button>
    </div>
  );
}
