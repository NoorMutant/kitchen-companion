import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { UtensilsCrossed } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const login = useStore(s => s.login);
  const user = useStore(s => s.user);
  const navigate = useNavigate();

  if (user) {
    navigate(user.role === 'admin' ? '/dashboard' : '/pos');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(username, password);
    if (success) {
      const u = useStore.getState().user!;
      toast.success(`Welcome, ${u.name}!`);
      navigate(u.role === 'admin' ? '/dashboard' : '/pos');
    } else {
      toast.error('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md animate-fade-in shadow-lg">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary flex items-center justify-center">
            <UtensilsCrossed className="w-8 h-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold">Restaurant POS</CardTitle>
          <p className="text-muted-foreground text-sm">Sign in to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input id="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="admin or counter" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
          <div className="mt-6 p-3 rounded-lg bg-muted text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Demo Credentials:</p>
            <p>Admin: <code className="text-foreground">admin / admin123</code></p>
            <p>Counter: <code className="text-foreground">counter / counter123</code></p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
