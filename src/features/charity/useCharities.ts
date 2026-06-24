import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/services/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export interface Charity {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  website_url: string | null;
}

export const useCharities = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [charities, setCharities] = useState<Charity[]>([]);
  const [activeCharityId, setActiveCharityId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCharities = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all charities
      const { data: charityData, error: charityError } = await supabase
        .from('charities')
        .select('*')
        .order('name');
      
      if (charityError) throw charityError;
      setCharities(charityData || []);

      if (user) {
        // Fetch current user's active charity from subscriptions table
        const { data: subData, error: subError } = await supabase
          .from('subscriptions')
          .select('charity_id')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (subError) throw subError;
        setActiveCharityId(subData?.charity_id || null);
      }
    } catch (err) {
      console.error('Error fetching charities:', err);
      toast('Failed to load charities', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchCharities();
  }, [fetchCharities]);

  const selectCharity = async (charityId: string) => {
    if (!user) {
      toast('Must be logged in to select a charity', 'error');
      return false;
    }

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({ charity_id: charityId })
        .eq('user_id', user.id);

      if (error) throw error;
      
      setActiveCharityId(charityId);
      toast('Charity successfully updated', 'success');
      return true;
    } catch (err) {
      console.error('Error selecting charity:', err);
      toast('Failed to update charity', 'error');
      return false;
    }
  };

  return {
    charities,
    activeCharityId,
    isLoading,
    selectCharity
  };
};
