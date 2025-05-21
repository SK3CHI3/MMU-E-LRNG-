
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, Lock, Globe, Shield, Upload, Trash, User, Phone, Mail, FileText } from "lucide-react";

const Settings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Tabs defaultValue="account">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="account">
            <User className="h-4 w-4 mr-2" />
            Account
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Globe className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile information and contact details.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder.svg" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button size="sm" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Change Avatar
                  </Button>
                  <Button size="sm" variant="outline" className="text-destructive">
                    <Trash className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" defaultValue="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admissionNo">Admission Number</Label>
                  <Input id="admissionNo" defaultValue="MCS-001-2025" disabled />
                  <p className="text-xs text-muted-foreground">Cannot be changed</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" defaultValue="john.doe@student.mmu.ac.ke" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" defaultValue="+254 712 345 678" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input id="bio" defaultValue="Fourth-year Media Studies student specializing in Digital Media." />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Changes</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Connected Accounts</CardTitle>
              <CardDescription>Connect third-party accounts for enhanced features.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Google</h4>
                    <p className="text-xs text-muted-foreground">Connect your Google account for single sign-on</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center">
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">GitHub</h4>
                    <p className="text-xs text-muted-foreground">Connect GitHub for project access</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Connect</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose what notifications you receive and how.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email Notifications</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-announcements" className="flex items-center gap-2 text-sm">
                      <Bell className="h-4 w-4" />
                      Announcements
                    </Label>
                    <Switch id="email-announcements" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-assignments" className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      New Assignments
                    </Label>
                    <Switch id="email-assignments" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="email-grades" className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      Grade Updates
                    </Label>
                    <Switch id="email-grades" defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Push Notifications</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-announcements" className="flex items-center gap-2 text-sm">
                      <Bell className="h-4 w-4" />
                      Announcements
                    </Label>
                    <Switch id="push-announcements" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-reminders" className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      Class Reminders
                    </Label>
                    <Switch id="push-reminders" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="push-assignments" className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4" />
                      Assignment Deadlines
                    </Label>
                    <Switch id="push-assignments" defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">SMS Notifications</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-fees" className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4" />
                      Fee Reminders
                    </Label>
                    <Switch id="sms-fees" defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sms-urgent" className="flex items-center gap-2 text-sm">
                      <Bell className="h-4 w-4" />
                      Urgent Announcements
                    </Label>
                    <Switch id="sms-urgent" defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the LMS looks on your device.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Theme Preference</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="border rounded-md p-3 cursor-pointer [&:has(input:checked)]:border-primary space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="theme-light" className="text-sm font-medium cursor-pointer">Light</Label>
                      <input type="radio" id="theme-light" name="theme" className="sr-only" />
                      <div className="size-4 rounded-full border flex items-center justify-center [&:has(div)]:bg-primary">
                        <div className="size-2 rounded-full bg-white"></div>
                      </div>
                    </div>
                    <div className="h-16 rounded-md bg-[#f8fafc] border"></div>
                  </div>
                  
                  <div className="border rounded-md p-3 cursor-pointer [&:has(input:checked)]:border-primary space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="theme-dark" className="text-sm font-medium cursor-pointer">Dark</Label>
                      <input type="radio" id="theme-dark" name="theme" className="sr-only" defaultChecked />
                      <div className="size-4 rounded-full border flex items-center justify-center [&:has(div)]:bg-primary">
                        <div className="size-2 rounded-full bg-white"></div>
                      </div>
                    </div>
                    <div className="h-16 rounded-md bg-[#1e293b] border"></div>
                  </div>
                  
                  <div className="border rounded-md p-3 cursor-pointer [&:has(input:checked)]:border-primary space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="theme-system" className="text-sm font-medium cursor-pointer">System</Label>
                      <input type="radio" id="theme-system" name="theme" className="sr-only" />
                      <div className="size-4 rounded-full border flex items-center justify-center [&:has(div)]:bg-primary">
                        <div className="size-2 rounded-full bg-white"></div>
                      </div>
                    </div>
                    <div className="h-16 rounded-md bg-gradient-to-r from-[#f8fafc] to-[#1e293b] border"></div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduce-animations" className="text-sm">Reduce Animations</Label>
                  <Switch id="reduce-animations" />
                </div>
                <p className="text-xs text-muted-foreground">Minimize animations for reduced motion preference</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="compact-view" className="text-sm">Compact View</Label>
                  <Switch id="compact-view" />
                </div>
                <p className="text-xs text-muted-foreground">Display more content with less spacing</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Password</CardTitle>
              <CardDescription>Change your password to keep your account secure.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update Password</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">SMS Authentication</h4>
                  <p className="text-xs text-muted-foreground">Receive a verification code via SMS</p>
                </div>
                <Switch id="sms-2fa" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium">Authenticator App</h4>
                  <p className="text-xs text-muted-foreground">Use an authenticator app like Google Authenticator</p>
                </div>
                <Button variant="outline" size="sm">Setup</Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sessions</CardTitle>
              <CardDescription>Manage your active sessions across devices.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Current Session</p>
                      <p className="text-xs text-muted-foreground">Chrome on Windows • Nairobi, Kenya</p>
                    </div>
                  </div>
                  <Badge>Active</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Mobile App</p>
                      <p className="text-xs text-muted-foreground">Android • Last active: Yesterday</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-destructive">Revoke</Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="text-destructive">
                Sign Out of All Devices
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
