
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, Check, X } from "lucide-react";

const Assignments = () => {
  // This would come from an API in a real app
  const assignments = [
    {
      id: 1,
      title: "Media Analysis Report",
      unit: "MCS 101: Introduction to Media Studies",
      dueDate: "May 25, 2025",
      status: "pending",
      description: "Analyze a piece of media content using the frameworks discussed in class."
    },
    {
      id: 2,
      title: "Digital Campaign Strategy",
      unit: "MCS 204: Digital Communications",
      dueDate: "May 30, 2025",
      status: "pending",
      description: "Create a comprehensive digital marketing campaign for a fictional product."
    },
    {
      id: 3,
      title: "Ethics Case Study",
      unit: "MCS 305: Media Ethics",
      dueDate: "May 20, 2025",
      status: "submitted",
      description: "Analyze the ethical implications of a recent media controversy."
    },
    {
      id: 4,
      title: "Research Methods Proposal",
      unit: "MCS 202: Research Methods",
      dueDate: "May 15, 2025",
      status: "late",
      description: "Propose a research methodology for investigating digital media consumption patterns."
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "submitted":
        return "bg-green-500";
      case "late":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "submitted":
        return <Check className="h-4 w-4" />;
      case "late":
        return <X className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Assignments</h1>
        <p className="text-muted-foreground">View and manage your assignments.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {assignments.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-base font-medium">{assignment.title}</CardTitle>
                <Badge 
                  className="flex items-center gap-1" 
                  variant="outline"
                  style={{ backgroundColor: getStatusColor(assignment.status), color: "white" }}
                >
                  {getStatusIcon(assignment.status)}
                  {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{assignment.unit}</p>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{assignment.description}</p>
              <div className="flex items-center gap-2 mt-4 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>Due: {assignment.dueDate}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button size="sm" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                {assignment.status === "submitted" ? "View Submission" : "Submit Assignment"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Assignments;
