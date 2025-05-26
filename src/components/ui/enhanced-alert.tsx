import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Copy, Mail, RefreshCw } from 'lucide-react';
import { generateEmailSuggestions, generateAlternativeEmails, type EmailSuggestion } from '@/utils/emailSuggestions';
import { showSuccessToast } from '@/utils/toast';

interface EnhancedErrorAlertProps {
  error: string;
  originalEmail?: string;
  role?: string;
  faculty?: string;
  onEmailSelect?: (email: string) => void;
  onRetry?: () => void;
}

export const EnhancedErrorAlert: React.FC<EnhancedErrorAlertProps> = ({
  error,
  originalEmail,
  role,
  faculty,
  onEmailSelect,
  onRetry
}) => {
  const isDuplicateEmailError = error.toLowerCase().includes('email') && 
    (error.toLowerCase().includes('already') || error.toLowerCase().includes('duplicate'));

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showSuccessToast('Copied to clipboard', {
        description: `Email "${text}" copied to clipboard`
      });
    } catch (err) {
      console.error('Failed to copy to clipboard:', err);
    }
  };

  const handleEmailSelect = (email: string) => {
    if (onEmailSelect) {
      onEmailSelect(email);
    } else {
      copyToClipboard(email);
    }
  };

  if (!isDuplicateEmailError || !originalEmail || !role) {
    // Regular error display
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Registration Failed</AlertTitle>
        <AlertDescription className="mt-2">
          {error}
          {onRetry && (
            <Button
              variant="outline"
              size="sm"
              className="mt-3 ml-0"
              onClick={onRetry}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  // Enhanced error display with email suggestions
  const suggestions = generateEmailSuggestions(role, faculty);
  const alternatives = generateAlternativeEmails(originalEmail, role);

  return (
    <div className="space-y-4">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Email Already Registered</AlertTitle>
        <AlertDescription>
          An account with the email "{originalEmail}" already exists. Please use a different email address or sign in to your existing account.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Mail className="h-5 w-5 mr-2" />
            Email Suggestions
          </CardTitle>
          <CardDescription>
            Here are some alternative email addresses you can use for your {role} account:
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Role-specific suggestions */}
          {suggestions.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                Recommended {role} email formats:
              </h4>
              <div className="grid gap-2">
                {suggestions.slice(0, 3).map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-mono text-sm">{suggestion.email}</div>
                      <div className="text-xs text-muted-foreground">{suggestion.description}</div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(suggestion.email)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {onEmailSelect && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleEmailSelect(suggestion.email)}
                        >
                          Use
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alternatives based on original email */}
          {alternatives.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">
                Alternatives based on your email:
              </h4>
              <div className="grid gap-2">
                {alternatives.slice(0, 3).map((alternative, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 transition-colors"
                  >
                    <div className="font-mono text-sm">{alternative}</div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(alternative)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {onEmailSelect && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleEmailSelect(alternative)}
                        >
                          Use
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button variant="outline" size="sm" asChild>
              <a href="/login">Sign In Instead</a>
            </Button>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            <Button variant="outline" size="sm" asChild>
              <a href="mailto:support@mmu.ac.ke">Contact Support</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedErrorAlert;
