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
    <div className="fixed bottom-20 right-4">
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
        className="flex fixed"
        onClick={() => {
          setIsOpen((prev) => {
            const newIsOpen = !prev;
            if (newIsOpen && messages.length === 0) {
              setMessages([
                { from: "bot", text: "Hi there! I'm Lumi, your assistant. How can I help you today?" }
              ]);
            }
            return newIsOpen;
          });
        }}
      >
       
        <img 
          src="../../../../lumivitaDesigns/Lumi.png" 
          alt="small image"
          style={{
            position: "fixed",  // Keep the image fixed while scrolling
            bottom: "20px",     // Adjust this value to set the distance from the bottom
            right: "20px",      // Adjust this value to set the distance from the right
            width: "50px",     // Set the size of the image
            height: "auto",     // Maintain aspect ratio
            zIndex: "9999",     // Ensure it stays on top of other elements
          }}/>
      </button>
    </div>
  );
}
