
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin } from "lucide-react";

const ClassSessions = () => {
  // This would come from an API in a real app
  const upcomingClasses = [
    {
      id: 1, 
      unit: "MCS 101: Introduction to Media Studies",
      date: "May 22, 2025",
      time: "10:00 AM - 12:00 PM",
      location: "Main Campus, Room 203",
      isOnline: false,
    },
    {
      id: 2,
      unit: "MCS 204: Digital Communications",
      date: "May 22, 2025",
      time: "2:00 PM - 4:00 PM",
      location: "Zoom",
      isOnline: true,
      meetingLink: "https://zoom.us/j/1234567890",
    },
    {
      id: 3,
      unit: "MCS 305: Media Ethics",
      date: "May 23, 2025",
      time: "9:00 AM - 11:00 AM",
      location: "Main Campus, Room 105",
      isOnline: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Class Sessions</h1>
        <p className="text-muted-foreground">View and manage your upcoming class sessions.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {upcomingClasses.map((classItem) => (
          <Card key={classItem.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-medium">{classItem.unit}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{classItem.date}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-primary" />
                <span>{classItem.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-primary" />
                {classItem.isOnline ? (
                  <a href={classItem.meetingLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                    {classItem.location}
                  </a>
                ) : (
                  <span>{classItem.location}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ClassSessions;
