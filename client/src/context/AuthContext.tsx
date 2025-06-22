import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DataService } from '@/lib/dataService';

interface User {
  id: string;
  username: string;
  password: string;
  role: string;
  permissions?: {
    level: 'read' | 'edit'; // مستوى الصلاحية
    scope: 'full' | 'limited'; // نطاق الوصول
    pages?: string[]; // الصفحات المسموح بالوصول إليها في حالة النطاق المحدود
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
  hasPageAccess: (pageName: string) => boolean;
  hasEditPermission: () => boolean;
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
      permissions: { level: 'edit', scope: 'full' }
    },
    {
      id: "2",
      username: "abdulsalam",
      password: "Alramz2025",
      role: "مدير ادارة راحة العملاء",
      permissions: { level: 'edit', scope: 'full' }
    },
    {
      id: "3",
      username: "aljawhara",
      password: "Alramz2025",
      role: "موظف ادارة راحة العملاء",
      permissions: { level: 'edit', scope: 'limited', pages: ['dashboard', 'complaints', 'reception'] }
    },
    {
      id: "4",
      username: "khulood",
      password: "Alramz2025",
      role: "موظف ادارة راحة العملاء",
      permissions: { level: 'edit', scope: 'limited', pages: ['dashboard', 'complaints', 'quality-calls'] }
    },
    {
      id: "5",
      username: "adnan",
      password: "Alramz2025",
      role: "موظف ادارة راحة العملاء",
      permissions: { level: 'read', scope: 'limited', pages: ['dashboard', 'analytics', 'reports'] }
    },
    {
      id: "6",
      username: "lateefa",
      password: "Alramz2025",
      role: "موظف ادارة راحة العملاء",
      permissions: { level: 'edit', scope: 'limited', pages: ['dashboard', 'delivery', 'delivery-analytics'] }
    },
    {
      id: "7",
      username: "nawaf",
      password: "Alramz2025",
      role: "مدير النظام",
      permissions: { level: 'edit', scope: 'full' }
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
    const loadUsersFromDB = async () => {
      try {
        const usersFromDB = await DataService.getUsersWithPermissions();
        setUsers(usersFromDB);
        console.log('تم تحميل المستخدمين من قاعدة البيانات:', usersFromDB);
      } catch (error) {
        console.error('خطأ في تحميل المستخدمين من قاعدة البيانات:', error);
        // fallback إلى localStorage في حالة الخطأ
        const initialUsers = initializeDefaultAdmin();
        setUsers(initialUsers);
        console.log('تم تحميل المستخدمين من localStorage:', initialUsers);
      }
    };

    loadUsersFromDB();

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
      
      // تجربة قاعدة البيانات أولاً
      const user = await DataService.authenticateUser(username, password);
      
      if (user) {
        setUser(user);
        localStorage.setItem('current_user', JSON.stringify(user));
        console.log('تم تسجيل الدخول بنجاح للمستخدم:', user.username, 'بدور:', user.role);
        return true;
      }
      
      // fallback إلى localStorage في حالة فشل قاعدة البيانات
      const localUsers = JSON.parse(localStorage.getItem('auth_users') || '[]');
      const localUser = localUsers.find((u: User) => 
        u.username === username && u.password === password
      );
      
      if (localUser) {
        setUser(localUser);
        localStorage.setItem('current_user', JSON.stringify(localUser));
        console.log('تم تسجيل الدخول بنجاح من localStorage للمستخدم:', localUser.username, 'بدور:', localUser.role);
        return true;
      }
      
      console.log('فشل تسجيل الدخول للمستخدم:', username);
      return false;
    } catch (error) {
      console.error('خطأ في تسجيل الدخول:', error);
      // fallback إلى localStorage في حالة الخطأ
      try {
        const localUsers = JSON.parse(localStorage.getItem('auth_users') || '[]');
        const localUser = localUsers.find((u: User) => 
          u.username === username && u.password === password
        );
        
        if (localUser) {
          setUser(localUser);
          localStorage.setItem('current_user', JSON.stringify(localUser));
          console.log('تم تسجيل الدخول بنجاح من localStorage (fallback) للمستخدم:', localUser.username);
          return true;
        }
      } catch (localError) {
        console.error('خطأ في fallback:', localError);
      }
      return false;
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('current_user');
    console.log('تم تسجيل الخروج وحذف بيانات المستخدم من localStorage');
  };

  const addUser = async (userData: Omit<User, "id">) => {
    try {
      const newUser = {
        id: Date.now().toString(),
        ...userData
      };
      
      // إضافة إلى قاعدة البيانات
      await DataService.addUser(newUser);
      
      // تحديث القائمة المحلية
      const updatedUsers = await DataService.getUsersWithPermissions();
      setUsers(updatedUsers);
      
      // fallback إلى localStorage
      const currentUsers = JSON.parse(localStorage.getItem('auth_users') || '[]');
      currentUsers.push(newUser);
      localStorage.setItem('auth_users', JSON.stringify(currentUsers));
    } catch (error) {
      console.error('خطأ في إضافة المستخدم:', error);
      // fallback إلى localStorage فقط
      try {
        const newUser = {
          id: Date.now().toString(),
          ...userData
        };
        const currentUsers = JSON.parse(localStorage.getItem('auth_users') || '[]');
        currentUsers.push(newUser);
        localStorage.setItem('auth_users', JSON.stringify(currentUsers));
        setUsers(currentUsers);
      } catch (localError) {
        console.error('خطأ في fallback localStorage:', localError);
        throw error;
      }
    }
  };

