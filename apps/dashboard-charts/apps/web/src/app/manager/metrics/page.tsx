'use client';

import { useEffect, useMemo, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

type Metric = { id: number; label: string; value: number; created_at: string };

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(false);
  const [label, setLabel] = useState('');
  const [value, setValue] = useState<string>('');

  async function load() {
    setLoading(true);
    try {
      const res = await fetch('/api/metrics?limit=200', { cache: 'no-store' });
      const json = await res.json();
      setMetrics(json.rows ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 5000);
    return () => clearInterval(t);
  }, []);

  async function addMetric(e: React.FormEvent) {
    e.preventDefault();
    const v = Number(value);
    if (!label.trim() || Number.isNaN(v)) {
      alert('Provide a label and numeric value.');
      return;
    }
    const res = await fetch('/api/metrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: label.trim(), value: v }),
    });
    if (res.ok) {
      setLabel('');
      setValue('');
      load();
    } else {
      const err = await res.json().catch(() => ({}));
      alert(`Insert failed: ${err.error ?? res.statusText}`);
    }
  }

  async function deleteMetric(id: number) {
    const res = await fetch(`/api/metrics/${id}`, { method: 'DELETE' });
    if (res.ok) load();
    else alert('Delete failed');
  }

  const chartData = useMemo(() => {
    const reversed = [...metrics].reverse();
    return {
      labels: reversed.map((m) => new Date(m.created_at).toLocaleTimeString()),
      datasets: [{ label: 'Metric Values', data: reversed.map((m) => m.value) }],
    };
  }, [metrics]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      plugins: { legend: { display: true }, tooltip: { enabled: true } },
    }),
    [],
  );

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Metrics & Health</h1>

      <form onSubmit={addMetric} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          placeholder="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          style={{
            flex: 1,
            padding: 8,
            border: '1px solid #1f2937',
            borderRadius: 8,
            background: 'black',
            color: 'white',
          }}
        />
        <input
          placeholder="value (number)"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          style={{
            width: 200,
            padding: 8,
            border: '1px solid #1f2937',
            borderRadius: 8,
            background: 'black',
            color: 'white',
          }}
        />
        <button type="submit" style={btn}>
          Add Metric
        </button>
      </form>

      <div style={card}>
        <Line data={chartData} options={chartOptions} />
      </div>

      <div style={card}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '80px 1fr 120px 220px 100px',
            gap: 12,
            fontWeight: 600,
            paddingBottom: 8,
            borderBottom: '1px solid #1f2937',
          }}
        >
          <div>ID</div>
          <div>Label</div>
          <div>Value</div>
          <div>Created At</div>
          <div>Actions</div>
        </div>
        {loading ? (
          <div style={{ padding: 12 }}>Loading…</div>
        ) : metrics.length === 0 ? (
          <div style={{ padding: 12 }}>No metrics yet</div>
        ) : (
          metrics.map((m) => (
            <div
              key={m.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px 1fr 120px 220px 100px',
                gap: 12,
                padding: '8px 0',
                borderBottom: '1px solid #111827',
              }}
            >
              <div>{m.id}</div>
              <div>{m.label}</div>
              <div>{m.value}</div>
              <div>{new Date(m.created_at).toLocaleString()}</div>
              <div>
                <button onClick={() => deleteMetric(m.id)} style={dangerBtn}>
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const card = {
  background: '#0b0b0b',
  border: '1px solid #1f2937',
  borderRadius: 12,
  padding: 16,
  marginBottom: 16,
} as const;
const btn = {
  padding: '8px 12px',
  borderRadius: 8,
  border: '1px solid #1f2937',
  background: 'white',
  color: 'black',
  cursor: 'pointer',
} as const;
const dangerBtn = {
  padding: '6px 12px',
  borderRadius: 8,
  border: '1px solid #ef4444',
  background: 'transparent',
  color: '#ef4444',
  cursor: 'pointer',
} as const;
