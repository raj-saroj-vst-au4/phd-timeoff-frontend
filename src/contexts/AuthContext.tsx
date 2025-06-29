
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  removeUser: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users with passwords - fallback data
const sampleUsers: User[] = [];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [isBackendAvailable, setIsBackendAvailable] = useState(false);

  useEffect(() => {
    loadUsers();
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const loadUsers = async () => {
    console.log('Load users from backend...');
    const response = await apiService.getUsers();

    if (response.success && response.data && Array.isArray(response.data)) {
      console.log('Backend available, loading users from API');
      setUsers(response.data as User[]);
    } else {
      console.log('Backend unavailable, using sample data');
      setUsers(sampleUsers);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Attempting login for:', email);

    // Try backend first
    const response = await apiService.login(email, password);
    if (response.success && response.data) {
      console.log('Backend login successful');
      const userData = response.data as User;
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
      return true;
    }

    // Fallback to local authentication
    console.log('Backend login failed, trying local authentication');
    const foundUser = users.find(u => u.email === email && u.password === password && u.isActive);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      return true;
    }
    return false;
  };

    const logout = () => {
      setUser(null);
      localStorage.removeItem('currentUser');
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

    const updateUser = (id: string, updates: Partial<User>) => {
        setUsers(prev => prev.map(user =>
          user.id === id ? { ...user, ...updates } : user
    ));
  };

  const removeUser = (id: string) => {
      setUsers(prev => prev.filter(user => user.id !== id));
  };

  return (
    <AuthContext.Provider value={{
      user,
      users,
      login,
      logout,
      addUser,
      updateUser,
      removeUser,
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
