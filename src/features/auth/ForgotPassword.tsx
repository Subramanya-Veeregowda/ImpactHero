import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Mail, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const { forgotPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast('Please enter your email address', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(email);
      setIsSuccess(true);
      toast('Password reset email sent (if email delivery is enabled)', 'success');
    } catch (err: any) {
      // Don't block UI if email delivery fails or rate limits are hit in dev.
      // We still show success conceptually, or gracefully show the error.
      if (err.message?.includes('rate limit') || err.message?.includes('disabled')) {
        toast('Email provider is rate-limited or disabled in development.', 'info');
      } else {
        toast(err.message || 'Failed to send reset email. Please try again.', 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-accent-primary/10 mb-4">
          <CheckCircle2 className="h-6 w-6 text-accent-primary" />
        </div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Check your email</h1>
        <p className="text-text-secondary mb-8">
          We've sent a password reset link to <strong>{email}</strong>
        </p>
        <Link to="/login">
          <Button fullWidth variant="primary">
            Return to log in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Reset password</h1>
        <p className="text-text-secondary">Enter your email and we'll send you a link to reset your password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
              Send reset link
              <ArrowRight className="ml-2 w-4 h-4" />
            </>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-text-secondary">
        Remember your password?{' '}
        <Link to="/login" className="font-semibold text-accent-primary hover:text-accent-hover transition-colors">
          Back to log in
        </Link>
      </p>
    </div>
  );
};
