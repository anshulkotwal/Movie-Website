// components/DarkModeToggle.jsx
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const DarkModeToggle = () => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <motion.button
      className="fixed top-4 right-4 z-50 p-2 rounded-full shadow-lg bg-white dark:bg-gray-800"
      onClick={() => setIsDark(!isDark)}
      whileTap={{ scale: 0.8 }}
      initial={false}
      animate={{ rotate: isDark ? 180 : 0 }}
    >
      {isDark ? (
        <svg className="w-6 h-6 text-yellow-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M12 3v1m0 16v1m8.66-9h-1M4.34 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M12 5a7 7 0 000 14a7 7 0 000-14z" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-gray-700 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M21 12.79A9 9 0 1111.21 3a7 7 0 0010.08 9.79z" />
        </svg>
      )}
    </motion.button>
  );
};

export default DarkModeToggle;
