import React, { useContext, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotifications } from '../context/NotificationContext';
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
  Moon,
  X,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Printer,
  ShieldCheck,
  Eye,
  Trash
} from 'lucide-react';

export default function SidebarLayout({ children }) {
  const location = useLocation();
  const { logout, user } = useContext(AuthContext);
  const { theme, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false); // Mobile drawer open
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop/tablet collapsed status
  const [showNotifications, setShowNotifications] = useState(false);

  const isActive = (path) => location.pathname === path;

  const getGroupedNotifications = () => {
    const today = [];
    const yesterday = [];
    const earlier = [];
    const now = Date.now();

    notifications.forEach((n) => {
      const diff = now - new Date(n.timestamp).getTime();
      const diffHours = diff / (1000 * 60 * 60);
      if (diffHours < 24) {
        today.push(n);
      } else if (diffHours < 48) {
        yesterday.push(n);
      } else {
        earlier.push(n);
      }
    });

    return { today, yesterday, earlier };
  };

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
      { name: 'AI Assistant', path: '/assistant', icon: Sparkles },
      { name: 'PDF Reports', path: '/exports', icon: Printer },
    ],
    account: [
      { name: 'Profile', path: '/profile', icon: User },
      { name: 'Settings', path: '/profile#settings', icon: Settings }, // redirect to profile with hash/tab
      { name: 'Admin Panel', path: '/admin/dashboard', icon: ShieldCheck },
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
    if (path.startsWith('/assistant')) return 'AI Health Assistant';
    if (path.startsWith('/exports')) return 'PDF Report Center';
    if (path.startsWith('/admin/dashboard')) return 'Admin Control Center';
    return 'HealthEase';
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-surface">
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
          className="hidden md:flex p-1.5 rounded-lg hover:bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors"
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
                        ? 'bg-[rgba(20,184,166,0.12)] text-primary-dark border-primary font-medium'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary border-transparent'
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
                        ? 'bg-[rgba(20,184,166,0.12)] text-primary-dark border-primary font-medium'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary border-transparent'
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
      <div className="p-4 border-t border-border bg-surface-secondary/50">
        <div className="relative group">
          <button
            onClick={logout}
            className={`flex items-center gap-3 px-3 py-3 rounded-[14px] text-text-secondary hover:text-danger hover:bg-danger/5 transition-all duration-200 border-l-4 border-transparent w-full`}
          >
            <LogOut size={20} className="flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Log Out</span>}
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
        className={`hidden md:block bg-surface border-r border-border h-full flex-shrink-0 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-[260px]'
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
          <div className="relative w-[260px] h-full bg-surface shadow-xl animate-slideUp flex flex-col">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-lg bg-surface-secondary border border-border text-text-secondary hover:text-text-primary transition-colors"
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
        <header className="h-[72px] sticky top-0 bg-surface border-b border-border px-6 flex items-center justify-between z-30 flex-shrink-0">
          <div className="flex items-center gap-4">
            {/* Hamburger Trigger for Mobile */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl hover:bg-surface-secondary border border-border text-text-secondary hover:text-text-primary transition-colors md:hidden"
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
            <div className="hidden sm:flex items-center relative w-60 max-w-[420px]">
              <Search size={16} className="absolute left-3 text-text-secondary" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full bg-surface-secondary border border-border rounded-[14px] pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary focus:bg-surface transition-all duration-200 text-text-primary"
              />
            </div>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2.5 rounded-[14px] hover:bg-surface-secondary text-text-secondary hover:text-text-primary border border-transparent hover:border-border transition-all duration-200 relative"
                aria-label="View Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-danger ring-2 ring-white dark:ring-slate-900"></span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-80 sm:w-[400px] bg-surface border border-border shadow-lg rounded-custom z-50 p-4 space-y-3 animate-slideUp">
                    <div className="flex items-center justify-between border-b border-border pb-2">
                      <span className="font-extrabold text-xs text-text-primary">Notifications ({unreadCount})</span>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[10px] font-bold text-primary hover:underline bg-transparent border-0"
                        >
                          Mark all as read
                        </button>
                      )}
                    </div>

                    <div className="max-h-[300px] overflow-y-auto space-y-3 pr-1 divide-y divide-border/50">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-text-secondary text-xs flex flex-col items-center justify-center gap-2">
                          <Bell size={24} className="text-text-secondary/35" />
                          <p className="font-bold">No notifications yet</p>
                          <p className="text-[10px] opacity-75">New healthcare updates will appear here.</p>
                        </div>
                      ) : (
                        Object.entries(getGroupedNotifications()).map(([groupName, items]) => {
                          if (items.length === 0) return null;
                          return (
                            <div key={groupName} className="pt-2.5 first:pt-0">
                              <p className="text-[9px] font-black text-text-secondary/65 uppercase tracking-wider mb-2">
                                {groupName}
                              </p>
                              <div className="space-y-2">
                                {items.map(n => (
                                  <div
                                    key={n.id}
                                    onClick={() => {
                                      markAsRead(n.id);
                                    }}
                                    className={`p-2 rounded-lg flex gap-2.5 cursor-pointer hover:bg-surface-secondary transition-colors relative ${n.read ? 'opacity-65' : ''}`}
                                  >
                                    {!n.read && (
                                      <div className="absolute left-0 top-2 bottom-2 w-0.75 bg-primary rounded-r" />
                                    )}
                                    <div className="flex-1 min-w-0">
                                      <div className="flex justify-between items-start gap-1">
                                        <p className={`font-bold text-[11px] truncate ${n.read ? 'text-text-secondary' : 'text-text-primary'}`}>
                                          {n.title}
                                        </p>
                                      </div>
                                      <p className="text-[10px] text-text-secondary mt-0.5 leading-relaxed">{n.message}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="border-t border-border pt-2 text-center">
                      <Link
                        to="/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
                      >
                        View All Notifications <ChevronRight size={12} />
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-[14px] hover:bg-surface-secondary text-text-secondary hover:text-text-primary border border-transparent hover:border-border transition-all duration-200"
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
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
