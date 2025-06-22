import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { usePermissions } from "@/hooks/usePermissions";
import { DataService } from "@/lib/dataService";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Filter,
  Plus,
  Trash2,
  Edit,
  Eye,
  AlertCircle,
  FileText,
  User,
  Home,
  MapPin,
  Phone,
  Clock,
  Calendar,
  CheckCircle2,
  History,
  X,
} from "lucide-react";

// حالات الشكاوى
const complaintStatuses = [
  { value: "all", label: "جميع الحالات" },
  { value: "تم حلها", label: "تم حلها" },
  { value: "لازالت قائمة", label: "لازالت قائمة" },
  { value: "لم يتم حلها", label: "لم يتم حلها" },
  { value: "جديدة", label: "جديدة" },
];

// مصادر الشكاوى
const complaintSources = [
  { value: "الاستبيان", label: "الاستبيان" },
  { value: "المقر", label: "المقر" },
  { value: "خدمة العملاء", label: "خدمة العملاء" },
  { value: "مكالمة هاتفية", label: "مكالمة هاتفية" },
  { value: "البريد الإلكتروني", label: "البريد الإلكتروني" },
  { value: "زيارة شخصية", label: "زيارة شخصية" },
  { value: "وسائل التواصل الاجتماعي", label: "وسائل التواصل الاجتماعي" },
  { value: "الموقع الإلكتروني", label: "الموقع الإلكتروني" },
  { value: "أخرى", label: "أخرى" },
];

// تعديل واجهة الشكوى لتشمل تتبع التغييرات
interface ComplaintUpdate {
  field: string;
  oldValue: string;
  newValue: string;
  updatedBy: string;
  updatedAt: string;
}

interface Complaint {
  id: string;
  date: string;
  customerName: string;
  project: string;
  unitNumber: string;
  source: string;
  status: string;
  description: string;
  action: string;
  duration: number;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
  updates: ComplaintUpdate[];
}

