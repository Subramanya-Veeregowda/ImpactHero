import { useState, useEffect } from 'react';
import { useScores } from './useScores';
import { PlusCircle, Calendar, Loader2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface AddScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddScoreModal = ({ isOpen, onClose }: AddScoreModalProps) => {
  const [score, setScore] = useState('');
  const [date, setDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addScore } = useScores();

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setScore('');
      setDate('');
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!score || !date) return;

    setIsSubmitting(true);
    const numericScore = parseInt(score, 10);
    const success = await addScore(numericScore, date);
    setIsSubmitting(false);
    
    if (success) {
      onClose();
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Log New Score">
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
          disabled={isSubmitting}
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
            disabled={isSubmitting}
          />
          <div className="absolute top-[34px] left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-text-secondary" />
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            fullWidth
            variant="primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <PlusCircle className="mr-2 w-5 h-5" />
                Add Score
              </>
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
