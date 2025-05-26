import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EnhancedErrorAlert } from '@/components/ui/enhanced-alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showErrorToast, showSuccessToast } from '@/utils/toast';
import { getFacultyNames, getDepartmentsByFaculty } from '@/services/facultyService';

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    studentId: '',
    department: '',
    role: 'student' as 'student' | 'lecturer' | 'dean' | 'admin',
    faculty: '', // For dean role
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [faculties, setFaculties] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // Load dynamic faculty data on component mount
  useEffect(() => {
    const loadFaculties = () => {
      try {
        const facultyNames = getFacultyNames();
        setFaculties(facultyNames);
      } catch (error) {
        console.error('Error loading faculties:', error);
        // Fallback to hardcoded data
        setFaculties([
          'Faculty of Computing and Information Technology',
          'Faculty of Business and Economics',
          'Faculty of Engineering and Technology',
          'Faculty of Media and Communication',
          'Faculty of Science & Technology',
          'Faculty of Social Sciences and Technology'
        ]);
      }
    };

    loadFaculties();
  }, []);

  // Load departments when faculty changes (for dean role)
  useEffect(() => {
    if (formData.role === 'dean' && formData.faculty) {
      try {
        const facultyDepartments = getDepartmentsByFaculty(formData.faculty);
        setDepartments(facultyDepartments);
      } catch (error) {
        console.error('Error loading departments:', error);
        // Fallback to generic departments
        setDepartments([
          'Computer Science',
          'Business Administration',
          'Engineering',
          'Other'
        ]);
      }
    } else {
      // For non-dean roles, use generic departments
      setDepartments([
        'Computer Science',
        'Information Technology',
        'Business Administration',
        'Engineering',
        'Media and Communication',
        'Science',
        'Social Sciences',
        'Other'
      ]);
    }
  }, [formData.role, formData.faculty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (value: 'student' | 'lecturer' | 'dean' | 'admin') => {
    setFormData((prev) => ({ ...prev, role: value }));
  };

  const handleFacultyChange = (value: string) => {
    setFormData((prev) => ({ ...prev, faculty: value }));
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

    // Faculty validation (only for deans)
    if (formData.role === 'dean') {
      if (!formData.faculty) {
        throw new Error('Faculty is required for deans');
      }
    }

    // Department validation (required for students, lecturers, and deans)
    if (formData.role !== 'admin' && !formData.department) {
      throw new Error('Department is required');
    }
  };

  const handleEmailSelect = (email: string) => {
    setFormData(prev => ({ ...prev, email }));
    setError(null); // Clear error when email is selected
  };

  const handleRetry = () => {
    setError(null);
    setSuccessMessage(null);
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
        department: formData.role !== 'admin' ? formData.department : null,
        faculty: formData.role === 'dean' ? formData.faculty : null,
      };

      console.log('Submitting registration with data:', {
        email: formData.email,
        userData
      });

      // Sign up
      const { data, error } = await signUp(formData.email, formData.password, userData);

      if (error) {
        console.error('Registration error:', error);

        // Handle specific error cases with better user-friendly messages
        if (error.message?.includes('already registered') ||
            error.message?.includes('User already registered') ||
            error.message?.includes('duplicate key value violates unique constraint')) {
          throw new Error('This email address is already registered. Please use a different email or try to sign in instead.');
        } else if (error.message?.includes('duplicate key value violates unique constraint "users_email_key"')) {
          throw new Error('An account with this email already exists. Please use a different email address or sign in to your existing account.');
        } else if (error.message?.includes('duplicate key value violates unique constraint "users_student_id_key"')) {
          throw new Error('This student ID is already registered. Please check your student ID or contact support if you believe this is an error.');
        } else if (error.message?.includes('invalid api key')) {
          throw new Error('There was a problem connecting to the server. Please try again later or contact support.');
        } else if (error.message?.includes('Email rate limit exceeded')) {
          throw new Error('Too many registration attempts. Please wait a few minutes before trying again.');
        } else if (error.message?.includes('Invalid email')) {
          throw new Error('Please enter a valid email address.');
        } else if (error.message?.includes('Password should be at least 6 characters')) {
          throw new Error('Password must be at least 6 characters long.');
        } else {
          throw new Error(error.message || 'Failed to create account. Please try again.');
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
            <div className="mb-4">
              <EnhancedErrorAlert
                error={error}
                originalEmail={formData.email}
                role={formData.role}
                faculty={formData.faculty}
                onEmailSelect={handleEmailSelect}
                onRetry={handleRetry}
              />
            </div>
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
                  <SelectItem value="dean">Dean</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
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

            {formData.role === 'dean' && (
              <div className="space-y-2">
                <Label htmlFor="faculty">Faculty</Label>
                <Select
                  value={formData.faculty}
                  onValueChange={handleFacultyChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {faculties.map((faculty) => (
                      <SelectItem key={faculty} value={faculty}>
                        {faculty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.role !== 'admin' && (
              <div className="space-y-2">
                <Label htmlFor="department">
                  {formData.role === 'dean' ? 'Primary Department' : 'Department'}
                </Label>
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
            )}

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
