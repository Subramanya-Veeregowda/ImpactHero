import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import { Card } from '@/components/ui/Card';
import { Users, Trophy, Gift, Activity } from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';

export const AdminDashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    activeSubscriptions: 0,
    charities: 0,
    totalDraws: 0,
    activeDraws: 0,
    totalPayouts: 0,
    pendingVerifications: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          { count: usersCount },
          { count: subsCount },
          { count: charitiesCount },
          { count: drawsCount },
          { count: activeDrawsCount },
          { data: payoutData },
          { count: pendingCount }
        ] = await Promise.all([
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('subscriptions').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('charities').select('*', { count: 'exact', head: true }),
          supabase.from('draws').select('*', { count: 'exact', head: true }),
          supabase.from('draws').select('*', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('winners').select('prize_amount').in('status', ['paid', 'verified']),
          supabase.from('winners').select('*', { count: 'exact', head: true }).eq('status', 'pending_verification')
        ]);

        const totalPayouts = payoutData?.reduce((acc, curr) => acc + (curr.prize_amount || 0), 0) || 0;

        setStats({
          users: usersCount || 0,
          activeSubscriptions: subsCount || 0,
          charities: charitiesCount || 0,
          totalDraws: drawsCount || 0,
          activeDraws: activeDrawsCount || 0,
          totalPayouts,
          pendingVerifications: pendingCount || 0,
        });
      } catch (error) {
        console.error('Failed to load admin stats:', error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Admin Dashboard</h1>
        <p className="text-text-secondary">Platform overview and key metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <StatCard
          title="Total Draws"
          value={stats.totalDraws}
          icon={<Trophy className="h-5 w-5" />}
        />
        <StatCard
          title="Active Draws"
          value={stats.activeDraws}
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          title="Total Payouts"
          value={`£${stats.totalPayouts.toLocaleString()}`}
          icon={<Gift className="h-5 w-5" />}
        />
        <StatCard
          title="Pending Verifications"
          value={stats.pendingVerifications}
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <h2 className="text-xl font-bold text-text-primary mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <p className="text-text-secondary text-sm">Select an area from the sidebar to manage platform entities.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};
