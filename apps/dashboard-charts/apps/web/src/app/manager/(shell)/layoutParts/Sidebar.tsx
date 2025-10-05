'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const nav = [
  { href: '/manager', label: 'Overview' },
  { href: '/manager/metrics', label: 'Metrics & Health' },
  { href: '/manager/ideas', label: 'Idea Forge' },
  { href: '/manager/projects', label: 'Projects' },
  { href: '/manager/financials', label: 'Financials' },
  { href: '/manager/automations', label: 'Automations' },
  { href: '/manager/governance', label: 'Governance & Safety' },
  { href: '/manager/access', label: 'Users & Access' },
  { href: '/manager/ai-console', label: 'AI Console' },
];

export default function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      style={{
        width: 260,
        borderRight: '1px solid #1f2937',
        padding: 16,
        position: 'sticky',
        top: 0,
        height: '100vh',
        background: '#0b0b0b',
      }}
    >
      <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>
        Lazy Manager
      </div>
      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 16 }}>
        Jungle Book
      </div>

      <nav style={{ display: 'grid', gap: 6 }}>
        {nav.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '8px 10px',
                borderRadius: 8,
                textDecoration: 'none',
                color: active ? 'white' : '#d1d5db',
                background: active ? '#111827' : 'transparent',
                border: active ? '1px solid #374151' : '1px solid transparent',
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
