
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import AdminDashboard from './dashboards/AdminDashboard';
import StudentDashboard from './dashboards/StudentDashboard';
import FacultyDashboard from './dashboards/FacultyDashboard';
import HODDashboard from './dashboards/HODDashboard';

const Dashboard: React.FC = () => {
  const { user: {user} } = useAuth();

  if (!user) return null;
  switch (user.role) {
    case 'admin':
      return <AdminDashboard />;
    case 'student':
      return <StudentDashboard />;
    case 'faculty':
      return <FacultyDashboard />;
    case 'hod':
      return <HODDashboard />;
    default:
      return <div>Invalid user role</div>;
  }
};

export default Dashboard;
