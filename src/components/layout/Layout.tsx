// Layout principal de l'application
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950">
      <Navbar />
      <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
