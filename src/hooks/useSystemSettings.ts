import { useState, useEffect } from 'react';
import { getPublicSettings } from '@/services/adminService';

interface SystemSettings {
  site_name?: string;
  site_description?: string;
  site_url?: string;
  maintenance_mode?: boolean;
  registration_enabled?: boolean;
  signup_page_visible?: boolean;
  welcome_message?: string;
  show_mmu_branding?: boolean;
  theme?: string;
  primary_color?: string;
  secondary_color?: string;
  logo_url?: string;
  favicon_url?: string;
  default_language?: string;
  timezone?: string;
}

export const useSystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettings>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const publicSettings = await getPublicSettings();
      setSettings(publicSettings);
    } catch (err) {
      console.error('Error fetching system settings:', err);
      setError('Failed to load system settings');
      // Set default values on error
      setSettings({
        site_name: 'MMU Learning Management System',
        site_description: 'Elevating Learning, Empowering Futures',
        maintenance_mode: false,
        registration_enabled: true,
        signup_page_visible: true,
        welcome_message: 'Welcome to MMU Digital Campus Experience',
        show_mmu_branding: true,
        theme: 'light',
        primary_color: '#2563eb',
        secondary_color: '#dc2626',
        default_language: 'en',
        timezone: 'Africa/Nairobi'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    error,
    refetch: fetchSettings
  };
};

// Helper functions for specific settings
export const useRegistrationSettings = () => {
  const { settings, loading } = useSystemSettings();
  
  return {
    registrationEnabled: settings.registration_enabled ?? true,
    signupPageVisible: settings.signup_page_visible ?? true,
    loading
  };
};

export const useMaintenanceMode = () => {
  const { settings, loading } = useSystemSettings();
  
  return {
    maintenanceMode: settings.maintenance_mode ?? false,
    loading
  };
};

export const useSiteSettings = () => {
  const { settings, loading } = useSystemSettings();
  
  return {
    siteName: settings.site_name ?? 'MMU Learning Management System',
    siteDescription: settings.site_description ?? 'Elevating Learning, Empowering Futures',
    welcomeMessage: settings.welcome_message ?? 'Welcome to MMU Digital Campus Experience',
    showMmuBranding: settings.show_mmu_branding ?? true,
    loading
  };
};

export const useThemeSettings = () => {
  const { settings, loading } = useSystemSettings();
  
  return {
    theme: settings.theme ?? 'light',
    primaryColor: settings.primary_color ?? '#2563eb',
    secondaryColor: settings.secondary_color ?? '#dc2626',
    logoUrl: settings.logo_url ?? '',
    faviconUrl: settings.favicon_url ?? '',
    loading
  };
};
