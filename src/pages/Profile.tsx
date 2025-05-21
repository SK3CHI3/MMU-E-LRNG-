
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Pencil, Book, GraduationCap, Clock, Award } from "lucide-react";

const Profile = () => {
  // This would come from an API in a real app
  const user = {
    name: "John Doe",
    role: "Student",
    faculty: "Media & Communication Studies",
    admissionNumber: "MCS-001-2025",
    email: "john.doe@student.mmu.ac.ke",
    phone: "+254 712 345 678",
    avatar: "/placeholder.svg",
    bio: "Fourth-year Media Studies student specializing in Digital Media. Passionate about visual storytelling and interactive media design.",
    yearOfStudy: 4,
    semester: "Jan-May 2025",
    skills: [
      "Content Creation",
      "Social Media Management",
      "Video Editing",
      "Graphic Design",
      "Photography"
    ],
    achievements: [
      {
        id: 1,
        title: "Dean's List",
        date: "Dec 2024",
        description: "Recognized for academic excellence with a GPA above 3.7"
      },
      {
        id: 2,
        title: "Media Project Competition Winner",
        date: "Oct 2024",
        description: "Won first place in the annual media project competition for documentary filmmaking"
      }
    ],
    badges: [
      {
        id: 1,
        name: "Perfect Attendance",
        icon: <Clock className="h-4 w-4" />,
        awarded: "Mar 2025"
      },
      {
        id: 2,
        name: "Research Excellence",
        icon: <Book className="h-4 w-4" />,
        awarded: "Feb 2025"
      },
      {
        id: 3,
        name: "Leadership Award",
        icon: <Award className="h-4 w-4" />,
        awarded: "Dec 2024"
      }
    ],
    academicProgress: {
      totalUnits: 48,
      completedUnits: 36,
      inProgressUnits: 4,
      remainingUnits: 8
    }
  };

  const progressPercentage = (user.academicProgress.completedUnits / user.academicProgress.totalUnits) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">Manage your personal information and academic profile.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <Avatar className="h-24 w-24 mb-4">
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <h2 className="text-xl font-bold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.admissionNumber}</p>
            <div className="my-2">
              <Badge className="bg-primary">{user.role}</Badge>
            </div>
            <p className="text-sm">{user.faculty}</p>
            <p className="text-sm text-muted-foreground mt-1">Year {user.yearOfStudy}, {user.semester}</p>
            <Button variant="outline" size="sm" className="mt-4">
              <Pencil className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="academic">Academic Progress</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>About</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{user.bio}</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="grid grid-cols-[100px_1fr] text-sm">
                    <span className="text-muted-foreground">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] text-sm">
                    <span className="text-muted-foreground">Phone:</span>
                    <span>{user.phone}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {user.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="achievements" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Badges</CardTitle>
                  <CardDescription>Recognition for your accomplishments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-4">
                    {user.badges.map((badge) => (
                      <div key={badge.id} className="flex flex-col items-center text-center w-24">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                          {badge.icon}
                        </div>
                        <span className="text-sm font-medium">{badge.name}</span>
                        <span className="text-xs text-muted-foreground">{badge.awarded}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Achievements</CardTitle>
                  <CardDescription>Notable academic accomplishments</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {user.achievements.map((achievement) => (
                      <div key={achievement.id} className="border-l-2 border-primary pl-4 relative before:absolute before:w-2 before:h-2 before:rounded-full before:bg-primary before:left-[-4.5px] before:top-2">
                        <h4 className="font-medium">{achievement.title}</h4>
                        <p className="text-xs text-muted-foreground mb-1">{achievement.date}</p>
                        <p className="text-sm">{achievement.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="academic" className="space-y-4 mt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Degree Progress</CardTitle>
                  <CardDescription>Media & Communication Studies</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Completion Progress</span>
                        <span>{Math.round(progressPercentage)}%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-secondary">
                        <div 
                          className="h-full rounded-full bg-primary" 
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                      <div className="rounded-lg border p-2 text-center">
                        <p className="text-sm text-muted-foreground">Total Units</p>
                        <p className="text-lg font-bold">{user.academicProgress.totalUnits}</p>
                      </div>
                      <div className="rounded-lg border p-2 text-center">
                        <p className="text-sm text-muted-foreground">Completed</p>
                        <p className="text-lg font-bold text-green-500">{user.academicProgress.completedUnits}</p>
                      </div>
                      <div className="rounded-lg border p-2 text-center">
                        <p className="text-sm text-muted-foreground">In Progress</p>
                        <p className="text-lg font-bold text-blue-500">{user.academicProgress.inProgressUnits}</p>
                      </div>
                      <div className="rounded-lg border p-2 text-center">
                        <p className="text-sm text-muted-foreground">Remaining</p>
                        <p className="text-lg font-bold text-amber-500">{user.academicProgress.remainingUnits}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle>Academic Timeline</CardTitle>
                    <GraduationCap className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">First Year</p>
                        <p className="text-xs text-muted-foreground">2022-2023</p>
                      </div>
                      <Badge variant="outline" className="bg-green-500 text-white">Completed</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Second Year</p>
                        <p className="text-xs text-muted-foreground">2023-2024</p>
                      </div>
                      <Badge variant="outline" className="bg-green-500 text-white">Completed</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Third Year</p>
                        <p className="text-xs text-muted-foreground">2024-2025</p>
                      </div>
                      <Badge variant="outline" className="bg-blue-500 text-white">In Progress</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Fourth Year</p>
                        <p className="text-xs text-muted-foreground">2025-2026</p>
                      </div>
                      <Badge variant="outline" className="bg-gray-400 text-white">Upcoming</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Profile;
