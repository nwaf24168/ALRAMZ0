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
  addUser: (userData: User) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  resetUserPassword: (id: string, newPassword: string) => Promise<void>;
  updateUserPermissions: (id: string, permissions: User['permissions']) => Promise<void>;
  loadUsersFromDB: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);

  // تحميل المستخدمين من قاعدة البيانات
  const loadUsersFromDB = async () => {
    try {
      console.log('تحميل المستخدمين من قاعدة البيانات...');
      const usersFromDB = await DataService.getUsers();
      console.log('المستخدمون المحملون من قاعدة البيانات:', usersFromDB);
      setUsers(usersFromDB);
    } catch (error) {
      console.error('خطأ في تحميل المستخدمين من قاعدة البيانات:', error);
      // في حالة الخطأ، إنشاء مستخدم admin افتراضي
      await createDefaultAdmin();
    }
  };

  // إنشاء مستخدم admin افتراضي إذا لم يوجد
  const createDefaultAdmin = async () => {
    try {
      const defaultAdmin = {
        username: "admin",
        password: "admin123",
        role: "مدير النظام",
        permissions: {
          level: "edit" as const,
          scope: "full" as const,
          pages: []
        }
      };

      console.log('إنشاء مستخدم admin افتراضي...');
      const savedAdmin = await DataService.saveUser(defaultAdmin);
      console.log('تم إنشاء مستخدم admin افتراضي:', savedAdmin);

      // إعادة تحميل المستخدمين
      await loadUsersFromDB();
    } catch (error) {
      console.error('خطأ في إنشاء مستخدم admin افتراضي:', error);
    }
  };

  useEffect(() => {
    // تحميل المستخدمين عند بدء التطبيق
    loadUsersFromDB();

    // استرداد المستخدم المحفوظ في الجلسة
    const savedUser = sessionStorage.getItem('current_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        console.log('تم استرداد المستخدم من الجلسة:', parsedUser.username);
      } catch (error) {
        console.error('خطأ في استرداد بيانات المستخدم:', error);
        sessionStorage.removeItem('current_user');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('محاولة تسجيل الدخول للمستخدم:', username);

      // التحقق من قاعدة البيانات مباشرة
      const usersFromDB = await DataService.getUsers();
      const user = usersFromDB.find((u: User) => 
        u.username === username && u.password === password
      );

      if (user) {
        setUser(user);
        sessionStorage.setItem('current_user', JSON.stringify(user));
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
    sessionStorage.removeItem('current_user');
    console.log('تم تسجيل الخروج');
  };

  const addUser = async (userData: User) => {
    try {
      console.log('إضافة مستخدم جديد إلى قاعدة البيانات:', userData);

      // حفظ في قاعدة البيانات
      const savedUser = await DataService.saveUser(userData);
      console.log('تم حفظ المستخدم في قاعدة البيانات:', savedUser);

      // تحديث القائمة المحلية
      const userToAdd = {
        id: savedUser.id.toString(),
        username: savedUser.username,
        password: savedUser.password,
        role: savedUser.role,
        permissions: savedUser.permissions ? JSON.parse(savedUser.permissions) : userData.permissions
      };

      setUsers(prevUsers => {
        // التحقق من عدم وجود المستخدم مسبقاً
        const existingIndex = prevUsers.findIndex(u => u.id === userToAdd.id);
        if (existingIndex !== -1) {
          // تحديث المستخدم الموجود
          const updatedUsers = [...prevUsers];
          updatedUsers[existingIndex] = userToAdd;
          return updatedUsers;
        } else {
          // إضافة مستخدم جديد
          return [...prevUsers, userToAdd];
        }
      });

    } catch (error) {
      console.error('خطأ في إضافة المستخدم:', error);
      throw error;
    }
  };

  const deleteUser = async (id: string) => {
    try {
      console.log('حذف المستخدم من قاعدة البيانات:', id);

      // حذف من قاعدة البيانات
      await DataService.deleteUser(id);
      console.log('تم حذف المستخدم من قاعدة البيانات');

      // تحديث القائمة المحلية
      setUsers(prevUsers => prevUsers.filter(u => u.id !== id));

    } catch (error) {
      console.error('خطأ في حذف المستخدم:', error);
      throw error;
    }
  };

  const resetUserPassword = async (id: string, newPassword: string) => {
    try {
      console.log('تحديث كلمة مرور المستخدم:', id);

      // العثور على المستخدم
      const userToUpdate = users.find(u => u.id === id);
      if (!userToUpdate) {
        throw new Error('المستخدم غير موجود');
      }

      // تحديث في قاعدة البيانات
      const updatedUserData = {
        ...userToUpdate,
        password: newPassword
      };

      await DataService.saveUser(updatedUserData);
      console.log('تم تحديث كلمة المرور في قاعدة البيانات');

      // تحديث القائمة المحلية
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === id ? { ...u, password: newPassword } : u
        )
      );

    } catch (error) {
      console.error('خطأ في تحديث كلمة المرور:', error);
      throw error;
    }
  };

  const updateUserPermissions = async (id: string, permissions: User['permissions']) => {
    try {
      console.log('تحديث صلاحيات المستخدم:', id, permissions);

      // العثور على المستخدم
      const userToUpdate = users.find(u => u.id === id);
      if (!userToUpdate) {
        throw new Error('المستخدم غير موجود');
      }

      // تحديث في قاعدة البيانات
      const updatedUserData = {
        ...userToUpdate,
        permissions
      };

      await DataService.saveUser(updatedUserData);
      console.log('تم تحديث الصلاحيات في قاعدة البيانات');

      // تحديث القائمة المحلية
      setUsers(prevUsers => 
        prevUsers.map(u => 
          u.id === id ? { ...u, permissions } : u
        )
      );

    } catch (error) {
      console.error('خطأ في تحديث الصلاحيات:', error);
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
      loadUsersFromDB
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