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
import { Edit2, Trash2, UserPlus } from "lucide-react";

export default function Settings() {
  const { addNotification } = useNotification();
  const { users, addUser, deleteUser, resetUserPassword } = useAuth();
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
                    <TableHead className="text-right">رمز الدخول</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>••••••••</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
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
      </div>
    </Layout>
  );
}
