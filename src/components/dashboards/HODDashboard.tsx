
import React from 'react';
import Layout from '../Layout';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { CheckCircle, XCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { toast } from '../ui/use-toast';

const HODDashboard: React.FC = () => {
  const { users } = useAuth();
  const { leaves, updateLeave, addNotification } = useData();

  // Find leaves that need HOD approval
  const pendingLeaves = leaves.filter(leave => leave.status === 'guide_approved');
  const allLeaves = leaves.length;
  const approvedLeaves = leaves.filter(leave =>
    leave.status === 'hod_approved' ||
    leave.status === 'dean_approved' ||
    leave.status === 'dean_approval_pending'
  ).length;

  // Find leaves that need special attention (continuous leaves)
  const specialAttentionLeaves = leaves.filter(leave => {
    if (leave.type === 'personal' && leave.daysCount > 15) return true;
    if (leave.type === 'medical' && leave.daysCount > 5) return true;
    if (leave.type === 'academic' && leave.daysCount > 15) return true;
    return false;
  });

  // Get admin users for notifications
  const adminUsers = users.filter(u => u.role === 'admin');

  const approveLeave = (leaveId: string, isPaid: boolean = true) => {
    const leave = leaves.find(l => l.id === leaveId);

    if (leave?.type === 'academic' && leave.daysCount > 15) {
      // Academic leave > 15 days needs Dean approval after HOD approval
      updateLeave(leaveId, {
        status: 'dean_approval_pending',
        hodApprovalDate: new Date().toISOString(),
        isPaid
      });

      // Notify admin to generate Dean AP document
      adminUsers.forEach(admin => {
        addNotification({
          userId: admin.id,
          type: 'leave_request',
          message: `Academic leave from ${users.find(u => u.id === leave.studentId)?.name} requires Dean AP document generation`,
          read: false
        });
      });

      toast({
        title: "Leave Approved - Pending Dean AP Document",
        description: "Academic leave approved by HOD. Admin will generate Dean AP approval document.",
      });
    } else {
      // Regular approval flow
      updateLeave(leaveId, {
        status: 'hod_approved',
        hodApprovalDate: new Date().toISOString(),
        isPaid
      });

      toast({
        title: "Leave Approved",
        description: "Leave application has been approved successfully.",
      });
    }
  };

  const rejectLeave = (leaveId: string) => {
    updateLeave(leaveId, {
      status: 'rejected'
    });

    toast({
      title: "Leave Rejected",
      description: "Leave application has been rejected.",
    });
  };

  const getStatusBadge = (leave: any) => {
    switch (leave.status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800">Pending</Badge>;
      case 'guide_approved':
        return <Badge variant="outline" className="bg-blue-50 text-blue-800">Guide Approved</Badge>;
      case 'hod_approved':
        return <Badge variant="outline" className="bg-green-50 text-green-800">HOD Approved</Badge>;
      case 'dean_approval_pending':
        return <Badge variant="outline" className="bg-orange-50 text-orange-800">Awaiting Dean AP Document</Badge>;
      case 'dean_approved':
        return <Badge variant="outline" className="bg-purple-50 text-purple-800">Dean Approved</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Layout title="HOD Dashboard">
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Total Leaves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{allLeaves}</div>
              <p className="text-sm text-gray-600">All applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingLeaves.length}</div>
              <p className="text-sm text-gray-600">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{approvedLeaves}</div>
              <p className="text-sm text-gray-600">Approved leaves</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Special Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{specialAttentionLeaves.length}</div>
              <p className="text-sm text-gray-600">Exceeding limits</p>
            </CardContent>
          </Card>
        </div>

        {/* Special Attention Leaves */}
        {specialAttentionLeaves.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-600" />
                Leaves Requiring Special Attention
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {specialAttentionLeaves.map((leave) => {
                  const student = users.find(u => u.id === leave.studentId);
                  return (
                    <div key={leave.id} className="border border-red-200 rounded-lg p-4 bg-red-50">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">{student?.name}</h3>
                          <p className="text-sm text-gray-600">{student?.rollNumber}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="capitalize">
                              {leave.type}
                            </Badge>
                            <Badge variant="destructive">
                              {leave.daysCount} days (Exceeds limit)
                            </Badge>
                            {leave.requiresDeanApproval && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-800">
                                Requires Dean Approval
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {leave.startDate} - {leave.endDate}
                          </p>
                          {getStatusBadge(leave)}
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 mb-4">{leave.reason}</p>
                      {leave.status === 'guide_approved' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => approveLeave(leave.id, true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Approve as Paid
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveLeave(leave.id, false)}
                          >
                            Approve as Unpaid
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => rejectLeave(leave.id)}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

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
                  const guide = users.find(u => u.id === student?.guideId);

                  return (
                    <div key={leave.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-medium">{student?.name}</h3>
                          <p className="text-sm text-gray-600">{student?.rollNumber}</p>
                          <p className="text-sm text-gray-600">Guide: {guide?.name}</p>
                          <div className="flex items-center space-x-2 mt-2">
                            <Badge variant="outline" className="capitalize">
                              {leave.type}
                            </Badge>
                            <Badge variant="secondary">
                              {leave.daysCount} days
                            </Badge>
                            {getStatusBadge(leave)}
                            {leave.requiresDeanApproval && (
                              <Badge variant="outline" className="bg-orange-50 text-orange-800">
                                Will Need Dean Approval
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            {leave.startDate} - {leave.endDate}
                          </p>
                          <p className="text-xs text-gray-500">
                            Guide approved: {leave.guideApprovalDate ? new Date(leave.guideApprovalDate).toLocaleDateString() : 'N/A'}
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
      </div>
    </Layout>
  );
};

export default HODDashboard;
