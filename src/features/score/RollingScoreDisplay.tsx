import { useScores } from './useScores';
import { Card } from '@/components/ui/Card';
import { Target, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

export const RollingScoreDisplay = () => {
  const { scores } = useScores();

  const count = scores.length;
  const average = count > 0 
    ? Math.round(scores.reduce((acc, curr) => acc + curr.value, 0) / count) 
    : 0;

  let trendIcon = <Minus className="h-5 w-5 text-gray-400" />;
  if (count >= 2) {
    const latest = scores[0].value;
    const previous = scores[1].value;
    if (latest > previous) {
      trendIcon = <TrendingUp className="h-5 w-5 text-emerald-400" />;
    } else if (latest < previous) {
      trendIcon = <TrendingDown className="h-5 w-5 text-red-400" />;
    }
  }

  return (
    <Card className="bg-gradient-to-br from-surface to-surface-hover border-accent-primary/20">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">Rolling Average</h2>
        <div className="p-2 bg-accent-primary/10 rounded-lg">
          <Target className="h-6 w-6 text-accent-primary" />
        </div>
      </div>
      
      <div className="flex items-end justify-between">
        <div>
          <div className="text-4xl font-black text-text-primary flex items-center gap-3">
            {count > 0 ? average : '--'}
            {count > 0 && trendIcon}
          </div>
          <p className="text-sm text-text-secondary mt-2">
            Based on your last {count} score{count !== 1 ? 's' : ''}
          </p>
        </div>
        
        <div className="flex gap-1">
          {/* Visual indicator of the 5 slots */}
          {Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className={`h-12 w-3 rounded-full ${
                i < count 
                  ? 'bg-accent-primary/80 shadow-[0_0_10px_rgba(var(--accent-primary),0.3)]' 
                  : 'bg-white/10'
              }`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};
