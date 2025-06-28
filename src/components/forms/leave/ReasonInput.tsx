
import React from 'react';
import { Label } from '../../ui/label';
import { Textarea } from '../../ui/textarea';

interface ReasonInputProps {
  value: string;
  onChange: (value: string) => void;
}

const ReasonInput: React.FC<ReasonInputProps> = ({ value, onChange }) => {
  return (
    <div>
      <Label htmlFor="reason">Reason for Leave</Label>
      <Textarea
        id="reason"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Please provide grounds for your leave..."
        required
      />
    </div>
  );
};

export default ReasonInput;
