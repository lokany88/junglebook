import './globals.css';
import Sidebar from '@components/Sidebar';
import Topbar from '@components/Topbar';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen bg-gray-950 text-gray-100">
          <Sidebar />
          <div className="flex flex-col flex-1">
            <Topbar />
            <main className="p-6 overflow-y-auto">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
