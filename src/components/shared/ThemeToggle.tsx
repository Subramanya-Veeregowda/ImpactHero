import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  const shouldReduceMotion = useReducedMotion();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors flex items-center justify-center relative w-9 h-9 overflow-hidden"
      aria-label="Toggle theme"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === 'dark' ? (
          <motion.div
            key="sun"
            initial={{ opacity: 0, rotate: shouldReduceMotion ? 0 : -90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: shouldReduceMotion ? 0 : 90, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute flex items-center justify-center"
          >
            <Sun className="w-5 h-5" />
          </motion.div>
        ) : (
          <motion.div
            key="moon"
            initial={{ opacity: 0, rotate: shouldReduceMotion ? 0 : 90, scale: 0.8 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: shouldReduceMotion ? 0 : -90, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            className="absolute flex items-center justify-center"
          >
            <Moon className="w-5 h-5" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};
