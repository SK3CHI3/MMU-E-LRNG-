
import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const Login = () => {
  const [clickCount, setClickCount] = useState(0);
  const [showLecturerLogin, setShowLecturerLogin] = useState(false);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 3) {
      setShowLecturerLogin(true);
      setClickCount(0);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-secondary/20 p-4">
      <div className="mb-8 flex flex-col items-center">
        <div 
          className="flex h-16 w-16 items-center justify-center rounded-full bg-primary"
          onClick={handleLogoClick}
        >
          <GraduationCap className="h-10 w-10 text-primary-foreground" />
        </div>
        <h1 className="mt-4 text-3xl font-bold">MMU Learning Management System</h1>
        <p className="text-muted-foreground">Elevating Learning, Empowering Futures</p>
      </div>

      <Tabs defaultValue="student" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="student">Student</TabsTrigger>
          {showLecturerLogin && <TabsTrigger value="lecturer">Lecturer</TabsTrigger>}
          {!showLecturerLogin && <div className="h-10"></div>}
        </TabsList>
        
        <TabsContent value="student">
          <Card>
            <CardHeader>
              <CardTitle>Student Login</CardTitle>
              <CardDescription>
                Enter your admission number and password to access your student portal.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admission-number">Admission Number</Label>
                <Input id="admission-number" placeholder="e.g., MCS123456" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </Link>
                </div>
                <Input id="password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+254 7XX XXX XXX" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Sign In</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {showLecturerLogin && (
          <TabsContent value="lecturer">
            <Card>
              <CardHeader>
                <CardTitle>Lecturer Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access your lecturer portal.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lecturer-id">Lecturer ID</Label>
                  <Input id="lecturer-id" placeholder="e.g., LEC123" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lecturer-email">Email</Label>
                  <Input id="lecturer-email" type="email" placeholder="your.email@mmu.ac.ke" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="lecturer-password">Password</Label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input id="lecturer-password" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Sign In</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>
      
      <div className="mt-6">
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
