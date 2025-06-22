import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import { useNotification } from "@/context/NotificationContext";
import { DataService } from "@/lib/dataService";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Edit2, Trash2, UserPlus, Shield, Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  const { addNotification } = useNotification();
  const { users, addUser, deleteUser, resetUserPassword, updateUserPermissions } = useAuth();
  const [realtimeChannel, setRealtimeChannel] =
    useState<RealtimeChannel | null>(null);

  // بيانات المستخدم الجديد
  const [newUser, setNewUser] = useState<{
    username: string;
    role: string;
    password: string;
  }>({
    username: "",
    role: "",
    password: "",
  });

  // حالة إدارة الصلاحيات
  const [editingPermissions, setEditingPermissions] = useState<string | null>(null);
  const [permissionsForm, setPermissionsForm] = useState<{
    level: 'read' | 'edit';
    scope: 'full' | 'limited';
    pages: string[];
  }>({
    level: 'edit',
    scope: 'full',
    pages: []
  });

  // قائمة الصفحات المتاحة
  const availablePages = [
    { id: 'dashboard', name: 'لوحة القيادة' },
    { id: 'complaints', name: 'الشكاوى' },
    { id: 'reception', name: 'الاستقبال' },
    { id: 'quality-calls', name: 'مكالمات الجودة' },
    { id: 'delivery', name: 'التسليم' },
    { id: 'delivery-analytics', name: 'تحليلات التسليم' },
    { id: 'analytics', name: 'التحليلات' },
    { id: 'reports', name: 'التقارير' },
    { id: 'maintenance', name: 'الصيانة' },
    { id: 'customer-service', name: 'خدمة العملاء' },
    { id: 'data-entry', name: 'إدخال البيانات' },
    { id: 'settings', name: 'الإعدادات' }
  ];

  // معالجة تغيير بيانات المستخدم الجديد
  const handleNewUserChange = (field: string, value: string) => {
    setNewUser((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // إضافة مستخدم جديد
  const handleAddUser = async () => {
    if (!newUser.username || !newUser.role || !newUser.password) {
      addNotification({
        title: "تنبيه",
        message: "يرجى تعبئة جميع الحقول المطلوبة",
        type: "warning",
      });
      return;
    }

    // التحقق من عدم وجود مستخدم باسم المستخدم نفسه
    if (users.some((user) => user.username === newUser.username)) {
      addNotification({
        title: "خطأ",
        message: "اسم المستخدم موجود بالفعل، يرجى اختيار اسم آخر",
        type: "error",
      });
      return;
    }

    try {
      // إضافة المستخدم محلياً
      addUser(newUser);

      // حفظ في Supabase
      const userWithId = {
        id: Date.now().toString(),
        ...newUser,
      };
      await DataService.saveUser(userWithId);

      addNotification({
        title: "تمت الإضافة",
        message: `تم إضافة المستخدم ${newUser.username} بنجاح في قاعدة البيانات`,
        type: "success",
      });

      console.log("تمت إضافة مستخدم جديد:", newUser.username);

      // إعادة تعيين نموذج المستخدم الجديد
      setNewUser({
        username: "",
        role: "",
        password: "",
      });
    } catch (error) {
      console.error("خطأ في إضافة المستخدم:", error);
      addNotification({
        title: "خطأ",
        message:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء إضافة المستخدم",
        type: "error",
      });
    }
  };

  // حذف مستخدم
  const handleDeleteUser = async (id: string) => {
    const userToDelete = users.find((user) => user.id === id);
    if (!userToDelete) return;

    try {
      // حذف محلياً
      deleteUser(id);

      // حذف من Supabase
      await DataService.deleteUser(id);

      addNotification({
        title: "تم الحذف",
        message: `تم حذف المستخدم ${userToDelete.username} بنجاح من قاعدة البيانات`,
        type: "success",
      });
    } catch (error) {
      console.error("خطأ في حذف المستخدم:", error);
      addNotification({
        title: "خطأ",
        message:
          error instanceof Error ? error.message : "حدث خطأ أثناء حذف المستخدم",
        type: "error",
      });
    }
  };

  // تعديل كلمة مرور المستخدم
  const handleResetPassword = async (id: string) => {
    const userToReset = users.find((user) => user.id === id);
    if (!userToReset) return;

    // إنشاء كلمة مرور جديدة للمستخدم
    const newPassword = prompt("أدخل كلمة المرور الجديدة:", "");

    if (newPassword) {
      try {
        // تحديث محلياً
        resetUserPassword(id, newPassword);

        // تحديث في Supabase
        const updatedUser = {
          ...userToReset,
          password: newPassword,
        };
        await DataService.saveUser(updatedUser);

        addNotification({
          title: "تم التحديث",
          message: `تم إعادة تعيين كلمة مرور المستخدم ${userToReset.username} بنجاح في قاعدة البيانات`,
          type: "success",
        });
      } catch (error) {
        console.error("خطأ في تحديث كلمة المرور:", error);
        addNotification({
          title: "خطأ",
          message:
            error instanceof Error
              ? error.message
              : "حدث خطأ أثناء تحديث كلمة المرور",
          type: "error",
        });
      }
    }
  };

  // فتح نموذج تعديل الصلاحيات
  const handleEditPermissions = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user && user.permissions) {
      setPermissionsForm({
        level: user.permissions.level,
        scope: user.permissions.scope,
        pages: user.permissions.pages || []
      });
    } else {
      setPermissionsForm({
        level: 'edit',
        scope: 'full',
        pages: []
      });
    }
    setEditingPermissions(userId);
  };

  // حفظ الصلاحيات
  const handleSavePermissions = async () => {
    if (!editingPermissions) return;

    try {
      await updateUserPermissions(editingPermissions, permissionsForm);
      
      addNotification({
        title: "تم التحديث",
        message: "تم تحديث صلاحيات المستخدم بنجاح",
        type: "success",
      });

      setEditingPermissions(null);
    } catch (error) {
      console.error("خطأ في تحديث الصلاحيات:", error);
      addNotification({
        title: "خطأ",
        message: "حدث خطأ أثناء تحديث الصلاحيات",
        type: "error",
      });
    }
  };

  // تغيير الصفحات المحددة
  const handlePageToggle = (pageId: string) => {
    setPermissionsForm(prev => ({
      ...prev,
      pages: prev.pages.includes(pageId)
        ? prev.pages.filter(p => p !== pageId)
        : [...prev.pages, pageId]
    }));
  };

  // تحميل المستخدمين من Supabase عند تحميل المكون
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersFromDB = await DataService.getUsers();
        // يمكن دمج المستخدمين من قاعدة البيانات مع المستخدمين المحليين
        console.log("المستخدمون من قاعدة البيانات:", usersFromDB);
      } catch (error) {
        console.error("خطأ في تحميل المستخدمين:", error);
      }
    };

    loadUsers();
  }, []);

  // إعداد الاشتراك للوقت الفعلي للمستخدمين
  useEffect(() => {
    const channel = DataService.setupRealtimeSubscription(
      "users",
      async (payload) => {
        console.log("تحديث المستخدمين:", payload);
        try {
          const usersFromDB = await DataService.getUsers();
          console.log("المستخدمون المحدثون:", usersFromDB);
        } catch (error) {
          console.error("خطأ في تحديث المستخدمين:", error);
        }
      },
    );

    setRealtimeChannel(channel);

    return () => {
      if (channel) {
        DataService.removeRealtimeSubscription(channel);
      }
    };
  }, []);

  // طباعة حالة المستخدمين في كل مرة يتغير فيها المستخدمون
  useEffect(() => {
    console.log("قائمة المستخدمين الحالية في الإعدادات:", users);
  }, [users]);

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6 p-3 md:p-0">
        <h1 className="text-xl md:text-2xl font-bold">إعدادات النظام</h1>

        <Card>
          <CardHeader>
            <CardTitle>إدارة المستخدمين</CardTitle>
            <CardDescription>إضافة وتعديل وحذف مستخدمي النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <h3 className="text-lg font-semibold mb-4">المستخدمون الحاليون</h3>

            <div className="rounded-md border mb-8">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">اسم المستخدم</TableHead>
                    <TableHead className="text-right">الصلاحية</TableHead>
                    <TableHead className="text-right">مستوى الوصول</TableHead>
                    <TableHead className="text-right">نطاق الوصول</TableHead>
                    <TableHead className="text-right">رمز الدخول</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.permissions?.level === 'edit' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {user.permissions?.level === 'edit' ? 'تعديل' : 'قراءة فقط'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.permissions?.scope === 'full' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {user.permissions?.scope === 'full' ? 'كامل المنصة' : 'صفحات محددة'}
                        </span>
                      </TableCell>
                      <TableCell>••••••••</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditPermissions(user.id)}
                            title="تعديل الصلاحيات"
                          >
                            <Shield className="h-4 w-4 text-purple-500" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleResetPassword(user.id)}
                            title="تعديل كلمة المرور"
                          >
                            <Edit2 className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                            title="حذف المستخدم"
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">إضافة مستخدم جديد</h3>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="username">اسم المستخدم</Label>
                  <Input
                    id="username"
                    placeholder="أدخل اسم المستخدم"
                    value={newUser.username}
                    onChange={(e) =>
                      handleNewUserChange("username", e.target.value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">الصلاحية</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) =>
                      handleNewUserChange("role", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الصلاحية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مدير النظام">مدير النظام</SelectItem>
                      <SelectItem value="مدير ادارة راحة العملاء">
                        مدير ادارة راحة العملاء
                      </SelectItem>
                      <SelectItem value="موظف ادارة راحة العملاء">
                        موظف ادارة راحة العملاء
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">رمز الدخول</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="أدخل رمز الدخول"
                    value={newUser.password}
                    onChange={(e) =>
                      handleNewUserChange("password", e.target.value)
                    }
                  />
                </div>
              </div>

              <Button onClick={handleAddUser} className="flex items-center">
                <UserPlus className="ml-2 h-4 w-4" />
                إضافة المستخدم
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* نموذج تعديل الصلاحيات */}
        {editingPermissions && (
          <Card>
            <CardHeader>
              <CardTitle>تعديل صلاحيات المستخدم</CardTitle>
              <CardDescription>
                تحديد مستوى الوصول ونطاق الصلاحيات للمستخدم
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* مستوى الصلاحية */}
                <div className="space-y-2">
                  <Label>مستوى الصلاحية</Label>
                  <Select
                    value={permissionsForm.level}
                    onValueChange={(value: 'read' | 'edit') =>
                      setPermissionsForm(prev => ({ ...prev, level: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">قراءة فقط</SelectItem>
                      <SelectItem value="edit">قراءة وتعديل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* نطاق الوصول */}
                <div className="space-y-2">
                  <Label>نطاق الوصول</Label>
                  <Select
                    value={permissionsForm.scope}
                    onValueChange={(value: 'full' | 'limited') =>
                      setPermissionsForm(prev => ({ ...prev, scope: value, pages: value === 'full' ? [] : prev.pages }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">الوصول لكامل المنصة</SelectItem>
                      <SelectItem value="limited">الوصول لصفحات محددة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* اختيار الصفحات (في حالة النطاق المحدود) */}
                {permissionsForm.scope === 'limited' && (
                  <div className="space-y-2">
                    <Label>الصفحات المسموح بالوصول إليها</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availablePages.map((page) => (
                        <div key={page.id} className="flex items-center space-x-2 space-x-reverse">
                          <input
                            type="checkbox"
                            id={page.id}
                            checked={permissionsForm.pages.includes(page.id)}
                            onChange={() => handlePageToggle(page.id)}
                            className="rounded"
                          />
                          <Label htmlFor={page.id} className="text-sm">
                            {page.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* أزرار الحفظ والإلغاء */}
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingPermissions(null)}
                  >
                    إلغاء
                  </Button>
                  <Button onClick={handleSavePermissions}>
                    حفظ الصلاحيات
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
