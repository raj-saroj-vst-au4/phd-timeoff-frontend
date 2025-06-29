
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'faculty' | 'hod' | 'student';
  rollNumber?: string; // Only for students
  guideId?: string; // Only for students
  taId?: string; // Only for students
  password: string;
  isActive: boolean;
}

export interface Leave {
  id: string;
  studentId: string;
  type: 'personal' | 'medical' | 'academic';
  startDate: string;
  endDate: string;
  reason: string;
  document?: File | string;
  deanApprovalDocument?: File | string; // Only set by admin after HOD approval
  status: 'pending' | 'guide_approved' | 'hod_approved' | 'dean_approval_pending' | 'dean_approved' | 'rejected';
  guideApprovalDate?: string;
  hodApprovalDate?: string;
  deanApprovalDate?: string;
  isPaid: boolean;
  paidDays?: number;
  daysCount: number;
  requiresDeanApproval?: boolean;
  createdAt: string;
}

export interface LeaveBalance {
  studentId: string;
  personalLeaves: number;
  medicalLeaves: number;
  academicLeaves: number;
  lastReset: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  type: 'national' | 'university' | 'department';
}

export interface AttendanceCheck {
  id: string;
  studentId: string;
  month: string;
  year: number;
  confirmed: boolean;
  guideApproved: boolean;
  taApproved: boolean;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'leave_request' | 'leave_approved' | 'leave_rejected' | 'attendance_check';
  message: string;
  read: boolean;
  createdAt: string;
}
