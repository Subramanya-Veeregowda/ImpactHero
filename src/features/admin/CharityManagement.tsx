import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import { Card } from '@/components/ui/Card';
import { Loader2 } from 'lucide-react';
import type { Charity } from '../charity/useCharities';

export const CharityManagement = () => {
  const [charities, setCharities] = useState<Charity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const { data, error } = await supabase
          .from('charities')
          .select('*')
          .order('name');

        if (error) throw error;
        setCharities(data || []);
      } catch (error) {
        console.error('Failed to load charities:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCharities();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Charity Management</h1>
        <p className="text-text-secondary">Manage platform charities.</p>
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
                <th className="p-4 text-sm font-medium text-text-secondary">Name</th>
                <th className="p-4 text-sm font-medium text-text-secondary">Website</th>
              </tr>
            </thead>
            <tbody>
              {charities.map(charity => (
                <tr key={charity.id} className="border-b border-border-subtle/50 hover:bg-white/5">
                  <td className="p-4 text-sm font-medium text-text-primary">
                    <div className="flex items-center gap-3">
                      {charity.logo_url && (
                        <img src={charity.logo_url} alt={charity.name} className="w-8 h-8 rounded-full bg-white object-contain p-1" />
                      )}
                      {charity.name}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    {charity.website_url ? (
                      <a href={charity.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-accent-primary">
                        {charity.website_url}
                      </a>
                    ) : 'N/A'}
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
