import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Trophy, Activity, Heart, ArrowRight, Plus, Loader2 } from 'lucide-react';
import { PageContainer } from '@/components/ui/PageContainer';
import { StatCard } from '@/components/ui/StatCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useSubscriberDashboard } from './useSubscriberDashboard';
import { useAuth } from '@/context/AuthContext';

export const SubscriberDashboard = () => {
  const { user } = useAuth();
  const { data, isLoading, error } = useSubscriberDashboard();
  const shouldReduceMotion = useReducedMotion();

  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const staggerItem = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex h-[50vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <Card className="flex flex-col items-center justify-center p-12 text-center">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center mb-4">
            <Activity className="h-6 w-6 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Failed to load dashboard</h2>
          <p className="text-text-secondary mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <motion.div 
        className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <div className="w-full md:w-auto">
          <motion.h1 variants={staggerItem} className="text-3xl font-bold text-text-primary mb-2">Welcome back, {user?.name}</motion.h1>
          <motion.p variants={staggerItem} className="text-text-secondary">Here's your latest impact and performance summary.</motion.p>
        </div>
        <motion.div variants={staggerItem} className="w-full md:w-auto mt-4 md:mt-0">
          <Link to="/scores/add" className="block w-full">
            <Button variant="primary" className="w-full md:w-auto justify-center">
              <Plus className="h-4 w-4 mr-2" />
              Add Score
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={staggerItem}>
          <StatCard
            title="Subscription"
            value={data?.subscription?.plan_type ? data.subscription.plan_type.charAt(0).toUpperCase() + data.subscription.plan_type.slice(1) : 'None'}
            icon={<Activity className="h-5 w-5" />}
            description={data?.subscription?.status === 'active' ? 'Active Subscription' : 'Inactive'}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="Active Scores"
            value={data?.scores.count || 0}
            icon={<Trophy className="h-5 w-5" />}
            description="Rolling 5-score limit"
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="Latest Score"
            value={data?.scores.latest || '--'}
            icon={<Activity className="h-5 w-5" />}
            description={data?.scores.average ? `Avg: ${data.scores.average}` : 'No scores yet'}
          />
        </motion.div>
        <motion.div variants={staggerItem}>
          <StatCard
            title="Charity Impact"
            value={data?.charity?.name ? 'Active' : 'Pending'}
            icon={<Heart className="h-5 w-5" />}
            description={data?.charity?.name || 'No charity selected'}
          />
        </motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">Current Charity</h2>
              <Heart className="h-5 w-5 text-accent-primary" />
            </div>
            {data?.charity ? (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-surface-secondary rounded-xl border border-white/5">
                <Heart className="h-12 w-12 text-rose-500 mb-4 fill-rose-500/20" />
                <h3 className="text-lg font-bold text-text-primary mb-2">{data.charity.name}</h3>
                <p className="text-text-secondary mb-6 text-sm">
                  A portion of your subscription goes to support this cause.
                </p>
                <Link to="/charities">
                  <Button variant="secondary" size="sm">Change Charity</Button>
                </Link>
              </div>
            ) : (
              <div className="flex-1 flex flex-col justify-center items-center text-center p-6 bg-surface-secondary rounded-xl border border-dashed border-white/10">
                <div className="h-12 w-12 rounded-full bg-canvas-elevated mb-4 flex items-center justify-center">
                  <Heart className="h-6 w-6 text-text-secondary" />
                </div>
                <h3 className="text-lg font-bold text-text-primary mb-2">No Charity Selected</h3>
                <p className="text-text-secondary mb-6 text-sm">
                  Select a charity to direct your impact!
                </p>
                <Link to="/charities">
                  <Button variant="primary">Choose Charity</Button>
                </Link>
              </div>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <Card className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-text-primary">Subscription Status</h2>
              {data?.subscription?.status === 'active' ? (
                <Badge variant="success">Active</Badge>
              ) : (
                <Badge variant="warning">Inactive</Badge>
              )}
            </div>
            
            <div className="flex-1">
              {!data?.subscription || data.subscription.status !== 'active' ? (
                <div className="text-center p-6">
                  <p className="text-text-secondary mb-4">You don't have an active subscription yet.</p>
                  <Link to="/upgrade">
                    <Button variant="primary" className="w-full">View Plans</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-surface-secondary rounded-lg border border-white/5 flex justify-between items-center">
                    <div>
                      <p className="text-sm text-text-secondary mb-1">Current Plan</p>
                      <p className="font-semibold text-text-primary capitalize">{data.subscription.plan_type} Tier</p>
                    </div>
                    <Link to="/settings/subscription">
                      <Button variant="ghost" size="sm" className="text-accent-primary">
                        Manage
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </PageContainer>
  );
};
