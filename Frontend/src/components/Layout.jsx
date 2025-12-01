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
  Moon
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

  const toggleTheme = () => {
    // Simple, predictable toggle between light and dark
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Users, label: 'My Groups', path: '/groups' },
    { icon: Users, label: 'My Friends', path: '/friends' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 fixed h-full z-30">
        <div className="p-6 border-b border-gray-50 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50">
              E
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-gray-100">Expense Splitter</span>
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
                  ? "bg-primary-light/50 dark:bg-primary/20 text-primary dark:text-primary-light"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 font-medium"
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
        "fixed inset-y-0 left-0 w-64 bg-white dark:bg-gray-800 z-50 transform transition-transform duration-300 ease-in-out md:hidden",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex justify-between items-center border-b border-gray-50 dark:border-gray-700">
          <span className="font-bold text-xl text-gray-900 dark:text-gray-100">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} className="text-gray-500 dark:text-gray-400" />
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
                  ? "bg-primary-light/50 dark:bg-primary/20 text-primary dark:text-primary-light"
                  : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
              )}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all duration-200 font-medium mt-4"
          >
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col">
        {/* Top Navbar */}
        <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md sticky top-0 z-20 border-b border-gray-100 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg"
            >
              <Menu size={24} />
            </button>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 hidden sm:block">
              {navItems.find(i => i.path === location.pathname)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-6">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-light transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
            </button>

            {/* Notifications */}
            <div className="relative">
              <button className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-light transition-colors rounded-full hover:bg-indigo-50 dark:hover:bg-gray-700 relative">
                <Bell size={24} />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 dark:bg-red-400 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </button>
            </div>

            {/* User Profile */}
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900 dark:to-purple-900 rounded-full flex items-center justify-center text-primary dark:text-primary-light font-bold">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{user?.name}</p>
                </div>
                <ChevronDown size={16} className="text-gray-400 dark:text-gray-500 hidden md:block" />
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
