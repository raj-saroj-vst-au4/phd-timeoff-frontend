
import React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { toast } from '../ui/use-toast';

const FacultyDashboard: React.FC = () => {
  const { user: {user}, users } = useAuth();
  const { leaves, isLoading, updateLeave, addNotification } = useData();

  const [hod, setHod] = useState(null);

  useEffect(() => {
    const foundHod = users.find(u => u.role === 'hod');
    setHod(foundHod);
  }, [users]);

  // Find students where current user is guide or TA
  const myStudents = users.filter(u =>
    u.role === 'student' && (u.guideId === user?.id || u.taId === user?.id)
  );

  // Find leaves that need my approval
  const pendingLeaves = leaves.filter(leave => {
    const student = users.find(u => u.id === leave.studentId);
    return student && (student.guideId === user?.id || student.taId === user?.id) &&
           leave.status === 'pending';
  });

  const approveLeave = (leaveId: string) => {
    const leave = leaves.find(l => l.id === leaveId);
    if (!leave) return;

    updateLeave(leaveId, {
      status: 'guide_approved',
      guideApprovalDate: new Date().toISOString()
    });

    // Notify HOD
    addNotification({
      userId: hod?.id, // HOD ID
      type: 'leave_request',
      message: `Leave application approved by guide and needs your approval`,
      read: false
    });

    console.log({
      userId: hod,
      id: hod?.id,
      type: 'leave_request',
      message: `Leave application approved by guide and needs your approval`,
      read: false
    });

    toast({
      title: "Leave Approved",
      description: "Leave application has been approved and sent to HOD for final approval."
    });
  };

  const rejectLeave = (leaveId: string) => {
    updateLeave(leaveId, {
      status: 'rejected'
    });

    toast({
      title: "Leave Rejected",
      description: "Leave application has been rejected."
    });
  };

  if (isLoading || !users || users.length === 0) {
    return (
      <Layout title="Faculty Dashboard">
        <div className="p-8 text-center text-gray-500">
          Loading leave data...
        </div>
      </Layout>
    );
  }


  return (
    <Layout title="Faculty Dashboard">
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                My Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{myStudents.length}</div>
              <p className="text-sm text-gray-600">Students under guidance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Pending Approvals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingLeaves.length}</div>
              <p className="text-sm text-gray-600">Awaiting your approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Total Leaves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {leaves.filter(l => {
                  const student = users.find(u => u.id === l.studentId);
                  return student && (student.guideId === user?.id || student.taId === user?.id);
                }).length}
              </div>
              <p className="text-sm text-gray-600">All time applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Leave Approvals */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Leave Approvals</CardTitle>
          </CardHeader>
          <CardContent>
            {pendingLeaves.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No pending leave approvals.</p>
            ) : (
              <div className="space-y-4">
                {pendingLeaves.map((leave) => {
                  const student = users.find(u => u.id === leave.studentId);
                  return (
                    <div key={leave.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">{student?.name}</h3>
                          <p className="text-sm text-gray-600">{student?.rollNumber}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="capitalize">
                              {leave.type}
                            </Badge>
                            <Badge variant="secondary">
                              {leave.daysCount} days
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {leave.startDate} - {leave.endDate}
                          </p>
                          <p className="text-xs text-gray-500">
                            Applied: {new Date(leave.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-4">{leave.reason}</p>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => approveLeave(leave.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => rejectLeave(leave.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Students */}
        <Card>
          <CardHeader>
            <CardTitle>My Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {myStudents.map((student) => {
                const studentLeaves = leaves.filter(l => l.studentId === student.id);
                const isGuide = student.guideId === user?.id;
                const isTA = student.taId === user?.id;

                return (
                  <div key={student.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{student.name}</h3>
                        <p className="text-sm text-gray-600">{student.rollNumber}</p>
                        <p className="text-sm text-gray-600">{student.email}</p>
                        <div className="flex items-center space-x-2 mt-2">

                          {isGuide && <Badge variant="outline">Your Role: Guide</Badge>}
                          {isTA && <Badge variant="outline">Your Role: TA</Badge>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {studentLeaves.length} total leaves
                        </p>
                        <p className="text-xs text-gray-500">
                          {studentLeaves.filter(l => l.status === 'hod_approved').length} approved
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default FacultyDashboard;
