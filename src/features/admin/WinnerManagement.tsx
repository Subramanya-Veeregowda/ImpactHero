import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loader2, ExternalLink, Check, X } from 'lucide-react';

interface Winner {
  id: string;
  draw_id: string;
  user_id: string;
  match_type: number;
  prize_amount: number;
  proof_url: string | null;
  status: string;
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  };
}

export const WinnerManagement = () => {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      const { data, error } = await supabase
        .from('winners')
        .select(`
          *,
          profiles (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWinners(data || []);
    } catch (error) {
      console.error('Failed to load winners:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from('winners')
        .update({ status })
        .eq('id', id);

      if (error) throw error;
      fetchWinners();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Winner Verification</h1>
        <p className="text-text-secondary">Verify scorecards and process prize payouts.</p>
      </div>

      <Card className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="p-4 text-sm font-medium text-text-secondary">User</th>
                <th className="p-4 text-sm font-medium text-text-secondary">Prize</th>
                <th className="p-4 text-sm font-medium text-text-secondary">Proof</th>
                <th className="p-4 text-sm font-medium text-text-secondary">Status</th>
                <th className="p-4 text-sm font-medium text-text-secondary">Actions</th>
              </tr>
            </thead>
            <tbody>
              {winners.map(winner => (
                <tr key={winner.id} className="border-b border-border-subtle/50 hover:bg-white/5">
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <div>{winner.profiles?.full_name || 'Anonymous'}</div>
                    <div className="text-xs text-text-secondary font-normal">{winner.profiles?.email}</div>
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    £{winner.prize_amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-sm">
                    {winner.proof_url ? (
                      <a 
                        href={winner.proof_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-accent-primary hover:text-accent-hover"
                      >
                        View Card <ExternalLink className="ml-1 w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-text-secondary text-xs italic">Pending Upload</span>
                    )}
                  </td>
                  <td className="p-4 text-sm">
                    <Badge variant={
                      winner.status === 'verified' ? 'success' :
                      winner.status === 'rejected' ? 'error' :
                      winner.status === 'pending_verification' ? 'warning' : 'glass'
                    }>
                      {winner.status.replace('_', ' ')}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm">
                    {winner.status === 'pending_verification' && (
                      <div className="flex items-center gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                          onClick={() => updateStatus(winner.id, 'verified')}
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                          onClick={() => updateStatus(winner.id, 'rejected')}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {winners.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-text-secondary">
                    No winners found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};
