
import React, { useState } from 'react';
import Layout from '../Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Plus, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';
import LeaveApplicationForm from '../forms/LeaveApplicationForm';
import { formatDate } from '../../utils/dateUtils';

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { leaves, leaveBalances } = useData();
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const studentLeaves = leaves.filter(leave => leave.studentId === user?.id);
  const studentBalance = leaveBalances.find(balance => balance.studentId === user?.id);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'guide_approved':
        return 'bg-blue-100 text-blue-800';
      case 'hod_approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'guide_approved':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'hod_approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <Layout title="Student Dashboard">
      <div className="space-y-6">
        {/* Leave Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Personal Leaves</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {studentBalance?.personalLeaves || 0}
              </div>
              <p className="text-sm text-gray-600">Available (Max: 15 per 6 months)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Medical Leaves</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {studentBalance?.medicalLeaves || 0}
              </div>
              <p className="text-sm text-gray-600">Available (Max: 5 per 6 months)</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Academic Leaves</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {studentBalance?.academicLeaves || 0}
              </div>
              <p className="text-sm text-gray-600">Available (Max: 25 per 6 months)</p>
            </CardContent>
          </Card>
        </div>

        {/* Apply for Leave */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Apply for Leave</CardTitle>
              <Button onClick={() => setShowApplicationForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Apply Leave
              </Button>
            </div>
          </CardHeader>
        </Card>

        {/* Leave History */}
        <Card>
          <CardHeader>
            <CardTitle>Leave History</CardTitle>
          </CardHeader>
          <CardContent>
            {studentLeaves.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No leave applications found.</p>
            ) : (
              <div className="space-y-4">
                {studentLeaves.map((leave) => (
                  <div key={leave.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="capitalize">
                            {leave.type}
                          </Badge>
                          <Badge className={getStatusColor(leave.status)}>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(leave.status)}
                              <span className="capitalize">{leave.status.replace('_', ' ')}</span>
                            </div>
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{leave.daysCount} days</p>
                        <p className="text-xs text-gray-500">
                          {leave.isPaid ? 'Paid' : 'Unpaid'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">{leave.reason}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Leave Application Form Modal */}
        {showApplicationForm && (
          <LeaveApplicationForm onClose={() => setShowApplicationForm(false)} />
        )}
      </div>
    </Layout>
  );
};

export default StudentDashboard;
