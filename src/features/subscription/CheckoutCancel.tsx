import { useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const CheckoutCancel = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
        <XCircle className="w-10 h-10 text-red-400" />
      </div>
      
      <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-4">
        Checkout Cancelled
      </h1>
      
      <p className="text-text-secondary max-w-md mx-auto mb-8">
        Your subscription process was cancelled. You have not been charged. You can resume whenever you are ready.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
        <Button onClick={() => navigate('/upgrade')} variant="primary" className="flex-1">
          Try Again
        </Button>
        <Button onClick={() => navigate('/dashboard')} variant="secondary" className="flex-1">
          Return to Dashboard
        </Button>
      </div>
    </div>
  );
};
