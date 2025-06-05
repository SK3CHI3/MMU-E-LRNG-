
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
    <div className="space-y-6 mobile-container overflow-hidden">
      <div className="overflow-hidden">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight break-words">Announcements</h1>
        <p className="text-sm sm:text-base text-muted-foreground break-words">Stay updated with important university news and events.</p>
      </div>

      <div className="space-y-4 overflow-hidden">
        {announcements.map((announcement) => (
          <Card key={announcement.id} className="mobile-card overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex flex-col gap-3 overflow-hidden">
                <div className="flex items-start gap-2 min-w-0">
                  <BellRing className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <CardTitle className="text-base sm:text-lg font-medium break-words line-clamp-2 flex-1 min-w-0">
                    {announcement.title}
                  </CardTitle>
                  <Badge
                    className="text-xs flex-shrink-0"
                    variant="outline"
                    style={{ backgroundColor: getCategoryColor(announcement.category), color: "white" }}
                  >
                    {announcement.category}
                  </Badge>
                </div>
                <CardDescription className="flex items-center gap-2 text-xs sm:text-sm overflow-hidden">
                  <Calendar className="h-3 w-3 flex-shrink-0" />
                  <span className="truncate">{announcement.date}</span>
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pb-3 overflow-hidden">
              <p className="text-sm mb-4 break-words line-clamp-3">{announcement.content}</p>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground overflow-hidden">
                <Avatar className="h-5 w-5 sm:h-6 sm:w-6 flex-shrink-0">
                  <AvatarImage src={announcement.sender.avatar} />
                  <AvatarFallback>
                    {announcement.sender.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{announcement.sender.name}</span>
                <span className="text-xs flex-shrink-0">({announcement.sender.role})</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Announcements;
