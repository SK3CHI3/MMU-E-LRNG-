import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Download,
  Search,
  FileText,
  Video,
  Headphones,
  Link as LinkIcon,
  Calendar,
  User,
  Filter,
  BookOpen,
  PlayCircle,
  FileAudio,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentCourses } from "@/services/studentService";
import { supabase } from "@/lib/supabaseClient";
import { Skeleton } from "@/components/ui/skeleton";

interface StudyResource {
  id: string;
  title: string;
  description?: string;
  type: 'document' | 'video' | 'audio' | 'link';
  url: string;
  course_id: string;
  course_name: string;
  course_code: string;
  lecturer_name: string;
  upload_date: string;
}

const Resources = () => {
  const { user } = useAuth();
  const [resources, setResources] = useState<StudyResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<StudyResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    if (user?.id) {
      loadResources();
    }
  }, [user?.id]);

  useEffect(() => {
    filterResources();
  }, [searchTerm, selectedCourse, selectedType, resources]);

  const loadResources = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get student's enrolled courses
      const enrolledCourses = await getStudentCourses(user.id);
      setCourses(enrolledCourses);

      // Get course materials for enrolled courses
      const courseIds = enrolledCourses.map(course => course.id);

      if (courseIds.length === 0) {
        setResources([]);
        return;
      }

      // Fetch course materials from database
      const { data: materials, error } = await supabase
        .from('course_materials')
        .select(`
          *,
          courses!inner (
            id,
            code,
            title,
            users!courses_created_by_fkey (
              full_name
            )
          )
        `)
        .in('course_id', courseIds)
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform materials to StudyResource format
      const transformedResources: StudyResource[] = (materials || []).map(material => ({
        id: material.id,
        title: material.title,
        description: material.description,
        type: material.type as 'document' | 'video' | 'audio' | 'link',
        url: material.url,
        course_id: material.course_id,
        course_name: material.courses.title,
        course_code: material.courses.code,
        lecturer_name: material.courses.users?.full_name || 'Unknown',
        upload_date: material.created_at
      }));

      setResources(transformedResources);

      // All resource data now comes from the database via course_materials table
    } catch (error) {
      console.error('Error loading resources:', error);
      // Fallback to empty array
      setResources([]);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.course_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.course_code.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by course
    if (selectedCourse !== "all") {
      filtered = filtered.filter(resource => resource.course_id === selectedCourse);
    }

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter(resource => resource.type === selectedType);
    }

    setFilteredResources(filtered);
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'audio':
        return <Headphones className="h-5 w-5" />;
      case 'link':
        return <LinkIcon className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'video':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'audio':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'link':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const handleDownload = (resource: StudyResource) => {
    if (resource.type === 'link') {
      window.open(resource.url, '_blank');
    } else {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = resource.url;
      link.download = resource.title;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Study Resources</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Access unit materials, recordings, and study resources from your lecturers
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Units" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Units</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id}>
                    {course.code} - {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="link">Links</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Resources Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource) => (
          <Card key={resource.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getResourceIcon(resource.type)}
                  <CardTitle className="text-base line-clamp-2">{resource.title}</CardTitle>
                </div>
                <Badge className={getTypeColor(resource.type)}>
                  {resource.type}
                </Badge>
              </div>
              <CardDescription className="line-clamp-2">
                {resource.description || "No description available"}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3 w-3" />
                  <span>{resource.course_code} - {resource.course_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  <span>{resource.lecturer_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(resource.upload_date)}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleDownload(resource)}
                className="w-full"
                variant={resource.type === 'link' ? 'outline' : 'default'}
              >
                {resource.type === 'link' ? (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Open Link
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Resources Found</h3>
            <p className="text-muted-foreground">
              {searchTerm || selectedCourse !== "all" || selectedType !== "all"
                ? "Try adjusting your filters to find more resources."
                : "Your lecturers haven't uploaded any study resources yet."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Resources;
