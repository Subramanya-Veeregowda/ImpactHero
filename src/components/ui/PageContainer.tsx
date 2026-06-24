import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export const PageContainer = ({ children, className = '' }: { children: ReactNode, className?: string }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${className}`}
    >
      {children}
    </motion.div>
  );
};
