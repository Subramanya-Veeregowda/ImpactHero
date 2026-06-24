import { useState } from 'react';
import { supabase } from '@/services/supabase/client';
import { Button } from '@/components/ui/Button';
import { X, Loader2, Play, CheckCircle } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

interface ExecuteDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  drawId: string;
  month: string;
  onSuccess: () => void;
}

export const ExecuteDrawModal = ({ isOpen, onClose, drawId, month, onSuccess }: ExecuteDrawModalProps) => {
  const [numbers, setNumbers] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [simulationResults, setSimulationResults] = useState<any>(null);
  const { toast } = useToast();

  if (!isOpen) return null;

  const parseNumbers = () => {
    const arr = numbers.split(',').map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
    return arr;
  };

  const handleSimulate = async () => {
    const winningNumbers = parseNumbers();
    if (winningNumbers.length !== 5) {
      toast('Please enter exactly 5 winning numbers.', 'error');
      return;
    }

    setLoading(true);
    setSimulationResults(null);
    try {
      const { data, error } = await supabase.functions.invoke('execute-draw', {
        body: {
          drawId,
          winningNumbers,
          isSimulation: true
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setSimulationResults(data.results);
      toast('Simulation completed', 'success');
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'Simulation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleExecute = async () => {
    const winningNumbers = parseNumbers();
    if (winningNumbers.length !== 5) return;

    if (!confirm('Are you sure you want to execute this draw? This cannot be undone.')) {
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('execute-draw', {
        body: {
          drawId,
          winningNumbers,
          isSimulation: false
        }
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast('Draw executed successfully!', 'success');
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast(err.message || 'Execution failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const generateRandom = () => {
    const nums = new Set<number>();
    while(nums.size < 5) {
      nums.add(Math.floor(Math.random() * 45) + 1);
    }
    setNumbers(Array.from(nums).sort((a,b) => a-b).join(', '));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-canvas-base border border-border-subtle rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-border-subtle shrink-0">
          <h2 className="text-xl font-bold text-text-primary">Execute Draw: {new Date(month + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">Winning Numbers (Comma separated, 1-45)</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={numbers}
                onChange={(e) => setNumbers(e.target.value)}
                className="flex-1 px-4 py-2 bg-surface-secondary border border-border-subtle rounded-lg text-text-primary focus:outline-none focus:border-accent-primary"
                placeholder="e.g. 5, 12, 23, 34, 42"
              />
              <Button variant="secondary" onClick={generateRandom}>Randomize</Button>
            </div>
          </div>

          <div className="flex justify-center">
            <Button variant="secondary" onClick={handleSimulate} disabled={loading || !numbers}>
              {loading && !simulationResults ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              Simulate Draw
            </Button>
          </div>

          {simulationResults && (
            <div className="p-4 bg-canvas-elevated rounded-xl border border-border-subtle space-y-4">
              <h3 className="font-bold text-text-primary text-lg">Simulation Results</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-surface-secondary rounded-lg">
                  <div className="text-sm text-text-secondary">Eligible Participants</div>
                  <div className="text-xl font-bold text-text-primary">{simulationResults.totalParticipants}</div>
                </div>
                <div className="p-3 bg-surface-secondary rounded-lg">
                  <div className="text-sm text-text-secondary">Total Payout</div>
                  <div className="text-xl font-bold text-emerald-400">£{simulationResults.payouts.totalPayout.toLocaleString()}</div>
                </div>
              </div>
              
              <div className="space-y-2 mt-4">
                <div className="flex justify-between items-center p-2 border-b border-border-subtle">
                  <span className="text-text-primary">5 Matches (Jackpot)</span>
                  <span className="text-text-secondary">{simulationResults.winnersCount.tier5} winners @ £{simulationResults.payouts.tier5PerUser.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-2 border-b border-border-subtle">
                  <span className="text-text-primary">4 Matches (Tier 2)</span>
                  <span className="text-text-secondary">{simulationResults.winnersCount.tier4} winners @ £{simulationResults.payouts.tier4PerUser.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-2 border-b border-border-subtle">
                  <span className="text-text-primary">3 Matches (Tier 3)</span>
                  <span className="text-text-secondary">{simulationResults.winnersCount.tier3} winners @ £{simulationResults.payouts.tier3PerUser.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border-subtle shrink-0 flex justify-end gap-3 bg-canvas-base">
          <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
          <Button type="button" variant="primary" disabled={loading || !simulationResults} onClick={handleExecute}>
            {loading && simulationResults ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
            Execute Final Draw
          </Button>
        </div>
      </div>
    </div>
  );
};
