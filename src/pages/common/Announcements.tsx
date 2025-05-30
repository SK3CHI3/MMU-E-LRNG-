
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { BellRing, Calendar } from "lucide-react";

const Announcements = () => {
  // This would come from an API in a real app
  const announcements = [
    {
      id: 1,
      title: "Semester Registration Deadline",
      category: "Important",
      sender: {
        name: "Faculty Admin",
        avatar: "/placeholder.svg",
        role: "Admin"
      },
      date: "May 19, 2025",
      content: "Registration for the next semester closes on May 30th. Ensure you've paid at least 60% of your fees to register for units.",
    },
    {
      id: 2,
      title: "Media Studies Workshop",
      category: "Event",
      sender: {
        name: "Dr. Sarah Johnson",
        avatar: "/placeholder.svg",
        role: "Lecturer"
      },
      date: "May 20, 2025",
      content: "Join us for a special workshop on Digital Media Analysis this Friday at 2PM in the Main Auditorium. All Media Studies students are encouraged to attend.",
    },
    {
      id: 3,
      title: "Library Hours Extended",
      category: "Information",
      sender: {
        name: "University Library",
        avatar: "/placeholder.svg",
        role: "Service"
      },
      date: "May 21, 2025",
      content: "The main library will now be open until midnight during the exam period (May 25 - June 10). Take advantage of the extended hours for your studies.",
    },
  ];

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case "important":
        return "bg-red-500";
      case "event":
        return "bg-blue-500";
      case "information":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Announcements</h1>
        <p className="text-muted-foreground">Stay updated with important university news and events.</p>
      </div>

      <div className="space-y-4">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <BellRing className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg font-medium">
                    {announcement.title}
                  </CardTitle>
                </div>
                <Badge 
                  className="ml-2" 
                  variant="outline"
                  style={{ backgroundColor: getCategoryColor(announcement.category), color: "white" }}
                >
                  {announcement.category}
                </Badge>
              </div>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-3 w-3" />
                {announcement.date}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <p className="text-sm mb-4">{announcement.content}</p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={announcement.sender.avatar} />
                  <AvatarFallback>
                    {announcement.sender.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span>{announcement.sender.name}</span>
                <span className="text-xs">({announcement.sender.role})</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
