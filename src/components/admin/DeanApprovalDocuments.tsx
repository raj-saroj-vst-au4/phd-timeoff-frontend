
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { FileText, Download, Upload, CheckCircle } from 'lucide-react';
import { toast } from '../ui/use-toast';
import FileUpload from '../forms/leave/FileUpload';

const DeanApprovalDocuments: React.FC = () => {
  const { users : {users} } = useAuth();
  const { leaves, updateLeave } = useData();
  const [uploadingFor, setUploadingFor] = React.useState<string | null>(null);
  const [deanDocument, setDeanDocument] = React.useState<File | null>(null);

  // Find leaves that need Dean AP document generation
  const pendingDeanApproval = leaves.filter(leave =>
    leave.status === 'dean_approval_pending' && leave.requiresDeanApproval
  );

  const generateDeanDocument = (leave: any) => {
    const student = users.find(u => u.id === leave.studentId);

    // Create a simple text document for demonstration
    const documentContent = `
DEAN AP APPROVAL DOCUMENT

Student Name: ${student?.name}
Roll Number: ${student?.rollNumber}
Leave Type: ${leave.type.toUpperCase()}
Duration: ${leave.startDate} to ${leave.endDate} (${leave.daysCount} days)
Reason: ${leave.reason}

This academic leave application has been reviewed and approved by:
- Guide: ${new Date(leave.guideApprovalDate || '').toLocaleDateString()}
- HOD: ${new Date(leave.hodApprovalDate || '').toLocaleDateString()}

DEAN AP SIGNATURE REQUIRED

Date: ${new Date().toLocaleDateString()}
    `;

    const blob = new Blob([documentContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dean-approval-${student?.rollNumber}-${leave.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Dean AP Document Generated",
      description: "Document downloaded. Please get it signed and upload back.",
    });
  };

  const uploadSignedDocument = (leaveId: string) => {
    if (!deanDocument) {
      toast({
        title: "No Document Selected",
        description: "Please select the signed Dean AP document to upload.",
        variant: "destructive"
      });
      return;
    }

    updateLeave(leaveId, {
      status: 'dean_approved',
      deanApprovalDate: new Date().toISOString(),
      deanApprovalDocument: deanDocument.name
    });

    toast({
      title: "Dean AP Document Uploaded",
      description: "Leave has been fully approved with Dean AP signature.",
    });

    setUploadingFor(null);
    setDeanDocument(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Dean AP Approval Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingDeanApproval.length === 0 ? (
          <p className="text-center text-gray-500 py-8">No leaves pending Dean AP approval.</p>
        ) : (
          <div className="space-y-4">
            {pendingDeanApproval.map((leave) => {
              const student = users.find(u => u.id === leave.studentId);
              const isUploading = uploadingFor === leave.id;

              return (
                <div key={leave.id} className="border rounded-lg p-4 bg-orange-50">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium">{student?.name}</h3>
                      <p className="text-sm text-gray-600">{student?.rollNumber}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline" className="capitalize">
                          {leave.type}
                        </Badge>
                        <Badge variant="outline" className="bg-orange-100 text-orange-800">
                          {leave.daysCount} days
                        </Badge>
                        <Badge variant="outline" className="bg-blue-100 text-blue-800">
                          HOD Approved
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {leave.startDate} - {leave.endDate}
                      </p>
                      <p className="text-xs text-gray-500">
                        HOD approved: {new Date(leave.hodApprovalDate || '').toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-700 mb-4">{leave.reason}</p>

                  <div className="flex flex-col space-y-3">
                    {!isUploading ? (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateDeanDocument(leave)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Generate Dean AP Document
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setUploadingFor(leave.id)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Signed Document
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 p-3 border border-blue-200 rounded bg-blue-50">
                        <FileUpload
                          id={`dean-doc-${leave.id}`}
                          label="Signed Dean AP Document"
                          file={deanDocument}
                          onFileChange={setDeanDocument}
                          required
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          helpText="Upload the document signed by Dean AP"
                        />
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            onClick={() => uploadSignedDocument(leave.id)}
                            disabled={!deanDocument}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete Approval
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setUploadingFor(null);
                              setDeanDocument(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeanApprovalDocuments;
