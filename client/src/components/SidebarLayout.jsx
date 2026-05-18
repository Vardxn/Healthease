import { Link, useLocation } from 'react-router-dom';
import { LogOut, Menu } from 'lucide-react';
import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';

export default function SidebarLayout({ children }) {
  const location = useLocation();
  const { logout } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex h-screen bg-gray-50 font-sans selection:bg-teal-100">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 bg-white px-4 py-4 flex items-center justify-between z-40 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Menu size={20} className="text-gray-900" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm font-bold">H</span>
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900">HEALTHEASE</span>
        </div>
        <div className="w-8"></div>
      </header>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`w-64 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] px-6 py-8 hidden md:flex flex-col justify-between transition-all duration-300 ${
          sidebarOpen
            ? 'fixed left-0 top-0 bottom-0 z-40 md:static md:z-auto'
            : 'md:static'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-10">
            <div className="w-8 h-8 bg-teal-600 rounded-lg"></div>
            <span className="text-xl font-semibold tracking-tight text-gray-900">HEALTHEASE</span>
          </div>

          <nav className="space-y-1">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 mt-6">
              Clinical
            </p>
            <Link
              to="/dashboard"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/dashboard')
                  ? 'text-teal-700 bg-teal-100 font-semibold'
                  : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/upload"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/upload')
                  ? 'text-teal-700 bg-teal-100 font-semibold'
                  : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              Upload Prescription
            </Link>
            <Link
              to="/prescriptions"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/prescriptions')
                  ? 'text-teal-700 bg-teal-100 font-semibold'
                  : 'text-gray-600 hover:text-teal-600 hover:bg-teal-50'
              }`}
            >
              My Prescriptions
            </Link>

            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3 mt-8">
              Account
            </p>
            <Link
              to="/profile"
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/profile')
                  ? 'text-gray-900 bg-gray-200 font-semibold'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              Profile
            </Link>
          </nav>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 w-full overflow-y-auto pt-16 md:pt-0 px-4 py-6 md:px-10 md:py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
