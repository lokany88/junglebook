'use client';
import { useState } from 'react';

export default function IdeasPage() {
  const [idea, setIdea] = useState('');
  const [result, setResult] = useState<string | null>(null);

  async function generate(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: wire to Architect AI later
    setResult(`Blueprint (mock): Build "${idea}" using Next.js + Turso + Workers`);
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Idea Forge</h1>
      <form onSubmit={generate} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          placeholder="Describe your idea..."
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
          Generate Blueprint
        </button>
      </form>
      {result && <div style={card}>{result}</div>}
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
