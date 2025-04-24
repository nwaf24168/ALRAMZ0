import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { xataClient } from '@/lib/xata';

interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  email?: string;
  full_name?: string;
  department?: string;
  is_active?: string;
  last_login?: Date;
}

// Add login function that uses Xata
const loginUser = async (username: string, password: string) => {
  try {
    const records = await xataClient.db['users'].select(['*']).filter({ username }).getFirst();
    if (records && records.password === password) {
      await xataClient.db['users'].update(records.id, {
        last_login: new Date()
      });
      return records;
    }
    return null;
  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    return null;
  }
};

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

// Initialize default admin users in Xata
const initializeDefaultAdmin = async () => {
  try {
    // تحقق من وجود المستخدمين في Xata
    const existingUsers = await xataClient.db.users.getMany();
    
    if (existingUsers.length === 0) {
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
  // رفع المستخدمين الافتراضيين إلى Xata
      const createdUsers = await Promise.all(
        defaultUsers.map(user => xataClient.db.users.create(user))
      );
      console.log('تم تهيئة المستخدمين الافتراضيين في Xata:', createdUsers);
      return createdUsers;
    }
    
    console.log('المستخدمون موجودون بالفعل في Xata:', existingUsers);
    return existingUsers;
  } catch (error) {
    console.error('خطأ في تهيئة المستخدمين:', error);
    return [];
  }
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
      const records = await xataClient.db.users.filter('username', username).getFirst();

      if (records && records.password === password) {
        await xataClient.db.users.update({
          id: records.id,
          last_login: new Date()
        });
        setUser(records);
        console.log('تم تسجيل الدخول بنجاح للمستخدم:', records.username, 'بدور:', records.role);
        return true;
      }

      console.log('فشل تسجيل الدخول للمستخدم:', username);
      return false;
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
  };

  const addUser = async (userData: Omit<User, "id">) => {
    try {
      const newUser = await xataClient.db.users.create(userData);
      setUsers(prevUsers => [...prevUsers, newUser]);
      toast({
        title: "تم بنجاح",
        description: "تم إضافة المستخدم بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error('Error adding user:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المستخدم",
        variant: "destructive",
      });
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