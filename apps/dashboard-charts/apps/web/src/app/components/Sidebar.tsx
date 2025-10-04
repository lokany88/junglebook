import Link from 'next/link';
import { HomeIcon, BriefcaseIcon, DollarSignIcon, SettingsIcon } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: HomeIcon },
  { href: '/dashboard/projects', label: 'Projects', icon: BriefcaseIcon },
  { href: '/dashboard/finances', label: 'Finances', icon: DollarSignIcon },
  { href: '/dashboard/settings', label: 'Settings', icon: SettingsIcon },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 p-4">
      <h1 className="text-2xl font-bold text-brand mb-6">Lazy Manager</h1>
      <nav className="flex flex-col gap-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-800 transition"
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
