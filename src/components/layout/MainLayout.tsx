import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LogOut } from 'lucide-react';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await logout();
      toast('Successfully logged out', 'success');
    } catch {
      toast('Failed to log out', 'error');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas-base text-text-primary selection:bg-accent-primary/30">
      <header className="sticky top-0 z-30 glass-panel !rounded-none !border-x-0 !border-t-0 h-16 flex items-center justify-between px-6">
        <h1 className="text-xl font-bold tracking-tight text-gradient">ImpactHero</h1>
        
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-text-secondary font-medium">
              {user.name} {user.role === 'admin' && '(Admin)'}
            </span>
            <button
              onClick={handleLogout}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        )}
      </header>
      
      <motion.main 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-grow p-6 w-full max-w-7xl mx-auto"
      >
        <Outlet />
      </motion.main>
      
      <footer className="border-t border-border-subtle text-text-secondary p-6 text-center text-sm">
        &copy; {new Date().getFullYear()} ImpactHero. All rights reserved.
      </footer>
    </div>
  );
};
