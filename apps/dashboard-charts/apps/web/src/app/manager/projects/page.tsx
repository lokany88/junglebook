export default function ProjectsPage() {
  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 12 }}>Projects</h1>
      <div style={card}>No projects yet. (Placeholder for Create/Build/Deploy flows)</div>
    </div>
  );
}
const card = {
  background: '#0b0b0b',
  border: '1px solid #1f2937',
  borderRadius: 12,
  padding: 16,
} as const;