export default function Complaints() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { canAccessPage, hasEditAccess, isReadOnly } = usePermissions();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [realtimeChannel, setRealtimeChannel] = useState<RealtimeChannel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const [newComplaint, setNewComplaint] = useState<
    Omit<
      Complaint,
      | "id"
      | "createdBy"
      | "duration"
      | "createdAt"
      | "updatedBy"
      | "updatedAt"
      | "updates"
    >
  >({
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    project: "",
    unitNumber: "",
    source: "",
    status: "جديدة",
    description: "",
    action: "",
  });

  // تحميل البيانات من قاعدة البيانات عند تحميل المكون
  const loadComplaints = async () => {
    try {
      setLoading(true);
      const complaintsFromDB = await DataService.getComplaints();
      console.log("تم تحميل الشكاوى من قاعدة البيانات:", complaintsFromDB);
      setComplaints(complaintsFromDB);
    } catch (error) {
      console.error("خطأ في تحميل الشكاوى:", error);
      addNotification({
        title: "خطأ",
        message: "حدث خطأ أثناء تحميل الشكاوى من قاعدة البيانات",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  // إعداد الاشتراك للوقت الفعلي
  useEffect(() => {
    const channel = DataService.setupRealtimeSubscription(
      "complaints",
      async (payload) => {
        console.log("تحديث الشكاوى في الوقت الفعلي:", payload);
        // إعادة تحميل البيانات عند أي تغيير
        await loadComplaints();
      },
    );

    setRealtimeChannel(channel);

    return () => {
      if (channel) {
        DataService.removeRealtimeSubscription(channel);
      }
    };
  }, []);

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || complaint.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleNewComplaintChange = (field: string, value: string) => {
    setNewComplaint((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleViewComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsViewDialogOpen(true);
  };

  const handleEditSetup = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setNewComplaint({
      date: complaint.date,
      customerName: complaint.customerName,
      project: complaint.project,
      unitNumber: complaint.unitNumber,
      source: complaint.source,
      status: complaint.status,
      description: complaint.description,
      action: complaint.action,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteSetup = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsDeleteDialogOpen(true);
  };

  const generateComplaintId = () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    return `${timestamp}${random}`;
  };

  const handleAddComplaint = async () => {
    if (!user) {
      addNotification({
        title: "خطأ",
        message: "يجب تسجيل الدخول أولاً",
        type: "error",
      });
      return;
    }

    const newId = generateComplaintId();
    const now = new Date().toISOString();

    const complaint: Complaint = {
      ...newComplaint,
      id: newId,
      createdBy: user.username,
      duration: 0,
      createdAt: now,
      updatedBy: null,
      updatedAt: null,
      updates: [],
    };

    try {
      console.log("إضافة شكوى جديدة:", complaint);
      await DataService.saveComplaint(complaint);

      addNotification({
        title: "تمت الإضافة",
        message: `تم إضافة الشكوى رقم ${newId} بنجاح في قاعدة البيانات`,
        type: "success",
      });

      // إعادة تحميل البيانات
      await loadComplaints();
      setIsAddDialogOpen(false);

      // إعادة تعيين النموذج
      setNewComplaint({
        date: new Date().toISOString().split("T")[0],
        customerName: "",
        project: "",
        unitNumber: "",
        source: "",
        status: "جديدة",
        description: "",
        action: "",
      });
    } catch (error) {
      console.error("خطأ في إضافة الشكوى:", error);
      addNotification({
        title: "خطأ",
        message: error instanceof Error ? error.message : "حدث خطأ أثناء إضافة الشكوى",
        type: "error",
      });
    }
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint || !user) return;

    const now = new Date().toISOString();
    const newUpdates: ComplaintUpdate[] = [];

    // تتبع التغييرات في كل الحقول
    const fieldsToCheck = {
      customerName: "اسم العميل",
      project: "المشروع",
      unitNumber: "رقم الوحدة",
      source: "مصدر الشكوى",
      status: "الحالة",
      description: "تفاصيل الشكوى",
      action: "الإجراء المتخذ",
    };

    Object.entries(fieldsToCheck).forEach(([field, label]) => {
      const oldValue = (selectedComplaint as any)[field];
      const newValue = (newComplaint as any)[field];
      if (oldValue !== newValue) {
        newUpdates.push({
          field,
          oldValue: oldValue || "",
          newValue: newValue || "",
          updatedBy: user.username,
          updatedAt: now,
        });
      }
    });

    if (newUpdates.length === 0) {
      addNotification({
        title: "تنبيه",
        message: "لم يتم إجراء أي تغييرات",
        type: "info",
      });
      setIsEditDialogOpen(false);
      return;
    }

    try {
      const updatedComplaint = {
        ...selectedComplaint,
        ...newComplaint,
        updatedBy: user.username,
        updatedAt: now,
        updates: newUpdates, // إرسال التحديثات الجديدة فقط
      };

      console.log("تحديث الشكوى:", updatedComplaint);
      await DataService.saveComplaint(updatedComplaint);

      setIsEditDialogOpen(false);

      // إظهار إشعار لكل تحديث
      newUpdates.forEach((update) => {
        addNotification({
          title: "تم التحديث",
          message: `تم تحديث ${fieldsToCheck[update.field]} من "${update.oldValue}" إلى "${update.newValue}" بواسطة ${user.username}`,
          type: "success",
        });
      });

      addNotification({
        title: "تم التحديث",
        message: "تم حفظ التحديثات بنجاح في قاعدة البيانات",
        type: "success",
      });

      // إعادة تحميل البيانات
      await loadComplaints();
    } catch (error) {
      console.error("خطأ في تحديث الشكوى:", error);
      addNotification({
        title: "خطأ",
        message: error instanceof Error ? error.message : "حدث خطأ أثناء تحديث الشكوى",
        type: "error",
      });
    }
  };

  const handleDeleteComplaint = async () => {
    if (!selectedComplaint) return;

    try {
      console.log("حذف الشكوى:", selectedComplaint.id);
      await DataService.deleteComplaint(selectedComplaint.id);

      setIsDeleteDialogOpen(false);

      addNotification({
        title: "تم الحذف",
        message: `تم حذف الشكوى رقم ${selectedComplaint.id} بنجاح من قاعدة البيانات`,
        type: "success",
      });

      // إعادة تحميل البيانات
      await loadComplaints();
    } catch (error) {
      console.error("خطأ في حذف الشكوى:", error);
      addNotification({
        title: "خطأ",
        message: error instanceof Error ? error.message : "حدث خطأ أثناء حذف الشكوى",
        type: "error",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ar-SA", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  // دالة مساعدة للحصول على اسم الحقل بالعربية
  const getFieldName = (field: string): string => {
    const fieldNames: { [key: string]: string } = {
      status: "الحالة",
      action: "الإجراء المتخذ",
      description: "تفاصيل الشكوى",
      customerName: "اسم العميل",
      project: "المشروع",
      unitNumber: "رقم الوحدة",
      source: "مصدر الشكوى",
    };
    return fieldNames[field] || field;
  };

  // فحص صلاحيات الوصول للصفحة
  if (!canAccessPage("complaints")) {
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

  const readOnly = isReadOnly("complaints");

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <p>جاري تحميل الشكاوى...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6 p-3 md:p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-bold">
            سجل الشكاوى {readOnly && <span className="text-sm text-gray-500">(قراءة فقط)</span>}
          </h1>
          {hasEditAccess("complaints") && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة شكوى جديدة
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>إضافة شكوى جديدة</DialogTitle>
                <DialogDescription>
                  أدخل بيانات الشكوى لإضافتها إلى السجل وتعيين رقم تذكرة جديد
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="date">التاريخ</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newComplaint.date}
                    onChange={(e) =>
                      handleNewComplaintChange("date", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">اسم العميل</Label>
                  <Input
                    id="customerName"
                    value={newComplaint.customerName}
                    onChange={(e) =>
                      handleNewComplaintChange("customerName", e.target.value)
                    }
                    placeholder="أدخل اسم العميل"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">المشروع</Label>
                  <Input
                    id="project"
                    value={newComplaint.project}
                    onChange={(e) =>
                      handleNewComplaintChange("project", e.target.value)
                    }
                    placeholder="أدخل اسم المشروع"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unitNumber">رقم الوحدة / العمارة</Label>
                  <Input
                    id="unitNumber"
                    value={newComplaint.unitNumber}
                    onChange={(e) =>
                      handleNewComplaintChange("unitNumber", e.target.value)
                    }
                    placeholder="أدخل رقم الوحدة"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="source">مصدر الشكوى</Label>
                  <Select
                    value={newComplaint.source}
                    onValueChange={(value) =>
                      handleNewComplaintChange("source", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر مصدر الشكوى" />
                    </SelectTrigger>
                    <SelectContent>
                      {complaintSources.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          {source.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">الحالة</Label>
                  <Select
                    value={newComplaint.status}
                    onValueChange={(value) =>
                      handleNewComplaintChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حالة الشكوى" />
                    </SelectTrigger>
                    <SelectContent>
                      {complaintStatuses.slice(1).map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-sm font-medium text-gray-300 flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 text-yellow-400" />
                    تفاصيل الشكوى
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="description"
                      value={newComplaint.description}
                      onChange={(e) =>
                        handleNewComplaintChange("description", e.target.value)
                      }
                      placeholder="أدخل تفاصيل الشكوى هنا..."
                      className="min-h-[150px] bg-[#1a1c23] border border-gray-800/50 rounded-xl p-4 text-white placeholder:text-gray-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 resize-y"
                      required
                    />
                    <div className="absolute bottom-3 left-3 text-xs text-gray-500">
                      يرجى كتابة تفاصيل الشكوى بشكل واضح ودقيق
                    </div>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="action">الإجراء المتخذ</Label>
                  <Textarea
                    id="action"
                    value={newComplaint.action}
                    onChange={(e) =>
                      handleNewComplaintChange("action", e.target.value)
                    }
                    placeholder="أدخل الإجراء المتخذ (إن وجد)"
                    className="min-h-[80px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsAddDialogOpen(false)}
                >
                  إلغاء
                </Button>
                <Button type="button" onClick={handleAddComplaint}>
                  إضافة الشكوى
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>سجل الشكاوى والطلبات ({complaints.length} شكوى)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Filter className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث عن عميل، مشروع، أو شكوى..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedStatus}
                  onValueChange={setSelectedStatus}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="جميع الحالات" />
                  </SelectTrigger>
                  <SelectContent>
                    {complaintStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم التذكرة</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">اسم العميل</TableHead>
                    <TableHead className="text-right">المشروع</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        {complaints.length === 0 
                          ? "لا توجد شكاوى في قاعدة البيانات"
                          : "لا توجد شكاوى متطابقة مع معايير البحث"
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComplaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell className="font-medium">
                          {complaint.id}
                        </TableCell>
                        <TableCell>{complaint.date}</TableCell>
                        <TableCell>{complaint.customerName}</TableCell>
                        <TableCell>{complaint.project}</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              complaint.status === "تم حلها" ||
                              complaint.status === "تم الحل"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : complaint.status === "لازالت قائمة"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                  : complaint.status === "لم يتم حلها"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                            }`}
                          >
                            {complaint.status}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewComplaint(complaint)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            {hasEditAccess("complaints") ? (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleEditSetup(complaint)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteSetup(complaint)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </>
                            ) : (
                              <span className="text-gray-400 text-sm">قراءة فقط</span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* باقي مربعات الحوار تبقى كما هي */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#1a1c23] to-[#1f2128] border border-gray-800/50 shadow-2xl">
          {selectedComplaint && (
            <>
              <DialogHeader className="border-b border-gray-800/50 pb-4 mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <DialogTitle className="text-xl font-bold text-white flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-gray-800/50">
                        <FileText className="w-5 h-5 text-blue-400" />
                      </div>
                      <span>تفاصيل الشكوى #{selectedComplaint.id}</span>
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      تاريخ التسجيل: {formatDate(selectedComplaint.createdAt)}
                    </DialogDescription>
                  </div>
                  <div
                    className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                      selectedComplaint.status === "تم حلها" ||
                      selectedComplaint.status === "مغلقة"
                        ? "bg-green-500/10 text-green-400 border border-green-500/20"
                        : selectedComplaint.status === "قيد المعالجة"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : selectedComplaint.status === "معلقة"
                            ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                    }`}
                  >
                    {selectedComplaint.status}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-8">
                {/* معلومات العميل والمشروع */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                    <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400" />
                      معلومات العميل والمشروع
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                          <User className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">
                            اسم العميل
                          </div>
                          <div className="font-medium text-white">
                            {selectedComplaint.customerName}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                          <Home className="w-5 h-5 text-purple-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">المشروع</div>
                          <div className="font-medium text-white">
                            {selectedComplaint.project}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                        <div className="p-2 rounded-lg bg-emerald-500/10">
                          <MapPin className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">
                            رقم الوحدة
                          </div>
                          <div className="font-medium text-white">
                            {selectedComplaint.unitNumber || "غير محدد"}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                        <div className="p-2 rounded-lg bg-yellow-500/10">
                          <Phone className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">
                            مصدر الشكوى
                          </div>
                          <div className="font-medium text-white">
                            {selectedComplaint.source}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                    <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-red-400" />
                      معلومات الوقت والإنشاء
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                        <div className="p-2 rounded-lg bg-red-500/10">
                          <Clock className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">المدة</div>
                          <div className="font-medium text-white">
                            {selectedComplaint.duration} يوم
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                        <div className="p-2 rounded-lg bg-orange-500/10">
                          <Calendar className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">
                            تاريخ الإنشاء
                          </div>
                          <div className="font-medium text-white">
                            {new Date(selectedComplaint.createdAt).toLocaleDateString(
                              "ar-EG",
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                        <div className="p-2 rounded-lg bg-teal-500/10">
                          <User className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-400">
                            تم الإنشاء بواسطة
                          </div>
                          <div className="font-medium text-white">
                            {selectedComplaint.createdBy}
                          </div>
                        </div>
                      </div>

                      {/* معلومات آخر تحديث */}
                      {selectedComplaint.updatedBy && selectedComplaint.updatedAt && (
                        <>
                          <div className="border-t border-gray-800/50 pt-4"></div>
                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                              <Edit className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">
                                آخر تحديث بواسطة
                              </div>
                              <div className="font-medium text-white">
                                {selectedComplaint.updatedBy}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                              <Calendar className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                              <div className="text-xs text-gray-400">
                                تاريخ آخر تحديث
                              </div>
                              <div className="font-medium text-white">
                                {new Date(selectedComplaint.updatedAt).toLocaleDateString(
                                  "ar-EG",
                                )} - {new Date(selectedComplaint.updatedAt).toLocaleTimeString(
                                  "ar-EG",
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* تفاصيل الشكوى والإجراء */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                    <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-400" />
                      تفاصيل الشكوى
                    </h3>
                    <div className="p-4 bg-gray-800/30 rounded-lg min-h-[120px]">
                      <p className="text-white leading-relaxed">
                        {selectedComplaint.description}
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                    <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      الإجراء المتخذ
                    </h3>
                    <div className="p-4 bg-gray-800/30 rounded-lg min-h-[120px]">
                      <p className="text-white leading-relaxed">
                        {selectedComplaint.action || "لم يتم اتخاذ إجراء بعد"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* سجل التحديثات - يظهر دائماً */}
                <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                  <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                    <History className="w-4 h-4 text-blue-400" />
                    سجل التحديثات والتعديلات
                    {selectedComplaint.updates && selectedComplaint.updates.length > 0 && (
                      <span className="bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full text-xs">
                        {selectedComplaint.updates.length} تحديث
                      </span>
                    )}
                  </h3>
                  
                  {selectedComplaint.updates && selectedComplaint.updates.length > 0 ? (
                    <div className="space-y-4 max-h-80 overflow-y-auto">
                      {selectedComplaint.updates
                        .slice()
                        .reverse()
                        .map((update, index) => (
                        <div
                          key={index}
                          className="relative p-4 rounded-lg bg-gradient-to-r from-gray-800/20 to-gray-800/40 border border-gray-700/30 hover:border-gray-600/50 transition-all duration-200"
                        >
                          {/* خط التوصيل للتحديثات */}
                          {index < selectedComplaint.updates.length - 1 && (
                            <div className="absolute left-6 bottom-0 w-0.5 h-4 bg-gradient-to-b from-blue-500/50 to-transparent"></div>
                          )}
                          
                          <div className="flex items-start gap-4">
                            <div className="p-2.5 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
                              <Edit className="w-4 h-4 text-blue-400" />
                            </div>
                            
                            <div className="flex-1 space-y-3">
                              {/* رأس التحديث */}
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium text-blue-400">
                                    {update.updatedBy}
                                  </span>
                                  <span className="text-xs text-gray-500">•</span>
                                  <span className="text-xs text-gray-400">
                                    قام بالتحديث
                                  </span>
                                </div>
                                <div className="text-right">
                                  <div className="text-xs text-gray-300">
                                    {new Date(update.updatedAt).toLocaleDateString("ar-EG")}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {new Date(update.updatedAt).toLocaleTimeString("ar-EG", {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </div>
                                </div>
                              </div>

                              {/* تفاصيل التحديث */}
                              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700/20">
                                <p className="text-sm text-white mb-3 flex items-center gap-2">
                                  <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                                  تم تحديث حقل: <span className="font-semibold text-yellow-400">{getFieldName(update.field)}</span>
                                </p>
                                
                                <div className="grid grid-cols-1 gap-3">
                                  {/* القيمة القديمة */}
                                  <div className="flex items-start gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-xs text-gray-400 whitespace-nowrap">القيمة السابقة:</span>
                                      <div className="bg-red-500/10 border border-red-500/20 text-red-300 px-3 py-1.5 rounded-md text-xs max-w-full overflow-hidden">
                                        <span className="block truncate" title={update.oldValue || "فارغ"}>
                                          {update.oldValue || "فارغ"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  {/* القيمة الجديدة */}
                                  <div className="flex items-start gap-3">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span className="text-xs text-gray-400 whitespace-nowrap">القيمة الجديدة:</span>
                                      <div className="bg-green-500/10 border border-green-500/20 text-green-300 px-3 py-1.5 rounded-md text-xs max-w-full overflow-hidden">
                                        <span className="block truncate" title={update.newValue || "فارغ"}>
                                          {update.newValue || "فارغ"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                        <History className="w-8 h-8 text-gray-500" />
                      </div>
                      <p className="text-gray-400 text-sm">لا توجد تحديثات على هذه الشكوى</p>
                      <p className="text-gray-500 text-xs mt-1">
                        ستظهر هنا جميع التعديلات التي تتم على الشكوى
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className="mt-8">
                <Button
                  onClick={() => setIsViewDialogOpen(false)}
                  className="bg-gray-800 hover:bg-gray-700 text-white"
                >
                  إغلاق
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#1a1c23] to-[#1f2128] border border-gray-800/50 shadow-2xl">
          <DialogHeader className="border-b border-gray-800/50 pb-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold text-white flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gray-800/50">
                    <Edit className="w-5 h-5 text-blue-400" />
                  </div>
                  <span>تعديل الشكوى #{selectedComplaint?.id}</span>
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  قم بتعديل بيانات الشكوى في النموذج أدناه
                </DialogDescription>
              </div>
              <button
                onClick={() => setIsEditDialogOpen(false)}
                className="p-1 hover:bg-gray-800/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
          </DialogHeader>

          <div className="space-y-8">
            {/* معلومات العميل والمشروع */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-400" />
                  معلومات العميل والمشروع
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-date"
                      className="text-xs text-gray-400"
                    >
                      التاريخ
                    </Label>
                    <div className="relative">
                      <Input
                        id="edit-date"
                        type="date"
                        value={newComplaint.date}
                        onChange={(e) =>
                          handleNewComplaintChange("date", e.target.value)
                        }
                        className="bg-gray-800/30 border-gray-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white"
                        required
                      />
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-customerName"
                      className="text-xs text-gray-400"
                    >
                      اسم العميل
                    </Label>
                    <div className="relative">
                      <Input
                        id="edit-customerName"
                        value={newComplaint.customerName}
                        onChange={(e) =>
                          handleNewComplaintChange(
                            "customerName",
                            e.target.value,
                          )
                        }
                        placeholder="أدخل اسم العميل"
                        className="bg-gray-800/30 border-gray-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white pr-9"
                        required
                      />
                      <User className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-project"
                      className="text-xs text-gray-400"
                    >
                      المشروع
                    </Label>
                    <div className="relative">
                      <Input
                        id="edit-project"
                        value={newComplaint.project}
                        onChange={(e) =>
                          handleNewComplaintChange("project", e.target.value)
                        }
                        placeholder="أدخل اسم المشروع"
                        className="bg-gray-800/30 border-gray-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white pr-9"
                        required
                      />
                      <Home className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-unitNumber"
                      className="text-xs text-gray-400"
                    >
                      رقم الوحدة / العمارة
                    </Label>
                    <div className="relative">
                      <Input
                        id="edit-unitNumber"
                        value={newComplaint.unitNumber}
                        onChange={(e) =>
                          handleNewComplaintChange("unitNumber", e.target.value)
                        }
                        placeholder="أدخل رقم الوحدة"
                        className="bg-gray-800/30 border-gray-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white pr-9"
                      />
                      <MapPin className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  معلومات الشكوى
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-source"
                      className="text-xs text-gray-400"
                    >
                      مصدر الشكوى
                    </Label>
                    <Select
                      value={newComplaint.source}
                      onValueChange={(value) =>
                        handleNewComplaintChange("source", value)
                      }
                    >
                      <SelectTrigger className="bg-gray-800/30 border-gray-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white">
                        <SelectValue placeholder="اختر مصدر الشكوى" />
                      </SelectTrigger>
                      <SelectContent>
                        {complaintSources.map((source) => (
                          <SelectItem key={source.value} value={source.value}>
                            {source.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="edit-status"
                      className="text-xs text-gray-400"
                    >
                      الحالة
                    </Label>
                    <Select
                      value={newComplaint.status}
                      onValueChange={(value) =>
                        handleNewComplaintChange("status", value)
                      }
                    >
                      <SelectTrigger className="bg-gray-800/30 border-gray-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white">
                        <SelectValue placeholder="اختر حالة الشكوى" />
                      </SelectTrigger>
                      <SelectContent>
                        {complaintStatuses.slice(1).map((status) => (
                          <SelectItem key={status.value} value={status.value}>
                            {status.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* تفاصيل الشكوى والإجراء */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400" />
                  تفاصيل الشكوى
                </h3>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-description"
                    className="text-xs text-gray-400"
                  >
                    تفاصيل الشكوى
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="edit-description"
                      value={newComplaint.description}
                      onChange={(e) =>
                        handleNewComplaintChange("description", e.target.value)
                      }
                      placeholder="أدخل تفاصيل الشكوى هنا..."
                      className="min-h-[150px] bg-gray-800/30 border-gray-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white placeholder:text-gray-500 resize-y"
                      required
                    />
                    <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-yellow-400" />
                  </div>
                </div>
              </div>

              <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
                <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-400" />
                  الإجراء المتخذ
                </h3>
                <div className="space-y-2">
                  <Label
                    htmlFor="edit-action"
                    className="text-xs text-gray-400"
                  >
                    الإجراء المتخذ
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="edit-action"
                      value={newComplaint.action}
                      onChange={(e) =>
                        handleNewComplaintChange("action", e.target.value)
                      }
                      placeholder="أدخل الإجراء المتخذ (إن وجد)"
                      className="min-h-[120px] bg-gray-800/30 border-gray-800/50 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-white placeholder:text-gray-500 resize-y"
                    />
                    <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-green-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="mt-8 border-t border-gray-800/50 pt-6">
            <Button
              onClick={() => setIsEditDialogOpen(false)}
              variant="outline"
              className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleUpdateComplaint}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار تأكيد الحذف */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1a1c23] border border-gray-800/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-400" />
              تأكيد حذف الشكوى
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              هل أنت متأكد من رغبتك في حذف الشكوى رقم{" "}
              <span className="font-bold text-white">
                {selectedComplaint?.id}
              </span>
              ؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700">
              إلغاء
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComplaint}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              حذف الشكوى
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}