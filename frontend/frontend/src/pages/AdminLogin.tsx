import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Lock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL ?? "http://localhost:8000";

const AdminLogin = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${BACKEND_URL}/admin_login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        login({ name: 'Admin', location: '', isAdmin: true });
        toast.success('Admin login successful');
        navigate('/admin');
      } else {
        toast.error(data.detail || 'Invalid admin credentials');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 animate-fade-in">
        <div className="text-center">
          <div className="inline-flex p-4 rounded-2xl bg-primary/10 mb-6">
            <Shield className="w-12 h-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Admin Login</h1>
          <p className="text-muted-foreground mt-2">Access the admin dashboard</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 bg-card p-8 rounded-xl border border-border card-shadow">
          <div className="space-y-2">
            <Label>Admin Username</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                className="pl-10"
                placeholder="Enter admin username"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Admin Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="pl-10"
                placeholder="Enter admin password"
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-12" disabled={isLoading}>
            <Shield className="w-4 h-4 mr-2" />
            Login as Admin
          </Button>
        </form>

        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="w-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Farmer Login
        </Button>
      </div>
    </div>
  );
};

export default AdminLogin;
