import React from 'react';

interface ChartCardProps {
  title: string;
  children?: React.ReactNode;
}

export default function ChartCard({ title, children }: ChartCardProps) {
  return (
    <div className="bg-gray-900 rounded-xl shadow p-4">
      <h2 className="text-lg font-semibold mb-2">{title}</h2>
      <div>{children}</div>
    </div>
  );
}
