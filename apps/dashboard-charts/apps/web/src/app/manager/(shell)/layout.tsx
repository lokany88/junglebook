import Sidebar from '@components/Sidebar';
import Topbar from '@components/Topbar';

export default function ManagerShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        color: '#e5e7eb',
        background: 'black',
      }}
    >
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Topbar />
        <main style={{ padding: 16 }}>{children}</main>
      </div>
    </div>
  );
}
