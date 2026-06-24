import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { adminNavItems } from '@/config/navigation';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const shouldReduceMotion = useReducedMotion();

  const handleLogout = async () => {
    try {
      await logout();
      toast('Successfully logged out', 'success');
    } catch {
      toast('Failed to log out', 'error');
    }
  };

  const navContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 }
    }
  };

  const navItemVariants = {
    hidden: { opacity: 0, x: shouldReduceMotion ? 0 : -10 },
    show: { opacity: 1, x: 0, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen flex bg-canvas-base text-text-primary selection:bg-accent-primary/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border-subtle bg-canvas-elevated flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border-subtle">
          <h1 className="text-xl font-bold tracking-tight text-gradient">Admin Portal</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-accent-primary/10 text-accent-primary font-medium' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-border-subtle">
          <Link to="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors">
            Return to App
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 bg-canvas-base/80 backdrop-blur-md border-b border-border-subtle h-16 flex items-center justify-between px-6">
          <div className="md:hidden flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-bold tracking-tight text-gradient">Admin</h1>
          </div>
          <div className="hidden md:flex ml-auto items-center gap-4">
            <ThemeToggle />
            <span className="text-sm text-text-secondary font-medium">
              {user?.name} (Admin)
            </span>
            <button
              onClick={handleLogout}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-[280px] bg-canvas-elevated border-r border-border-subtle z-50 flex flex-col md:hidden shadow-2xl"
              >
                <div className="h-16 flex-none flex items-center justify-between px-6 border-b border-border-subtle">
                  <h2 className="text-lg font-bold text-gradient">Admin Menu</h2>
                  <div className="flex items-center gap-2">
                    <ThemeToggle />
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 -mr-2 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <motion.div 
                    className="py-4 px-4 space-y-1"
                    variants={navContainerVariants}
                    initial="hidden"
                    animate="show"
                  >
                    {adminNavItems.map((item) => {
                      const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
                      return (
                        <motion.div key={item.name} variants={navItemVariants}>
                          <Link
                            to={item.path}
                            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                              isActive 
                                ? 'bg-accent-primary/10 text-accent-primary font-medium' 
                                : 'text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5'
                            }`}
                          >
                            <item.icon className="w-5 h-5" />
                            {item.name}
                          </Link>
                        </motion.div>
                      );
                    })}
                    
                    <motion.div variants={navItemVariants}>
                      <Link
                        to="/dashboard"
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-colors mt-4 border border-border-subtle"
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        Return to App
                      </Link>
                    </motion.div>
                  </motion.div>

                  <div className="p-4 mt-2 border-t border-border-subtle">
                    <div className="px-3 mb-4 text-sm text-text-secondary truncate">
                      Signed in as<br/>
                      <strong className="text-text-primary truncate block">{user?.email}</strong>
                    </div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-text-primary rounded-xl transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        <motion.main 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-grow w-full max-w-7xl mx-auto md:p-6 p-4 overflow-y-auto"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};
