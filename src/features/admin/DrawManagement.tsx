import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loader2 } from 'lucide-react';

interface Draw {
  id: string;
  month: string;
  jackpot_amount: number;
  status: string;
  created_at: string;
}

export const DrawManagement = () => {
  const [draws, setDraws] = useState<Draw[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDraws = async () => {
      try {
        const { data, error } = await supabase
          .from('draws')
          .select('*')
          .order('month', { ascending: false });

        if (error) throw error;
        setDraws(data || []);
      } catch (error) {
        console.error('Failed to load draws:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDraws();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Draw Management</h1>
        <p className="text-text-secondary">Manage monthly charity draws and jackpots.</p>
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
                <th className="p-4 text-sm font-medium text-text-secondary">Month</th>
                <th className="p-4 text-sm font-medium text-text-secondary">Jackpot</th>
                <th className="p-4 text-sm font-medium text-text-secondary">Status</th>
              </tr>
            </thead>
            <tbody>
              {draws.map(draw => (
                <tr key={draw.id} className="border-b border-border-subtle/50 hover:bg-white/5">
                  <td className="p-4 text-sm font-medium text-text-primary capitalize">
                    {new Date(draw.month + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    £{draw.jackpot_amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-sm">
                    <Badge variant={draw.status === 'completed' ? 'success' : 'warning'}>
                      {draw.status}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};
