import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const SimpleRegister = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    role: 'student',
    studentId: '',
    department: 'Computer Science'
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
    setSuccess(null);
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

      console.log('SimpleRegister: Submitting registration with data:', {
        email: formData.email,
        userData
      });

      // Sign up
      const { data, error } = await signUp(formData.email, formData.password, userData);

      if (error) {
        console.error('SimpleRegister: Registration error:', error);
        throw new Error(error.message || 'Failed to create account');
      }

      console.log('SimpleRegister: Registration successful:', data);

      // Show success message
      setSuccess('Account created successfully! You can now sign in.');

      // Redirect to login after a delay
      setTimeout(() => {
        navigate('/simple-login');
      }, 3000);
    } catch (err: any) {
      console.error('SimpleRegister: Registration error caught:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md p-8 space-y-8 bg-card rounded-lg shadow-lg border">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create an Account</h1>
          <p className="text-muted-foreground mt-2">Sign up to access the MMU LMS</p>
        </div>

        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-md text-green-600">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="fullName" className="text-sm font-medium">Full Name</label>
            <input
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              disabled={isLoading}
              required
            >
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          {formData.role === 'student' && (
            <div className="space-y-2">
              <label htmlFor="studentId" className="text-sm font-medium">Student ID</label>
              <input
                id="studentId"
                name="studentId"
                placeholder="e.g., MCS-234-178/2024"
                value={formData.studentId}
                onChange={handleChange}
                className="w-full p-2 border rounded-md"
                disabled={isLoading}
                required
              />
              <p className="text-xs text-muted-foreground">
                Format: Program code-Serial number-Student number/Year (e.g., MCS-234-178/2024)
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="department" className="text-sm font-medium">Department</label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full p-2 border rounded-md"
              disabled={isLoading}
              required
            >
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Software Engineering">Software Engineering</option>
              <option value="Business Information Technology">Business Information Technology</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="text-center text-sm">
          Already have an account?{' '}
          <Link to="/simple-login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SimpleRegister;
