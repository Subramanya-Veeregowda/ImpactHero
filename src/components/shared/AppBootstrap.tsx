import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { AppSplashLoader } from './AppSplashLoader';

export const AppBootstrap = ({ children }: { children: ReactNode }) => {
  const { isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const startTime = Date.now();

    if (!isLoading) {
      const elapsed = Date.now() - startTime;
      const minDuration = 1200;
      const delay = Math.max(minDuration - elapsed, 0);

      const timer = setTimeout(() => {
        setShowSplash(false);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  return (
    <>
      <AnimatePresence>
        {showSplash && <AppSplashLoader />}
      </AnimatePresence>
      {!showSplash && children}
    </>
  );
};
