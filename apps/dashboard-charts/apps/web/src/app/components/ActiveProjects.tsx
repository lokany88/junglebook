'use client';

import ChartCard from './ChartCard';

const projects = [
  { name: 'ResQNow Platform', progress: 80 },
  { name: 'Lazy Manager Dashboard', progress: 55 },
  { name: 'Tool Deals Daily', progress: 30 },
];

export default function ActiveProjects() {
  return (
    <ChartCard title="Active Projects">
      <ul className="space-y-4">
        {projects.map((project) => (
          <li key={project.name}>
            <div className="flex justify-between mb-1">
              <span className="text-gray-700 dark:text-gray-300">
                {project.name}
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                {project.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full"
                style={{ width: `${project.progress}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </ChartCard>
  );
}
