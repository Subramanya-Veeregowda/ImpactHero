import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Mail, Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast('Please enter both email and password', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast('Successfully logged in!', 'success');
      navigate('/');
    } catch (err: any) {
      toast(err.message || 'Failed to login. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldReduceMotion = useReducedMotion();

  const formVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome back</h1>
        <p className="text-text-secondary">Enter your credentials to sign in to your account</p>
      </div>

      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-6"
        variants={formVariants}
        initial="hidden"
        animate="show"
      >
        <div className="space-y-4">
          <motion.div variants={itemVariants} className="relative">
            <Input
              id="email"
              type="email"
              label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={isSubmitting}
              className="pl-10"
              required
            />
            <div className="absolute top-[34px] left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-text-secondary" />
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="relative">
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="text-sm font-medium text-text-primary">
                Password
              </label>
              <Link 
                to="/forgot-password" 
                className="text-sm font-semibold text-accent-primary hover:text-accent-hover transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
                className="pl-10 pr-10"
                required
              />
              <div className="absolute top-[10px] left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-text-secondary" />
              </div>
              <button
                type="button"
                className="absolute top-[10px] right-0 pr-3 flex items-center"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-text-secondary hover:text-text-primary transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-text-secondary hover:text-text-primary transition-colors" />
                )}
              </button>
            </div>
          </motion.div>
        </div>

        <motion.div variants={itemVariants}>
          <Button
            type="submit"
          disabled={isSubmitting}
          fullWidth
          variant="primary"
        >
          {isSubmitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Sign in
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
        </motion.div>
      </motion.form>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-accent-primary hover:text-accent-hover transition-colors">
          Sign up
        </Link>
      </p>
    </div>
  );
};
