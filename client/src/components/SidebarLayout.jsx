import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard,
  FileText,
  Users,
  Video,
  Pill,
  Activity,
  Calendar,
  User,
  Settings,
  LogOut,
  Menu,
  Bell,
  Search,
  Sun,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export default function SidebarLayout({ children }) {
  const location = useLocation();
  const { logout, user } = useContext(AuthContext);
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer open
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop/tablet collapsed status

  const isActive = (path) => location.pathname === path;

  // Auto-collapse on tablet viewport
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setIsCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // run on initial mount
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const menuItems = {
    main: [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Prescriptions', path: '/prescriptions', icon: FileText },
      { name: 'Doctors', path: '/doctors', icon: Users },
      { name: 'Consultations', path: '/consultations/my', icon: Video },
      { name: 'Medicines', path: '/medicine-tracker', icon: Pill },
      { name: 'Vitals', path: '/vitals', icon: Activity },
      { name: 'Timeline', path: '/timeline', icon: Calendar },
    ],
    account: [
      { name: 'Profile', path: '/profile', icon: User },
      { name: 'Settings', path: '/profile#settings', icon: Settings }, // redirect to profile with hash/tab
    ]
  };

  // Helper function to render path titles dynamically
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard/analytics')) return 'Health Analytics';
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/upload')) return 'Upload Prescription';
    if (path.startsWith('/prescriptions')) return 'My Prescriptions';
    if (path.startsWith('/profile')) return 'My Profile';
    if (path.startsWith('/doctors')) return 'Find Doctors';
    if (path.startsWith('/consultations')) return 'Consultations';
    if (path.startsWith('/timeline')) return 'Health Timeline';
    if (path.startsWith('/medicine-tracker')) return 'Medicine Tracker';
    if (path.startsWith('/medicine-history')) return 'Reminder History';
    if (path.startsWith('/vitals')) return 'Vitals Log';
    if (path.startsWith('/symptom-checker')) return 'Symptom Checker';
    if (path.startsWith('/doctor/dashboard')) return 'Doctor Dashboard';
    if (path.startsWith('/consultation')) return 'Consultation Room';
    return 'HealthEase';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Brand Header */}
      <div className={`h-[72px] px-6 border-b border-border flex items-center justify-between`}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 bg-primary rounded-[10px] flex items-center justify-center text-white font-bold flex-shrink-0">
            H
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-text-primary animate-fadeIn">
              HEALTHEASE
            </span>
          )}
        </div>
        
        {/* Toggle Collapse Button for Large Screens */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg hover:bg-slate-100 text-text-secondary hover:text-text-primary transition-colors"
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-7">
        {/* MAIN Menu */}
        <div>
          {!isCollapsed && (
            <p className="text-[11px] font-bold text-text-secondary/60 uppercase tracking-widest px-3 mb-2">
              Main Menu
            </p>
          )}
          <ul className="space-y-1">
            {menuItems.main.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <li key={item.name} className="relative group">
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-[14px] transition-all duration-200 border-l-4 ${
                      active
                        ? 'bg-[#E6FFFA] text-primary border-primary font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                  </Link>

                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap shadow-md">
                      {item.name}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* ACCOUNT Menu */}
        <div>
          {!isCollapsed && (
            <p className="text-[11px] font-bold text-text-secondary/60 uppercase tracking-widest px-3 mb-2">
              Account
            </p>
          )}
          <ul className="space-y-1">
            {menuItems.account.map((item) => {
              const active = isActive(item.path);
              const Icon = item.icon;
              return (
                <li key={item.name} className="relative group">
                  <Link
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-[14px] transition-all duration-200 border-l-4 ${
                      active
                        ? 'bg-[#E6FFFA] text-primary border-primary font-semibold'
                        : 'text-text-secondary hover:text-text-primary hover:bg-slate-50 border-transparent'
                    }`}
                  >
                    <Icon size={20} className="flex-shrink-0" />
                    {!isCollapsed && <span className="text-sm font-medium">{item.name}</span>}
                  </Link>

                  {/* Tooltip for collapsed mode */}
                  {isCollapsed && (
                    <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap shadow-md">
                      {item.name}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Logout Footer */}
      <div className="p-4 border-t border-border bg-slate-50/50">
        <div className="relative group">
          <button
            onClick={logout}
            className={`flex items-center gap-3 px-3 py-3 rounded-[14px] text-text-secondary hover:text-danger hover:bg-danger/5 transition-all duration-200 border-l-4 border-transparent w-full`}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-bold">Log Out</span>}
          </button>
          
          {/* Tooltip for collapsed mode */}
          {isCollapsed && (
            <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-150 z-50 whitespace-nowrap shadow-md">
              Log Out
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      {/* 1. Desktop Sidebar */}
      <aside
        className={`hidden md:block bg-white border-r border-border h-full flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-[280px]'
        }`}
      >
        <SidebarContent />
      </aside>

      {/* 2. Mobile Drawer Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
          {/* Backdrop overlay */}
          <div
            className="absolute inset-0 bg-slate-950/40 backdrop-blur-xs"
            onClick={() => setSidebarOpen(false)}
          />
          
          {/* Drawer body */}
          <div className="relative w-[280px] h-full bg-white shadow-xl animate-slideUp flex flex-col">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-lg bg-slate-50 border border-border text-text-secondary hover:text-text-primary transition-colors"
            >
              <X size={16} />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* 3. Main View Area (Wrapper) */}
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        {/* Sticky Top Navigation Bar */}
        <header className="h-[72px] sticky top-0 bg-white border-b border-border px-6 flex items-center justify-between z-30 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Hamburger Trigger for Mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-slate-50 border border-border text-text-secondary hover:text-text-primary transition-colors md:hidden"
            >
              <Menu size={18} />
            </button>
            
            <h1 className="text-xl font-bold text-text-primary capitalize tracking-tight select-none">
              {getPageTitle()}
            </h1>
          </div>

          {/* Search, Notifications, Avatar, Theme toggle */}
          <div className="flex items-center gap-4">
            {/* Search Bar - hidden on small screens */}
            <div className="hidden sm:flex items-center relative w-60">
              <Search size={16} className="absolute left-3 text-text-secondary" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-slate-50 border border-border rounded-[14px] pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:bg-white transition-all duration-200"
              />
            </div>

            {/* Notification Bell */}
            <button
              className="p-2.5 rounded-[14px] hover:bg-slate-50 text-text-secondary hover:text-text-primary border border-transparent hover:border-border transition-all duration-200 relative"
              aria-label="View Notifications"
            >
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-danger ring-2 ring-white"></span>
            </button>

            {/* Theme Toggle Placeholder */}
            <button
              className="p-2.5 rounded-[14px] hover:bg-slate-50 text-text-secondary hover:text-text-primary border border-transparent hover:border-border transition-all duration-200"
              aria-label="Toggle Theme"
            >
              <Sun size={18} />
            </button>

            {/* User Avatar */}
            <div className="flex items-center gap-3 pl-2 border-l border-border">
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center font-bold text-primary text-sm select-none">
                {user?.name ? user.name[0].toUpperCase() : 'U'}
              </div>
              <div className="hidden lg:block text-left">
                <p className="text-sm font-semibold text-text-primary leading-tight">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-text-secondary leading-tight">
                  Patient Account
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Content Pane */}
        <main className="flex-1 overflow-y-auto px-6 py-8 md:px-8 bg-background">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
