import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/services/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { PageContainer } from '@/components/ui/PageContainer';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Trophy, Upload, Download, Loader2, AlertCircle } from 'lucide-react';
import { useSubscriptionStatus } from '../subscription/useSubscriptionStatus';

interface Winner {
  id: string;
  draw_id: string;
  match_type: number;
  prize_amount: number;
  proof_url: string | null;
  status: string;
  created_at: string;
  draws?: {
    month: string;
  };
}

export const WinnerDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isActive, isLoading: subLoading } = useSubscriptionStatus();
  const [wins, setWins] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchWins();
    }
  }, [user]);

  const fetchWins = async () => {
    try {
      const { data, error } = await supabase
        .from('winners')
        .select(`
          *,
          draws (
            month
          )
        `)
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWins(data || []);
    } catch (error) {
      console.error('Failed to load wins:', error);
      toast('Failed to load your winning history', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, winnerId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      toast('Please upload an image or PDF', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast('File size must be less than 5MB', 'error');
      return;
    }

    setUploadingId(winnerId);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${winnerId}-${Math.random()}.${fileExt}`;
      const filePath = `scorecards/${user!.id}/${fileName}`;

      // Upload to storage bucket
      const { error: uploadError } = await supabase.storage
        .from('proofs')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('proofs')
        .getPublicUrl(filePath);

      // Update winner record
      const { error: updateError } = await supabase
        .from('winners')
        .update({
          proof_url: publicUrl,
          status: 'pending_verification'
        })
        .eq('id', winnerId);

      if (updateError) throw updateError;

      toast('Scorecard uploaded successfully! Pending verification.', 'success');
      fetchWins();
    } catch (error) {
      console.error('Upload failed:', error);
      toast('Failed to upload scorecard. Please try again.', 'error');
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <PageContainer>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">My Winnings</h1>
        <p className="text-text-secondary">Track your draw results and upload scorecards to claim prizes.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
        </div>
      ) : wins.length === 0 ? (
        <Card className="flex flex-col items-center justify-center p-12 text-center border-dashed">
          <Trophy className="h-12 w-12 text-text-secondary mb-4" />
          <h3 className="text-xl font-bold text-text-primary mb-2">No Winnings Yet</h3>
          <p className="text-text-secondary">
            Keep logging your scores to participate in the monthly draws!
          </p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {wins.map((win) => (
            <Card key={win.id} className="relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-accent-primary" />
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pl-4">
                
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-text-primary">
                      {win.draws?.month ? new Date(win.draws.month + '-01').toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : 'Monthly Draw'}
                    </h3>
                    <Badge variant={
                      win.status === 'verified' ? 'success' :
                      win.status === 'rejected' ? 'error' :
                      win.status === 'pending_verification' ? 'warning' : 'glass'
                    }>
                      {win.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-text-secondary">
                    Match {win.match_type} Numbers
                  </p>
                </div>

                <div className="text-left md:text-right">
                  <div className="text-sm text-text-secondary mb-1">Prize Amount</div>
                  <div className="text-2xl font-bold text-emerald-400">
                    £{win.prize_amount.toLocaleString()}
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                  {win.status === 'pending_upload' || win.status === 'rejected' ? (
                    <div className="relative w-full md:w-auto">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          if (isActive) {
                            handleFileUpload(e, win.id)
                          } else {
                            e.preventDefault();
                            navigate('/upgrade');
                          }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                        disabled={uploadingId === win.id || subLoading}
                        onClick={(e) => {
                          if (!isActive && !subLoading) {
                            e.preventDefault();
                            navigate('/upgrade');
                          }
                        }}
                      />
                      <Button 
                        variant="primary" 
                        className="w-full"
                        disabled={uploadingId === win.id || subLoading}
                      >
                        {uploadingId === win.id ? (
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4 mr-2" />
                        )}
                        Upload Proof
                      </Button>
                    </div>
                  ) : win.proof_url ? (
                    <Button 
                      variant="ghost" 
                      onClick={() => window.open(win.proof_url!, '_blank')}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      View Upload
                    </Button>
                  ) : null}
                </div>

              </div>

              {win.status === 'rejected' && (
                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-text-secondary">
                    Your previous scorecard upload was rejected. Please ensure the image is clear and matches the date and score played.
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </PageContainer>
  );
};
