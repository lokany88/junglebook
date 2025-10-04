'use client';
import { useState } from 'react';

export default function AIConsolePage() {
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);

  async function run(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: wire to Architect/Interpreter/Audit AI later
    setAnswer(
      `Mock AI: I would analyze "${prompt}" and choose the best template.`,
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
        AI Console
      </h1>
      <form
        onSubmit={run}
        style={{ display: 'flex', gap: 8, marginBottom: 16 }}
      >
        <input
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask the Architect/Audit AI…"
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            border: '1px solid #1f2937',
            background: 'black',
            color: 'white',
          }}
        />
        <button type="submit" style={btn}>
          Run
        </button>
      </form>
      {answer && <div style={card}>{answer}</div>}
    </div>
  );
}
const btn = {
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid #1f2937',
  background: 'white',
  color: 'black',
  cursor: 'pointer',
} as const;
const card = {
  background: '#0b0b0b',
  border: '1px solid #1f2937',
  borderRadius: 12,
  padding: 16,
  whiteSpace: 'pre-wrap',
} as const;
