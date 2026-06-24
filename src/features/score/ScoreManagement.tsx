import { ScoreForm } from './ScoreForm';
import { ScoreHistory } from './ScoreHistory';
import { PageContainer } from '@/components/ui/PageContainer';

export const ScoreManagement = () => {
  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Score Management</h1>
        <p className="text-text-secondary">
          Log your rounds to maintain your active pool of 5 scores. The oldest score will roll off automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <ScoreForm />
        </div>
        <div>
          <ScoreHistory />
        </div>
      </div>
    </PageContainer>
  );
};
