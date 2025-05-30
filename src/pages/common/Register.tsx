import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input, PasswordInput } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showErrorToast, showSuccessToast } from '@/utils/ui/toast';
import { getFacultyNames, getDepartmentsByFaculty } from '@/services/facultyService';
import { mmuFaculties } from '@/data/mmuData';
import { useRegistrationSettings } from '@/hooks/useSystemSettings';
// Removed complex email checking utilities

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    studentId: '',
    department: '', // Only for deans (they head departments)
    role: '' as 'student' | 'lecturer' | 'dean' | 'admin' | '',
    faculty: '', // For all roles that need faculty
    programme: '', // For students and lecturers (department auto-determined from programme)
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [faculties, setFaculties] = useState<string[]>([]);
  const [departments, setDepartments] = useState<string[]>([]);
  const [programmes, setProgrammes] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    feedback: string[];
    isValid: boolean;
  }>({ score: 0, feedback: [], isValid: false });
  // Removed complex email status checking
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const { registrationEnabled } = useRegistrationSettings();

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

  // Load programmes and departments when faculty changes
  useEffect(() => {
    if (formData.faculty) {
      try {
        const selectedFaculty = mmuFaculties.find(f => f.name === formData.faculty);
        if (selectedFaculty) {
          // Load programmes
          const facultyProgrammes = selectedFaculty.programmes.map(p => p.name);
          setProgrammes(facultyProgrammes);

          // Load departments
          const facultyDepartments = selectedFaculty.departments.map(d => d.name);
          setDepartments(facultyDepartments);
        }
      } catch (error) {
        console.error('Error loading faculty data:', error);
        // Fallback to generic data
        setProgrammes([
          'Bachelor of Science in Computer Science',
          'Bachelor of Science in Information Technology',
          'Bachelor of Commerce',
          'Bachelor of Engineering'
        ]);
        setDepartments([
          'Computer Science',
          'Information Technology',
          'Business Administration',
          'Engineering'
        ]);
      }
    } else {
      // Clear programmes and departments when no faculty is selected
      setProgrammes([]);
      setDepartments([]);
    }
  }, [formData.faculty]);

  // Password strength validation function
  const validatePasswordStrength = (password: string) => {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('At least 8 characters');
    }

    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One uppercase letter');
    }

    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One lowercase letter');
    }

    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('One number');
    }

    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      feedback.push('One special character');
    }

    return {
      score,
      feedback,
      isValid: score >= 3 && password.length >= 8
    };
  };

  // Real-time field validation
  const validateField = (name: string, value: string) => {
    const errors: Record<string, string> = { ...fieldErrors };

    switch (name) {
      case 'email': {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          errors.email = 'Please enter a valid email address';
        } else {
          delete errors.email;
        }
        break;
      }

      case 'fullName':
        if (!value.trim()) {
          errors.fullName = 'Full name is required';
        } else if (value.trim().length < 2) {
          errors.fullName = 'Full name must be at least 2 characters';
        } else {
          delete errors.fullName;
        }
        break;

      case 'studentId':
        if (formData.role === 'student') {
          if (!value.trim()) {
            errors.studentId = 'Admission number is required';
          } else {
            const studentIdRegex = /^[A-Z]{2,4}-\d{3}-\d{3}\/\d{4}$/;
            if (!studentIdRegex.test(value)) {
              errors.studentId = 'Format: MCS-234-178/2024';
            } else {
              delete errors.studentId;
            }
          }
        }
        break;

      case 'password': {
        const strength = validatePasswordStrength(value);
        setPasswordStrength(strength);
        if (!strength.isValid) {
          errors.password = 'Password does not meet requirements';
        } else {
          delete errors.password;
        }
        break;
      }

      case 'confirmPassword':
        if (value !== formData.password) {
          errors.confirmPassword = 'Passwords do not match';
        } else {
          delete errors.confirmPassword;
        }
        break;
    }

    setFieldErrors(errors);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Real-time validation
    validateField(name, value);

    // Clear global error when user starts typing
    if (error) {
      setError(null);
    }
  };

  const handleRoleChange = (value: 'student' | 'lecturer' | 'dean' | 'admin') => {
    setFormData((prev) => ({
      ...prev,
      role: value,
      // Clear fields based on role
      department: value === 'dean' ? prev.faculty : (value === 'student' || value === 'lecturer') ? '' : prev.department, // Deans: department = faculty they head
      faculty: value === 'admin' ? '' : prev.faculty,
      programme: value === 'dean' || value === 'admin' ? '' : prev.programme, // Students and lecturers select programmes
      studentId: value !== 'student' ? '' : prev.studentId
    }));
  };

  const handleFacultyChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      faculty: value,
      programme: '',
      // For deans, department should be set to the faculty they head
      department: prev.role === 'dean' ? value : ''
    }));
  };

  const handleProgrammeChange = (value: string) => {
    // When programme is selected, automatically determine the department
    const selectedFaculty = mmuFaculties.find(f => f.name === formData.faculty);
    let programDepartment = '';

    if (selectedFaculty) {
      // Find which department this programme belongs to
      // For now, we'll use a simple mapping based on programme name
      const programme = selectedFaculty.programmes.find(p => p.name === value);
      if (programme) {
        // Map programme to department based on programme content and faculty
        // Check for Journalism and Communication FIRST to avoid conflict with "Communication" in other programs
        if (value.includes('Journalism') && value.includes('Communication')) {
          programDepartment = 'Department of Journalism and Communication';
        } else if (value.includes('Film') || value.includes('Broadcast')) {
          programDepartment = 'Department of Film and Broadcast';
        } else if (value.includes('Computer Science') || value.includes('Computer Technology')) {
          programDepartment = 'Department of Computer Science';
        } else if (value.includes('Information Technology') || value.includes('ICT')) {
          programDepartment = 'Department of Information Technology';
        } else if (value.includes('Software Engineering')) {
          programDepartment = 'Department of Computer Science'; // Software Engineering typically under CS
        } else if (value.includes('Business') || value.includes('Commerce') || value.includes('MBA') || value.includes('Management')) {
          programDepartment = 'Department of Marketing and Management';
        } else if (value.includes('Procurement') || value.includes('Logistics')) {
          programDepartment = 'Department of Procurement and Logistics Management';
        } else if (value.includes('Finance') || value.includes('Accounting') || value.includes('Actuarial')) {
          programDepartment = 'Department of Finance and Accounting';
        } else if (value.includes('Electrical') || value.includes('Communication Engineering')) {
          programDepartment = 'Department of Electrical & Communication Engineering (ECE)';
        } else if (value.includes('Mechanical') || value.includes('Mechatronics')) {
          programDepartment = 'Department of Mechanical & Mechatronics Engineering (MME)';
        } else if (value.includes('Civil Engineering')) {
          programDepartment = 'Department of Civil Engineering (CE)';
        } else if (value.includes('Chemistry')) {
          programDepartment = 'Department of Chemistry';
        } else if (value.includes('Physics')) {
          programDepartment = 'Department of Physics';
        } else if (value.includes('Mathematics')) {
          programDepartment = 'Department of Mathematics';
        } else if (value.includes('Psychology')) {
          programDepartment = 'Department of Psychology';
        } else if (value.includes('Sociology')) {
          programDepartment = 'Department of Sociology';
        } else if (value.includes('Political Science')) {
          programDepartment = 'Department of Political Science';
        } else {
          // Default to first department in faculty
          programDepartment = selectedFaculty.departments[0]?.name || '';
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      programme: value,
      // Auto-set department for students and lecturers based on programme
      department: (prev.role === 'student' || prev.role === 'lecturer') ? programDepartment : prev.department
    }));
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

    // Role validation
    if (!formData.role || formData.role === '') {
      throw new Error('Please select your role');
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

    // Faculty validation (required for all roles except admin)
    if (formData.role !== 'admin' && !formData.faculty) {
      throw new Error('Faculty is required');
    }

    // Programme validation (required for students and lecturers)
    if ((formData.role === 'student' || formData.role === 'lecturer') && !formData.programme) {
      throw new Error('Programme is required');
    }

    // Faculty validation for deans (they head the entire faculty)
    if (formData.role === 'dean' && !formData.faculty) {
      throw new Error('Faculty is required for deans - you must select the faculty you head');
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

      // Prepare user data (excluding programme_id to avoid foreign key constraint issues)
      const userData = {
        full_name: formData.fullName,
        role: formData.role as 'student' | 'lecturer' | 'dean' | 'admin',
        student_id: formData.role === 'student' ? formData.studentId : null,
        department: formData.role === 'dean' ? formData.faculty : formData.department || null, // Deans: department = faculty they head
        faculty: formData.role !== 'admin' ? formData.faculty : null,
        // Note: programme_id is intentionally excluded to avoid foreign key constraint issues
        // Programme information will be stored in the department field for now
      };

      // Registration data prepared for submission

      // Sign up
      const { data, error } = await signUp(formData.email, formData.password, userData);

      if (error) {
        // Use the error message as-is from the AuthContext
        throw new Error(error.message || 'Failed to create account. Please try again.');
      }

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
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Registration Failed</AlertTitle>
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
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                disabled={isLoading}
                required
                className={fieldErrors.fullName ? 'border-red-500' : ''}
              />
              {fieldErrors.fullName && (
                <p className="text-sm text-red-500">{fieldErrors.fullName}</p>
              )}
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
                className={fieldErrors.email ? 'border-red-500' : ''}
              />
              {fieldErrors.email && (
                <p className="text-sm text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  name="password"
                  placeholder="Create a strong password"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className={fieldErrors.password ? 'border-red-500' : ''}
                />
                {formData.password && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            passwordStrength.score <= 1
                              ? 'bg-red-500 w-1/4'
                              : passwordStrength.score <= 2
                              ? 'bg-yellow-500 w-2/4'
                              : passwordStrength.score <= 3
                              ? 'bg-blue-500 w-3/4'
                              : 'bg-green-500 w-full'
                          }`}
                        />
                      </div>
                      <span className="text-xs font-medium">
                        {passwordStrength.score <= 1
                          ? 'Weak'
                          : passwordStrength.score <= 2
                          ? 'Fair'
                          : passwordStrength.score <= 3
                          ? 'Good'
                          : 'Strong'}
                      </span>
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <p>Password needs:</p>
                        <ul className="list-disc list-inside">
                          {passwordStrength.feedback.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <PasswordInput
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className={fieldErrors.confirmPassword ? 'border-red-500' : ''}
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-sm text-red-500">{fieldErrors.confirmPassword}</p>
                )}
                {formData.confirmPassword && formData.password === formData.confirmPassword && (
                  <p className="text-sm text-green-600 flex items-center">
                    <span className="mr-1">✓</span>
                    Passwords match
                  </p>
                )}
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
                <Label htmlFor="studentId">Admission Number</Label>
                <Input
                  id="studentId"
                  name="studentId"
                  placeholder="e.g., MCS-234-178/2024"
                  value={formData.studentId}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className={fieldErrors.studentId ? 'border-red-500' : ''}
                />
                {fieldErrors.studentId && (
                  <p className="text-sm text-red-500">{fieldErrors.studentId}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Format: Program code-Serial number-Student number/Year (e.g., MCS-234-178/2024)
                </p>
                <p className="text-xs text-amber-600">
                  💡 Use your unique admission number. If you get an error, try a different number like MCS-234-179/2024
                </p>
              </div>
            )}

            {/* Faculty selection for all roles except admin */}
            {formData.role !== 'admin' && (
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

            {/* Programme selection for students and lecturers */}
            {(formData.role === 'student' || formData.role === 'lecturer') && formData.faculty && (
              <div className="space-y-2">
                <Label htmlFor="programme">Programme</Label>
                <Select
                  value={formData.programme}
                  onValueChange={handleProgrammeChange}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your programme" />
                  </SelectTrigger>
                  <SelectContent>
                    {programmes.map((programme) => (
                      <SelectItem key={programme} value={programme}>
                        {programme}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {formData.programme && formData.department && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      📍 Selected Department:
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      {formData.department}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Information for deans - they head the entire faculty */}
            {formData.role === 'dean' && formData.faculty && (
              <div className="space-y-2">
                <Label>Faculty Leadership</Label>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    You are registering as the Dean of:
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                    {formData.faculty}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">
                  As a dean, you head the entire faculty and oversee all departments within it
                </p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !registrationEnabled}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : !registrationEnabled ? (
                'Registration Disabled'
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
