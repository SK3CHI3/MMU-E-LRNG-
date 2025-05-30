import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GuestLayout from '@/components/layout/GuestLayout';
import GuestDashboard from '@/pages/guest/GuestDashboard';
import GuestCourses from '@/pages/guest/GuestCourses';
import GuestAssignments from '@/pages/guest/GuestAssignments';
import GuestGrades from '@/pages/guest/GuestGrades';
import GuestSchedule from '@/pages/guest/GuestSchedule';
import GuestResources from '@/pages/guest/GuestResources';
import GuestFees from '@/pages/guest/GuestFees';
import GuestAnnouncements from '@/pages/guest/GuestAnnouncements';
import GuestStudyAI from '@/pages/guest/GuestStudyAI';
import GuestMessages from '@/pages/guest/GuestMessages';

const GuestPortal = () => {
  return (
    <GuestLayout>
      <Routes>
        <Route path="/" element={<Navigate to="/guest-portal/dashboard" replace />} />
        <Route path="/dashboard" element={<GuestDashboard />} />
        <Route path="/courses" element={<GuestCourses />} />
        <Route path="/assignments" element={<GuestAssignments />} />
        <Route path="/grades" element={<GuestGrades />} />
        <Route path="/schedule" element={<GuestSchedule />} />
        <Route path="/resources" element={<GuestResources />} />
        <Route path="/fees" element={<GuestFees />} />
        <Route path="/announcements" element={<GuestAnnouncements />} />
        <Route path="/study-ai" element={<GuestStudyAI />} />
        <Route path="/messages" element={<GuestMessages />} />
      </Routes>
    </GuestLayout>
  );
};

export default GuestPortal;
