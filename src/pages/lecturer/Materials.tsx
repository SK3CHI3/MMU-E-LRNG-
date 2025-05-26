import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import {
  uploadMaterial,
  getLecturerMaterials,
  deleteMaterial,
  trackMaterialDownload,
  MaterialWithStats
} from '@/services/materialService';
import { getLecturerCourses } from '@/services/courseService';
import {
  Plus,
  Upload,
  FileText,
  Video,
  Image,
  Download,
  Share2,
  Trash2,
  Eye,
  Calendar,
  BookOpen
} from 'lucide-react';

const Materials = () => {
  const { dbUser } = useAuth();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [materials, setMaterials] = useState<MaterialWithStats[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  // Form state for upload
  const [uploadForm, setUploadForm] = useState({
    title: '',
    description: '',
    course_id: '',
    type: 'document' as 'document' | 'video' | 'audio' | 'link' | 'other',
    tags: '',
    is_public: false,
    file: null as File | null
  });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!dbUser?.auth_id) return;

      try {
        setLoading(true);

        // Fetch materials and courses in parallel
        const [materialsData, coursesData] = await Promise.all([
          getLecturerMaterials(dbUser.auth_id),
          getLecturerCourses(dbUser.auth_id)
        ]);

        setMaterials(materialsData);
        setCourses(coursesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dbUser?.auth_id]);

  // Handle form input changes
  const handleInputChange = (field: string, value: any) => {
    setUploadForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadForm(prev => ({
        ...prev,
        file
      }));
    }
  };

  // Handle material upload
  const handleUpload = async () => {
    if (!dbUser?.auth_id || !uploadForm.title || !uploadForm.course_id) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setUploading(true);

      const materialData = {
        title: uploadForm.title,
        description: uploadForm.description,
        course_id: uploadForm.course_id,
        type: uploadForm.type,
        tags: uploadForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        is_public: uploadForm.is_public,
        file: uploadForm.file
      };

      await uploadMaterial(materialData, dbUser.auth_id);

      // Refresh materials list
      const updatedMaterials = await getLecturerMaterials(dbUser.auth_id);
      setMaterials(updatedMaterials);

      // Reset form and close dialog
      setUploadForm({
        title: '',
        description: '',
        course_id: '',
        type: 'document',
        tags: '',
        is_public: false,
        file: null
      });
      setIsUploadDialogOpen(false);

      alert('Material uploaded successfully!');
    } catch (error) {
      console.error('Error uploading material:', error);
      alert('Failed to upload material. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Handle material deletion
  const handleDelete = async (materialId: string) => {
    if (!dbUser?.auth_id) return;

    if (confirm('Are you sure you want to delete this material?')) {
      try {
        await deleteMaterial(materialId, dbUser.auth_id);

        // Refresh materials list
        const updatedMaterials = await getLecturerMaterials(dbUser.auth_id);
        setMaterials(updatedMaterials);

        alert('Material deleted successfully!');
      } catch (error) {
        console.error('Error deleting material:', error);
        alert('Failed to delete material. Please try again.');
      }
    }
  };

  // Handle material download
  const handleDownload = async (materialId: string, url: string) => {
    if (!dbUser?.auth_id) return;

    try {
      // Track the download
      await trackMaterialDownload(materialId, dbUser.auth_id);

      // Open the file URL
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error tracking download:', error);
      // Still allow download even if tracking fails
      window.open(url, '_blank');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'document': return <FileText className="h-5 w-5" />;
      case 'video': return <Video className="h-5 w-5" />;
      case 'presentation': return <FileText className="h-5 w-5" />;
      case 'image': return <Image className="h-5 w-5" />;
      case 'code': return <FileText className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'document': return 'text-blue-600';
      case 'video': return 'text-red-600';
      case 'presentation': return 'text-orange-600';
      case 'image': return 'text-green-600';
      case 'code': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const UploadMaterialDialog = () => (
    <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Upload Material
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Learning Material</DialogTitle>
          <DialogDescription>
            Share resources with your students
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Select value={uploadForm.course_id} onValueChange={(value) => handleInputChange('course_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Material Type</Label>
              <Select value={uploadForm.type} onValueChange={(value) => handleInputChange('type', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="link">External Link</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Enter material title"
              value={uploadForm.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the content and purpose of this material"
              rows={3}
              value={uploadForm.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g., algorithms, data-structures, programming"
              value={uploadForm.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="file">File Upload</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
              <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {uploadForm.file ? uploadForm.file.name : 'Drag and drop your file here, or click to browse'}
              </p>
              <Input
                type="file"
                className="hidden"
                id="file"
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.ppt,.pptx,.mp4,.mp3,.jpg,.jpeg,.png,.zip"
              />
              <Button variant="outline" className="mt-2" onClick={() => document.getElementById('file')?.click()}>
                Choose File
              </Button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="public"
              className="rounded"
              checked={uploadForm.is_public}
              onChange={(e) => handleInputChange('is_public', e.target.checked)}
            />
            <Label htmlFor="public">Make this material publicly accessible</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsUploadDialogOpen(false)} disabled={uploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={uploading || !uploadForm.title || !uploadForm.course_id}>
            {uploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Material
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading materials...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Materials</h1>
          <p className="text-gray-600 dark:text-gray-400">Upload and manage course materials for your students</p>
        </div>
        <UploadMaterialDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Materials</p>
                <p className="text-2xl font-bold text-blue-600">{materials.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Downloads</p>
                <p className="text-2xl font-bold text-green-600">
                  {materials.reduce((sum, m) => sum + (m.downloads || 0), 0)}
                </p>
              </div>
              <Download className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Views</p>
                <p className="text-2xl font-bold text-purple-600">
                  {materials.reduce((sum, m) => sum + (m.views || 0), 0)}
                </p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Public Materials</p>
                <p className="text-2xl font-bold text-orange-600">
                  {materials.filter(m => m.is_public).length}
                </p>
              </div>
              <Share2 className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Materials List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Materials</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="videos">Videos</TabsTrigger>
          <TabsTrigger value="presentations">Presentations</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {materials.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No materials yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start by uploading your first learning material
              </p>
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Upload Material
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {materials.map((material) => (
                <Card key={material.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`${getTypeColor(material.type)}`}>
                          {getTypeIcon(material.type)}
                        </div>
                        <div>
                          <CardTitle className="text-lg">{material.title}</CardTitle>
                          <CardDescription className="font-medium">
                            {material.course_code} - {material.course_name}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={material.is_public ? 'default' : 'secondary'}>
                          {material.is_public ? 'Public' : 'Private'}
                        </Badge>
                        <Badge variant="outline">
                          {material.type.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {material.description}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {material.tags && Array.isArray(material.tags) && material.tags.map((tag: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(material.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Download className="h-4 w-4" />
                        <span>{material.downloads || 0}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4" />
                        <span>{material.views || 0}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(material.url, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(material.id, material.url)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(material.url);
                        alert('Link copied to clipboard!');
                      }}
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(material.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Materials;
