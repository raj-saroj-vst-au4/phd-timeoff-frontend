import React, { useState } from 'react';
import Layout from '../Layout';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Users, Calendar, FileText, Settings, Download, Plus, Edit, Trash2 } from 'lucide-react';
import UserModal from '../modals/UserModal';
import HolidayModal from '../modals/HolidayModal';
import { useToast } from '../../hooks/use-toast';
import DeanApprovalDocuments from '../admin/DeanApprovalDocuments';

const AdminDashboard: React.FC = () => {
  const { leaves, holidays, addHoliday, updateHoliday, removeHoliday } = useData();
  const { users, addUser, updateUser, removeUser } = useAuth();
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [holidayModalOpen, setHolidayModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editingHoliday, setEditingHoliday] = useState(null);

  const students = users.filter(user => user.role === 'student');
  const faculty = users.filter(user => user.role === 'faculty');
  const pendingLeaves = leaves.filter(leave => leave.status === 'pending');
  const approvedLeaves = leaves.filter(leave => leave.status === 'hod_approved');

  const handleAddUser = () => {
    setEditingUser(null);
    setUserModalOpen(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    requestAnimationFrame(() => setUserModalOpen(true));
    setUserModalOpen(true);
  };

  const handleDeleteUser = (userId) => {
    if (confirm('Are you sure you want to delete this user?')) {
      removeUser(userId);
      toast({
        title: "User Deleted",
        description: "User has been successfully deleted."
      });
    }
  };

  const handleSaveUser = (userData) => {
    if (editingUser) {
      updateUser(editingUser.id, userData);
      toast({
        title: "User Updated",
        description: "User has been successfully updated."
      });
    } else {
      addUser(userData);
      toast({
        title: "User Added",
        description: "User has been successfully added."
      });
    }
  };

  const handleAddHoliday = () => {
    setEditingHoliday(null);
    setHolidayModalOpen(true);
  };

  const handleEditHoliday = (holiday) => {
    setEditingHoliday(holiday);
    setHolidayModalOpen(true);
  };

  const handleDeleteHoliday = (holidayId) => {
    if (confirm('Are you sure you want to delete this holiday?')) {
      removeHoliday(holidayId);
      toast({
        title: "Holiday Deleted",
        description: "Holiday has been successfully deleted."
      });
    }
  };

  const handleSaveHoliday = (holidayData) => {
    if (editingHoliday) {
      updateHoliday(editingHoliday.id, holidayData);
      toast({
        title: "Holiday Updated",
        description: "Holiday has been successfully updated."
      });
    } else {
      addHoliday(holidayData);
      toast({
        title: "Holiday Added",
        description: "Holiday has been successfully added."
      });
    }
  };

  const generateMonthlyReport = () => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'];

    const reportData = {
      month: monthNames[selectedMonth],
      year: selectedYear,
      totalLeaves: leaves.length,
      approvedLeaves: approvedLeaves.length,
      pendingLeaves: pendingLeaves.length,
      students: students.length,
      leaves: leaves.map(leave => ({
        studentName: students.find(s => s.id === leave.studentId)?.name || 'Unknown',
        type: leave.type,
        days: leave.daysCount,
        status: leave.status,
        dates: `${leave.startDate} to ${leave.endDate}`
      }))
    };

    const jsonString = JSON.stringify(reportData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `monthly-report-${selectedMonth + 1}-${selectedYear}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{students.length}</div>
              <p className="text-sm text-gray-600">Active Students</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Faculty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{faculty.length}</div>
              <p className="text-sm text-gray-600">Faculty Members</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2" />
                Pending Leaves
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingLeaves.length}</div>
              <p className="text-sm text-gray-600">Awaiting Approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Holidays
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{holidays.length}</div>
              <p className="text-sm text-gray-600">This Year</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="leaves" className="space-y-4">
          <TabsList>
            <TabsTrigger value="leaves">Leave Management</TabsTrigger>
            <TabsTrigger value="dean-approvals">Dean AP Documents</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="holidays">Holiday Management</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="leaves">
            <Card>
              <CardHeader>
                <CardTitle>All Leave Applications</CardTitle>
              </CardHeader>
              <CardContent>
                {leaves.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No leave applications found.</p>
                ) : (
                  <div className="space-y-4">
                    {leaves.map((leave) => {
                      const student = students.find(s => s.id === leave.studentId);
                      return (
                        <div key={leave.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{student?.name}</h3>
                              <p className="text-sm text-gray-600">{student?.rollNumber}</p>
                              <div className="flex items-center space-x-2 mt-2">
                                <Badge variant="outline" className="capitalize">
                                  {leave.type}
                                </Badge>
                                <Badge variant={leave.status === 'hod_approved' ? 'default' : 'secondary'}>
                                  {leave.status.replace('_', ' ')}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">{leave.daysCount} days</p>
                              <p className="text-xs text-gray-500">
                                {leave.startDate} - {leave.endDate}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mt-2">{leave.reason}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dean-approvals">
            <DeanApprovalDocuments />
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>User Management</CardTitle>
                <Button onClick={handleAddUser}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add User
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Roll Number</TableHead>
                      <TableHead>Guide</TableHead>
                      <TableHead>TA</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      const guide = users.find(u => u.id === user.guideId);
                      const ta = users.find(u => u.id === user.taId);
                      return (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>{user.rollNumber || '-'}</TableCell>
                          <TableCell>{guide?.name || '-'}</TableCell>
                          <TableCell>{ta?.name || '-'}</TableCell>
                          {(user.role === 'student' || user.role === 'faculty') ? (
                            <TableCell>
                              <div className="flex space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          ) : <TableCell>-</TableCell>}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="holidays">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Holiday Management</CardTitle>
                <Button onClick={handleAddHoliday}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Holiday
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {holidays.map((holiday) => (
                      <TableRow key={holiday.id}>
                        <TableCell className="font-medium">{holiday.name}</TableCell>
                        <TableCell>{holiday.date}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {holiday.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditHoliday(holiday)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteHoliday(holiday.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Generate Monthly Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Month</label>
                      <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="border rounded px-3 py-2"
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <option key={i} value={i}>
                            {new Date(2024, i).toLocaleString('default', { month: 'long' })}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Year</label>
                      <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="border rounded px-3 py-2"
                      >
                        {Array.from({ length: 5 }, (_, i) => (
                          <option key={i} value={2024 + i}>
                            {2024 + i}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <Button onClick={generateMonthlyReport}>
                    <Download className="h-4 w-4 mr-2" />
                    Download Monthly Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modals */}
        <UserModal
          isOpen={userModalOpen}
          onClose={() => setUserModalOpen(false)}
          user={editingUser}
          onSave={handleSaveUser}
        />

        <HolidayModal
          isOpen={holidayModalOpen}
          onClose={() => setHolidayModalOpen(false)}
          holiday={editingHoliday}
          onSave={handleSaveHoliday}
        />
      </div>
    </Layout>
  );
};

export default AdminDashboard;
