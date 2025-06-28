
import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeanApprovalWarningProps {
  show: boolean;
}

const DeanApprovalWarning: React.FC<DeanApprovalWarningProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="flex items-center mt-2 p-2 bg-yellow-100 rounded">
      <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
      <p className="text-sm text-yellow-800">
        Academic leave exceeding 15 days requires HOD and Dean AP approval. Dean AP document will be generated after HOD approval.
      </p>
    </div>
  );
};

export default DeanApprovalWarning;
