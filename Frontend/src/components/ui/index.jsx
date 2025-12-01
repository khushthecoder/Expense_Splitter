import React from 'react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const Card = ({ className, children, ...props }) => (
  <div className={cn("bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200", className)} {...props}>
    {children}
  </div>
);

export const Button = ({ className, variant = 'primary', size = 'md', ...props }) => {
  const variants = {
    primary: "bg-primary text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50 hover:bg-primary-hover hover:shadow-indigo-300 dark:hover:shadow-indigo-900/70",
    secondary: "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600",
    danger: "bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50",
    ghost: "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button 
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    />
  );
};

export const Input = ({ className, label, error, ...props }) => (
  <div className="w-full">
    {label && <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{label}</label>}
    <input 
      className={cn(
        "w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:bg-white dark:focus:bg-gray-700 focus:border-primary focus:ring-4 focus:ring-primary-light/20 dark:focus:ring-primary/30 outline-none transition-all duration-200",
        error && "border-red-500 dark:border-red-400 focus:border-red-500 dark:focus:border-red-400 focus:ring-red-100 dark:focus:ring-red-900/30",
        className
      )}
      {...props}
    />
    {error && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{error}</p>}
  </div>
);

export const Badge = ({ children, variant = 'default', className }) => {
  const variants = {
    default: "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
    success: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
    warning: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400",
    danger: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400",
    primary: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400",
  };

  return (
    <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
};
