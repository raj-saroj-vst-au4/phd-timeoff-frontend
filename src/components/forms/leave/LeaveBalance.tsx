
import React from 'react';
import { LeaveBalance as LeaveBalanceType } from '../../../types';

interface LeaveBalanceProps {
  balance: LeaveBalanceType | undefined;
  leaveType: 'personal' | 'medical' | 'academic';
  daysCount: number;
}

const LeaveBalance: React.FC<LeaveBalanceProps> = ({ balance, leaveType, daysCount }) => {
  if (daysCount <= 0 || !balance) return null;

  const getAvailableBalance = () => {
    switch (leaveType) {
      case 'personal':
        return balance.personalLeaves;
      case 'medical':
        return balance.medicalLeaves;
      case 'academic':
        return balance.academicLeaves;
      default:
        return 0;
    }
  };

  return (
    <div className="p-3 bg-blue-50 rounded-lg">
      <p className="text-sm font-medium">Total Days: {daysCount}</p>
      <p className="text-sm text-gray-600">
        Available Balance: {getAvailableBalance()}
      </p>
    </div>
  );
};

export default LeaveBalance;
