/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../contexts/AppContext';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useApp();

  return (
    <button
      id="theme-toggle-btn"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      className="p-2.5 rounded-sm border-2 border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-[#1c1917]/70 text-slate-700 dark:text-slate-300 hover:text-[#020617] dark:hover:text-amber-400 hover:border-blue-200 dark:hover:border-amber-900/50 shadow-sm transition-all duration-300"
      aria-label="Toggle theme color"
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4 text-slate-800" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
      )}
    </button>
  );
};
