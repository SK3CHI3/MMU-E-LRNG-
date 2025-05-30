// =============================================
// System Settings Types
// =============================================

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: any;
  setting_type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  category: 'general' | 'email' | 'security' | 'system' | 'appearance' | 'notifications';
  description?: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

export interface SystemSettings {
  // General Settings
  site_name: string;
  site_description: string;
  site_url: string;
  maintenance_mode: boolean;
  registration_enabled: boolean;
  signup_page_visible: boolean;
  default_language: string;
  timezone: string;
  welcome_message: string;

  // Email Settings
  email_notifications: boolean;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_encryption: string;
  from_email: string;
  from_name: string;

  // Security Settings
  session_timeout: number;
  max_login_attempts: number;
  lockout_duration: number;
  password_policy: PasswordPolicy;
  two_factor_enabled: boolean;
  force_password_change: boolean;

  // System Settings
  max_file_size: number;
  allowed_file_types: string[];
  backup_frequency: string;
  log_retention: number;
  max_concurrent_sessions: number;
  system_maintenance_window: string;

  // Appearance Settings
  theme: string;
  primary_color: string;
  secondary_color: string;
  logo_url: string;
  favicon_url: string;
  custom_css: string;
  show_mmu_branding: boolean;

  // Notification Settings
  push_notifications: boolean;
  notification_retention: number;
  digest_frequency: string;
  announcement_notifications: boolean;
  assignment_notifications: boolean;
  grade_notifications: boolean;
  system_alerts: boolean;
}

export interface SettingsUpdateRequest {
  setting_key: string;
  setting_value: any;
  updated_by?: string;
}

export interface SettingsResponse {
  success: boolean;
  message: string;
  data?: SystemSettings;
  errors?: string[];
}

export interface SettingValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  allowedValues?: any[];
  customValidator?: (value: any) => boolean | string;
}

export interface SettingValidationRules {
  [key: string]: SettingValidationRule;
}

// Default validation rules for settings
export const SETTING_VALIDATION_RULES: SettingValidationRules = {
  site_name: {
    min: 3,
    max: 100
  },
  site_description: {
    max: 500
  },
  site_url: {
    pattern: /^https?:\/\/.+/
  },
  session_timeout: {
    min: 5,
    max: 480 // 8 hours max
  },
  max_login_attempts: {
    min: 3,
    max: 10
  },
  lockout_duration: {
    min: 5,
    max: 1440 // 24 hours max
  },
  max_file_size: {
    min: 1,
    max: 500 // 500MB max
  },
  log_retention: {
    min: 7,
    max: 365 // 1 year max
  },
  max_concurrent_sessions: {
    min: 1,
    max: 10
  },
  notification_retention: {
    min: 7,
    max: 365
  },
  smtp_port: {
    min: 1,
    max: 65535
  },
  backup_frequency: {
    allowedValues: ['hourly', 'daily', 'weekly', 'monthly']
  },
  digest_frequency: {
    allowedValues: ['daily', 'weekly', 'monthly', 'never']
  },
  theme: {
    allowedValues: ['light', 'dark', 'auto']
  },
  smtp_encryption: {
    allowedValues: ['none', 'tls', 'ssl']
  },
  default_language: {
    allowedValues: ['en', 'sw'] // English and Swahili
  },
  primary_color: {
    pattern: /^#[0-9A-Fa-f]{6}$/
  },
  secondary_color: {
    pattern: /^#[0-9A-Fa-f]{6}$/
  }
};

// Setting categories for organization
export const SETTING_CATEGORIES = {
  general: {
    label: 'General',
    description: 'Basic site information and configuration',
    icon: 'Globe'
  },
  email: {
    label: 'Email',
    description: 'Email server and notification settings',
    icon: 'Mail'
  },
  security: {
    label: 'Security',
    description: 'Authentication and security policies',
    icon: 'Shield'
  },
  system: {
    label: 'System',
    description: 'System-level configuration and limits',
    icon: 'Database'
  },
  appearance: {
    label: 'Appearance',
    description: 'Theme and visual customization',
    icon: 'Palette'
  },
  notifications: {
    label: 'Notifications',
    description: 'Notification preferences and settings',
    icon: 'Bell'
  }
} as const;

export type SettingCategory = keyof typeof SETTING_CATEGORIES;
