/**
 * @file DarkModeToggle.jsx
 * @description Animated dark-mode toggle switch for the Header.
 *
 * Renders a pill-shaped toggle with:
 *  - A sun icon (☀️)  visible when light mode is active
 *  - A moon icon (🌙) visible when dark mode is active
 *  - A sliding white thumb that moves between positions
 *  - Smooth colour + icon transitions (200 ms)
 *
 * Reads `isDarkMode` and calls `toggleTheme` from ThemeContext.
 *
 * @module components/common/DarkModeToggle
 */

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * DarkModeToggle — a self-contained theme toggle button.
 *
 * @returns {JSX.Element}
 */
export default function DarkModeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      id="dark-mode-toggle"
      type="button"
      onClick={toggleTheme}
      aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-checked={isDarkMode}
      role="switch"
      className={[
        // Track (pill)
        'relative inline-flex h-8 w-[3.25rem] items-center rounded-full',
        'border transition-colors duration-200 focus-visible:outline-none',
        'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
        'focus-visible:ring-offset-bg-surface flex-shrink-0',
        isDarkMode
          ? 'bg-primary/15 border-primary/30'
          : 'bg-bg-surface-hover border-border-base',
      ].join(' ')}
    >
      {/* ── Sliding thumb ──────────────────────────────────────────────── */}
      <span
        className={[
          'absolute flex h-6 w-6 items-center justify-center rounded-full',
          'shadow-sm transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]',
          isDarkMode
            ? 'translate-x-[1.625rem] bg-primary'
            : 'translate-x-1 bg-white border border-border-base',
        ].join(' ')}
        aria-hidden="true"
      >
        {/* Moon icon — visible in dark mode */}
        <Moon
          size={11}
          strokeWidth={2.5}
          className={[
            'absolute transition-all duration-200',
            isDarkMode
              ? 'opacity-100 scale-100 text-white'
              : 'opacity-0 scale-75 text-text-muted',
          ].join(' ')}
        />

        {/* Sun icon — visible in light mode */}
        <Sun
          size={11}
          strokeWidth={2.5}
          className={[
            'absolute transition-all duration-200',
            isDarkMode
              ? 'opacity-0 scale-75 text-white'
              : 'opacity-100 scale-100 text-amber-500',
          ].join(' ')}
        />
      </span>

      {/* ── Background icons (track decoration) ───────────────────────── */}
      {/* Sun on the left track — shown in dark mode as the "off" indicator */}
      <Sun
        size={10}
        className={[
          'absolute left-1.5 transition-opacity duration-200',
          isDarkMode ? 'opacity-30 text-primary' : 'opacity-0',
        ].join(' ')}
        aria-hidden="true"
      />
      {/* Moon on the right track — shown in light mode as the "on" indicator */}
      <Moon
        size={10}
        className={[
          'absolute right-1.5 transition-opacity duration-200',
          isDarkMode ? 'opacity-0' : 'opacity-30 text-text-muted',
        ].join(' ')}
        aria-hidden="true"
      />
    </button>
  );
}
