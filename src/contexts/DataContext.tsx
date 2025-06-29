
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Leave, LeaveBalance, Holiday, AttendanceCheck, Notification } from '../types';
import { apiService } from '../services/api';

interface DataContextType {
  leaves: Leave[];
  leaveBalances: LeaveBalance[];
  holidays: Holiday[];
  attendanceChecks: AttendanceCheck[];
  notifications: Notification[];
  addLeave: (leave: Omit<Leave, 'id' | 'createdAt'>) => void;
  updateLeave: (id: string, updates: Partial<Leave>) => void;
  deleteLeave: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  updateLeaveBalance: (studentId: string, updates: Partial<LeaveBalance>) => void;
  addHoliday: (holiday: Omit<Holiday, 'id'>) => void;
  updateHoliday: (id: string, updates: Partial<Holiday>) => void;
  removeHoliday: (id: string) => void;
  isBackendAvailable: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Sample data for fallback
const sampleLeaves: Leave[] = [];
const sampleLeaveBalances: LeaveBalance[] = [
  {
    studentId: '5',
    personalLeaves: 15,
    medicalLeaves: 5,
    academicLeaves: 25,
    lastReset: new Date().toISOString()
  },
  {
    studentId: '6',
    personalLeaves: 12,
    medicalLeaves: 3,
    academicLeaves: 20,
    lastReset: new Date().toISOString()
  }
];
const sampleHolidays: Holiday[] = [
  {
    id: '1',
    date: '2024-01-26',
    name: 'Republic Day',
    type: 'national'
  },
  {
    id: '2',
    date: '2024-03-08',
    name: 'Holi',
    type: 'national'
  }
];

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [leaves, setLeaves] = useState<Leave[]>(sampleLeaves);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>(sampleLeaveBalances);
  const [holidays, setHolidays] = useState<Holiday[]>(sampleHolidays);
  const [attendanceChecks, setAttendanceChecks] = useState<AttendanceCheck[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkBackendAndLoadData().finally(() => setIsLoading(false));
  }, []);

  const checkBackendAndLoadData = async () => {
    console.log('Loading data from backend...');

    // Check leaves
    const leavesResponse = await apiService.getLeaves();
    if (leavesResponse.success && leavesResponse.data && Array.isArray(leavesResponse.data)) {
      console.log('Backend available, loading leaves from API');
      setIsBackendAvailable(true);
      setLeaves(leavesResponse.data as Leave[]);
    } else {
      console.log('Backend unavailable for leaves, using sample data');
      setIsBackendAvailable(false);
      setLeaves(sampleLeaves);
    }

    // Load holidays
    const holidaysResponse = await apiService.getHolidays();
    if (holidaysResponse.success && holidaysResponse.data && Array.isArray(holidaysResponse.data)) {
      setHolidays(holidaysResponse.data as Holiday[]);
    } else {
      setHolidays(sampleHolidays);
    }
  };

  const addLeave = async (leave: Omit<Leave, 'id' | 'createdAt'>) => {
    if (isBackendAvailable) {
      const response = await apiService.createLeave(leave);
      if (response.success) {
        // Reload leaves from backend
        const leavesResponse = await apiService.getLeaves();
        if (leavesResponse.success && leavesResponse.data && Array.isArray(leavesResponse.data)) {
          setLeaves(leavesResponse.data as Leave[]);
        }
        return;
      }
    }

    // Fallback to local data
    const newLeave: Leave = {
      ...leave,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setLeaves(prev => [...prev, newLeave]);
  };

  const updateLeave = async (id: string, updates: Partial<Leave>) => {
    if (isBackendAvailable) {
      const response = await apiService.updateLeave({ id, ...updates });
      if (response.success) {
        // Reload leaves from backend
        const leavesResponse = await apiService.getLeaves();
        if (leavesResponse.success && leavesResponse.data && Array.isArray(leavesResponse.data)) {
          setLeaves(leavesResponse.data as Leave[]);
        }
        return;
      }
    }

    // Fallback to local data
    setLeaves(prev => prev.map(leave =>
      leave.id === id ? { ...leave, ...updates } : leave
    ));
  };

  const deleteLeave = (id: string) => {
    setLeaves(prev => prev.filter(leave => leave.id !== id));
  };

  const addNotification = (notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [...prev, newNotification]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const updateLeaveBalance = (studentId: string, updates: Partial<LeaveBalance>) => {
    setLeaveBalances(prev => prev.map(balance =>
      balance.studentId === studentId ? { ...balance, ...updates } : balance
    ));
  };

  const addHoliday = async (holiday: Omit<Holiday, 'id'>) => {
    if (isBackendAvailable) {
      const response = await apiService.createHoliday(holiday);
      if (response.success) {
        // Reload holidays from backend
        const holidaysResponse = await apiService.getHolidays();
        if (holidaysResponse.success && holidaysResponse.data && Array.isArray(holidaysResponse.data)) {
          setHolidays(holidaysResponse.data as Holiday[]);
        }
        return;
      }
    }

    // Fallback to local data
    const newHoliday: Holiday = {
      ...holiday,
      id: Date.now().toString()
    };
    setHolidays(prev => [...prev, newHoliday]);
  };

  const updateHoliday = async (id: string, updates: Partial<Holiday>) => {
    if (isBackendAvailable) {
      const response = await apiService.updateHoliday({ id, ...updates });
      if (response.success) {
        // Reload holidays from backend
        const holidaysResponse = await apiService.getHolidays();
        if (holidaysResponse.success && holidaysResponse.data && Array.isArray(holidaysResponse.data)) {
          setHolidays(holidaysResponse.data as Holiday[]);
        }
        return;
      }
    }

    // Fallback to local data
    setHolidays(prev => prev.map(holiday =>
      holiday.id === id ? { ...holiday, ...updates } : holiday
    ));
  };

  const removeHoliday = async (id: string) => {
    if (isBackendAvailable) {
      const response = await apiService.deleteHoliday(id);
      if (response.success) {
        // Reload holidays from backend
        const holidaysResponse = await apiService.getHolidays();
        if (holidaysResponse.success && holidaysResponse.data && Array.isArray(holidaysResponse.data)) {
          setHolidays(holidaysResponse.data as Holiday[]);
        }
        return;
      }
    }

    // Fallback to local data
    setHolidays(prev => prev.filter(holiday => holiday.id !== id));
  };

  return (
    <DataContext.Provider value={{
      leaves,
      leaveBalances,
      holidays,
      attendanceChecks,
      notifications,
      addLeave,
      updateLeave,
      deleteLeave,
      addNotification,
      markNotificationRead,
      updateLeaveBalance,
      addHoliday,
      updateHoliday,
      removeHoliday,
      isBackendAvailable
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
