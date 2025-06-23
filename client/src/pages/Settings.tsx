import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";
import { usePermissions } from "@/hooks/usePermissions";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Edit2, Trash2, UserPlus } from "lucide-react";

export default function Settings() {
  const { addNotification } = useNotification();
  const { users, addUser, deleteUser, resetUserPassword, updateUserPermissions, reloadUsers } = useAuth();
  const { canAccessPage, hasEditAccess, isReadOnly } = usePermissions();
  const [realtimeChannel, setRealtimeChannel] =
    useState<RealtimeChannel | null>(null);

  // بيانات المستخدم الجديد
  const [newUser, setNewUser] = useState<{
    username: string;
    role: string;
    password: string;
    permissions: {
      level: 'read' | 'edit';
      scope: 'full' | 'limited';
      pages: string[];
    };
  }>({
    username: "",
    role: "",
    password: "",
    permissions: {
      level: "read",
      scope: "full",
      pages: []
    }
  });

  // state لتحديث صلاحيات المستخدم
  const [editingPermissions, setEditingPermissions] = useState<{
    userId: string | null;
    permissions: {
      level: 'read' | 'edit';
      scope: 'full' | 'limited';
      pages: string[];
    };
  }>({
    userId: null,
    permissions: {
      level: "read",
      scope: "full",
      pages: []
    }
  });

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

    try {
      // حفظ في Supabase أولاً والحصول على البيانات المحفوظة
      const savedUser = await DataService.saveUser(newUser);

      // إضافة المستخدم محلياً بالبيانات الفعلية من قاعدة البيانات
      const userWithCorrectId = {
        id: savedUser.id.toString(),
        username: savedUser.username,
        password: savedUser.password,
        role: savedUser.role,
        permissions: savedUser.permissions ? JSON.parse(savedUser.permissions) : {
          level: "read",
          scope: "full",
          pages: []
        }
      };

      addUser(userWithCorrectId);

      addNotification({
        title: "تمت الإضافة",
        message: `تم إضافة المستخدم ${newUser.username} بنجاح في قاعدة البيانات`,
        type: "success",
      });

      console.log("تمت إضافة مستخدم جديد:", savedUser);

      // إعادة تعيين نموذج المستخدم الجديد
      setNewUser({
        username: "",
        role: "",
        password: "",
        permissions: {
          level: "read",
          scope: "full",
          pages: []
        }
      });

      // إعادة تحميل المستخدمين من قاعدة البيانات
      await reloadUsers();
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

    if (!confirm(`هل أنت متأكد من حذف المستخدم ${userToDelete.username}؟`)) {
      return;
    }

    try {
      // حذف من Supabase أولاً
      await DataService.deleteUser(id);

      // حذف محلياً
      deleteUser(id);

      addNotification({
        title: "تم الحذف",
        message: `تم حذف المستخدم ${userToDelete.username} بنجاح من قاعدة البيانات`,
        type: "success",
      });

      // إعادة تحميل المستخدمين من قاعدة البيانات
      await reloadUsers();
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

    if (newPassword && newPassword.trim() !== "") {
      try {
        // تحديث في Supabase أولاً
        const updatedUser = {
          id: userToReset.id,
          username: userToReset.username,
          password: newPassword,
          role: userToReset.role,
          permissions: userToReset.permissions,
        };
        const savedUser = await DataService.saveUser(updatedUser);

        // تحديث محلياً
        resetUserPassword(id, newPassword);

        addNotification({
          title: "تم التحديث",
          message: `تم إعادة تعيين كلمة مرور المستخدم ${userToReset.username} بنجاح في قاعدة البيانات`,
          type: "success",
        });

        // إعادة تحميل المستخدمين من قاعدة البيانات
        await reloadUsers();
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

  // تحديث صلاحيات المستخدم
  const handleUpdatePermissions = async (id: string) => {
    const userToUpdate = users.find((user) => user.id === id);
    if (!userToUpdate) return;

    setEditingPermissions({
      userId: id,
      permissions: userToUpdate.permissions || {
        level: "read",
        scope: "full",
        pages: []
      }
    });
  };

  // حفظ الصلاحيات المحدثة
  const handleSavePermissions = async () => {
    if (!editingPermissions.userId) return;

    const userToUpdate = users.find((user) => user.id === editingPermissions.userId);
    if (!userToUpdate) return;

    try {
      // تحديث في Supabase أولاً
      const updatedUser = {
        id: userToUpdate.id,
        username: userToUpdate.username,
        password: userToUpdate.password,
        role: userToUpdate.role,
        permissions: editingPermissions.permissions,
      };
      const savedUser = await DataService.saveUser(updatedUser);

      // تحديث محلياً
      await updateUserPermissions(editingPermissions.userId, editingPermissions.permissions);

      addNotification({
        title: "تم التحديث",
        message: `تم تحديث صلاحيات المستخدم ${userToUpdate.username} بنجاح`,
        type: "success",
      });

      // إعادة تعيين state
      setEditingPermissions({
        userId: null,
        permissions: {
          level: "read",
          scope: "full",
          pages: []
        }
      });

      // إعادة تحميل المستخدمين من قاعدة البيانات
      await reloadUsers();
    } catch (error) {
      console.error("خطأ في تحديث الصلاحيات:", error);
      addNotification({
        title: "خطأ",
        message:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء تحديث الصلاحيات",
        type: "error",
      });
    }
  };

  // تحميل المستخدمين من Supabase عند تحميل المكون
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const usersFromDB = await DataService.getUsers();
        console.log("المستخدمون من قاعدة البيانات:", usersFromDB);

        // إنشاء خريطة للمستخدمين الموجودين حالياً
        const currentUsersMap = new Map();
        users.forEach(user => {
          currentUsersMap.set(user.id, user);
        });

        // إضافة المستخدمين الجدد من قاعدة البيانات فقط
        usersFromDB.forEach(dbUser => {
          if (!currentUsersMap.has(dbUser.id)) {
            console.log("إضافة مستخدم جديد من قاعدة البيانات:", dbUser);
            addUser(dbUser);
          }
        });

      } catch (error) {
        console.error("خطأ في تحميل المستخدمين:", error);
      }
    };

    // تحميل المستخدمين فقط عند تحميل المكون لأول مرة
    if (users.length === 0) {
      loadUsers();
    }
  }, []); // تشغيل مرة واحدة فقط عند تحميل المكون

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

  // فحص صلاحيات الوصول للصفحة
  if (!canAccessPage("settings")) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-600 mb-2">غير مصرح</h1>
            <p className="text-gray-500">ليس لديك صلاحية للوصول إلى هذه الصفحة</p>
          </div>
        </div>
      </Layout>
    );
  }

  const readOnly = isReadOnly("settings");

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6 p-3 md:p-0">
        <h1 className="text-xl md:text-2xl font-bold">
          إعدادات النظام {readOnly && <span className="text-sm text-gray-500">(قراءة فقط)</span>}
        </h1>

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
                    <TableHead className="text-right">الدور</TableHead>
                    <TableHead className="text-right">مستوى الصلاحية</TableHead>
                    <TableHead className="text-right">نطاق الصلاحية</TableHead>
                    <TableHead className="text-right">رمز الدخول</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from(new Map(users.map(user => [user.id, user])).values()).map((user, index) => (
                    <TableRow key={`${user.id}-${index}`}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.permissions?.level === 'edit' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.permissions?.level === 'edit' ? 'تعديل' : 'قراءة'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded text-xs ${
                          user.permissions?.scope === 'full' 
                            ? 'bg-purple-100 text-purple-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {user.permissions?.scope === 'full' ? 'كامل' : 'محدود'}
                        </span>
                      </TableCell>
                      <TableCell>••••••••</TableCell>
                      <TableCell>
                        {hasEditAccess("settings") ? (
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUpdatePermissions(user.id)}
                              title="تعديل الصلاحيات"
                            >
                              الصلاحيات
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
                        ) : (
                          <span className="text-gray-400 text-sm">قراءة فقط</span>
                        )}
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
                  <Label htmlFor="role">الدور</Label>
                  <Select
                    value={newUser.role}
                    onValueChange={(value) =>
                      handleNewUserChange("role", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الدور" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="مدير النظام">مدير النظام</SelectItem>
                      <SelectItem value="مدير ادارة راحة العملاء">
                        مدير ادارة راحة العملاء
                      </SelectItem>
                      <SelectItem value="موظف ادارة راحة العملاء">
                        موظف ادارة راحة العملاء
                      </SelectItem>
                      <SelectItem value="موظف قسم الصيانة">
                        موظف قسم الصيانة
                      </SelectItem>
                      <SelectItem value="موظف قسم التسليم">
                        موظف قسم التسليم
                      </SelectItem>
                      <SelectItem value="موظف المبيعات">
                        موظف المبيعات
                      </SelectItem>
                      <SelectItem value="موظف الاستقبال">
                        موظف الاستقبال
                      </SelectItem>
                      <SelectItem value="موظف ادارة المشاريع">
                        موظف ادارة المشاريع
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

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="permission-level">مستوى الصلاحية</Label>
                  <Select
                    value={newUser.permissions.level}
                    onValueChange={(value: 'read' | 'edit') =>
                      setNewUser(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, level: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مستوى الصلاحية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="read">قراءة فقط</SelectItem>
                      <SelectItem value="edit">قراءة وتعديل</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="permission-scope">نطاق الصلاحية</Label>
                  <Select
                    value={newUser.permissions.scope}
                    onValueChange={(value: 'full' | 'limited') =>
                      setNewUser(prev => ({
                        ...prev,
                        permissions: { ...prev.permissions, scope: value }
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نطاق الصلاحية" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">جميع الصفحات</SelectItem>
                      <SelectItem value="limited">صفحات محددة</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasEditAccess("settings") && (
                <Button onClick={handleAddUser} className="flex items-center">
                  <UserPlus className="ml-2 h-4 w-4" />
                  إضافة المستخدم
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog تحديث الصلاحيات */}
        <Dialog open={editingPermissions.userId !== null} onOpenChange={() => 
          setEditingPermissions({
            userId: null,
            permissions: { level: "read", scope: "full", pages: [] }
          })
        }>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>تحديث صلاحيات المستخدم</DialogTitle>
              <DialogDescription>
                يمكنك تحديد مستوى ونطاق الصلاحيات للمستخدم
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-permission-level">مستوى الصلاحية</Label>
                <Select
                  value={editingPermissions.permissions.level}
                  onValueChange={(value: 'read' | 'edit') =>
                    setEditingPermissions(prev => ({
                      ...prev,
                      permissions: { ...prev.permissions, level: value }
                    }))
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

              <div className="space-y-2">
                <Label htmlFor="edit-permission-scope">نطاق الصلاحية</Label>
                <Select
                  value={editingPermissions.permissions.scope}
                  onValueChange={(value: 'full' | 'limited') =>
                    setEditingPermissions(prev => ({
                      ...prev,
                      permissions: { ...prev.permissions, scope: value }
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">جميع الصفحات</SelectItem>
                    <SelectItem value="limited">صفحات محددة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {editingPermissions.permissions.scope === 'limited' && (
                <div className="space-y-2">
                  <Label>الصفحات المسموحة</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'dashboard', name: 'لوحة التحكم' },
                      { id: 'data-entry', name: 'إدخال البيانات' },
                      { id: 'complaints', name: 'الشكاوى' },
                      { id: 'delivery', name: 'قسم التسليم' },
                      { id: 'delivery-analytics', name: 'تحليل التسليم' },
                      { id: 'analytics', name: 'التحليلات' },
                      { id: 'quality-calls', name: 'مكالمات الجودة' },
                      { id: 'reception', name: 'الاستقبال' },
                      { id: 'settings', name: 'الإعدادات' },
                    ].map((page) => (
                      <div key={page.id} className="flex items-center space-x-2 space-x-reverse">
                        <input
                          type="checkbox"
                          id={`page-${page.id}`}
                          checked={editingPermissions.permissions.pages.includes(page.id)}
                          onChange={(e) => {
                            const pages = e.target.checked
                              ? [...editingPermissions.permissions.pages, page.id]
                              : editingPermissions.permissions.pages.filter(p => p !== page.id);
                            setEditingPermissions(prev => ({
                              ...prev,
                              permissions: { ...prev.permissions, pages }
                            }));
                          }}
                          className="rounded"
                        />
                        <Label htmlFor={`page-${page.id}`} className="text-sm">
                          {page.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setEditingPermissions({
                  userId: null,
                  permissions: { level: "read", scope: "full", pages: [] }
                })}
              >
                إلغاء
              </Button>
              <Button onClick={handleSavePermissions}>
                حفظ التغييرات
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}