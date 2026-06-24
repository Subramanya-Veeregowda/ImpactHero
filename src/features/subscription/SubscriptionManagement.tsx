import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { supabase } from '@/services/supabase/client';

const PLANS = [
  {
    id: 'monthly',
    name: 'Monthly Pro',
    price: '$9.99',
    interval: 'month',
    stripePriceId: 'price_placeholder_monthly', // REPLACE IN PROD
    features: [
      'Enter all weekly draws',
      'Unlimited score entries',
      'Charity selection',
      'Impact tracking',
    ],
  },
  {
    id: 'yearly',
    name: 'Yearly Pro',
    price: '$99.99',
    interval: 'year',
    stripePriceId: 'price_placeholder_yearly', // REPLACE IN PROD
    features: [
      'Everything in Monthly',
      'Save ~16% annually',
      'Priority support',
      'Exclusive yearly badges',
    ],
    popular: true,
  },
];

export const SubscriptionManagement = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (priceId: string) => {
    try {
      setLoading(priceId);
      setError(null);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Call the Edge Function
      const { data, error: functionError } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          priceId,
          successUrl: `${window.location.origin}/checkout/success`,
          cancelUrl: `${window.location.origin}/checkout/cancel`,
        },
      });

      if (functionError) throw functionError;
      if (data?.error) throw new Error(data.error);

      // Redirect to Stripe Checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to create checkout session.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to start checkout. Please try again later.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">Subscription Plans</h2>
        <p className="text-text-secondary mt-1">
          Choose a plan to enter draws and make a real impact.
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {PLANS.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ y: -4 }}
            className={`relative p-6 rounded-2xl border ${
              plan.popular 
                ? 'bg-gradient-to-br from-primary-500/10 to-accent-500/10 border-primary-500/30' 
                : 'bg-canvas-elevated border-surface-light'
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-primary-500 to-accent-500 rounded-full text-xs font-medium text-text-primary shadow-lg">
                Most Popular
              </div>
            )}

            <div className="mb-8">
              <h3 className="text-xl font-bold text-text-primary">{plan.name}</h3>
              <div className="mt-4 flex items-baseline text-text-primary">
                <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                <span className="ml-1 text-xl font-medium text-text-secondary">/{plan.interval}</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start">
                  <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full bg-primary-500/20 flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-400" />
                  </div>
                  <span className="ml-3 text-text-secondary">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={plan.popular ? 'primary' : 'secondary'}
              className="w-full h-12"
              onClick={() => handleSubscribe(plan.stripePriceId)}
              disabled={loading !== null}
            >
              {loading === plan.stripePriceId ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Connecting to Stripe...
                </>
              ) : (
                'Subscribe Now'
              )}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
