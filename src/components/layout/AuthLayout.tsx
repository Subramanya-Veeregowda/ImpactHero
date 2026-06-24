import { Outlet, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen flex bg-canvas-base selection:bg-accent-primary/30">
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 md:px-24 py-12 relative z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-accent-primary/10 via-canvas-base to-canvas-base -z-10" />
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm mx-auto"
        >
          <div className="mb-10">
            <Link to="/" className="text-2xl font-bold tracking-tight text-gradient">
              ImpactHero
            </Link>
          </div>
          <Outlet />
        </motion.div>
      </div>

      {/* Right side - Image/Graphic */}
      <div className="hidden lg:flex lg:w-1/2 bg-canvas-elevated relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 to-accent-purple/20" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative z-10 text-center px-12"
        >
          <h2 className="text-4xl font-bold text-text-primary mb-6">Play for Purpose</h2>
          <p className="text-xl text-text-secondary max-w-md mx-auto">
            Join the community where every score counts towards making a real difference.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
