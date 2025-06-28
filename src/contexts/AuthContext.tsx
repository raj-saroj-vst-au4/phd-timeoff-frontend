
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  removeUser: (id: string) => void;
  isBackendAvailable: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users with passwords - fallback data
const demoUsers: User[] = [];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(demoUsers);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('phdUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // Check backend availability and load users
    checkBackendAndLoadUsers();
  }, []);

  const checkBackendAndLoadUsers = async () => {
    console.log('Checking backend availability...');
    const response = await apiService.getUsers();

    if (response.success && response.data) {
      console.log('Backend available, loading users from API');
      setIsBackendAvailable(true);
      setUsers(response.data);
    } else {
      console.log('Backend unavailable, using sample data');
      setIsBackendAvailable(false);
      setUsers(demoUsers);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    if (isBackendAvailable) {
      const response = await apiService.login(email, password);
      if (response.success && response.data) {
        setUser(response.data);
        localStorage.setItem('phdUser', JSON.stringify(response.data));
        return true;
      }
    }

    // Fallback to local authentication
    const foundUser = users.find(u => u.email === email && u.password === password);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('phdUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

  const addUser = async (userData: Omit<User, 'id'>) => {
    if (isBackendAvailable) {
      const response = await apiService.createUser(userData);
      if (response.success) {
        // Reload users from backend
        checkBackendAndLoadUsers();
        return;
      }
    }

    // Fallback to local data
    const newUser: User = {
      ...userData,
      id: Date.now().toString()
    };
    setUsers(prev => [...prev, newUser]);
  };

  const updateUser = async (id: string, updates: Partial<User>) => {
    if (isBackendAvailable) {
      const response = await apiService.updateUser({ id, ...updates });
      if (response.success) {
        // Reload users from backend
        checkBackendAndLoadUsers();
        return;
      }
    }

    // Fallback to local data
    setUsers(prev => prev.map(u =>
      u.id === id ? { ...u, ...updates } : u
    ));
  };

  const removeUser = async (id: string) => {
    if (isBackendAvailable) {
      const response = await apiService.deleteUser(id);
      if (response.success) {
        // Reload users from backend
        checkBackendAndLoadUsers();
        return;
      }
    }

    // Fallback to local data
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('phdUser');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      users,
      addUser,
      updateUser,
      removeUser,
      isBackendAvailable
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
