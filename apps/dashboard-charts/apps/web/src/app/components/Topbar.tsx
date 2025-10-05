'use client';

import { Search, User, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export default function Topbar() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      {/* Search */}
      <div className="flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md w-80">
        <Search className="h-5 w-5 text-gray-500 dark:text-gray-300 mr-2" />
        <input
          type="text"
          placeholder="Search..."
          className="bg-transparent flex-1 outline-none text-gray-800 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Right section */}
      <div className="flex items-center gap-6">
        {/* Dark mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          {darkMode ? (
            <Sun className="h-5 w-5 text-yellow-400" />
          ) : (
            <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer">
          <User className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          <span className="text-gray-800 dark:text-gray-100">Admin</span>
        </div>
      </div>
    </header>
  );
}
