import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

export const PageContainer = ({ children, className = '' }: { children: ReactNode, className?: string }) => {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}
    >
      {children}
    </motion.div>
  );
};
