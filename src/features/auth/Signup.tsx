import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Mail, Lock, User, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const Signup = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      toast('Please fill out all fields', 'error');
      return;
    }

    if (password.length < 6) {
      toast('Password must be at least 6 characters', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await signup(email, password, fullName);
      toast('Account created successfully!', 'success');
      navigate('/');
    } catch (err: any) {
      toast(err.message || 'Failed to create account. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Create an account</h1>
        <p className="text-text-secondary">Join ImpactHero to start making a difference.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <Input
              id="fullName"
              type="text"
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              disabled={isSubmitting}
              className="pl-10"
              required
            />
            <div className="absolute top-[34px] left-0 pl-3 flex items-center pointer-events-none">
              <User className="h-5 w-5 text-text-secondary" />
            </div>
          </div>

          <div className="relative">
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
          </div>

          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-1">
              Password
            </label>
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
            <p className="mt-1 text-xs text-text-secondary">Must be at least 6 characters</p>
          </div>
        </div>

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
              Sign up
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-accent-primary hover:text-accent-hover transition-colors">
          Log in
        </Link>
      </p>
    </div>
  );
};
