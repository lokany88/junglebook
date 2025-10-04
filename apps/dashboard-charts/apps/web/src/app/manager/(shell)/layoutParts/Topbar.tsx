'use client';

export default function OverviewPage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>
        Overview
      </h1>
      <p style={{ color: '#9ca3af', marginBottom: 16 }}>
        High-level status of your apps, deployments, finances, and AI activity.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 12,
        }}
      >
        <div style={card}>
          <div style={cardTitle}>Projects</div>
          <div>0 active (placeholder)</div>
        </div>
        <div style={card}>
          <div style={cardTitle}>Spend (30d)</div>
          <div>$0.00 (placeholder)</div>
        </div>
        <div style={card}>
          <div style={cardTitle}>Deploy health</div>
          <div>OK (placeholder)</div>
        </div>
      </div>
    </div>
  );
}

const card = {
  background: '#0b0b0b',
  border: '1px solid #1f2937',
  borderRadius: 12,
  padding: 16,
} as const;
const cardTitle = { fontWeight: 700, marginBottom: 6 } as const;
