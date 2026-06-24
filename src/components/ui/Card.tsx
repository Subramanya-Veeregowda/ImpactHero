import { forwardRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

export interface CardProps extends HTMLMotionProps<"div"> {
  glass?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className = '', glass = true, children, ...props }, ref) => {
    const shouldReduceMotion = useReducedMotion();

    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={shouldReduceMotion ? {} : { scale: 1.01, y: -2 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`p-6 ${glass ? 'glass-panel' : 'bg-canvas-elevated rounded-2xl'} hover:shadow-lg transition-shadow duration-300 ${className}`}
        {...props}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = 'Card';
