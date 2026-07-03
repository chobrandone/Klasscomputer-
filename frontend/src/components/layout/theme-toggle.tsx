'use client';

import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggleTheme() {
    const dark = document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
    setIsDark(dark);
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle dark mode"
      className="rounded p-2 text-[#555555] transition-colors hover:bg-[#F5F5F5] hover:text-brand dark:text-[#999999] dark:hover:bg-[#1A1A1A] dark:hover:text-brand-light"
    >
      {mounted && isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
