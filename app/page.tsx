"use client";

import { useState } from "react";

type MentorMode =
  | "communication_coach"
  | "pm_simulator"
  | "workflow_helper"
  | "safe_qa";

const MODES: { id: MentorMode; label: string }[] = [
  { id: "communication_coach", label: "Communication Coach" },
  { id: "pm_simulator", label: "PM Simulator" },
  { id: "workflow_helper", label: "Workflow Helper" },
  { id: "safe_qa", label: "Safe Q&A" },
];

export default function HomePage() {
  const [mode, setMode] = useState<MentorMode>("communication_coach");
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSend() {
    if (!input.trim()) return;
    setLoading(true);
    setErrorMsg("");
    setAnswer("");

    try {
      const res = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, userInput: input }),
      });

      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Request failed");
      } else {
        setAnswer(data.answer);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center p-6 gap-4">
      <h1 className="text-2xl font-semibold mb-2">
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

      <textarea
        className="w-full max-w-2xl border rounded p-2 h-40"
        placeholder="Paste your draft / thesis / task list / question here..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />

      <button
        onClick={handleSend}
        disabled={loading}
        className="px-4 py-2 rounded bg-blue-600 text-white disabled:opacity-50"
      >
        {loading ? "Thinking..." : "Ask Mentor"}
      </button>

      {errorMsg && (
        <p className="text-red-600 mt-2 text-sm">{errorMsg}</p>
      )}

      {answer && (
        <div className="w-full max-w-2xl mt-4 border rounded p-3 whitespace-pre-wrap">
          {answer}
        </div>
      )}
    </main>
  );
}
