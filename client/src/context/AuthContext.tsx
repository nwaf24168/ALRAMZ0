import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DataService } from '@/lib/dataService';

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
  reloadUsers: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // تحميل المستخدمين من قاعدة البيانات
  const loadUsers = async () => {
    try {
      console.log('تحميل المستخدمين من قاعدة البيانات...');
      const usersFromDB = await DataService.getUsers();
      setUsers(usersFromDB);
      console.log('تم تحميل المستخدمين من قاعدة البيانات:', usersFromDB);
    } catch (error) {
      console.error('خطأ في تحميل المستخدمين:', error);
    }
  };

  const reloadUsers = async () => {
    await loadUsers();
  };

  useEffect(() => {
    // تحميل المستخدمين عند تحميل المكون
    loadUsers();

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

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('محاولة تسجيل الدخول للمستخدم:', username);
      const authenticatedUser = await DataService.authenticateUser(username, password);

      if (authenticatedUser) {
        setUser(authenticatedUser);
        localStorage.setItem('current_user', JSON.stringify(authenticatedUser));
        console.log('تم تسجيل الدخول بنجاح للمستخدم:', authenticatedUser.username, 'بدور:', authenticatedUser.role);
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

  const addUser = async (userData: Omit<User, "id">) => {
    try {
      console.log('إضافة مستخدم جديد:', userData.username);
      const newUser = await DataService.createUser(userData);

      // إعادة تحميل قائمة المستخدمين من قاعدة البيانات
      await loadUsers();

      console.log('تم إضافة المستخدم بنجاح:', newUser);
    } catch (error) {
      console.error('خطأ في إضافة المستخدم:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      console.log('حذف المستخدم بالمعرف:', id);
      await DataService.deleteUser(id);

      // إعادة تحميل قائمة المستخدمين من قاعدة البيانات
      await loadUsers();

      console.log('تم حذف المستخدم بنجاح');
    } catch (error) {
      console.error('خطأ في حذف المستخدم:', error);
      throw error;
    }
  };

  const resetUserPassword = async (id: string, newPassword: string) => {
    try {
      console.log('إعادة تعيين كلمة مرور المستخدم بالمعرف:', id);
      await DataService.resetUserPassword(id, newPassword);

      // إعادة تحميل قائمة المستخدمين من قاعدة البيانات
      await loadUsers();

      console.log('تم إعادة تعيين كلمة المرور بنجاح');
    } catch (error) {
      console.error('خطأ في إعادة تعيين كلمة المرور:', error);
      throw error;
    }
  };

  const updateUserPermissions = async (id: string, permissions: User['permissions']) => {
    try {
      console.log('تحديث صلاحيات المستخدم بالمعرف:', id, 'الصلاحيات الجديدة:', permissions);
      await DataService.updateUserPermissions(id, permissions);

      // إعادة تحميل قائمة المستخدمين من قاعدة البيانات
      await loadUsers();

      // إذا كان المستخدم الحالي هو نفس المستخدم المحدث، نحديث بياناته في localStorage
      if (user && user.id === id) {
        const updatedUser = { ...user, permissions };
        setUser(updatedUser);
        localStorage.setItem('current_user', JSON.stringify(updatedUser));
      }

      console.log('تم تحديث صلاحيات المستخدم بنجاح');
    } catch (error) {
      console.error('خطأ في تحديث صلاحيات المستخدم:', error);
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
      updateUserPermissions,
      reloadUsers
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