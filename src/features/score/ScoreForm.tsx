import { useState } from 'react';
import { useScores } from './useScores';
import { PlusCircle, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export const ScoreForm = () => {
  const [score, setScore] = useState('');
  const [date, setDate] = useState('');
  const { addScore } = useScores();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!score || !date) return;

    const numericScore = parseInt(score, 10);
    const success = await addScore(numericScore, date);
    
    if (success) {
      setScore('');
      setDate('');
    }
  };

  // Prevent selecting future dates
  const today = new Date().toISOString().split('T')[0];

  return (
    <Card>
      <h2 className="text-xl font-bold text-text-primary mb-6">Log New Score</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          id="score"
          type="number"
          min="1"
          max="45"
          required
          label="Stableford Score (1-45)"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          placeholder="e.g., 36"
        />

        <div className="relative">
          <Input
            id="date"
            type="date"
            required
            label="Date of Play"
            max={today}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="pl-10"
          />
          <div className="absolute top-[34px] left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-text-secondary" />
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          variant="primary"
          className="mt-2"
        >
          <PlusCircle className="mr-2 w-5 h-5" />
          Add Score
        </Button>
      </form>
    </Card>
  );
};
