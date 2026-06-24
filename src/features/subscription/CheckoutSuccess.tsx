import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const CheckoutSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Optionally fire analytics or re-fetch user session here
  }, []);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-success" />
      </div>
      
      <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-4">
        Subscription Confirmed!
      </h1>
      
      <p className="text-text-secondary max-w-md mx-auto mb-8">
        Thank you for subscribing. Your account has been upgraded and you now have full access to enter draws and track your impact.
      </p>

      <Button onClick={() => navigate('/dashboard')} size="lg" className="min-w-[200px]">
        Go to Dashboard
      </Button>
    </div>
  );
};
