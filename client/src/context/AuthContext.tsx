import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  password: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  users: User[];
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  addUser: (userData: Omit<User, "id">) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetUserPassword: (id: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initialize default admin user if no users exist
const initializeDefaultAdmin = () => {
  const savedUsers = localStorage.getItem('auth_users');
  const defaultUsers = [
    {
      id: "1",
      username: "admin",
      password: "admin123",
      role: "مدير النظام"
    },
    {
      id: "2",
      username: "abdulsalam",
      password: "Alramz2025",
      role: "مدير ادارة راحة العملاء"
    },
    {
      id: "3",
      username: "aljawhara",
      password: "Alramz2025",
      role: "موظف ادارة راحة العملاء"
    },
    {
      id: "4",
      username: "khulood",
      password: "Alramz2025",
      role: "موظف ادارة راحة العملاء"
    },
    {
      id: "5",
      username: "adnan",
      password: "Alramz2025",
      role: "موظف ادارة راحة العملاء"
    },
    {
      id: "6",
      username: "lateefa",
      password: "Alramz2025",
      role: "موظف ادارة راحة العملاء"
    },
    {
      id: "7",
      username: "nawaf",
      password: "Alramz2025",
      role: "مدير النظام"
    }
  ];

  // تحقق من وجود المستخدمين وتحديثهم إذا لزم الأمر
  if (!savedUsers || JSON.parse(savedUsers).length === 0) {
    localStorage.setItem('auth_users', JSON.stringify(defaultUsers));
    console.log('تم تهيئة المستخدمين الافتراضيين:', defaultUsers);
    return defaultUsers;
  }

  // تحقق من وجود جميع المستخدمين المطلوبين
  const currentUsers = JSON.parse(savedUsers);
  const missingUsers = defaultUsers.filter(defaultUser => 
    !currentUsers.some(currentUser => currentUser.username === defaultUser.username)
  );

  if (missingUsers.length > 0) {
    const updatedUsers = [...currentUsers, ...missingUsers];
    localStorage.setItem('auth_users', JSON.stringify(updatedUsers));
    console.log('تم إضافة المستخدمين المفقودين:', missingUsers);
    return updatedUsers;
  }

  return currentUsers;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const initialUsers = initializeDefaultAdmin();
    setUsers(initialUsers);
    console.log('تم تحميل المستخدمين:', initialUsers);
  }, []);

  const loadUsers = () => {
    const savedUsers = localStorage.getItem('auth_users');
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      setUsers(parsedUsers);
      console.log('تم إعادة تحميل المستخدمين:', parsedUsers);
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('محاولة تسجيل الدخول للمستخدم:', username);
      const localUsers = JSON.parse(localStorage.getItem('auth_users') || '[]');
      const user = localUsers.find((u: User) => 
        u.username === username && u.password === password
      );
      
      if (user) {
        setUser(user);
        console.log('تم تسجيل الدخول بنجاح للمستخدم:', user.username, 'بدور:', user.role);
        return true;
      }
      
      console.log('فشل تسجيل الدخول للمستخدم:', username);
      return false;
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      throw new Error('Authentication failed');
    }
  };

  const logout = async () => {
    setUser(null);
  };

  const addUser = async (userData: Omit<User, "id">) => {
    try {
      const newUser = {
        id: Date.now().toString(),
        ...userData
      };
      
      const currentUsers = JSON.parse(localStorage.getItem('auth_users') || '[]');
      currentUsers.push(newUser);
      localStorage.setItem('auth_users', JSON.stringify(currentUsers));
      setUsers(currentUsers);
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      const currentUsers = JSON.parse(localStorage.getItem('auth_users') || '[]');
      const updatedUsers = currentUsers.filter((u: User) => u.id !== id);
      localStorage.setItem('auth_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  };

  const resetUserPassword = async (id: string, newPassword: string) => {
    try {
      const currentUsers = JSON.parse(localStorage.getItem('auth_users') || '[]');
      const updatedUsers = currentUsers.map((u: User) => 
        u.id === id ? { ...u, password: newPassword } : u
      );
      localStorage.setItem('auth_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      users,
      isAuthenticated: !!user,
      login,
      logout,
      addUser,
      deleteUser,
      resetUserPassword
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}