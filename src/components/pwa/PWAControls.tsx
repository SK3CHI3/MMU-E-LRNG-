import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Download, 
  RefreshCw, 
  Smartphone, 
  CheckCircle, 
  WifiOff, 
  Wifi,
  AlertCircle
} from 'lucide-react';
import { usePWA } from './PWAManager';
import { cn } from '@/lib/utils';

interface PWAControlsProps {
  variant?: 'default' | 'compact' | 'minimal';
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  className?: string;
}

export const PWAControls: React.FC<PWAControlsProps> = ({
  variant = 'default',
  orientation = 'horizontal',
  showLabels = true,
  className
}) => {
  const {
    isInstallable,
    isInstalled,
    needsRefresh,
    isOnline,
    isCheckingForUpdates,
    isUpdating,
    installApp,
    updateApp,
    checkForUpdates
  } = usePWA();
  
  const [isInstalling, setIsInstalling] = useState(false);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      await installApp();
    } catch (error) {
      console.error('Install failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateApp();
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const handleCheckForUpdates = async () => {
    await checkForUpdates();
  };

  const containerClasses = cn(
    'flex gap-2',
    orientation === 'vertical' ? 'flex-col' : 'flex-row items-center',
    className
  );

  const buttonSize = variant === 'compact' ? 'sm' : variant === 'minimal' ? 'sm' : 'default';
  const iconSize = variant === 'minimal' ? 'h-3 w-3' : 'h-4 w-4';

  return (
    <TooltipProvider>
      <div className={containerClasses}>
        {/* Install Button */}
        {isInstallable && !isInstalled && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                size={buttonSize}
                variant={variant === 'minimal' ? 'ghost' : 'outline'}
                className={cn(
                  'transition-all duration-200',
                  variant === 'minimal' && 'p-2'
                )}
              >
                {isInstalling ? (
                  <RefreshCw className={cn(iconSize, 'animate-spin')} />
                ) : (
                  <Download className={iconSize} />
                )}
                {showLabels && variant !== 'minimal' && (
                  <span className="ml-2">
                    {isInstalling ? 'Installing...' : 'Install App'}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Install MMU Campus as an app</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Update Button */}
        {needsRefresh && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleUpdate}
                disabled={isUpdating}
                size={buttonSize}
                variant={variant === 'minimal' ? 'ghost' : 'default'}
                className={cn(
                  'relative transition-all duration-200',
                  variant === 'minimal' && 'p-2'
                )}
              >
                {isUpdating ? (
                  <RefreshCw className={cn(iconSize, 'animate-spin')} />
                ) : (
                  <RefreshCw className={iconSize} />
                )}
                {showLabels && variant !== 'minimal' && (
                  <span className="ml-2">
                    {isUpdating ? 'Updating...' : 'Update Now'}
                  </span>
                )}
                {variant !== 'minimal' && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-2 w-2 p-0 rounded-full"
                  />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update available - Click to install</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Check for Updates Button */}
        {!needsRefresh && !isUpdating && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={handleCheckForUpdates}
                disabled={isCheckingForUpdates}
                size={buttonSize}
                variant={variant === 'minimal' ? 'ghost' : 'outline'}
                className={cn(
                  'transition-all duration-200',
                  variant === 'minimal' && 'p-2'
                )}
              >
                <RefreshCw className={cn(iconSize, isCheckingForUpdates && 'animate-spin')} />
                {showLabels && variant !== 'minimal' && (
                  <span className="ml-2">
                    {isCheckingForUpdates ? 'Checking...' : 'Check Updates'}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isCheckingForUpdates ? 'Checking for updates...' : 'Check for app updates'}</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Updating Status */}
        {isUpdating && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <RefreshCw className={cn(iconSize, 'animate-spin text-blue-600')} />
                {showLabels && variant !== 'minimal' && (
                  <span className="text-xs text-blue-600 font-medium">Updating...</span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>App is updating automatically</p>
            </TooltipContent>
          </Tooltip>
        )}

        {/* Status Indicators */}
        {variant !== 'minimal' && (
          <div className="flex items-center gap-2">
            {/* Installation Status */}
            {isInstalled && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    {showLabels && (
                      <span className="text-xs text-green-600 font-medium">Installed</span>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>App is installed</p>
                </TooltipContent>
              </Tooltip>
            )}

            {/* Connection Status */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-1">
                  {isOnline ? (
                    <Wifi className="h-3 w-3 text-green-600" />
                  ) : (
                    <WifiOff className="h-3 w-3 text-orange-600" />
                  )}
                  {showLabels && (
                    <span className={cn(
                      'text-xs font-medium',
                      isOnline ? 'text-green-600' : 'text-orange-600'
                    )}>
                      {isOnline ? 'Online' : 'Offline'}
                    </span>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isOnline ? 'Connected to internet' : 'Working offline'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

// Compact version for footers
export const PWAFooterControls: React.FC<{ className?: string }> = ({ className }) => (
  <PWAControls 
    variant="compact" 
    orientation="horizontal" 
    showLabels={false}
    className={className}
  />
);

// Minimal version for dashboards
export const PWADashboardControls: React.FC<{ className?: string }> = ({ className }) => (
  <PWAControls 
    variant="minimal" 
    orientation="horizontal" 
    showLabels={false}
    className={className}
  />
);

// Full version for settings pages
export const PWASettingsControls: React.FC<{ className?: string }> = ({ className }) => (
  <PWAControls 
    variant="default" 
    orientation="vertical" 
    showLabels={true}
    className={className}
  />
);

export default PWAControls;
