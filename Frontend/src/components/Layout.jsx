import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { cn } from './ui';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout, notifications, unreadCount, theme, setTheme } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'My Groups', path: '/groups' },
    { icon: Users, label: 'My Friends', path: '/friends' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex transition-colors duration-200">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 fixed h-full z-30">
        <div className="p-6 border-b border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 dark:shadow-none">
              E
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white">Expense Splitter</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                isActive
                  ? "bg-primary-light/50 text-primary dark:bg-primary/20"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50 dark:border-gray-800 space-y-4">
          {/* Theme Toggle */}
          <div className="bg-gray-50 dark:bg-gray-800 p-1 rounded-xl flex items-center justify-between">
            {['light', 'dark', 'auto'].map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={cn(
                  "p-2 rounded-lg transition-all duration-200 flex-1 flex justify-center",
                  theme === t
                    ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                )}
                title={t === 'auto' ? 'System Theme' : `${t.charAt(0).toUpperCase() + t.slice(1)} Mode`}
              >
                {t === 'light' && <Sun size={18} />}
                {t === 'dark' && <Moon size={18} />}
                {t === 'auto' && <Monitor size={18} />}
              </button>
            ))}
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-medium"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-900 z-50 transform transition-transform duration-300 ease-in-out md:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex justify-between items-center border-b border-gray-50 dark:border-gray-800">
          <span className="font-bold text-xl text-gray-900 dark:text-white">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium",
                isActive
                  ? "bg-primary-light/50 text-primary dark:bg-primary/20"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
          <div className="mt-4 space-y-4">
            <div className="bg-gray-50 dark:bg-gray-800 p-1 rounded-xl flex items-center justify-between">
              {['light', 'dark', 'auto'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "p-2 rounded-lg transition-all duration-200 flex-1 flex justify-center",
                    theme === t
                      ? "bg-white dark:bg-gray-700 text-primary shadow-sm"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  )}
                  title={t === 'auto' ? 'System Theme' : `${t.charAt(0).toUpperCase() + t.slice(1)} Mode`}
                >
                  {t === 'light' && <Sun size={18} />}
                  {t === 'dark' && <Moon size={18} />}
                  {t === 'auto' && <Monitor size={18} />}
                </button>
              ))}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-medium"
            >
              <LogOut size={20} />
              Logout
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:bg-gray-50 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white hidden sm:block">
              {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-gray-400 hover:text-primary transition-colors rounded-full hover:bg-indigo-50 relative">
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                )}
              </button>
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-primary font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-200">{user?.name}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400 hidden md:block" />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6 max-w-7xl mx-auto w-full animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
