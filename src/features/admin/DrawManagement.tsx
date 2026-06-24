import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loader2, Plus, Play } from 'lucide-react';
import { CreateDrawModal } from './draws/CreateDrawModal';
import { ExecuteDrawModal } from './draws/ExecuteDrawModal';

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
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [executingDraw, setExecutingDraw] = useState<{id: string, month: string} | null>(null);

  const fetchDraws = async () => {
    setIsLoading(true);
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

  useEffect(() => {
    fetchDraws();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Draw Management</h1>
          <p className="text-text-secondary">Manage monthly charity draws and jackpots.</p>
        </div>
        <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Draw
        </Button>
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
                <th className="p-4 text-sm font-medium text-text-secondary text-right">Actions</th>
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
                    <Badge variant={draw.status === 'completed' ? 'success' : draw.status === 'active' ? 'info' : 'warning'}>
                      {draw.status}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-right">
                    {draw.status === 'active' && (
                      <Button variant="ghost" size="sm" onClick={() => setExecutingDraw({ id: draw.id, month: draw.month })}>
                        <Play className="w-4 h-4 mr-2 text-accent-primary" />
                        Execute
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>

      <CreateDrawModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSuccess={fetchDraws} 
      />

      {executingDraw && (
        <ExecuteDrawModal 
          isOpen={!!executingDraw} 
          onClose={() => setExecutingDraw(null)} 
          drawId={executingDraw.id}
          month={executingDraw.month}
          onSuccess={fetchDraws}
        />
      )}
    </div>
  );
};
