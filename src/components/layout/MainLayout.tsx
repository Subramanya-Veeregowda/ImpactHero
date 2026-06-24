import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LogOut, Menu, X, LayoutDashboard, Mail, MessageCircle } from 'lucide-react';
import { mainNavItems } from '@/config/navigation';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.2c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/>
    <path d="M9 18c-4.51 2-5-2-7-2"/>
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
    <rect width="4" height="12" x="2" y="9"/>
    <circle cx="4" cy="4" r="2"/>
  </svg>
);

export const MainLayout = () => {
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
    <div className="min-h-screen flex flex-col bg-canvas-base text-text-primary selection:bg-accent-primary/30">
      <header className="sticky top-0 z-30 glass-panel !rounded-none !border-x-0 !border-t-0 h-16 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          {user && (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 -ml-2 text-text-secondary hover:text-text-primary hover:bg-white/5 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}
          <h1 className="text-xl font-bold tracking-tight text-gradient">ImpactHero</h1>
        </div>
        
        {user && (
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex items-center gap-4 text-sm font-medium">
              {mainNavItems.map((item) => {
                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                return (
                  <Link 
                    key={item.name} 
                    to={item.path} 
                    className={`transition-colors ${isActive ? 'text-text-primary font-bold' : 'text-text-secondary hover:text-text-primary'}`}
                  >
                    {item.name}
                  </Link>
                );
              })}
              {user.role === 'admin' && (
                <Link to="/admin" className="text-accent-primary hover:text-accent-hover transition-colors">Admin Portal</Link>
              )}
            </nav>
            <div className="hidden md:flex items-center gap-4 border-l border-border-subtle pl-6">
              <ThemeToggle />
              <span className="text-sm text-text-secondary font-medium">
                {user.name} {user.role === 'admin' && '(Admin)'}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-text-secondary hover:text-text-primary hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && user && (
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
                <h2 className="text-lg font-bold text-gradient">Menu</h2>
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
                  {mainNavItems.map((item) => {
                    const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
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
                  
                  {user.role === 'admin' && (
                    <motion.div variants={navItemVariants}>
                      <Link
                        to="/admin"
                        className="flex items-center gap-3 px-3 py-3 rounded-xl text-accent-primary hover:bg-accent-primary/10 transition-colors mt-4 border border-accent-primary/20"
                      >
                        <LayoutDashboard className="w-5 h-5" />
                        Admin Portal
                      </Link>
                    </motion.div>
                  )}
                </motion.div>

                <div className="p-4 mt-2 border-t border-border-subtle">
                  <div className="px-3 mb-4 text-sm text-text-secondary truncate">
                    Signed in as<br/>
                    <strong className="text-text-primary truncate block">{user.email}</strong>
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
        className="flex-grow w-full max-w-7xl mx-auto md:p-6 p-4"
      >
        <Outlet />
      </motion.main>
      
      <footer className="border-t border-border-subtle bg-canvas-base py-8 px-6 text-center">
        <div className="flex justify-center items-center gap-6 mb-4">
          <a
            href="https://github.com/Subramanya-Veeregowda"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-text-primary transition-all duration-300 hover:scale-110"
            title="GitHub"
          >
            <GithubIcon className="w-5 h-5" />
          </a>
          <a
            href="https://www.linkedin.com/in/subramanyav2002"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-[#0a66c2] transition-all duration-300 hover:scale-110"
            title="LinkedIn"
          >
            <LinkedinIcon className="w-5 h-5" />
          </a>
          <a
            href="mailto:subramanyav3012@gmail.com"
            className="text-text-secondary hover:text-accent-primary transition-all duration-300 hover:scale-110"
            title="Email"
          >
            <Mail className="w-5 h-5" />
          </a>
          <a
            href="https://wa.me/qr/IH3W2XLDW7FHE1"
            target="_blank"
            rel="noopener noreferrer"
            className="text-text-secondary hover:text-[#25D366] transition-all duration-300 hover:scale-110"
            title="WhatsApp"
          >
            <MessageCircle className="w-5 h-5" />
          </a>
        </div>
        <div className="text-sm text-text-secondary font-medium">
          Built and Developed by Subramanya V
        </div>
      </footer>
    </div>
  );
};
