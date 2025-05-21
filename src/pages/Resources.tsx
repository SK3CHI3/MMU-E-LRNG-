
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { BookOpen, FileText, Download, ExternalLink, BookMarked, Newspaper } from "lucide-react";

const Resources = () => {
  // This would come from an API in a real app
  const textbooks = [
    {
      id: 1,
      title: "Introduction to Media Studies",
      author: "James Smith",
      description: "Essential textbook covering all key concepts in media studies.",
      link: "#",
      type: "pdf"
    },
    {
      id: 2,
      title: "Digital Communications in the Modern Era",
      author: "Emily Johnson",
      description: "Comprehensive guide to digital communications theory and practice.",
      link: "#",
      type: "pdf"
    },
    {
      id: 3,
      title: "Ethics in Media: A Critical Approach",
      author: "Michael Chang",
      description: "Analyzing ethical frameworks for media professionals.",
      link: "#",
      type: "epub"
    },
  ];

  const pastPapers = [
    {
      id: 1,
      unit: "MCS 101: Introduction to Media Studies",
      year: "2024",
      semester: "Jan-Apr",
      link: "#"
    },
    {
      id: 2,
      unit: "MCS 204: Digital Communications",
      year: "2024",
      semester: "Jan-Apr",
      link: "#"
    },
    {
      id: 3,
      unit: "MCS 305: Media Ethics",
      year: "2023",
      semester: "Sep-Dec",
      link: "#"
    },
  ];

  const externalTools = [
    {
      id: 1,
      name: "Grammarly",
      description: "AI writing assistant to enhance your written work",
      link: "https://www.grammarly.com",
      icon: <FileText className="h-8 w-8" />
    },
    {
      id: 2,
      name: "Overleaf",
      description: "Online LaTeX editor for professional documents",
      link: "https://www.overleaf.com",
      icon: <BookMarked className="h-8 w-8" />
    },
    {
      id: 3,
      name: "JSTOR",
      description: "Digital library of academic journals and books",
      link: "https://www.jstor.org",
      icon: <Newspaper className="h-8 w-8" />
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
        <p className="text-muted-foreground">Access learning materials and helpful tools.</p>
      </div>

      <Tabs defaultValue="textbooks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="textbooks">Textbooks</TabsTrigger>
          <TabsTrigger value="past-papers">Past Papers</TabsTrigger>
          <TabsTrigger value="external-tools">External Tools</TabsTrigger>
        </TabsList>
        
        <TabsContent value="textbooks" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {textbooks.map((book) => (
              <Card key={book.id}>
                <CardHeader>
                  <CardTitle className="text-base">{book.title}</CardTitle>
                  <CardDescription>{book.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{book.description}</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download {book.type.toUpperCase()}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="past-papers" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pastPapers.map((paper) => (
              <Card key={paper.id}>
                <CardHeader>
                  <CardTitle className="text-base">{paper.unit}</CardTitle>
                  <CardDescription>
                    {paper.semester} {paper.year}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="text-sm">Exam Paper</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Download PDF
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="external-tools" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {externalTools.map((tool) => (
              <Card key={tool.id}>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className="rounded-full bg-primary/10 p-2">
                    {tool.icon}
                  </div>
                  <div className="space-y-1">
                    <CardTitle className="text-base">{tool.name}</CardTitle>
                    <CardDescription className="line-clamp-1">
                      {tool.description}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardFooter>
                  <Button asChild className="w-full">
                    <a href={tool.link} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Open Tool
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Resources;
