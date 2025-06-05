import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Download, Smartphone, Zap, Wifi, Bell } from 'lucide-react';

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
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if app is already installed (running in standalone mode)
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              (window.navigator as any).standalone ||
                              document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
    };

    checkStandalone();

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after a delay if not already dismissed
      const dismissed = localStorage.getItem('pwa-install-dismissed');
      const lastShown = localStorage.getItem('pwa-install-last-shown');
      const now = Date.now();
      
      // Show prompt if never dismissed or if 7 days have passed since last dismissal
      if (!dismissed || (lastShown && now - parseInt(lastShown) > 7 * 24 * 60 * 60 * 1000)) {
        setTimeout(() => setShowPrompt(true), 3000); // Show after 3 seconds
      }
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setShowPrompt(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa-installed', 'true');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);
    
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        localStorage.setItem('pwa-installed', 'true');
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Error during PWA installation:', error);
    } finally {
      setIsInstalling(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
    localStorage.setItem('pwa-install-last-shown', Date.now().toString());
    onClose?.();
  };

  // Don't show if already installed or no prompt available
  if (isStandalone || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Smartphone className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Install MMU Campus</CardTitle>
                <CardDescription>Get the full app experience</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Features */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-yellow-600" />
              <span>Faster loading</span>
            </div>
            <div className="flex items-center gap-2">
              <Wifi className="h-4 w-4 text-green-600" />
              <span>Works offline</span>
            </div>
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-blue-600" />
              <span>Push notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-purple-600" />
              <span>Native feel</span>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-2">
            <Badge variant="secondary" className="text-xs">
              ✨ Enhanced Performance
            </Badge>
            <p className="text-sm text-muted-foreground">
              Install the app for instant access to assignments, classes, and study tools - even when you're offline!
            </p>
          </div>

          {/* Install Button */}
          <Button
            onClick={handleInstallClick}
            disabled={isInstalling}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            <Download className="h-4 w-4 mr-2" />
            {isInstalling ? 'Installing...' : 'Install App'}
          </Button>

          {/* Dismiss option */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="w-full text-xs"
          >
            Maybe later
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAInstallPrompt;
