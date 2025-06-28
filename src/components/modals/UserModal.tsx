
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { User } from '../../types';
import { useAuth } from '../../contexts/AuthContext';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: User;
  onSave: (userData: Omit<User, 'id'>) => void;
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, onSave }) => {
  const { users } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student' as User['role'],
    rollNumber: '',
    guideId: '',
    taId: '',
    password: '',
    isActive: true
  });

  useEffect(() => {
    if (user) {
      setFormData({
            name: user.name ?? '',
            email: user.email ?? '',
            role: user.role,
            rollNumber: user.rollNumber ?? '',
            guideId: user.guideId ? String(user.guideId) : '',
            taId: user.taId ? String(user.taId) : '',
            password: user.password ?? '',
            isActive: user.isActive
          });
    } else {
      setFormData({
        name: '',
        email: '',
        role: 'student',
        rollNumber: '',
        guideId: '',
        taId: '',
        password: '',
        isActive: true
      });
    }
  }, [user, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const faculty = users.filter(u => u.role === 'faculty');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'Add New User'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value as User['role'] })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="hod">HOD</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.role === 'student' && (
            <>
              <div>
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="guide">Guide</Label>
                <Select
                  value={formData.guideId || ""}
                  onValueChange={(value) => setFormData({ ...formData, guideId: value })}
                >
                  <SelectTrigger>
                    <SelectValue>
                      {faculty.find(f => String(f.id) === formData.guideId)?.name || "Select Guide"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {faculty.map((f) => (
                      <SelectItem key={String(f.id)} value={String(f.id)}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="ta">Teaching Assistant</Label>
                <Select value={formData.taId} onValueChange={(value) => setFormData({ ...formData, taId: value })}>
                  <SelectTrigger>
                    <SelectValue>
                      {faculty.find(f => String(f.id) === formData.taId)?.name || "Select TA"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {faculty.map((f) => (
                      <SelectItem key={String(f.id)} value={String(f.id)}>
                        {f.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {user ? 'Update' : 'Add'} User
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserModal;
