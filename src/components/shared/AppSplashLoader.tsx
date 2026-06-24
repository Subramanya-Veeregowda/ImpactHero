import { useEffect, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ShieldCheck, Zap } from 'lucide-react';

const MESSAGES = [
  'Connecting Communities...',
  'Loading Dashboard...',
  'Preparing Impact...',
  'Almost Ready...'
];

export const AppSplashLoader = () => {
  const [messageIndex, setMessageIndex] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-canvas-base"
    >
      {/* Background ambient glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/5 rounded-full blur-[100px]" />
      </div>

      <div className="flex flex-col items-center justify-center relative z-10 w-full max-w-sm px-6">
        {/* Logo Container */}
        <motion.div
          initial={{ scale: shouldReduceMotion ? 1 : 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="relative mb-6"
        >
          <div className="absolute inset-0 bg-accent-primary/20 blur-2xl rounded-full" />
          <div className="relative glass-panel p-6 rounded-full border border-border-focus flex items-center justify-center">
            <Zap className="w-10 h-10 text-accent-primary fill-accent-primary/20" />
          </div>
        </motion.div>

        {/* Brand Text */}
        <motion.div
          initial={{ y: shouldReduceMotion ? 0 : 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
          className="text-center mb-8"
        >
          <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">ImpactHero</h1>
          <p className="text-xs font-semibold tracking-widest text-text-secondary uppercase">
            Every Score Creates Impact
          </p>
        </motion.div>

        {/* Progress Bar Container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="w-full mb-4"
        >
          <div className="h-1 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden relative">
            <motion.div
              className="absolute top-0 left-0 bottom-0 bg-accent-primary w-1/3 rounded-full"
              animate={shouldReduceMotion ? {} : {
                x: ['-100%', '300%'],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
          </div>
        </motion.div>

        {/* Rotating Messages */}
        <div className="h-6 relative w-full flex justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: shouldReduceMotion ? 0 : -5 }}
              transition={{ duration: 0.3 }}
              className="text-sm text-text-secondary absolute"
            >
              {MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute bottom-8 flex items-center justify-center gap-2 text-xs text-text-muted"
      >
        <ShieldCheck className="w-4 h-4" />
        <span>SECURED BY STRIPE & CLOUDFLARE</span>
      </motion.div>
    </motion.div>
  );
};
