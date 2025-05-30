import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Settings,
  Save,
  RefreshCw,
  Globe,
  Mail,
  Shield,
  Database,
  Users,
  CheckCircle,
  AlertTriangle,
  Info,
  Palette
} from 'lucide-react';
import { getSystemSettings, updateSystemSettings } from '@/services/adminService';
import { SystemSettings, SETTING_VALIDATION_RULES } from '@/types/settings';

const GlobalSettings = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      const systemSettings = await getSystemSettings();
      setSettings(systemSettings);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setErrorMessage('Failed to load system settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const validateSetting = (key: string, value: any): string | null => {
    const rule = SETTING_VALIDATION_RULES[key];
    if (!rule) return null;

    // Skip validation for empty values unless explicitly required
    const isEmpty = value === null || value === undefined || value === '';
    if (isEmpty && !rule.required) {
      return null;
    }

    if (rule.required && isEmpty) {
      return `${key.replace(/_/g, ' ')} is required`;
    }

    // Only validate non-empty values
    if (!isEmpty) {
      if (typeof value === 'string') {
        if (rule.min && value.length < rule.min) {
          return `${key.replace(/_/g, ' ')} must be at least ${rule.min} characters`;
        }
        if (rule.max && value.length > rule.max) {
          return `${key.replace(/_/g, ' ')} must be no more than ${rule.max} characters`;
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          return `${key.replace(/_/g, ' ')} format is invalid`;
        }
      }

      if (typeof value === 'number') {
        if (isNaN(value)) {
          return `${key.replace(/_/g, ' ')} must be a valid number`;
        }
        if (rule.min && value < rule.min) {
          return `${key.replace(/_/g, ' ')} must be at least ${rule.min}`;
        }
        if (rule.max && value > rule.max) {
          return `${key.replace(/_/g, ' ')} must be no more than ${rule.max}`;
        }
      }

      if (rule.allowedValues && !rule.allowedValues.includes(value)) {
        return `${key.replace(/_/g, ' ')} must be one of: ${rule.allowedValues.join(', ')}`;
      }

      if (rule.customValidator) {
        const result = rule.customValidator(value);
        if (typeof result === 'string') return result;
        if (result === false) return `${key.replace(/_/g, ' ')} is invalid`;
      }
    }

    return null;
  };

  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);

    // Clear any existing error for this field
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }

    // Validate the new value
    const error = validateSetting(key, value);
    if (error) {
      setErrors(prev => ({ ...prev, [key]: error }));
    }
  };

  const handleNestedSettingChange = (parent: string, key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      // Validate all settings before saving
      const validationErrors: Record<string, string> = {};
      if (settings) {
        Object.entries(settings).forEach(([key, value]) => {
          const error = validateSetting(key, value);
          if (error) {
            validationErrors[key] = error;
            console.log(`Validation error for ${key}:`, error, 'Value:', value);
          }
        });
      }

      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        console.log('All validation errors:', validationErrors);
        setErrorMessage(`Please fix the validation errors before saving. Errors found in: ${Object.keys(validationErrors).join(', ')}`);
        return;
      }

      const success = await updateSystemSettings(settings);
      if (success) {
        setHasChanges(false);
        setSuccessMessage('Settings saved successfully!');
        setTimeout(() => setSuccessMessage(''), 5000);
      } else {
        setErrorMessage('Failed to save settings. Please try again.');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setErrorMessage('An error occurred while saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleResetSettings = async () => {
    if (window.confirm('Are you sure you want to reset all settings to their default values? This action cannot be undone.')) {
      try {
        setLoading(true);
        await fetchSettings();
        setHasChanges(false);
        setErrors({});
        setSuccessMessage('Settings have been reset to default values.');
        setTimeout(() => setSuccessMessage(''), 5000);
      } catch (error) {
        setErrorMessage('Failed to reset settings. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Settings className="h-8 w-8 text-blue-600" />
            Global Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Configure system-wide settings and preferences</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleResetSettings} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Reset to Defaults
          </Button>
          {Object.keys(errors).length > 0 && (
            <Button variant="outline" onClick={() => setErrors({})}>
              Clear Errors
            </Button>
          )}
          <Button onClick={handleSaveSettings} disabled={!hasChanges || saving}>
            <Save className={`h-4 w-4 mr-2 ${saving ? 'animate-spin' : ''}`} />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-900/20">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {errorMessage && (
        <Alert className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {errorMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Changes indicator */}
      {hasChanges && (
        <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            You have unsaved changes. Don't forget to save your settings.
          </AlertDescription>
        </Alert>
      )}

      {/* Changes Indicator */}
      {hasChanges && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-900 dark:text-orange-100">
                You have unsaved changes. Don't forget to save your settings.
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            System
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Site Information
              </CardTitle>
              <CardDescription>Basic information about your learning management system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Site Name</Label>
                  <Input
                    id="siteName"
                    value={settings?.site_name || ''}
                    onChange={(e) => handleSettingChange('site_name', e.target.value)}
                    placeholder="MMU Learning Management System"
                    className={errors.site_name ? 'border-red-500' : ''}
                  />
                  {errors.site_name && (
                    <p className="text-sm text-red-600 mt-1">{errors.site_name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">Site URL</Label>
                  <Input
                    id="siteUrl"
                    value="https://lms.mmu.ac.ke"
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={settings?.site_description || ''}
                  onChange={(e) => handleSettingChange('site_description', e.target.value)}
                  placeholder="Elevating Learning, Empowering Futures"
                  rows={3}
                  className={errors.site_description ? 'border-red-500' : ''}
                />
                {errors.site_description && (
                  <p className="text-sm text-red-600 mt-1">{errors.site_description}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="welcomeMessage">Welcome Message</Label>
                <Input
                  id="welcomeMessage"
                  value={settings?.welcome_message || ''}
                  onChange={(e) => handleSettingChange('welcome_message', e.target.value)}
                  placeholder="Welcome to MMU Digital Campus Experience"
                  className={errors.welcome_message ? 'border-red-500' : ''}
                />
                {errors.welcome_message && (
                  <p className="text-sm text-red-600 mt-1">{errors.welcome_message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Registration
              </CardTitle>
              <CardDescription>Control user registration and access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow User Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new users to register for accounts
                  </p>
                </div>
                <Switch
                  checked={settings?.registration_enabled || false}
                  onCheckedChange={(checked) => handleSettingChange('registration_enabled', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Signup Page</Label>
                  <p className="text-sm text-muted-foreground">
                    Display signup page to visitors (even if registration is disabled)
                  </p>
                </div>
                <Switch
                  checked={settings?.signup_page_visible || false}
                  onCheckedChange={(checked) => handleSettingChange('signup_page_visible', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Temporarily disable access for maintenance
                  </p>
                </div>
                <Switch
                  checked={settings?.maintenance_mode || false}
                  onCheckedChange={(checked) => handleSettingChange('maintenance_mode', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show MMU Branding</Label>
                  <p className="text-sm text-muted-foreground">
                    Display MMU branding elements throughout the system
                  </p>
                </div>
                <Switch
                  checked={settings?.show_mmu_branding || false}
                  onCheckedChange={(checked) => handleSettingChange('show_mmu_branding', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Password Policy
              </CardTitle>
              <CardDescription>Configure password requirements for all users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minLength">Minimum Length</Label>
                  <Input
                    id="minLength"
                    type="number"
                    value={settings?.password_policy?.minLength || 8}
                    onChange={(e) => handleNestedSettingChange('password_policy', 'minLength', parseInt(e.target.value))}
                    min="6"
                    max="20"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={settings?.session_timeout || 30}
                    onChange={(e) => handleSettingChange('session_timeout', parseInt(e.target.value))}
                    min="5"
                    max="480"
                    className={errors.session_timeout ? 'border-red-500' : ''}
                  />
                  {errors.session_timeout && (
                    <p className="text-sm text-red-600 mt-1">{errors.session_timeout}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                  <Input
                    id="maxLoginAttempts"
                    type="number"
                    value={settings?.max_login_attempts || 5}
                    onChange={(e) => handleSettingChange('max_login_attempts', parseInt(e.target.value))}
                    min="3"
                    max="10"
                    className={errors.max_login_attempts ? 'border-red-500' : ''}
                  />
                  {errors.max_login_attempts && (
                    <p className="text-sm text-red-600 mt-1">{errors.max_login_attempts}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Uppercase Letters</Label>
                    <p className="text-sm text-muted-foreground">
                      Passwords must contain at least one uppercase letter
                    </p>
                  </div>
                  <Switch
                    checked={settings?.password_policy?.requireUppercase || false}
                    onCheckedChange={(checked) => handleNestedSettingChange('password_policy', 'requireUppercase', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Lowercase Letters</Label>
                    <p className="text-sm text-muted-foreground">
                      Passwords must contain at least one lowercase letter
                    </p>
                  </div>
                  <Switch
                    checked={settings?.password_policy?.requireLowercase || false}
                    onCheckedChange={(checked) => handleNestedSettingChange('password_policy', 'requireLowercase', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Numbers</Label>
                    <p className="text-sm text-muted-foreground">
                      Passwords must contain at least one number
                    </p>
                  </div>
                  <Switch
                    checked={settings?.password_policy?.requireNumbers || false}
                    onCheckedChange={(checked) => handleNestedSettingChange('password_policy', 'requireNumbers', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Require Special Characters</Label>
                    <p className="text-sm text-muted-foreground">
                      Passwords must contain at least one special character
                    </p>
                  </div>
                  <Switch
                    checked={settings?.password_policy?.requireSpecialChars || false}
                    onCheckedChange={(checked) => handleNestedSettingChange('password_policy', 'requireSpecialChars', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Configuration
              </CardTitle>
              <CardDescription>Configure email settings for notifications and communications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send email notifications for important events
                  </p>
                </div>
                <Switch
                  checked={settings?.email_notifications || false}
                  onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="smtpHost">SMTP Host</Label>
                  <Input
                    id="smtpHost"
                    placeholder="smtp.gmail.com"
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPort">SMTP Port</Label>
                  <Input
                    id="smtpPort"
                    placeholder="587"
                    disabled
                    className="bg-gray-50 dark:bg-gray-800"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                System Configuration
              </CardTitle>
              <CardDescription>Configure system-level settings and limits</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxFileSize">Max File Upload Size (MB)</Label>
                  <Input
                    id="maxFileSize"
                    type="number"
                    value={settings?.max_file_size || 50}
                    onChange={(e) => handleSettingChange('max_file_size', parseInt(e.target.value))}
                    className={errors.max_file_size ? 'border-red-500' : ''}
                    min="1"
                    max="500"
                  />
                  {errors.max_file_size && (
                    <p className="text-sm text-red-600 mt-1">{errors.max_file_size}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logRetention">Log Retention (days)</Label>
                  <Input
                    id="logRetention"
                    type="number"
                    value={settings?.log_retention || 90}
                    onChange={(e) => handleSettingChange('log_retention', parseInt(e.target.value))}
                    className={errors.log_retention ? 'border-red-500' : ''}
                    min="7"
                    max="365"
                  />
                  {errors.log_retention && (
                    <p className="text-sm text-red-600 mt-1">{errors.log_retention}</p>
                  )}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="backupFrequency">Backup Frequency</Label>
                <Select
                  value={settings?.backup_frequency || 'daily'}
                  onValueChange={(value) => handleSettingChange('backup_frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">Hourly</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme & Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultTheme">Default Theme</Label>
                  <Select
                    value={settings?.theme || 'light'}
                    onValueChange={(value) => handleSettingChange('theme', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="auto">Auto (System)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Primary Color</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    value={settings?.primary_color || '#2563eb'}
                    onChange={(e) => handleSettingChange('primary_color', e.target.value)}
                    className="h-10 w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondaryColor">Secondary Color</Label>
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={settings?.secondary_color || '#dc2626'}
                    onChange={(e) => handleSettingChange('secondary_color', e.target.value)}
                    className="h-10 w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUrl">Logo URL</Label>
                  <Input
                    id="logoUrl"
                    value={settings?.logo_url || ''}
                    onChange={(e) => handleSettingChange('logo_url', e.target.value)}
                    placeholder="https://example.com/logo.png"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customCss">Custom CSS</Label>
                <Textarea
                  id="customCss"
                  value={settings?.custom_css || ''}
                  onChange={(e) => handleSettingChange('custom_css', e.target.value)}
                  placeholder="/* Add your custom CSS here */"
                  rows={4}
                  className="font-mono text-sm"
                />
                <p className="text-sm text-muted-foreground">
                  Add custom CSS to override default styles. Use with caution.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Notification Settings
              </CardTitle>
              <CardDescription>Configure system notifications and alerts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Email Notifications</h4>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Assignment Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify users about assignment updates
                      </p>
                    </div>
                    <Switch
                      checked={settings?.assignment_notifications || false}
                      onCheckedChange={(checked) => handleSettingChange('assignment_notifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Grade Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify students about new grades
                      </p>
                    </div>
                    <Switch
                      checked={settings?.grade_notifications || false}
                      onCheckedChange={(checked) => handleSettingChange('grade_notifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Announcement Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Notify users about new announcements
                      </p>
                    </div>
                    <Switch
                      checked={settings?.announcement_notifications || false}
                      onCheckedChange={(checked) => handleSettingChange('announcement_notifications', checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">System Notifications</h4>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Enable browser push notifications
                      </p>
                    </div>
                    <Switch
                      checked={settings?.push_notifications || false}
                      onCheckedChange={(checked) => handleSettingChange('push_notifications', checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Send maintenance and system alerts
                      </p>
                    </div>
                    <Switch
                      checked={settings?.system_alerts || false}
                      onCheckedChange={(checked) => handleSettingChange('system_alerts', checked)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notificationRetention">Notification Retention (days)</Label>
                    <Input
                      id="notificationRetention"
                      type="number"
                      value={settings?.notification_retention || 30}
                      onChange={(e) => handleSettingChange('notification_retention', parseInt(e.target.value))}
                      min="7"
                      max="365"
                      className={errors.notification_retention ? 'border-red-500' : ''}
                    />
                    {errors.notification_retention && (
                      <p className="text-sm text-red-600 mt-1">{errors.notification_retention}</p>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="digestFrequency">Email Digest Frequency</Label>
                <Select
                  value={settings?.digest_frequency || 'daily'}
                  onValueChange={(value) => handleSettingChange('digest_frequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="never">Never</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GlobalSettings;
