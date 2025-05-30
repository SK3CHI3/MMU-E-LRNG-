import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistrationSettings } from '@/hooks/useSystemSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface RegistrationGuardProps {
  children: React.ReactNode;
}

const RegistrationGuard: React.FC<RegistrationGuardProps> = ({ children }) => {
  const { registrationEnabled, signupPageVisible, loading } = useRegistrationSettings();
  const navigate = useNavigate();

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If signup page is not visible, redirect to login
  if (!signupPageVisible) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-red-100 p-3">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Registration Unavailable
            </CardTitle>
            <CardDescription className="text-gray-600">
              Account registration is currently not available. Please contact the administrator for assistance.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-500">
                If you already have an account, you can still sign in.
              </p>
              <div className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link to="/login">
                    Go to Login
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Home
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If registration is disabled but page is visible, show warning
  if (!registrationEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5 p-4">
        <div className="w-full max-w-md space-y-4">
          {/* Warning Card */}
          <Card className="border-amber-200 bg-amber-50 dark:bg-amber-900/20">
            <CardHeader className="text-center pb-3">
              <div className="flex justify-center mb-2">
                <div className="rounded-full bg-amber-100 p-2">
                  <AlertTriangle className="h-6 w-6 text-amber-600" />
                </div>
              </div>
              <CardTitle className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                Registration Temporarily Disabled
              </CardTitle>
              <CardDescription className="text-amber-700 dark:text-amber-300">
                New account registration is currently disabled. The form below is for reference only.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Registration Form (disabled) */}
          <div className="opacity-60 pointer-events-none">
            {children}
          </div>

          {/* Action Buttons */}
          <Card>
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account? You can still sign in.
                </p>
                <div className="flex flex-col gap-2">
                  <Button asChild className="w-full">
                    <Link to="/login">
                      Sign In Instead
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to Home
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // If everything is enabled, render the registration form normally
  return <>{children}</>;
};

export default RegistrationGuard;
