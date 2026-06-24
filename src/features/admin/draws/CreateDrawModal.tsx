import { useState } from 'react';
import { supabase } from '@/services/supabase/client';
import { Button } from '@/components/ui/Button';
import { X, Loader2 } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface CreateDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateDrawModal = ({ isOpen, onClose, onSuccess }: CreateDrawModalProps) => {
  const [month, setMonth] = useState('');
  const [cutoffDate, setCutoffDate] = useState('');
  const [jackpot, setJackpot] = useState('');
  const [tier2, setTier2] = useState('');
  const [tier3, setTier3] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from('draws').insert({
        month: month + '-01',
        cutoff_date: new Date(cutoffDate).toISOString(),
        jackpot_amount: Number(jackpot),
        tier_2_prize: Number(tier2),
        tier_3_prize: Number(tier3),
        status: 'active'
      } as any);

      if (error) throw error;
      
      toast('Draw created successfully', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'Failed to create draw', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-canvas-base border border-border-subtle rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-border-subtle">
          <h2 className="text-xl font-bold text-text-primary">Create New Draw</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Draw Month</label>
            <input
              type="month"
              required
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-full px-4 py-2 bg-surface-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Entry Cutoff Date</label>
            <input
              type="datetime-local"
              required
              value={cutoffDate}
              onChange={(e) => setCutoffDate(e.target.value)}
              className="w-full px-4 py-2 bg-surface-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Jackpot Amount (£)</label>
            <input
              type="number"
              required
              min="0"
              value={jackpot}
              onChange={(e) => setJackpot(e.target.value)}
              className="w-full px-4 py-2 bg-surface-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
              placeholder="e.g. 10000"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Tier 2 Prize (£)</label>
              <input
                type="number"
                required
                min="0"
                value={tier2}
                onChange={(e) => setTier2(e.target.value)}
                className="w-full px-4 py-2 bg-surface-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                placeholder="e.g. 500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Tier 3 Prize (£)</label>
              <input
                type="number"
                required
                min="0"
                value={tier3}
                onChange={(e) => setTier3(e.target.value)}
                className="w-full px-4 py-2 bg-surface-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                placeholder="e.g. 50"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="primary" disabled={loading}>
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Draw
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
