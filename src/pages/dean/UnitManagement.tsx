import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Users,
  Calendar,
  GraduationCap,
  Building,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import {
  getDeanFaculty,
  getFacultyProgrammes,
  getProgrammeCourses,
  getRegistrationPeriods,
  getFacultyAvailableUnits,
  createCourse,
  createAvailableUnit,
  updateCourse,
  updateAvailableUnit,
  deleteCourse,
  deleteAvailableUnit,
  getFacultyLecturers,
  assignLecturerToCourse,
  getLecturerCourseAssignments,
  getUnassignedFacultyCourses,
  bulkAssignLecturer,
  removeLecturerFromCourse,
  type Faculty,
  type Programme,
  type Course,
  type AvailableUnit,
  type RegistrationPeriod
} from '@/services/deanService';

export default function UnitManagement() {
  const { dbUser } = useAuth();
  const { toast } = useToast();

  // State management
  const [loading, setLoading] = useState(true);
  const [faculty, setFaculty] = useState<Faculty | null>(null);
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [availableUnits, setAvailableUnits] = useState<AvailableUnit[]>([]);
  const [registrationPeriods, setRegistrationPeriods] = useState<RegistrationPeriod[]>([]);
  const [lecturers, setLecturers] = useState<any[]>([]);
  const [unassignedCourses, setUnassignedCourses] = useState<Course[]>([]);

  // Dialog states
  const [courseDialogOpen, setCourseDialogOpen] = useState(false);
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editingUnit, setEditingUnit] = useState<AvailableUnit | null>(null);
  const [selectedLecturer, setSelectedLecturer] = useState<string>('');
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);

  // Form states
  const [courseForm, setCourseForm] = useState({
    code: '',
    title: '',
    description: '',
    department: '',
    level: 'undergraduate' as const,
    semester: '',
    year: 1,
    max_students: 50,
    prerequisites: '',
    programme_id: ''
  });

  const [unitForm, setUnitForm] = useState({
    course_id: '',
    programme_id: '',
    registration_period_id: '',
    semester: '',
    academic_year: '',
    year_level: 1,
    max_students: 50
  });

  // Load initial data
  useEffect(() => {
    if (dbUser?.id) {
      loadData();
    }
  }, [dbUser]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Get dean's faculty
      const facultyData = await getDeanFaculty(dbUser!.id);
      if (!facultyData) {
        toast({
          title: "Access Denied",
          description: "You are not assigned as a dean of any faculty.",
          variant: "destructive"
        });
        return;
      }
      setFaculty(facultyData);

      // Load all related data
      const [programmesData, registrationPeriodsData, availableUnitsData, lecturersData, unassignedCoursesData] = await Promise.all([
        getFacultyProgrammes(facultyData.name),
        getRegistrationPeriods(),
        getFacultyAvailableUnits(facultyData.name),
        getFacultyLecturers(facultyData.name),
        getUnassignedFacultyCourses(facultyData.name)
      ]);

      setProgrammes(programmesData);
      setRegistrationPeriods(registrationPeriodsData);
      setAvailableUnits(availableUnitsData);
      setLecturers(lecturersData);
      setUnassignedCourses(unassignedCoursesData);

      // Load courses for all programmes
      if (programmesData.length > 0) {
        const programmeIds = programmesData.map(p => p.id);
        const coursesData = await getProgrammeCourses(programmeIds);
        setCourses(coursesData);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Error",
        description: "Failed to load unit management data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCourse = async () => {
    try {
      if (!faculty || !courseForm.programme_id) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      const courseData = {
        ...courseForm,
        prerequisites: courseForm.prerequisites ? courseForm.prerequisites.split(',').map(p => p.trim()) : [],
        created_by: dbUser!.id,
        is_active: true
      };

      const newCourse = await createCourse(courseData);
      if (newCourse) {
        setCourses(prev => [...prev, newCourse]);
        setCourseDialogOpen(false);
        resetCourseForm();
        toast({
          title: "Success",
          description: "Course created successfully."
        });
      } else {
        throw new Error('Failed to create course');
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: "Error",
        description: "Failed to create course.",
        variant: "destructive"
      });
    }
  };

  const handleCreateUnit = async () => {
    try {
      if (!unitForm.course_id || !unitForm.registration_period_id) {
        toast({
          title: "Error",
          description: "Please fill in all required fields.",
          variant: "destructive"
        });
        return;
      }

      const newUnit = await createAvailableUnit({
        ...unitForm,
        is_active: true
      });

      if (newUnit) {
        setAvailableUnits(prev => [...prev, newUnit]);
        setUnitDialogOpen(false);
        resetUnitForm();
        toast({
          title: "Success",
          description: "Unit made available for registration."
        });
      } else {
        throw new Error('Failed to create available unit');
      }
    } catch (error) {
      console.error('Error creating unit:', error);
      toast({
        title: "Error",
        description: "Failed to make unit available.",
        variant: "destructive"
      });
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      code: '',
      title: '',
      description: '',
      department: '',
      level: 'undergraduate',
      semester: '',
      year: 1,
      max_students: 50,
      prerequisites: '',
      programme_id: ''
    });
    setEditingCourse(null);
  };

  const resetUnitForm = () => {
    setUnitForm({
      course_id: '',
      programme_id: '',
      registration_period_id: '',
      semester: '',
      academic_year: '',
      year_level: 1,
      max_students: 50
    });
    setEditingUnit(null);
  };

  const handleLecturerAssignment = async () => {
    try {
      if (!selectedLecturer || selectedCourses.length === 0) {
        toast({
          title: "Error",
          description: "Please select a lecturer and at least one course.",
          variant: "destructive"
        });
        return;
      }

      const success = await bulkAssignLecturer(selectedCourses, selectedLecturer);
      if (success) {
        toast({
          title: "Success",
          description: `Successfully assigned lecturer to ${selectedCourses.length} course(s).`
        });
        setAssignmentDialogOpen(false);
        setSelectedLecturer('');
        setSelectedCourses([]);
        loadData(); // Refresh data
      } else {
        throw new Error('Failed to assign lecturer');
      }
    } catch (error) {
      console.error('Error assigning lecturer:', error);
      toast({
        title: "Error",
        description: "Failed to assign lecturer to courses.",
        variant: "destructive"
      });
    }
  };

  const handleRemoveLecturer = async (courseId: string) => {
    try {
      const success = await removeLecturerFromCourse(courseId);
      if (success) {
        toast({
          title: "Success",
          description: "Lecturer removed from course successfully."
        });
        loadData(); // Refresh data
      } else {
        throw new Error('Failed to remove lecturer');
      }
    } catch (error) {
      console.error('Error removing lecturer:', error);
      toast({
        title: "Error",
        description: "Failed to remove lecturer from course.",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!faculty) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              You are not assigned as a dean of any faculty. Please contact the administrator.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Unit Management</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage courses and units for {faculty.name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Programmes</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{programmes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Units</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableUnits.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Enrollment</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {availableUnits.reduce((sum, unit) => sum + unit.current_enrollment, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="courses" className="space-y-4">
        <TabsList>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="units">Available Units</TabsTrigger>
          <TabsTrigger value="lecturers">Lecturer Assignments</TabsTrigger>
          <TabsTrigger value="programmes">Programmes</TabsTrigger>
        </TabsList>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Faculty Courses</h2>
            <Dialog open={courseDialogOpen} onOpenChange={setCourseDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetCourseForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Course
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
                  <DialogDescription>
                    {editingCourse ? 'Update course information' : 'Add a new course to your faculty'}
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="course-code">Course Code</Label>
                      <Input
                        id="course-code"
                        value={courseForm.code}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, code: e.target.value }))}
                        placeholder="e.g., CS101"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course-programme">Programme</Label>
                      <Select
                        value={courseForm.programme_id}
                        onValueChange={(value) => setCourseForm(prev => ({ ...prev, programme_id: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select programme" />
                        </SelectTrigger>
                        <SelectContent>
                          {programmes.map(programme => (
                            <SelectItem key={programme.id} value={programme.id}>
                              {programme.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course-title">Course Title</Label>
                    <Input
                      id="course-title"
                      value={courseForm.title}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Introduction to Computer Science"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course-description">Description</Label>
                    <Textarea
                      id="course-description"
                      value={courseForm.description}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Course description..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="course-department">Department</Label>
                      <Input
                        id="course-department"
                        value={courseForm.department}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, department: e.target.value }))}
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course-level">Level</Label>
                      <Select
                        value={courseForm.level}
                        onValueChange={(value: 'undergraduate' | 'graduate' | 'postgraduate') =>
                          setCourseForm(prev => ({ ...prev, level: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="undergraduate">Undergraduate</SelectItem>
                          <SelectItem value="graduate">Graduate</SelectItem>
                          <SelectItem value="postgraduate">Postgraduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="course-semester">Semester</Label>
                      <Select
                        value={courseForm.semester}
                        onValueChange={(value) => setCourseForm(prev => ({ ...prev, semester: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select semester" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Semester 1</SelectItem>
                          <SelectItem value="2">Semester 2</SelectItem>
                          <SelectItem value="3">Semester 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course-year">Year</Label>
                      <Select
                        value={courseForm.year.toString()}
                        onValueChange={(value) => setCourseForm(prev => ({ ...prev, year: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Year 1</SelectItem>
                          <SelectItem value="2">Year 2</SelectItem>
                          <SelectItem value="3">Year 3</SelectItem>
                          <SelectItem value="4">Year 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="course-max-students">Max Students</Label>
                      <Input
                        id="course-max-students"
                        type="number"
                        value={courseForm.max_students}
                        onChange={(e) => setCourseForm(prev => ({ ...prev, max_students: parseInt(e.target.value) || 50 }))}
                        min="1"
                        max="500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course-prerequisites">Prerequisites (comma-separated)</Label>
                    <Input
                      id="course-prerequisites"
                      value={courseForm.prerequisites}
                      onChange={(e) => setCourseForm(prev => ({ ...prev, prerequisites: e.target.value }))}
                      placeholder="e.g., MATH101, CS100"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setCourseDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCourse}>
                    {editingCourse ? 'Update Course' : 'Create Course'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Courses Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Year/Semester</TableHead>
                    <TableHead>Max Students</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {courses.length > 0 ? (
                    courses.map((course) => {
                      const programme = programmes.find(p => p.id === course.programme_id);
                      return (
                        <TableRow key={course.id}>
                          <TableCell className="font-mono">{course.code}</TableCell>
                          <TableCell className="font-medium">{course.title}</TableCell>
                          <TableCell>{programme?.title || 'Unknown'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {course.level}
                            </Badge>
                          </TableCell>
                          <TableCell>Year {course.year}, Sem {course.semester}</TableCell>
                          <TableCell>{course.max_students}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No courses found</p>
                        <p className="text-sm">Create your first course to get started.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Available Units Tab */}
        <TabsContent value="units" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Available Units for Registration</h2>
            <Dialog open={unitDialogOpen} onOpenChange={setUnitDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetUnitForm}>
                  <Plus className="mr-2 h-4 w-4" />
                  Make Unit Available
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Make Unit Available for Registration</DialogTitle>
                  <DialogDescription>
                    Select a course and registration period to make it available for student registration
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unit-course">Course</Label>
                      <Select
                        value={unitForm.course_id}
                        onValueChange={(value) => {
                          const course = courses.find(c => c.id === value);
                          setUnitForm(prev => ({
                            ...prev,
                            course_id: value,
                            programme_id: course?.programme_id || '',
                            semester: course?.semester || '',
                            year_level: course?.year || 1
                          }));
                        }}
                      >
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
                      <Label htmlFor="unit-registration-period">Registration Period</Label>
                      <Select
                        value={unitForm.registration_period_id}
                        onValueChange={(value) => {
                          const period = registrationPeriods.find(p => p.id === value);
                          setUnitForm(prev => ({
                            ...prev,
                            registration_period_id: value,
                            academic_year: period?.academic_year || '',
                            semester: period?.semester || prev.semester
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                          {registrationPeriods.map(period => (
                            <SelectItem key={period.id} value={period.id}>
                              {period.academic_year} - Semester {period.semester}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="unit-academic-year">Academic Year</Label>
                      <Input
                        id="unit-academic-year"
                        value={unitForm.academic_year}
                        onChange={(e) => setUnitForm(prev => ({ ...prev, academic_year: e.target.value }))}
                        placeholder="e.g., 2024/2025"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit-semester">Semester</Label>
                      <Input
                        id="unit-semester"
                        value={unitForm.semester}
                        onChange={(e) => setUnitForm(prev => ({ ...prev, semester: e.target.value }))}
                        placeholder="e.g., 1"
                        readOnly
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="unit-year-level">Year Level</Label>
                      <Input
                        id="unit-year-level"
                        type="number"
                        value={unitForm.year_level}
                        onChange={(e) => setUnitForm(prev => ({ ...prev, year_level: parseInt(e.target.value) || 1 }))}
                        min="1"
                        max="4"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="unit-max-students">Maximum Students</Label>
                    <Input
                      id="unit-max-students"
                      type="number"
                      value={unitForm.max_students}
                      onChange={(e) => setUnitForm(prev => ({ ...prev, max_students: parseInt(e.target.value) || 50 }))}
                      min="1"
                      max="500"
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setUnitDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUnit}>
                    Make Available
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Available Units Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Course Code</TableHead>
                    <TableHead>Course Title</TableHead>
                    <TableHead>Programme</TableHead>
                    <TableHead>Academic Year</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead>Enrollment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {availableUnits.length > 0 ? (
                    availableUnits.map((unit) => (
                      <TableRow key={unit.id}>
                        <TableCell className="font-mono">{unit.course?.code}</TableCell>
                        <TableCell className="font-medium">{unit.course?.title}</TableCell>
                        <TableCell>{unit.programme?.title}</TableCell>
                        <TableCell>{unit.academic_year}</TableCell>
                        <TableCell>Semester {unit.semester}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{unit.current_enrollment}/{unit.max_students}</span>
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(unit.current_enrollment / unit.max_students) * 100}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={unit.is_active ? "default" : "secondary"}>
                            {unit.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p className="font-medium">No units available for registration</p>
                        <p className="text-sm">Make courses available for student registration.</p>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Lecturer Assignments Tab */}
        <TabsContent value="lecturers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Lecturer Assignments</h2>
            <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Assign Lecturer
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Assign Lecturer to Courses</DialogTitle>
                  <DialogDescription>
                    Select a lecturer and courses to assign them to
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="lecturer-select">Select Lecturer</Label>
                    <Select
                      value={selectedLecturer}
                      onValueChange={setSelectedLecturer}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a lecturer" />
                      </SelectTrigger>
                      <SelectContent>
                        {lecturers.map(lecturer => (
                          <SelectItem key={lecturer.id} value={lecturer.id}>
                            {lecturer.full_name} - {lecturer.department || 'No Department'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Select Courses</Label>
                    <div className="max-h-60 overflow-y-auto space-y-2 border rounded-lg p-3">
                      {unassignedCourses.map(course => (
                        <div key={course.id} className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedCourses.includes(course.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedCourses(prev => [...prev, course.id]);
                              } else {
                                setSelectedCourses(prev => prev.filter(id => id !== course.id));
                              }
                            }}
                          />
                          <div className="flex-1">
                            <div className="font-medium">{course.code} - {course.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {course.programme?.title} | Year {course.year}, Semester {course.semester}
                            </div>
                          </div>
                        </div>
                      ))}
                      {unassignedCourses.length === 0 && (
                        <p className="text-center text-muted-foreground py-4">
                          All courses have been assigned to lecturers
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setAssignmentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleLecturerAssignment}>
                    Assign Lecturer
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Current Assignments */}
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Current Lecturer Assignments</CardTitle>
                <CardDescription>
                  View and manage lecturer course assignments
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Lecturer</TableHead>
                      <TableHead>Course Code</TableHead>
                      <TableHead>Course Title</TableHead>
                      <TableHead>Programme</TableHead>
                      <TableHead>Year/Semester</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {courses.filter(course => course.lecturer_id).map((course) => {
                      const lecturer = lecturers.find(l => l.id === course.lecturer_id);
                      const programme = programmes.find(p => p.id === course.programme_id);
                      return (
                        <TableRow key={course.id}>
                          <TableCell className="font-medium">
                            {lecturer?.full_name || 'Unknown Lecturer'}
                          </TableCell>
                          <TableCell className="font-mono">{course.code}</TableCell>
                          <TableCell>{course.title}</TableCell>
                          <TableCell>{programme?.title || 'Unknown'}</TableCell>
                          <TableCell>Year {course.year}, Sem {course.semester}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveLecturer(course.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                    {courses.filter(course => course.lecturer_id).length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="font-medium">No lecturer assignments found</p>
                          <p className="text-sm">Start by assigning lecturers to courses.</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Unassigned Courses */}
            {unassignedCourses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Unassigned Courses</CardTitle>
                  <CardDescription>
                    Courses that need lecturer assignments
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Course Code</TableHead>
                        <TableHead>Course Title</TableHead>
                        <TableHead>Programme</TableHead>
                        <TableHead>Year/Semester</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {unassignedCourses.map((course) => {
                        const programme = programmes.find(p => p.id === course.programme_id);
                        return (
                          <TableRow key={course.id}>
                            <TableCell className="font-mono">{course.code}</TableCell>
                            <TableCell className="font-medium">{course.title}</TableCell>
                            <TableCell>{programme?.title || 'Unknown'}</TableCell>
                            <TableCell>Year {course.year}, Sem {course.semester}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">Unassigned</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Programmes Tab */}
        <TabsContent value="programmes" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Faculty Programmes</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {programmes.map((programme) => (
              <Card key={programme.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{programme.title}</span>
                    <Badge variant="outline">{programme.level}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Code: {programme.code} | Duration: {programme.duration_years} years
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Total Units:</span>
                      <span className="font-medium">{programme.total_units}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Department:</span>
                      <span className="font-medium">{programme.department || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <Badge variant={programme.is_active ? "default" : "secondary"} className="text-xs">
                        {programme.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                  {programme.description && (
                    <p className="text-sm text-muted-foreground mt-3">
                      {programme.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {programmes.length === 0 && (
            <Card>
              <CardContent className="text-center py-8">
                <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="font-medium text-muted-foreground">No programmes found</p>
                <p className="text-sm text-muted-foreground">Contact the administrator to set up programmes for your faculty.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
