import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ScoreHistory } from './ScoreHistory';
import { RollingScoreDisplay } from './RollingScoreDisplay';
import { AddScoreModal } from './AddScoreModal';
import { PageContainer } from '@/components/ui/PageContainer';
import { Button } from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { useScores } from './useScores';
import { useSubscriptionStatus } from '../subscription/useSubscriptionStatus';

export const ScoreManagement = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoading: scoresLoading } = useScores();
  const { isActive, isLoading: subLoading } = useSubscriptionStatus();

  // Open modal automatically if navigating from dashboard with "add" intent
  useEffect(() => {
    if (location.pathname === '/scores/add' && !subLoading) {
      if (isActive) {
        setIsAddModalOpen(true);
      } else {
        navigate('/upgrade');
      }
      // Clean up the URL to prevent reopening on reload
      navigate('/scores', { replace: true });
    }
  }, [location, navigate, isActive, subLoading]);

  const handleAddClick = () => {
    if (isActive) {
      setIsAddModalOpen(true);
    } else {
      navigate('/upgrade');
    }
  };

  return (
    <PageContainer>
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <div className="w-full md:w-auto">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Score Management</h1>
          <p className="text-text-secondary max-w-2xl">
            Log your rounds to maintain your active pool of 5 scores. The oldest score will roll off automatically.
          </p>
        </div>
        <div className="w-full md:w-auto mt-4 md:mt-0">
          <Button variant="primary" onClick={handleAddClick} disabled={subLoading} className="w-full md:w-auto justify-center">
            <Plus className="h-4 w-4 mr-2" />
            Add Score
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-8">
          <RollingScoreDisplay />
          <div className="p-6 rounded-xl border border-border-subtle bg-canvas-base">
            <h3 className="font-semibold text-text-primary mb-2">How it works</h3>
            <ul className="text-sm text-text-secondary space-y-3 list-disc pl-4">
              <li>Enter your 18-hole Stableford points (1-45).</li>
              <li>You can only log one score per date.</li>
              <li>We maintain your latest 5 scores in a rolling window.</li>
              <li>These scores are automatically entered into the monthly charity draws!</li>
            </ul>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          {scoresLoading ? (
            <div className="h-64 flex items-center justify-center border border-border-subtle rounded-xl">
              <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 bg-white/10 rounded-full mb-4"></div>
                <div className="h-4 w-32 bg-white/10 rounded"></div>
              </div>
            </div>
          ) : (
            <ScoreHistory />
          )}
        </div>
      </div>

      <AddScoreModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </PageContainer>
  );
};
