import { useCharities } from './useCharities';
import type { Charity } from './useCharities';
import { PageContainer } from '@/components/ui/PageContainer';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Heart, Globe, CheckCircle2, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export const CharitySelection = () => {
  const { charities, activeCharityId, isLoading, selectCharity } = useCharities();

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Impact Partners</h1>
        <p className="text-text-secondary max-w-2xl">
          Choose which charity your subscription supports. You can change your chosen charity at any time.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
        </div>
      ) : charities.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <Heart className="h-12 w-12 text-text-secondary mb-4" />
          <h3 className="text-xl font-bold text-text-primary mb-2">No Charities Available</h3>
          <p className="text-text-secondary">We are currently onboarding new charity partners. Check back soon!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {charities.map((charity: Charity, index: number) => {
            const isActive = activeCharityId === charity.id;

            return (
              <motion.div
                key={charity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <Card 
                  className={`h-full flex flex-col transition-all duration-300 ${
                    isActive 
                      ? 'border-accent-primary ring-1 ring-accent-primary shadow-[0_0_15px_rgba(var(--accent-primary),0.15)] bg-gradient-to-b from-accent-primary/5 to-transparent' 
                      : 'hover:border-white/20'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="h-16 w-16 rounded-xl bg-white flex items-center justify-center p-2 border border-border-subtle overflow-hidden shadow-sm">
                      {charity.logo_url ? (
                        <img src={charity.logo_url} alt={charity.name} className="w-full h-full object-contain" />
                      ) : (
                        <Heart className="h-8 w-8 text-rose-500" />
                      )}
                    </div>
                    {isActive && (
                      <Badge variant="success" className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Selected
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="text-xl font-bold text-text-primary mb-2">{charity.name}</h3>
                  <p className="text-sm text-text-secondary flex-grow mb-6 line-clamp-4">
                    {charity.description || 'Dedicated to making a positive impact in our community.'}
                  </p>

                  <div className="mt-auto space-y-4 pt-4 border-t border-border-subtle">
                    {charity.website_url && (
                      <a 
                        href={charity.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center text-sm text-text-secondary hover:text-accent-primary transition-colors"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Visit Website
                      </a>
                    )}
                    
                    <Button
                      fullWidth
                      variant={isActive ? 'ghost' : 'primary'}
                      onClick={() => !isActive && selectCharity(charity.id)}
                      disabled={isActive}
                      className={isActive ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                      {isActive ? 'Currently Supporting' : 'Support this Charity'}
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
};
