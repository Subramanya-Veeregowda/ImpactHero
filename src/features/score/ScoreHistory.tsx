import { useScores } from './useScores';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export const ScoreHistory = () => {
  const { scores, clearScores } = useScores();

  return (
    <Card className="flex flex-col h-full min-h-[400px]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Your Active Scores</h2>
        {scores.length > 0 && (
          <button 
            onClick={clearScores}
            className="text-sm text-red-400 hover:text-red-300 font-medium flex items-center transition-colors"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </button>
        )}
      </div>

      {scores.length === 0 ? (
        <div className="flex-grow flex flex-col items-center justify-center text-center py-12">
          <div className="bg-white/5 p-4 rounded-full mb-4 ring-1 ring-border-subtle">
            <Trophy className="w-8 h-8 text-text-secondary" />
          </div>
          <h3 className="text-lg font-medium text-text-primary mb-1">No scores yet</h3>
          <p className="text-text-secondary max-w-xs">
            Log your first score to start participating in the monthly impact draws.
          </p>
        </div>
      ) : (
        <div className="space-y-3 flex-grow">
          <AnimatePresence initial={false}>
            {scores.map((score, index) => (
              <motion.div
                key={score.id}
                initial={{ opacity: 0, height: 0, scale: 0.9 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex items-center justify-between p-4 rounded-xl border border-border-subtle hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-canvas-base border border-border-focus text-accent-primary flex items-center justify-center font-bold text-lg">
                      {score.value}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text-primary">Stableford Points</p>
                      <div className="flex items-center text-xs text-text-secondary mt-1">
                        <Clock className="w-3 h-3 mr-1" />
                        {new Date(score.date).toLocaleDateString(undefined, {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  {index === 0 && (
                    <Badge variant="success">Latest</Badge>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t border-border-subtle flex items-center justify-between text-sm text-text-secondary">
        <span>Capacity</span>
        <span className="font-medium text-text-primary">{scores.length} / 5</span>
      </div>
    </Card>
  );
};
