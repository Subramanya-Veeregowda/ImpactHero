import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export interface DashboardData {
  subscription: {
    status: string;
    plan_type: string;
  } | null;
  scores: {
    count: number;
    latest: number | null;
    average: number | null;
  };
  charity: {
    id: string;
    name: string;
  } | null;
}

export const useSubscriberDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Fetch subscription and charity
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select(`
            status,
            plan_type,
            charities ( id, name )
          `)
          .eq('user_id', user.id)
          .maybeSingle();

        if (subError) throw subError;

        // Fetch scores (latest 5 to calculate average, count, and latest)
        const { data: scoreData, error: scoreError } = await supabase
          .from('scores')
          .select('value, date')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5);

        if (scoreError) throw scoreError;

        const count = scoreData?.length || 0;
        const latest = count > 0 ? scoreData[0].value : null;
        const average = count > 0 
          ? Math.round(scoreData.reduce((acc, curr) => acc + curr.value, 0) / count) 
          : null;

        // Note: charities is returned as an array or object depending on relation, 
        // with maybeSingle it's typically an object or array. We need to cast it safely.
        const charityData: any = subData?.charities;

        setData({
          subscription: subData ? { status: subData.status, plan_type: subData.plan_type } : null,
          charity: charityData ? { id: charityData.id, name: charityData.name } : null,
          scores: { count, latest, average }
        });
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data.');
        toast('Failed to load dashboard data.', 'error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, toast]);

  return { data, isLoading, error };
};
