import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Video, Users, Bell } from 'lucide-react';

const Schedule = () => {
  const [selectedDay, setSelectedDay] = useState('monday');

  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday', 
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday'
  };

  const schedule = {
    monday: [
      {
        id: 1,
        course: 'CS 301',
        title: 'Data Structures and Algorithms',
        instructor: 'Dr. Sarah Johnson',
        time: '9:00 AM - 10:30 AM',
        location: 'Room 201, Computer Science Building',
        type: 'lecture',
        isOnline: false,
        students: 45
      },
      {
        id: 2,
        course: 'CS 205',
        title: 'Database Management Systems',
        instructor: 'Prof. Michael Chen',
        time: '2:00 PM - 3:30 PM',
        location: 'Room 305, Engineering Building',
        type: 'lecture',
        isOnline: false,
        students: 38
      }
    ],
    tuesday: [
      {
        id: 3,
        course: 'CS 401',
        title: 'Software Engineering',
        instructor: 'Dr. Emily Rodriguez',
        time: '10:00 AM - 11:30 AM',
        location: 'Online via Zoom',
        type: 'lecture',
        isOnline: true,
        students: 42,
        zoomLink: 'https://zoom.us/j/123456789'
      },
      {
        id: 4,
        course: 'CS 301',
        title: 'Data Structures Lab',
        instructor: 'TA: John Smith',
        time: '3:00 PM - 5:00 PM',
        location: 'Lab 101, Computer Science Building',
        type: 'lab',
        isOnline: false,
        students: 20
      }
    ],
    wednesday: [
      {
        id: 5,
        course: 'CS 350',
        title: 'Computer Networks',
        instructor: 'Dr. James Wilson',
        time: '11:00 AM - 12:30 PM',
        location: 'Room 401, Engineering Building',
        type: 'lecture',
        isOnline: false,
        students: 35
      },
      {
        id: 6,
        course: 'MATH 301',
        title: 'Discrete Mathematics',
        instructor: 'Prof. Lisa Anderson',
        time: '1:00 PM - 2:00 PM',
        location: 'Room 150, Mathematics Building',
        type: 'lecture',
        isOnline: false,
        students: 50
      }
    ],
    thursday: [
      {
        id: 7,
        course: 'CS 205',
        title: 'Database Lab',
        instructor: 'TA: Sarah Wilson',
        time: '9:00 AM - 11:00 AM',
        location: 'Lab 205, Computer Science Building',
        type: 'lab',
        isOnline: false,
        students: 18
      },
      {
        id: 8,
        course: 'CS 401',
        title: 'Software Engineering Project',
        instructor: 'Dr. Emily Rodriguez',
        time: '2:00 PM - 4:00 PM',
        location: 'Online via Teams',
        type: 'project',
        isOnline: true,
        students: 42,
        teamsLink: 'https://teams.microsoft.com/l/meetup-join/...'
      }
    ],
    friday: [
      {
        id: 9,
        course: 'CS 350',
        title: 'Networks Lab',
        instructor: 'TA: Mike Johnson',
        time: '10:00 AM - 12:00 PM',
        location: 'Lab 301, Engineering Building',
        type: 'lab',
        isOnline: false,
        students: 16
      }
    ]
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'bg-blue-500';
      case 'lab':
        return 'bg-green-500';
      case 'project':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'default';
      case 'lab':
        return 'secondary';
      case 'project':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const todayClasses = schedule[selectedDay] || [];
  const totalClassesToday = todayClasses.length;
  const onlineClassesToday = todayClasses.filter(c => c.isOnline).length;
  const labsToday = todayClasses.filter(c => c.type === 'lab').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Class Schedule</h1>
          <p className="text-gray-600 dark:text-gray-400">View your weekly class schedule and upcoming sessions</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Calendar className="h-4 w-4 mr-2" />
          Export Schedule
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Classes</p>
                <p className="text-2xl font-bold text-blue-600">{totalClassesToday}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Online Classes</p>
                <p className="text-2xl font-bold text-green-600">{onlineClassesToday}</p>
              </div>
              <Video className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lab Sessions</p>
                <p className="text-2xl font-bold text-purple-600">{labsToday}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Next Class</p>
                <p className="text-2xl font-bold text-orange-600">
                  {todayClasses.length > 0 ? todayClasses[0].time.split(' - ')[0] : 'None'}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day Selector */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {weekDays.map((day) => (
          <Button
            key={day}
            variant={selectedDay === day ? 'default' : 'outline'}
            onClick={() => setSelectedDay(day)}
            className="min-w-[120px]"
          >
            {dayLabels[day]}
          </Button>
        ))}
      </div>

      {/* Schedule for Selected Day */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {dayLabels[selectedDay]} Schedule
        </h2>
        
        {todayClasses.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Classes Today</h3>
              <p className="text-gray-600 dark:text-gray-400">You have no scheduled classes for {dayLabels[selectedDay]}.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {todayClasses.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getTypeColor(classItem.type)}`} />
                      <div>
                        <CardTitle className="text-lg">{classItem.course}</CardTitle>
                        <CardDescription className="font-medium">{classItem.title}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getTypeBadge(classItem.type)}>
                        {classItem.type}
                      </Badge>
                      {classItem.isOnline && (
                        <Badge variant="outline" className="text-green-600">
                          <Video className="h-3 w-3 mr-1" />
                          Online
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{classItem.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{classItem.students} students</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {classItem.isOnline ? (
                        <Video className="h-4 w-4 text-gray-500" />
                      ) : (
                        <MapPin className="h-4 w-4 text-gray-500" />
                      )}
                      <span>{classItem.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Instructor: {classItem.instructor}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2 pt-2">
                    {classItem.isOnline ? (
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        <Video className="h-4 w-4 mr-2" />
                        Join Online Class
                      </Button>
                    ) : (
                      <Button size="sm" className="flex-1">
                        <MapPin className="h-4 w-4 mr-2" />
                        Get Directions
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Bell className="h-4 w-4 mr-2" />
                      Set Reminder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Schedule;
