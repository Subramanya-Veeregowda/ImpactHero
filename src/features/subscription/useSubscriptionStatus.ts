import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import { useAuth } from '@/context/AuthContext';

export const useSubscriptionStatus = () => {
  const { user } = useAuth();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;
        setIsActive(data?.status === 'active');
      } catch (error) {
        console.error('Error fetching subscription status:', error);
        setIsActive(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [user]);

  return { isActive, isLoading };
};
