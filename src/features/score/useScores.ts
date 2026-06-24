import { useState, useEffect, useCallback } from 'react';
import type { Score } from '@/types/score';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/services/supabase/client';

const LOCAL_STORAGE_KEY = 'impacthero_mock_scores';

export const useScores = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scores, setScores] = useState<Score[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchScores = useCallback(async () => {
    if (!user) {
      setScores([]);
      return;
    }
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setScores(data as Score[]);
    } catch (err) {
      console.error('Error fetching scores:', err);
      toast('Failed to load scores', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const migrateLocalScores = useCallback(async () => {
    if (!user) return;
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!stored) return;

    try {
      const allLocalScores = JSON.parse(stored);
      // We look for scores that belong to the user's email since local storage used btoa(email) as id,
      // but to be safe, we might just try to upload all their local scores or specific ones.
      // Assuming they were stored under whatever their mock userId was.
      // It's safer to just migrate them based on the email if we mapped it, but let's assume
      // the local storage might be empty for new users anyway.
      // If we do migrate, we need to map them:
      const userLocalScores = allLocalScores.map((s: any) => ({
        user_id: user.id,
        value: s.value,
        date: s.date
      }));

      if (userLocalScores.length > 0) {
        // Upsert or insert ignore to prevent duplicate date errors
        for (const s of userLocalScores) {
           await supabase.from('scores').insert(s).select().single();
        }
      }
      
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      await fetchScores(); // reload after migration
    } catch (err) {
      console.error('Error migrating local scores:', err);
      // Don't toast error so we don't bother them if it fails silently
    }
  }, [user, fetchScores]);

  // Load scores on mount or user change
  useEffect(() => {
    if (user) {
      migrateLocalScores().then(() => fetchScores());
    } else {
      setScores([]);
    }
  }, [user, fetchScores, migrateLocalScores]);

  const addScore = async (value: number, date: string): Promise<boolean> => {
    if (!user) {
      toast('You must be logged in to add scores', 'error');
      return false;
    }

    if (value < 1 || value > 45) {
      toast('Score must be between 1 and 45 (Stableford format)', 'error');
      return false;
    }

    const isDuplicate = scores.some(s => s.date === date);
    if (isDuplicate) {
      toast('A score already exists for this date. Only one score per date is allowed.', 'error');
      return false;
    }

    try {
      const { error } = await supabase.from('scores').insert({
        user_id: user.id,
        value,
        date
      });

      if (error) {
        if (error.code === '23505') { // Unique violation
           toast('A score already exists for this date.', 'error');
        } else {
           toast('Failed to record score', 'error');
        }
        return false;
      }

      await fetchScores();
      toast('Score successfully recorded!', 'success');
      return true;
    } catch (err) {
      console.error('Error adding score:', err);
      toast('Failed to record score', 'error');
      return false;
    }
  };

  const clearScores = async () => {
    if (!user) return;
    try {
      const { error } = await supabase.from('scores').delete().eq('user_id', user.id);
      if (error) throw error;
      setScores([]);
      toast('Scores cleared', 'success');
    } catch (err) {
      console.error('Error clearing scores:', err);
      toast('Failed to clear scores', 'error');
    }
  };

  return {
    scores,
    isLoading,
    addScore,
    clearScores
  };
};
