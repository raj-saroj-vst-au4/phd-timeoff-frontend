import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Calendar, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';

const StudentsOnLeaveToday: React.FC = () => {
  const { users } = useAuth();
  const { leaves } = useData();

  const today = new Date().toISOString().split('T')[0];

  // Find students who are currently on leave today
  const studentsOnLeaveToday = leaves.filter(leave => {
    const startDate = leave.startDate;
    const endDate = leave.endDate;
    const isApproved = ['hod_approved', 'dean_approved'].includes(leave.status);

    return isApproved && startDate <= today && endDate >= today;
  }).map(leave => {
    const student = users.find(u => u.id === leave.studentId);
    return {
      ...leave,
      studentName: student?.name || 'Unknown',
      rollNumber: student?.rollNumber || 'N/A'
    };
  });

  if (studentsOnLeaveToday.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Students on Leave Today
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">No students are on leave today.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Students on Leave Today ({studentsOnLeaveToday.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {studentsOnLeaveToday.map((leave) => (
            <div key={leave.id} className="border rounded-lg p-3 bg-blue-50">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <User className="h-4 w-4 text-blue-600" />
                  <div>
                    <h4 className="font-medium">{leave.studentName}</h4>
                    <p className="text-sm text-gray-600">{leave.rollNumber}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="capitalize mb-1">
                    {leave.type}
                  </Badge>
                  <p className="text-xs text-gray-500">
                    {leave.startDate} - {leave.endDate}
                  </p>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-700">{leave.reason}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge variant={leave.isPaid ? 'default' : 'secondary'} className="text-xs">
                    {leave.isPaid ? 'Paid' : 'Unpaid'}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {leave.daysCount} days total
                    {leave.paidDays && leave.paidDays !== leave.daysCount &&
                      ` (${leave.paidDays} paid)`
                    }
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StudentsOnLeaveToday;
