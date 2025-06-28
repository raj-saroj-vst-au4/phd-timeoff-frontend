
import React from 'react';
import { Button } from '../../ui/button';
import { Label } from '../../ui/label';
import { Upload } from 'lucide-react';

interface FileUploadProps {
  id: string;
  label: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  required?: boolean;
  accept?: string;
  helpText?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  id,
  label,
  file,
  onFileChange,
  required = false,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  helpText
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    onFileChange(selectedFile || null);
  };

  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="mt-1">
        <input
          id={id}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          required={required}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById(id)?.click()}
          className="w-full"
        >
          <Upload className="h-4 w-4 mr-2" />
          {file ? file.name : `Upload ${label}`}
        </Button>
      </div>
      {helpText && (
        <p className="text-xs text-gray-500 mt-1">{helpText}</p>
      )}
    </div>
  );
};

export default FileUpload;
