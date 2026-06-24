import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { LogOut, LayoutDashboard, Users, Heart, Trophy, Gift } from 'lucide-react';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
      toast('Successfully logged out', 'success');
    } catch {
      toast('Failed to log out', 'error');
    }
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Users', path: '/admin/users', icon: <Users className="w-5 h-5" /> },
    { name: 'Charities', path: '/admin/charities', icon: <Heart className="w-5 h-5" /> },
    { name: 'Draws', path: '/admin/draws', icon: <Trophy className="w-5 h-5" /> },
    { name: 'Winners', path: '/admin/winners', icon: <Gift className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen flex bg-canvas-base text-text-primary selection:bg-accent-primary/30">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border-subtle bg-surface flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-border-subtle">
          <h1 className="text-xl font-bold tracking-tight text-gradient">Admin Portal</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-accent-primary/10 text-accent-primary font-medium' 
                    : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                }`}
              >
                {item.icon}
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
          <div className="md:hidden flex items-center">
             <h1 className="text-xl font-bold tracking-tight text-gradient">Admin</h1>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="text-sm text-text-secondary font-medium">
              {user?.name} (Admin)
            </span>
            <button
              onClick={handleLogout}
              className="p-2 text-text-secondary hover:text-text-primary hover:bg-white/10 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>
        
        <motion.main 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex-grow p-6 w-full max-w-7xl mx-auto overflow-y-auto"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};
