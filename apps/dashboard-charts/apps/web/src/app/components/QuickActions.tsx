export default function QuickActions() {
  const actions = ['Add Project', 'Allocate Funds', 'Generate Report'];

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="flex gap-3">
        {actions.map((a) => (
          <button
            key={a}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-medium transition"
          >
            {a}
          </button>
        ))}
      </div>
    </div>
  );
}
