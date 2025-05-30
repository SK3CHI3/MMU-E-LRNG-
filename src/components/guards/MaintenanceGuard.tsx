import { useMaintenanceMode } from '@/hooks/useSystemSettings';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Clock, Wrench } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface MaintenanceGuardProps {
  children: React.ReactNode;
}

const MaintenanceGuard: React.FC<MaintenanceGuardProps> = ({ children }) => {
  const { maintenanceMode, loading } = useMaintenanceMode();
  const { dbUser } = useAuth();

  // If loading, show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If maintenance mode is enabled and user is not an admin, show maintenance page
  if (maintenanceMode && dbUser?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 p-4">
        <Card className="w-full max-w-lg shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="rounded-full bg-amber-100 dark:bg-amber-900/30 p-6">
                  <Wrench className="h-12 w-12 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="absolute -top-1 -right-1 rounded-full bg-red-100 dark:bg-red-900/30 p-2">
                  <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>
            <CardTitle className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              System Maintenance
            </CardTitle>
            <CardDescription className="text-lg text-gray-600 dark:text-gray-300">
              We're currently performing scheduled maintenance to improve your experience.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
                    Maintenance in Progress
                  </h3>
                  <p className="text-sm text-amber-700 dark:text-amber-300">
                    Our team is working to enhance the system. We expect to be back online shortly.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white">
                What's happening?
              </h4>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                  <span>System updates and security enhancements</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                  <span>Database optimization for better performance</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0"></span>
                  <span>New features and improvements</span>
                </li>
              </ul>
            </div>

            <div className="space-y-3">
              <Button 
                onClick={() => window.location.reload()} 
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Check Again
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Need immediate assistance?
                </p>
                <a 
                  href="mailto:support@mmu.ac.ke" 
                  className="text-sm text-primary hover:underline font-medium"
                >
                  Contact Support
                </a>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  Follow us for updates:
                </p>
                <div className="flex justify-center space-x-4">
                  <a 
                    href="https://twitter.com/mmu_kenya" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    Twitter
                  </a>
                  <a 
                    href="https://www.facebook.com/MultimediaUniversityOfKenya" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    Facebook
                  </a>
                  <a 
                    href="https://www.mmu.ac.ke" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors"
                  >
                    Website
                  </a>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If maintenance mode is disabled or user is admin, render normally
  return <>{children}</>;
};

export default MaintenanceGuard;
