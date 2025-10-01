export default function FinancialsPage() {
  return (
    <div style={{ maxWidth: 1000, margin: "0 auto" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Financials</h1>
      <div style={card}>Costs, burn, forecasts (placeholder)</div>
    </div>
  );
}
const card = { background: "#0b0b0b", border: "1px solid #1f2937", borderRadius: 12, padding: 16 } as const;

