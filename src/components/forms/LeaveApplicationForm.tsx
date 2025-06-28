
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { X } from 'lucide-react';
import { toast } from '../ui/use-toast';
import LeaveTypeSelector from './leave/LeaveTypeSelector';
import DateRangeSelector from './leave/DateRangeSelector';
import LeaveBalance from './leave/LeaveBalance';
import DeanApprovalWarning from './leave/DeanApprovalWarning';
import FileUpload from './leave/FileUpload';
import ReasonInput from './leave/ReasonInput';

interface LeaveApplicationFormProps {
  onClose: () => void;
}

const LeaveApplicationForm: React.FC<LeaveApplicationFormProps> = ({ onClose }) => {
  const { user: {user}, users } = useAuth();
  const { addLeave, leaveBalances, updateLeaveBalance, addNotification } = useData();

  const [formData, setFormData] = useState({
    type: 'personal' as 'personal' | 'medical' | 'academic',
    startDate: '',
    endDate: '',
    reason: '',
    document: null as File | null
  });

  const studentBalance = leaveBalances.find(balance => balance.studentId === user?.id);
  const guide = users.find(u => u.id === user?.guideId);

  const calculateDays = (start: string, end: string): number => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const daysCount = calculateDays(formData.startDate, formData.endDate);
  const requiresDeanApproval = formData.type === 'academic' && daysCount > 15;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !guide) {
      toast({
        title: "Error",
        description: "User or guide information not found",
        variant: "destructive"
      });
      return;
    }

    if (daysCount <= 0) {
      toast({
        title: "Invalid Date Range",
        description: "Please select valid start and end dates",
        variant: "destructive"
      });
      return;
    }

    if (formData.type === 'medical' && !formData.document) {
      toast({
        title: "Document Required",
        description: "Medical leave requires a medical proof document",
        variant: "destructive"
      });
      return;
    }

    addLeave({
      studentId: user.id,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      document: formData.document?.name || undefined,
      status: 'pending',
      isPaid: true,
      daysCount,
      requiresDeanApproval
    });

    if (studentBalance) {
      const updatedBalance = { ...studentBalance };
      switch (formData.type) {
        case 'personal':
          updatedBalance.personalLeaves = Math.max(0, updatedBalance.personalLeaves - daysCount);
          break;
        case 'medical':
          updatedBalance.medicalLeaves = Math.max(0, updatedBalance.medicalLeaves - daysCount);
          break;
        case 'academic':
          updatedBalance.academicLeaves = Math.max(0, updatedBalance.academicLeaves - daysCount);
          break;
      }
      updateLeaveBalance(user.id, updatedBalance);
    }

    addNotification({
      userId: guide.id,
      type: 'leave_request',
      message: `New leave application from ${user.name} requires your approval`,
      read: false
    });

    toast({
      title: "Leave Application Submitted",
      description: requiresDeanApproval
        ? "Your academic leave application has been submitted. It will require HOD and Dean AP approval."
        : "Your leave application has been submitted and your guide has been notified."
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Apply for Leave</CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <LeaveTypeSelector
              value={formData.type}
              onChange={(type) => setFormData(prev => ({ ...prev, type }))}
            />

            <DateRangeSelector
              startDate={formData.startDate}
              endDate={formData.endDate}
              onStartDateChange={(startDate) => setFormData(prev => ({ ...prev, startDate }))}
              onEndDateChange={(endDate) => setFormData(prev => ({ ...prev, endDate }))}
            />

            <LeaveBalance
              balance={studentBalance}
              leaveType={formData.type}
              daysCount={daysCount}
            />

            <DeanApprovalWarning show={requiresDeanApproval} />

            <ReasonInput
              value={formData.reason}
              onChange={(reason) => setFormData(prev => ({ ...prev, reason }))}
            />

            {formData.type === 'medical' && (
              <FileUpload
                id="document"
                label="Medical Proof (Required)"
                file={formData.document}
                onFileChange={(file) => setFormData(prev => ({ ...prev, document: file }))}
                required
              />
            )}

            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                Submit Application
              </Button>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LeaveApplicationForm;