  const deleteUser = async (id: string) => {
    try {
      // حذف من قاعدة البيانات
      await DataService.deleteUser(id);
      
      // تحديث القائمة المحلية
      const updatedUsers = await DataService.getUsersWithPermissions();
      setUsers(updatedUsers);
      
      // تحديث localStorage
      const currentUsers = JSON.parse(localStorage.getItem('auth_users') || '[]');
      const localUpdatedUsers = currentUsers.filter((u: User) => u.id !== id);
      localStorage.setItem('auth_users', JSON.stringify(localUpdatedUsers));
    } catch (error) {
      console.error('خطأ في حذف المستخدم:', error);
      // fallback إلى localStorage فقط
      try {
        const currentUsers = JSON.parse(localStorage.getItem('auth_users') || '[]');
        const updatedUsers = currentUsers.filter((u: User) => u.id !== id);
        localStorage.setItem('auth_users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
      } catch (localError) {
        console.error('خطأ في fallback localStorage:', localError);
        throw error;
      }
    }
  };

  const resetUserPassword = async (id: string, newPassword: string) => {
    try {
      // تحديث في قاعدة البيانات
      await DataService.updateUser(id, { password: newPassword });
      
      // تحديث القائمة المحلية
      const updatedUsers = await DataService.getUsersWithPermissions();
      setUsers(updatedUsers);
      
      // تحديث localStorage
      const currentUsers = JSON.parse(localStorage.getItem('auth_users') || '[]');
      const localUpdatedUsers = currentUsers.map((u: User) => 
        u.id === id ? { ...u, password: newPassword } : u
      );
      localStorage.setItem('auth_users', JSON.stringify(localUpdatedUsers));
    } catch (error) {
      console.error('خطأ في تحديث كلمة المرور:', error);
      // fallback إلى localStorage فقط
      try {
        const currentUsers = JSON.parse(localStorage.getItem('auth_users') || '[]');
        const updatedUsers = currentUsers.map((u: User) => 
          u.id === id ? { ...u, password: newPassword } : u
        );
        localStorage.setItem('auth_users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
      } catch (localError) {
        console.error('خطأ في fallback localStorage:', localError);
        throw error;
      }
    }
  };

  const updateUserPermissions = async (id: string, permissions: User['permissions']) => {
    try {
      if (!permissions) return;
      
      // تحديث في قاعدة البيانات
      await DataService.updateUserPermissions(id, permissions);
      
      // تحديث القائمة المحلية
      const updatedUsers = await DataService.getUsersWithPermissions();
      setUsers(updatedUsers);
      
      // إذا كان المستخدم الحالي هو من يتم تحديث صلاحياته، قم بتحديث بياناته
      if (user && user.id === id) {
        const updatedUser = { ...user, permissions };
        setUser(updatedUser);
        localStorage.setItem('current_user', JSON.stringify(updatedUser));
      }
      
      // تحديث localStorage
      const currentUsers = JSON.parse(localStorage.getItem('auth_users') || '[]');
      const localUpdatedUsers = currentUsers.map((u: User) => 
        u.id === id ? { ...u, permissions } : u
      );
      localStorage.setItem('auth_users', JSON.stringify(localUpdatedUsers));
    } catch (error) {
      console.error('خطأ في تحديث صلاحيات المستخدم:', error);
      // fallback إلى localStorage فقط
      try {
        const currentUsers = JSON.parse(localStorage.getItem('auth_users') || '[]');
        const updatedUsers = currentUsers.map((u: User) => 
          u.id === id ? { ...u, permissions } : u
        );
        localStorage.setItem('auth_users', JSON.stringify(updatedUsers));
        setUsers(updatedUsers);
        
        if (user && user.id === id) {
          const updatedUser = { ...user, permissions };
          setUser(updatedUser);
          localStorage.setItem('current_user', JSON.stringify(updatedUser));
        }
      } catch (localError) {
        console.error('خطأ في fallback localStorage:', localError);
        throw error;
      }
    }
  };

  const hasPageAccess = (pageName: string): boolean => {
    if (!user || !user.permissions) return true; // السماح بالوصول إذا لم تكن هناك صلاحيات محددة
    
    if (user.permissions.scope === 'full') return true;
    
    if (user.permissions.scope === 'limited' && user.permissions.pages) {
      return user.permissions.pages.includes(pageName);
    }
    
    return false;
  };

  const hasEditPermission = (): boolean => {
    if (!user || !user.permissions) return true; // السماح بالتعديل إذا لم تكن هناك صلاحيات محددة
    return user.permissions.level === 'edit';
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
      updateUserPermissions,
      hasPageAccess,
      hasEditPermission
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