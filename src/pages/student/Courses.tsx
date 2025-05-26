import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { BookOpen, Clock, Users, Calendar, Play, FileText, Plus, AlertCircle, CheckCircle, GraduationCap, TrendingUp, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentCourses, getAvailableUnitsForRegistration, registerForUnits } from '@/services/studentService';
import { canRegisterForUnits } from '@/services/feeService';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface EnrolledUnit {
  id: string;
  code: string;
  name: string;
  instructor: string;
  progress: number;
  status: 'active' | 'completed' | 'pending';
  nextClass: string;
  students: number;
  assignments: number;
  color: string;
  semester: string;
  academicYear: string;
}

interface AvailableUnit {
  id: string;
  code: string;
  name: string;
  instructor: string;
  credits: number;
  prerequisites: string[];
  description: string;
  semester: string;
  academicYear: string;
  maxStudents: number;
  enrolledStudents: number;
  isPrerequisiteMet: boolean;
}

const Courses = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledUnit[]>([]);
  const [availableUnits, setAvailableUnits] = useState<AvailableUnit[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrationLoading, setRegistrationLoading] = useState(false);
  const [canRegister, setCanRegister] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [registrationPeriod, setRegistrationPeriod] = useState({
    isOpen: true,
    startDate: '2025-05-15',
    endDate: '2025-06-15',
    semester: '2.2',
    academicYear: '2024/2025'
  });

  useEffect(() => {
    if (user?.id) {
      loadStudentUnits();
      checkRegistrationEligibility();
    }
  }, [user?.id]);

  const loadStudentUnits = async () => {
    try {
      setLoading(true);

      // Get enrolled units
      const enrolledUnits = await getStudentCourses(user!.id);

      // Transform to match interface
      const transformedUnits: EnrolledUnit[] = enrolledUnits.map((unit, index) => ({
        id: unit.id,
        code: unit.code,
        name: unit.title,
        instructor: unit.lecturer_name || 'TBA',

        progress: Math.floor(Math.random() * 100), // This would come from actual progress tracking
        status: unit.status || 'active',
        nextClass: unit.next_class || 'TBA',
        students: unit.enrolled_students || 0,
        assignments: unit.pending_assignments || 0,
        color: ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500'][index % 5],
        semester: unit.semester || '2.1',
        academicYear: unit.academic_year || '2024/2025'
      }));

      setEnrolledCourses(transformedUnits);

      // Get available units for registration
      if (registrationPeriod.isOpen) {
        const availableUnits = await getAvailableUnitsForRegistration(user!.id);
        setAvailableUnits(availableUnits);
      }
    } catch (error) {
      console.error('Error loading student units:', error);
      setEnrolledCourses([]);
      setAvailableUnits([]);
    } finally {
      setLoading(false);
    }
  };

  const checkRegistrationEligibility = async () => {
    try {
      const eligible = await canRegisterForUnits(user!.id);
      setCanRegister(eligible);
    } catch (error) {
      console.error('Error checking registration eligibility:', error);
      setCanRegister(false);
    }
  };

  const handleUnitSelection = (unitId: string, checked: boolean) => {
    if (checked) {
      setSelectedUnits(prev => [...prev, unitId]);
    } else {
      setSelectedUnits(prev => prev.filter(id => id !== unitId));
    }
  };

  const handleRegistration = async () => {
    if (selectedUnits.length === 0) {
      toast({
        title: "No Units Selected",
        description: "Please select at least one unit to register for.",
        variant: "destructive"
      });
      return;
    }

    try {
      setRegistrationLoading(true);

      const result = await registerForUnits(user!.id, selectedUnits);

      if (result.success) {
        toast({
          title: "Registration Successful",
          description: `Successfully registered for ${selectedUnits.length} unit(s).`,
        });

        setIsRegistrationOpen(false);
        setSelectedUnits([]);
        loadStudentUnits(); // Refresh the data
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to register for units. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error registering for units:', error);
      toast({
        title: "Registration Error",
        description: "An error occurred during registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRegistrationLoading(false);
    }
  };



  const activeCoursesCount = enrolledCourses.filter(course => course.status === 'active').length;
  const averageProgress = enrolledCourses.length > 0
    ? Math.round(enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length)
    : 0;

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-32 w-full" />
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Units</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your enrolled units and track progress</p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isRegistrationOpen} onOpenChange={setIsRegistrationOpen}>
            <DialogTrigger asChild>
              <Button
                className="bg-green-600 hover:bg-green-700"
                disabled={!registrationPeriod.isOpen || !canRegister}
              >
                <Plus className="h-4 w-4 mr-2" />
                Register Units
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Unit Registration - {registrationPeriod.semester} ({registrationPeriod.academicYear})</DialogTitle>
                <DialogDescription>
                  Select units to register for the upcoming semester. Registration period: {registrationPeriod.startDate} to {registrationPeriod.endDate}
                </DialogDescription>
              </DialogHeader>

              {!canRegister && (
                <Alert className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    You need to pay at least 60% of your fees to register for units. Please complete your fee payment first.
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
                  <span className="font-medium">Selected Units: {selectedUnits.length}</span>
                  <span className="text-sm text-muted-foreground">Maximum: 7 units per semester</span>
                </div>

                <div className="grid gap-4">
                  {availableUnits.map((unit) => (
                    <Card key={unit.id} className={`transition-all ${
                      selectedUnits.includes(unit.id) ? 'ring-2 ring-primary' : ''
                    } ${!unit.isPrerequisiteMet ? 'opacity-60' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={selectedUnits.includes(unit.id)}
                              onCheckedChange={(checked) => handleUnitSelection(unit.id, checked as boolean)}
                              disabled={!unit.isPrerequisiteMet || unit.enrolledStudents >= unit.maxStudents}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{unit.code}</h4>
                                {!unit.isPrerequisiteMet && (
                                  <Badge variant="destructive">Prerequisites Not Met</Badge>
                                )}
                                {unit.enrolledStudents >= unit.maxStudents && (
                                  <Badge variant="secondary">Full</Badge>
                                )}
                              </div>
                              <h5 className="font-medium text-sm mb-2">{unit.name}</h5>
                              <p className="text-sm text-muted-foreground mb-2">{unit.description}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Instructor: {unit.instructor}</span>
                                <span>Enrolled: {unit.enrolledStudents}/{unit.maxStudents}</span>
                              </div>
                              {unit.prerequisites.length > 0 && (
                                <div className="mt-2">
                                  <span className="text-xs text-muted-foreground">Prerequisites: </span>
                                  <span className="text-xs">{unit.prerequisites.join(', ')}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    {selectedUnits.length} unit(s) selected
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => setIsRegistrationOpen(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleRegistration}
                      disabled={selectedUnits.length === 0 || registrationLoading || selectedUnits.length > 7}
                    >
                      {registrationLoading ? 'Registering...' : `Register ${selectedUnits.length} Unit(s)`}
                    </Button>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            Browse Units
          </Button>
        </div>
      </div>

      {/* Registration Status Alert */}
      {registrationPeriod.isOpen && (
        <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
          <GraduationCap className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Unit Registration Open!</strong> Registration for {registrationPeriod.semester} ({registrationPeriod.academicYear})
            is open until {new Date(registrationPeriod.endDate).toLocaleDateString()}.
            {!canRegister && " Complete your fee payment to register for units."}
          </AlertDescription>
        </Alert>
      )}

      {/* Semester Progress Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            Semester Progress - {registrationPeriod.semester} {registrationPeriod.academicYear}
          </CardTitle>
          <CardDescription>
            Your academic progress for the current semester
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{enrolledCourses.length}</div>
              <div className="text-sm text-muted-foreground">Units Registered</div>
            </div>
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {enrolledCourses.filter(course => course.progress >= 80).length}
              </div>
              <div className="text-sm text-muted-foreground">Units Completed</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {enrolledCourses.filter(course => course.progress >= 50 && course.progress < 80).length}
              </div>
              <div className="text-sm text-muted-foreground">Units In Progress</div>
            </div>
            <div className="text-center p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {enrolledCourses.filter(course => course.progress < 50).length}
              </div>
              <div className="text-sm text-muted-foreground">Units At Risk</div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Overall Semester Progress</span>
              <span className="text-sm text-muted-foreground">{averageProgress}%</span>
            </div>
            <Progress value={averageProgress} className="h-2" />

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Total Units:</span>
                <span className="text-sm font-medium">{enrolledCourses.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">GPA Target:</span>
                <span className="text-sm font-medium">3.5+</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic History Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Academic History
          </CardTitle>
          <CardDescription>
            Your performance across previous semesters
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Previous Semesters Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">11</div>
                <div className="text-sm text-muted-foreground">Total Units Taken</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                <div className="text-2xl font-bold text-green-600">9</div>
                <div className="text-sm text-muted-foreground">Units Passed</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 rounded-lg">
                <div className="text-2xl font-bold text-red-600">2</div>
                <div className="text-sm text-muted-foreground">Units Failed</div>
              </div>
            </div>

            {/* Semester Breakdown */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Semester Breakdown</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Semester 1, 2024</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600">4 Passed</span>
                    <span className="text-red-600">1 Failed</span>
                    <span className="font-medium">GPA: 3.2</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Semester 2, 2024</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-600">5 Passed</span>
                    <span className="text-red-600">1 Failed</span>
                    <span className="font-medium">GPA: 3.4</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="font-medium">Semester 1, 2025 (Current)</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-blue-600">{enrolledCourses.length} Registered</span>
                    <span className="font-medium">Target GPA: 3.5+</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Overall Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">3.3</div>
                <div className="text-xs text-muted-foreground">Cumulative GPA</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">82%</div>
                <div className="text-xs text-muted-foreground">Pass Rate</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">11</div>
                <div className="text-xs text-muted-foreground">Total Units</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-orange-600">67%</div>
                <div className="text-xs text-muted-foreground">Degree Progress</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Units</p>
                <p className="text-2xl font-bold text-blue-600">{activeCoursesCount}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>



        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Progress</p>
                <p className="text-2xl font-bold text-purple-600">{averageProgress}%</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Assignments</p>
                <p className="text-2xl font-bold text-orange-600">
                  {enrolledCourses.reduce((sum, course) => sum + course.assignments, 0)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Registration Status</p>
                <p className={`text-2xl font-bold ${canRegister ? 'text-green-600' : 'text-red-600'}`}>
                  {canRegister ? 'Eligible' : 'Blocked'}
                </p>
              </div>
              {canRegister ? (
                <CheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <AlertCircle className="h-8 w-8 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Units Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {enrolledCourses.length > 0 ? (
          enrolledCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${course.color}`} />
                  <div>
                    <CardTitle className="text-lg">{course.code}</CardTitle>
                    <CardDescription className="font-medium">{course.name}</CardDescription>
                  </div>
                </div>
                <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                  {course.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Instructor: {course.instructor}</span>
                <span>{course.credits} Credits</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{course.assignments} pending</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>{course.nextClass}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button size="sm" className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Enter Unit
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Materials
                </Button>
              </div>
            </CardContent>
          </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <CardContent>
                <div className="max-w-md mx-auto">
                  <BookOpen className="h-16 w-16 mx-auto text-blue-500 mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Ready to Start Learning?</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't enrolled in any units yet. Register for units to begin your academic journey this semester.
                  </p>

                  {registrationPeriod.isOpen ? (
                    canRegister ? (
                      <div className="space-y-4">
                        <div className="rounded-lg border p-4 bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
                          <CheckCircle className="h-6 w-6 mx-auto text-green-600 mb-2" />
                          <p className="text-sm text-green-800 dark:text-green-200 font-medium">
                            Registration is open and you're eligible to register!
                          </p>
                        </div>
                        <Button
                          onClick={() => setIsRegistrationOpen(true)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Register for Units Now
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="rounded-lg border p-4 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800">
                          <AlertCircle className="h-6 w-6 mx-auto text-amber-600 mb-2" />
                          <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-2">
                            Registration is open but you need to pay fees first
                          </p>
                          <p className="text-xs text-amber-700 dark:text-amber-300">
                            Pay at least 60% of your fees to become eligible for unit registration
                          </p>
                        </div>
                        <div className="flex gap-2 justify-center">
                          <Button variant="outline" onClick={() => window.location.href = '/student/fees'}>
                            <DollarSign className="h-4 w-4 mr-2" />
                            Pay Fees
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => setIsRegistrationOpen(true)}
                            disabled
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Register Units
                          </Button>
                        </div>
                      </div>
                    )
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-lg border p-4 bg-gray-50 dark:bg-gray-950/20">
                        <Clock className="h-6 w-6 mx-auto text-gray-600 mb-2" />
                        <p className="text-sm text-gray-700 dark:text-gray-300 font-medium mb-2">
                          Registration is currently closed
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Registration period: {registrationPeriod.startDate} to {registrationPeriod.endDate}
                        </p>
                      </div>
                      <Button variant="outline" disabled>
                        <Plus className="h-4 w-4 mr-2" />
                        Registration Closed
                      </Button>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t">
                    <p className="text-xs text-muted-foreground">
                      Need help? Contact the Academic Office or your faculty advisor
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
