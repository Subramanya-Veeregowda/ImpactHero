import { useState, useEffect } from 'react';
import { supabase } from '@/services/supabase/client';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

export const UserManagement = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setUsers(data || []);
      } catch (error) {
        console.error('Failed to load users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">User Management</h1>
        <p className="text-text-secondary">View and manage platform users.</p>
      </div>

      <Card className="overflow-x-auto">
        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-8 h-8 animate-spin text-accent-primary" />
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="p-4 text-sm font-medium text-text-secondary">User</th>
                <th className="p-4 text-sm font-medium text-text-secondary">Email</th>
                <th className="p-4 text-sm font-medium text-text-secondary">Role</th>
                <th className="p-4 text-sm font-medium text-text-secondary">Joined</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-border-subtle/50 hover:bg-white/5">
                  <td className="p-4 text-sm font-medium text-text-primary">
                    {user.full_name || 'No Name Provided'}
                  </td>
                  <td className="p-4 text-sm text-text-secondary">{user.email}</td>
                  <td className="p-4 text-sm">
                    <Badge variant={user.role === 'admin' ? 'info' : 'glass'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="p-4 text-sm text-text-secondary">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
};
