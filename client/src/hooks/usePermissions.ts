
import { useAuth } from "@/context/AuthContext";

export function usePermissions() {
  const { user } = useAuth();

  const hasReadAccess = (page?: string) => {
    if (!user) return false;
    
    // مدراء النظام مع صلاحية تعديل ونطاق كامل لديهم صلاحية كاملة
    if (user.role === "مدير النظام" && user.permissions?.level === "edit" && user.permissions?.scope === "full") {
      return true;
    }

    // إذا كان النطاق محدود، تحقق من الصفحات المسموحة
    if (user.permissions?.scope === "limited" && page) {
      return user.permissions.pages.includes(page);
    }

    // إذا كان النطاق كامل
    if (user.permissions?.scope === "full") {
      return true;
    }

    // المستخدمون بدون صلاحيات محددة لا يمكنهم الوصول
    return false;
  };

  const hasEditAccess = (page?: string) => {
    if (!user) return false;
    
    // تحقق من إمكانية القراءة أولاً
    if (!hasReadAccess(page)) return false;
    
    // تحقق من مستوى الصلاحية
    return user.permissions?.level === "edit";
  };

  const canAccessPage = (page: string) => {
    return hasReadAccess(page);
  };

  const isReadOnly = (page?: string) => {
    return hasReadAccess(page) && !hasEditAccess(page);
  };

  return {
    hasReadAccess,
    hasEditAccess,
    canAccessPage,
    isReadOnly,
    userPermissions: user?.permissions
  };
}
