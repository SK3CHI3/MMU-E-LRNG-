import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Download, Smartphone, Zap, Wifi, Bell } from 'lucide-react';
import { usePWA } from './PWAManager';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface PWAInstallPromptProps {
  onClose?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ onClose }) => {
  const { isInstallable, isInstalled, installApp } = usePWA();

  const handleInstallClick = async () => {
    await installApp();
    onClose?.();
  };

  const handleDismiss = () => {
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-install-last-shown', Date.now().toString());
    onClose?.();
  };

  // Don't show if already installed or not installable
  if (isInstalled || !isInstallable) {
    return null;
  }

  // Check if user has dismissed recently
  const dismissed = localStorage.getItem('pwa-install-dismissed');
  const lastShown = localStorage.getItem('pwa-install-last-shown');
  const now = Date.now();

  // Don't show if dismissed and less than 7 days have passed
  if (dismissed && lastShown && now - parseInt(lastShown) < 7 * 24 * 60 * 60 * 1000) {
    return null;
  }

  return (
    <div className="fixed top-16 right-4 z-40 animate-in slide-in-from-top-2 duration-300">
      <Card className="border-blue-200 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg max-w-sm">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-600 rounded-lg">
                <Smartphone className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-sm font-semibold">Install MMU Campus</CardTitle>
                <CardDescription className="text-xs">Get the full app experience</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-5 w-5 p-0 shrink-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Features - Compact */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <Zap className="h-3 w-3 text-yellow-600" />
              <span>Faster</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3 text-green-600" />
              <span>Offline</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Bell className="h-3 w-3 text-blue-600" />
              <span>Notifications</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone className="h-3 w-3 text-purple-600" />
              <span>Native feel</span>
            </div>
          </div>

          {/* Benefits - Compact */}
          <p className="text-xs text-muted-foreground leading-relaxed">
            Install for instant access to assignments, classes, and study tools - even offline!
          </p>

          {/* Install Button - Compact */}
          <div className="flex gap-2">
            <Button
              onClick={handleInstallClick}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-xs h-8"
            >
              <Download className="h-3 w-3 mr-1" />
              Install
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="text-xs h-8 px-3"
            >
              Later
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
