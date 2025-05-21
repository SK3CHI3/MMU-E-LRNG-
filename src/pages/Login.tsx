import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('Login: Starting login process');

      // Validate inputs
      if (!email.trim()) {
        throw new Error('Email is required');
      }
      if (!password) {
        throw new Error('Password is required');
      }

      console.log('Login: Inputs validated, attempting to sign in');

      // For testing purposes, let's use a hardcoded email/password
      // This is just for debugging - remove in production
      const testEmail = email; // Use the entered email
      const testPassword = password; // Use the entered password

      // Sign in
      const { data, error } = await signIn(testEmail, testPassword);

      if (error) {
        console.error('Login: Sign in error:', error);
        throw new Error(error.message || 'Failed to sign in');
      }

      console.log('Login: Sign in successful, data:', data ? 'Data exists' : 'No data');

      if (data) {
        // Show success toast
        showSuccessToast('Signed in successfully');
        console.log('Login: Redirecting to dashboard');

        // Redirect to dashboard on successful login
        console.log('Login: Redirecting to dashboard');

        // Redirect immediately without timeout
        navigate('/dashboard', { replace: true });
      }
    } catch (err: any) {
      console.error('Login: Error during login:', err);
      setError(err.message);
      showErrorToast('Sign in failed', {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-2">
            <img src="/logo.png" alt="MMU Logo" className="h-12" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@mmu.ac.ke"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">
              Create an account
            </Link>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            By signing in, you agree to our{' '}
            <a href="#" className="hover:underline">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="hover:underline">Privacy Policy</a>.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
