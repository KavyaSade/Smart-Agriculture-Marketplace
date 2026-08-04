import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

export default function ThemeToggle({ mobile = false }) {
  const { theme, toggleTheme } = useTheme();

  if (mobile) {
    return (
      <button 
        type="button"
        onClick={toggleTheme} 
        className="theme-toggle-mobile" 
        aria-label="Toggle theme"
      >
        {theme === 'light' ? (
          <>
            <Moon size={18} /> <span>Dark Theme</span>
          </>
        ) : (
          <>
            <Sun size={18} /> <span>Light Theme</span>
          </>
        )}
      </button>
    );
  }

  return (
    <button 
      type="button"
      onClick={toggleTheme} 
      className="theme-toggle" 
      aria-label="Toggle theme"
    >
      {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
    </button>
  );
}
