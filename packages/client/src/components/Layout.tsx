import { Link, useLocation } from 'react-router-dom';
import { useAddExpense } from './AddExpenseModal';

const leftNavItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/items', label: 'Items', icon: '📋' },
];

const rightNavItems = [
  { path: '/reports', label: 'Reportes', icon: '📈' },
  { path: '/settings', label: 'Config', icon: '⚙️' },
];

function NavLink({ path, label, icon }: { path: string; label: string; icon: string }) {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      className={`flex flex-col items-center justify-center w-full h-full transition-colors ${
        isActive
          ? 'text-servo-400'
          : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  const { open } = useAddExpense();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-sm border-t border-slate-800 z-50">
        <div className="flex items-center h-16 max-w-lg mx-auto relative">
          {/* Left items */}
          <div className="flex flex-1 items-center justify-around">
            {leftNavItems.map(item => (
              <NavLink key={item.path} {...item} />
            ))}
          </div>

          {/* Center button */}
          <div className="flex items-center justify-center w-16">
            <button
              onClick={open}
              className="w-14 h-14 -mt-6 rounded-full bg-servo-600 hover:bg-servo-500 active:bg-servo-700 text-white shadow-lg shadow-servo-600/30 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              aria-label="Agregar gasto"
            >
              <svg
                width="28"
                height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
          </div>

          {/* Right items */}
          <div className="flex flex-1 items-center justify-around">
            {rightNavItems.map(item => (
              <NavLink key={item.path} {...item} />
            ))}
          </div>
        </div>
      </nav>

      <main className="pb-24 min-h-screen">
        {children}
      </main>
    </div>
  );
}
