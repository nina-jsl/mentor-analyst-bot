// app/page.tsx
"use client";

import { useState } from "react";

type MentorMode =
  | "communication_coach"
  | "pm_simulator"
  | "workflow_helper"
  | "safe_qa";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const MODES: { id: MentorMode; label: string }[] = [
  { id: "communication_coach", label: "Communication Coach" },
  { id: "pm_simulator", label: "PM Simulator" },
  { id: "workflow_helper", label: "Workflow Helper" },
  { id: "safe_qa", label: "Safe Q&A" },
];

export default function HomePage() {
  const [mode, setMode] = useState<MentorMode>("communication_coach");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSend() {
    const trimmed = input.trim();
    if (!trimmed) return;

    // optimistic update: add user message locally
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, messages: newMessages }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Request failed");
      } else {
        const reply: ChatMessage = {
          role: "assistant",
          content: data.answer,
        };
        setMessages([...newMessages, reply]);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!loading) {
        handleSend();
      }
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-6 gap-4">
      <h1 className="text-2xl font-semibold mb-2 text-center">
        Junior Analyst Mentor (Groq + AI SDK)
      </h1>

      <div className="flex gap-3 flex-wrap mb-2">
        {MODES.map((m) => (
          <button
            key={m.id}
            onClick={() => setMode(m.id)}
            className={`px-3 py-1 rounded border ${
              mode === m.id ? "bg-black text-white" : "bg-white"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <div className="w-full max-w-2xl border rounded p-3 h-80 overflow-y-auto bg-white">
        {messages.length === 0 && (
          <p className="text-gray-500 text-sm">
            Start by telling your mentor what you&apos;re working on, what
            you&apos;re stuck on, or paste a draft / thesis.
          </p>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`mb-3 ${
              m.role === "user" ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block px-3 py-2 rounded-lg whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
      </div>

      <textarea
        className="w-full max-w-2xl border rounded p-2 h-24"
        placeholder="Type your message here... (Enter to send, Shift+Enter for newline)"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className="mt-2 px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? "Thinking..." : "Ask Mentor"}
      </button>

      {errorMsg && (
        <p className="text-red-600 mt-2 text-sm">{errorMsg}</p>
      )}
    </main>
  );
}
