import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  permissions: {
    level: 'read' | 'edit';
    scope: 'full' | 'limited';
    pages: string[];
  };
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
  updateUserPermissions: (id: string, permissions: User['permissions']) => Promise<void>;
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
      role: "مدير النظام",
      permissions: {
        level: "edit" as const,
        scope: "full" as const,
        pages: []
      }
    },
    {
      id: "2",
      username: "abdulsalam",
      password: "Alramz2025",
      role: "مدير ادارة راحة العملاء",
      permissions: {
        level: "edit" as const,
        scope: "full" as const,
        pages: []
      }
    },
    {
      id: "3",
      username: "aljawhara",
      password: "Alramz2025",
      role: "موظف ادارة راحة العملاء",
      permissions: {
        level: "edit" as const,
        scope: "full" as const,
        pages: []
      }
    },
    {
      id: "4",
      username: "khulood",
      password: "Alramz2025",
      role: "موظف ادارة راحة العملاء",
      permissions: {
        level: "edit" as const,
        scope: "full" as const,
        pages: []
      }
    },
    {
      id: "5",
      username: "adnan",
      password: "Alramz2025",
      role: "موظف ادارة راحة العملاء",
      permissions: {
        level: "edit" as const,
        scope: "full" as const,
        pages: []
      }
    },
    {
      id: "6",
      username: "lateefa",
      password: "Alramz2025",
      role: "موظف ادارة راحة العملاء",
      permissions: {
        level: "edit" as const,
        scope: "full" as const,
        pages: []
      }
    },
    {
      id: "7",
      username: "nawaf",
      password: "Alramz2025",
      role: "موظف ادارة راحة العملاء",
      permissions: {
        level: "read" as const,
        scope: "limited" as const,
        pages: ["delivery"]
      }
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

    // استرداد المستخدم المحفوظ عند تحديث الصفحة
    const savedUser = localStorage.getItem('current_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log('تم استرداد المستخدم من localStorage:', parsedUser.username);
      } catch (error) {
        console.error('خطأ في استرداد بيانات المستخدم:', error);
        localStorage.removeItem('current_user');
      }
    }
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
        localStorage.setItem('current_user', JSON.stringify(user));
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
    localStorage.removeItem('current_user');
    console.log('تم تسجيل الخروج وحذف بيانات المستخدم من localStorage');
  };

  // دالة لإزالة المستخدمين المكررين
  const removeDuplicateUsers = (userList: User[]): User[] => {
    const uniqueUsers = new Map<string, User>();
    userList.forEach(user => {
      // استخدام id كمفتاح فريد، أو username كبديل إذا لم يكن id متوفراً
      const key = user.id || user.username;
      uniqueUsers.set(key, user);
    });
    return Array.from(uniqueUsers.values());
  };

  const addUser = async (userData: Omit<User, "id">) => {
    try {
      const newUser = {
        id: Date.now().toString(),
        ...userData
      };

      const currentUsers = JSON.parse(localStorage.getItem('auth_users') || '[]');
      // التحقق من عدم وجود المستخدم مسبقاً
      const existingUserIndex = currentUsers.findIndex(u => u.id === newUser.id || u.username === newUser.username);
      if (existingUserIndex !== -1) {
        // إذا كان المستخدم موجود، نقوم بتحديثه بدلاً من إضافته
        currentUsers[existingUserIndex] = newUser;
        localStorage.setItem('auth_users', JSON.stringify(currentUsers));
        setUsers([...currentUsers]);
        return;
      }
      // إضافة المستخدم الجديد
      currentUsers.push(newUser);
      localStorage.setItem('auth_users', JSON.stringify(currentUsers));
      setUsers((prevUsers) => {
        const updatedUsers = [...prevUsers, newUser];
        return removeDuplicateUsers(updatedUsers);
      });
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

  const updateUserPermissions = async (id: string, permissions: User['permissions']) => {
    try {
      const currentUsers = JSON.parse(localStorage.getItem('auth_users') || '[]');
      const updatedUsers = currentUsers.map((u: User) => 
        u.id === id ? { ...u, permissions } : u
      );
      localStorage.setItem('auth_users', JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
    } catch (error) {
      console.error('Error updating permissions:', error);
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
      resetUserPassword,
      updateUserPermissions
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