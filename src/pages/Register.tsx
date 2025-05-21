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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    studentId: '',
    department: '',
    role: 'student' as 'student' | 'lecturer' | 'admin',
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: 'student' | 'lecturer' | 'admin') => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleDepartmentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, department: value }));
  };

  const validateForm = () => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      throw new Error('Please enter a valid email address');
    }

    // Password validation
    if (formData.password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    // Password confirmation
    if (formData.password !== formData.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    // Full name validation
    if (!formData.fullName.trim()) {
      throw new Error('Full name is required');
    }

    // Student ID validation (only for students)
    if (formData.role === 'student') {
      if (!formData.studentId.trim()) {
        throw new Error('Student ID is required for students');
      }

      // Validate student ID format (e.g., MCS-234-178/2024)
      const studentIdRegex = /^[A-Z]{2,4}-\d{3}-\d{3}\/\d{4}$/;
      if (!studentIdRegex.test(formData.studentId)) {
        throw new Error('Student ID must be in the format MCS-234-178/2024');
      }
    }

    // Department validation
    if (!formData.department) {
      throw new Error('Department is required');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      // Validate form
      validateForm();

      // Prepare user data
      const userData = {
        full_name: formData.fullName,
        role: formData.role,
        student_id: formData.role === 'student' ? formData.studentId : null,
        department: formData.department,
      };

      console.log('Submitting registration with data:', {
        email: formData.email,
        userData
      });

      // Sign up
      const { data, error } = await signUp(formData.email, formData.password, userData);

      if (error) {
        console.error('Registration error:', error);

        // Handle specific error cases
        if (error.message?.includes('already registered')) {
          throw new Error('This email is already registered. Please use a different email or try to sign in.');
        } else if (error.message?.includes('invalid api key')) {
          throw new Error('There was a problem connecting to the server. Please try again later or contact support.');
        } else {
          throw new Error(error.message || 'Failed to create account');
        }
      }

      console.log('Registration successful:', data);

      // Show success message and toast
      setSuccessMessage('Account created successfully! You can now sign in.');
      showSuccessToast('Account created successfully', {
        description: 'You can now sign in with your credentials',
        duration: 5000
      });

      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    } catch (err: any) {
      console.error('Registration error caught:', err);
      setError(err.message);
      showErrorToast('Registration failed', {
        description: err.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  const departments = [
    'Computer Science',
    'Business Administration',
    'Engineering',
    'Medicine',
    'Education',
    'Arts and Social Sciences',
    'Law',
    'Science',
    'Agriculture',
    'Other'
  ];

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
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">
            Enter your details to register for MMU LMS
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

          {successMessage && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="your.email@mmu.ac.ke"
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) => handleRoleChange(value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="lecturer">Lecturer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'student' && (
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  placeholder="e.g., MCS-234-178/2024"
                  value={formData.studentId}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Format: Program code-Serial number-Student number/Year (e.g., MCS-234-178/2024)
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={handleDepartmentChange}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Create Account'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col space-y-4">
          <div className="text-center text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline">
              Sign in
            </Link>
          </div>

          <div className="text-center text-xs text-muted-foreground">
            By registering, you agree to our{' '}
            <a href="#" className="hover:underline">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="hover:underline">Privacy Policy</a>.
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
