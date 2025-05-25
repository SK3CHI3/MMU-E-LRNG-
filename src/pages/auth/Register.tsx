
import { useState } from "react";
import { Link } from "react-router-dom";
import { GraduationCap, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const Register = () => {
  const [clickCount, setClickCount] = useState(0);
  const [showLecturerRegistration, setShowLecturerRegistration] = useState(false);
  const [selectedRole, setSelectedRole] = useState("lecturer");

  const faculties = [
    "Faculty of Computing and Information Technology",
    "Faculty of Business and Economics",
    "Faculty of Engineering and Technology",
    "Faculty of Media and Communication",
    "Faculty of Science & Technology",
    "Faculty of Social Sciences and Technology",
  ];

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 3) {
      setShowLecturerRegistration(true);
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
        <h1 className="mt-4 text-3xl font-bold">Create Your MMU Account</h1>
        <p className="text-muted-foreground">Sign up to access the Learning Management System</p>
      </div>

      <Tabs defaultValue="student" className="w-full max-w-md">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="student">Student</TabsTrigger>
          {showLecturerRegistration && <TabsTrigger value="lecturer">Lecturer</TabsTrigger>}
          {!showLecturerRegistration && <div className="h-10"></div>}
        </TabsList>

        <TabsContent value="student">
          <Card>
            <CardHeader>
              <CardTitle>Student Registration</CardTitle>
              <CardDescription>
                Enter your details to create a student account.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admission-number">Admission Number</Label>
                <Input id="admission-number" placeholder="e.g., MCS123456" />
                <p className="text-xs text-muted-foreground">
                  Your faculty will be automatically detected from your admission number.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" placeholder="+254 7XX XXX XXX" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">Create Account</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {showLecturerRegistration && (
          <TabsContent value="lecturer">
            <Card>
              <CardHeader>
                <CardTitle>Lecturer Registration</CardTitle>
                <CardDescription>
                  Enter your details to create a lecturer account.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="lecturer-name">Full Name</Label>
                  <Input id="lecturer-name" placeholder="Dr. Jane Smith" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lecturer-id">Lecturer ID</Label>
                  <Input id="lecturer-id" placeholder="e.g., LEC123" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lecturer-email">Email</Label>
                  <Input id="lecturer-email" type="email" placeholder="your.email@mmu.ac.ke" />
                </div>
                <div className="space-y-2">
                  <Label>Faculty</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a faculty" />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map((faculty) => (
                        <SelectItem key={faculty} value={faculty}>{faculty}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <RadioGroup
                    value={selectedRole}
                    onValueChange={setSelectedRole}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="lecturer" id="role-lecturer" />
                      <Label htmlFor="role-lecturer">Lecturer</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="hof" id="role-hof" />
                      <Label htmlFor="role-hof">Head of Faculty</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lecturer-password">Password</Label>
                  <Input id="lecturer-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lecturer-confirm-password">Confirm Password</Label>
                  <Input id="lecturer-confirm-password" type="password" />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Create Account</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <div className="mt-6">
        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
