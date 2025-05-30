import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input, PasswordInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { showErrorToast, showSuccessToast } from '@/utils/ui/toast';

const Login = () => {
  const [admissionNumber, setAdmissionNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('student');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Real-time field validation
  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = { ...fieldErrors };

    switch (name) {
      case 'admissionNumber':
        if (activeTab === 'student') {
          if (!value.trim()) {
            errors.admissionNumber = 'Admission number is required';
          } else {
            const admissionNumberRegex = /^[A-Z]{2,4}-\d{3}-\d{3}\/\d{4}$/;
            if (!admissionNumberRegex.test(value)) {
              errors.admissionNumber = 'Invalid format. Use: MCS-234-178/2024';
            } else {
              delete errors.admissionNumber;
            }
          }
        }
        break;

      case 'email':
        if (activeTab === 'staff') {
          if (!value.trim()) {
            errors.email = 'Email is required';
          } else {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
              errors.email = 'Please enter a valid email address';
            } else {
              delete errors.email;
            }
          }
        }
        break;

      case 'password':
        if (!value) {
          errors.password = 'Password is required';
        } else if (value.length < 8) {
          errors.password = 'Password must be at least 8 characters';
        } else {
          delete errors.password;
        }
        break;
    }

    setFieldErrors(errors);
  };

  const handleInputChange = (name: string, value: string) => {
    if (name === 'admissionNumber') {
      setAdmissionNumber(value);
    } else if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }

    // Real-time validation
    validateField(name, value);

    // Clear global error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      console.log('Login: Starting login process for', activeTab);

      // Validate inputs based on user type
      if (activeTab === 'student') {
        if (!admissionNumber.trim()) {
          throw new Error('Admission number is required');
        }
        if (!password) {
          throw new Error('Password is required');
        }

        // Validate admission number format
        const admissionNumberRegex = /^[A-Z]{2,4}-\d{3}-\d{3}\/\d{4}$/;
        if (!admissionNumberRegex.test(admissionNumber)) {
          throw new Error('Invalid admission number format. Please use format: MCS-234-178/2024');
        }
        console.log('Login: Student inputs validated, attempting to sign in with admission number');
        // Sign in with admission number for students
        const { data, error } = await signIn(admissionNumber, password);
        if (error) {
          console.error('Login: Sign in error:', error);
          // Provide more helpful error messages
          if (error.message?.includes('No account found')) {
            throw new Error('No account found with this email. Please check your email or register for a new account.');
          } else if (error.message?.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          } else if (error.message?.includes('Invalid admission number')) {
            throw new Error('Invalid admission number. Please check your admission number and try again.');
          } else {
            throw new Error(error.message || 'Failed to sign in');
          }
        }
        if (data) {
          showSuccessToast('Signed in successfully');
          navigate('/dashboard', { replace: true });
        }
      } else {
        // Staff login (lecturer, dean, admin)
        if (!email.trim()) {
          throw new Error('Email is required');
        }
        if (!password) {
          throw new Error('Password is required');
        }
        console.log('Login: Staff inputs validated, attempting to sign in with email');
        // Sign in with email for staff
        const { data, error } = await signIn(email, password);
        if (error) {
          console.error('Login: Sign in error:', error);
          // Provide more helpful error messages
          if (error.message?.includes('No account found')) {
            throw new Error('No account found with this email. Please check your email or register for a new account.');
          } else if (error.message?.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please check your credentials and try again.');
          } else {
            throw new Error(error.message || 'Failed to sign in');
          }
        }
        if (data) {
          showSuccessToast('Signed in successfully');
          navigate('/dashboard', { replace: true });
        }
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

  // Clear errors when switching tabs
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setFieldErrors({});
    setError(null);
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
            Students use admission number, Staff use email to sign in
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

          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="staff">Staff</TabsTrigger>
            </TabsList>

            <TabsContent value="student" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admissionNumber">Admission Number</Label>
                  <Input
                    id="admissionNumber"
                    type="text"
                    placeholder="e.g., MCS-234-178/2024"
                    value={admissionNumber}
                    onChange={(e) => handleInputChange('admissionNumber', e.target.value)}
                    disabled={isLoading}
                    required
                    className={fieldErrors.admissionNumber ? 'border-red-500' : ''}
                  />
                  {fieldErrors.admissionNumber && (
                    <p className="text-sm text-red-500">{fieldErrors.admissionNumber}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Use your admission number in format: MCS-234-178/2024
                  </p>
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
                  <PasswordInput
                    id="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isLoading}
                    required
                    className={fieldErrors.password ? 'border-red-500' : ''}
                  />
                  {fieldErrors.password && (
                    <p className="text-sm text-red-500">{fieldErrors.password}</p>
                  )}
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
                    'Sign In as Student'
                  )}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="staff" className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@mmu.ac.ke"
                    value={email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    disabled={isLoading}
                    required
                    className={fieldErrors.email ? 'border-red-500' : ''}
                  />
                  {fieldErrors.email && (
                    <p className="text-sm text-red-500">{fieldErrors.email}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Use your institutional email address
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="staffPassword">Password</Label>
                    <Link
                      to="/forgot-password"
                      className="text-sm text-primary hover:underline"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <PasswordInput
                    id="staffPassword"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    disabled={isLoading}
                    required
                    className={fieldErrors.password ? 'border-red-500' : ''}
                  />
                  {fieldErrors.password && (
                    <p className="text-sm text-red-500">{fieldErrors.password}</p>
                  )}
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
                    'Sign In as Staff'
                  )}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
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
