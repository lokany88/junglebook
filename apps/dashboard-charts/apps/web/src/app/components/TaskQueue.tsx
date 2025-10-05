export default function TaskQueue() {
  const tasks = [
    { name: 'Set up Turso DB for metrics', due: 'Tomorrow' },
    { name: 'Finalize Tailwind config', due: 'Today' },
    { name: 'Deploy staging build', due: 'Friday' },
  ];

  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Task Queue</h2>
      <ul className="space-y-2">
        {tasks.map((t) => (
          <li
            key={t.name}
            className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-800 transition"
          >
            <span>{t.name}</span>
            <span className="text-xs text-gray-400">{t.due}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
