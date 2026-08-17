'use client';

import { useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

const STORAGE_KEY =
  'gold-shop-theme';

export default function ThemeToggle() {
  const [theme, setTheme] =
    useState<Theme>('dark');

  useEffect(() => {
    try {
      const saved =
        localStorage.getItem(
          STORAGE_KEY
        );

      const initialTheme =
        saved === 'light'
          ? 'light'
          : 'dark';

      setTheme(initialTheme);

      document.documentElement.dataset.theme =
        initialTheme;
    } catch {
      document.documentElement.dataset.theme =
        'dark';
    }
  }, []);

  function toggleTheme() {
    const nextTheme: Theme =
      theme === 'dark'
        ? 'light'
        : 'dark';

    setTheme(nextTheme);

    document.documentElement.dataset.theme =
      nextTheme;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        nextTheme
      );
    } catch {
      // localStorage ممکن است در برخی محیط‌ها در دسترس نباشد
    }
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={
        theme === 'dark'
          ? 'فعال کردن حالت روشن'
          : 'فعال کردن حالت تاریک'
      }
      title={
        theme === 'dark'
          ? 'حالت روشن'
          : 'حالت تاریک'
      }
      className="themeToggle"
    >
      <span className="themeToggleIcon">
        {theme === 'dark'
          ? '☀'
          : '☾'}
      </span>

      <span className="themeToggleText">
        {theme === 'dark'
          ? 'روشن'
          : 'تاریک'}
      </span>
    </button>
  );
}