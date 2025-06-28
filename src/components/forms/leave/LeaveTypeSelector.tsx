
import React from 'react';
import { Label } from '../../ui/label';

interface LeaveTypeSelectorProps {
  value: 'personal' | 'medical' | 'academic';
  onChange: (value: 'personal' | 'medical' | 'academic') => void;
}

const LeaveTypeSelector: React.FC<LeaveTypeSelectorProps> = ({ value, onChange }) => {
  return (
    <div>
      <Label htmlFor="type">Leave Type</Label>
      <select
        id="type"
        value={value}
        onChange={(e) => onChange(e.target.value as 'personal' | 'medical' | 'academic')}
        className="w-full border rounded px-3 py-2"
        required
      >
        <option value="personal">Personal Leave (15 max per 6 months)</option>
        <option value="medical">Medical Leave (5 max per 6 months)</option>
        <option value="academic">Academic Leave (25 max per 6 months)</option>
      </select>
    </div>
  );
};

export default LeaveTypeSelector;
