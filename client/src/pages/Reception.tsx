
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { DataService } from "@/lib/dataService";
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
  Phone,
  User,
  Building,
  MessageSquare,
  Calendar,
  FileText,
  Clock,
  CheckCircle2,
  X,
} from "lucide-react";

// بيانات تجريبية لقسم الاستقبال
const receptionDummyData: Reception[] = [
  {
    id: "R001",
    date: "2025-01-20",
    customerName: "أحمد محمد السعيد",
    phoneNumber: "0501234567",
    project: "النخيل",
    employee: "نوف الأحمدي",
    contactMethod: "زيارة شخصية",
    type: "شكوى",
    customerRequest: "مشكلة في تسريب المياه بالحمام الرئيسي",
    action: "تم إنشاء تذكرة صيانة رقم 2145 وتحويلها لقسم الصيانة",
    status: "مكتملة",
    createdBy: "نوف الأحمدي",
    createdAt: "2025-01-20T09:30:00",
    updatedBy: null,
    updatedAt: null,
  },
  {
    id: "R002",
    date: "2025-01-20",
    customerName: "فاطمة عبدالله الزهراني",
    phoneNumber: "0559876543",
    project: "المعالي",
    employee: "سارة القحطاني",
    contactMethod: "مكالمة هاتفية",
    type: "استفسار",
    customerRequest: "استفسار عن موعد تسليم الوحدة",
    action: "تم التواصل مع قسم المشاريع وإبلاغ العميلة بالموعد المحدد",
    status: "مكتملة",
    createdBy: "سارة القحطاني",
    createdAt: "2025-01-20T10:15:00",
    updatedBy: null,
    updatedAt: null,
  },
  {
    id: "R003",
    date: "2025-01-20",
    customerName: "محمد سعد الغامدي",
    phoneNumber: "0512345678",
    project: "تل الرمال",
    employee: "نوف الأحمدي",
    contactMethod: "زيارة شخصية",
    type: "طلب خدمة",
    customerRequest: "طلب نسخة إضافية من عقد البيع",
    action: "تم توجيه العميل لقسم المبيعات مع توفير النماذج المطلوبة",
    status: "قيد المتابعة",
    createdBy: "نوف الأحمدي",
    createdAt: "2025-01-20T11:20:00",
    updatedBy: null,
    updatedAt: null,
  },
  {
    id: "R004",
    date: "2025-01-20",
    customerName: "عائشة علي الشهري",
    phoneNumber: "0567891234",
    project: "النخيل",
    employee: "أمل الحربي",
    contactMethod: "مكالمة هاتفية",
    type: "شكوى",
    customerRequest: "تأخر في موعد التسليم المحدد مسبقاً",
    action: "تم التواصل مع مدير المشروع وتحديد موعد جديد للتسليم",
    status: "مكتملة",
    createdBy: "أمل الحربي",
    createdAt: "2025-01-20T13:45:00",
    updatedBy: null,
    updatedAt: null,
  },
  {
    id: "R005",
    date: "2025-01-20",
    customerName: "خالد عبدالرحمن العتيبي",
    phoneNumber: "0543216789",
    project: "المعالي",
    employee: "سارة القحطاني",
    contactMethod: "بريد إلكتروني",
    type: "استفسار",
    customerRequest: "استفسار عن إجراءات نقل الملكية",
    action: "تم إرسال دليل إجراءات نقل الملكية عبر البريد الإلكتروني",
    status: "مكتملة",
    createdBy: "سارة القحطاني",
    createdAt: "2025-01-20T14:30:00",
    updatedBy: null,
    updatedAt: null,
  },
  {
    id: "R006",
    date: "2025-01-21",
    customerName: "سعاد محمد البقمي",
    phoneNumber: "0598765432",
    project: "تل الرمال",
    employee: "نوف الأحمدي",
    contactMethod: "زيارة شخصية",
    type: "شكوى",
    customerRequest: "مشكلة في المصعد لا يعمل بشكل صحيح",
    action: "تم إبلاغ قسم الصيانة وطلب فني مختص للمصاعد",
    status: "قيد المعالجة",
    createdBy: "نوف الأحمدي",
    createdAt: "2025-01-21T08:15:00",
    updatedBy: null,
    updatedAt: null,
  },
  {
    id: "R007",
    date: "2025-01-21",
    customerName: "عبدالله أحمد الحارثي",
    phoneNumber: "0576543210",
    project: "النخيل",
    employee: "أمل الحربي",
    contactMethod: "مكالمة هاتفية",
    type: "طلب خدمة",
    customerRequest: "طلب شهادة إتمام البناء",
    action: "تم توجيه الطلب لقسم الهندسة للحصول على الشهادة",
    status: "قيد المتابعة",
    createdBy: "أمل الحربي",
    createdAt: "2025-01-21T09:50:00",
    updatedBy: null,
    updatedAt: null,
  },
  {
    id: "R008",
    date: "2025-01-21",
    customerName: "منى سعد الدوسري",
    phoneNumber: "0534567890",
    project: "المعالي",
    employee: "سارة القحطاني",
    contactMethod: "واتساب",
    type: "استفسار",
    customerRequest: "استفسار عن خدمات ما بعد البيع",
    action: "تم تزويد العميلة بدليل خدمات ما بعد البيع وأرقام التواصل",
    status: "مكتملة",
    createdBy: "سارة القحطاني",
    createdAt: "2025-01-21T11:25:00",
    updatedBy: null,
    updatedAt: null,
  },
];

// أنواع طرق التواصل
const contactMethods = [
  { value: "phone", label: "مكالمة هاتفية" },
  { value: "visit", label: "زيارة شخصية" },
  { value: "email", label: "بريد إلكتروني" },
  { value: "whatsapp", label: "واتساب" },
  { value: "sms", label: "رسالة نصية" },
];

// أنواع الطلبات
const requestTypes = [
  { value: "complaint", label: "شكوى" },
  { value: "inquiry", label: "استفسار" },
  { value: "service", label: "طلب خدمة" },
  { value: "follow_up", label: "متابعة" },
];

// حالات الطلبات
const statuses = [
  { value: "all", label: "جميع الحالات" },
  { value: "مكتملة", label: "مكتملة" },
  { value: "قيد المعالجة", label: "قيد المعالجة" },
  { value: "قيد المتابعة", label: "قيد المتابعة" },
  { value: "ملغية", label: "ملغية" },
];

// واجهة بيانات الاستقبال
interface Reception {
  id: string;
  date: string;
  customerName: string;
  phoneNumber: string;
  project: string;
  employee: string;
  contactMethod: string;
  type: string;
  customerRequest: string;
  action: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedBy: string | null;
  updatedAt: string | null;
}

export default function Reception() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [receptionData, setReceptionData] = useState<Reception[]>(receptionDummyData);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Reception | null>(null);

  const [newRecord, setNewRecord] = useState<
    Omit<Reception, "id" | "createdBy" | "createdAt" | "updatedBy" | "updatedAt">
  >({
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    phoneNumber: "",
    project: "",
    employee: user?.username || "",
    contactMethod: "",
    type: "",
    customerRequest: "",
    action: "",
    status: "قيد المعالجة",
  });

  const filteredData = receptionData.filter((record) => {
    const matchesSearch =
      record.customerName.includes(searchTerm) ||
      record.phoneNumber.includes(searchTerm) ||
      record.project.includes(searchTerm) ||
      record.customerRequest.includes(searchTerm) ||
      record.id.includes(searchTerm);

    const matchesStatus =
      selectedStatus === "all" || record.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleNewRecordChange = (field: string, value: string) => {
    setNewRecord((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleViewRecord = (record: Reception) => {
    setSelectedRecord(record);
    setIsViewDialogOpen(true);
  };

  const handleEditSetup = (record: Reception) => {
    setSelectedRecord(record);
    setNewRecord({
      date: record.date,
      customerName: record.customerName,
      phoneNumber: record.phoneNumber,
      project: record.project,
      employee: record.employee,
      contactMethod: record.contactMethod,
      type: record.type,
      customerRequest: record.customerRequest,
      action: record.action,
      status: record.status,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteSetup = (record: Reception) => {
    setSelectedRecord(record);
    setIsDeleteDialogOpen(true);
  };

  const handleAddRecord = async () => {
    const newId = `R${(receptionData.length + 1).toString().padStart(3, "0")}`;
    const now = new Date().toISOString();

    const record: Reception = {
      ...newRecord,
      id: newId,
      createdBy: user?.username || "موظف الاستقبال",
      createdAt: now,
      updatedBy: null,
      updatedAt: null,
    };

    const updatedData = [record, ...receptionData];
    setReceptionData(updatedData);

    addNotification({
      title: "تمت الإضافة",
      message: `تم إضافة السجل رقم ${newId} بنجاح`,
      type: "success",
    });

    setIsAddDialogOpen(false);
    setNewRecord({
      date: new Date().toISOString().split("T")[0],
      customerName: "",
      phoneNumber: "",
      project: "",
      employee: user?.username || "",
      contactMethod: "",
      type: "",
      customerRequest: "",
      action: "",
      status: "قيد المعالجة",
    });
  };

  const handleUpdateRecord = async () => {
    if (!selectedRecord || !user) return;

    const now = new Date().toISOString();
    const updatedRecord = {
      ...selectedRecord,
      ...newRecord,
      updatedBy: user.username,
      updatedAt: now,
    };

    const updatedData = receptionData.map((record) => {
      if (record.id === selectedRecord.id) {
        return updatedRecord;
      }
      return record;
    });

    setReceptionData(updatedData);
    setIsEditDialogOpen(false);

    addNotification({
      title: "تم التحديث",
      message: `تم تحديث السجل رقم ${selectedRecord.id} بنجاح`,
      type: "success",
    });
  };

  const handleDeleteRecord = async () => {
    if (!selectedRecord) return;

    const filteredData = receptionData.filter(
      (record) => record.id !== selectedRecord.id,
    );

    setReceptionData(filteredData);
    setIsDeleteDialogOpen(false);

    addNotification({
      title: "تم الحذف",
      message: `تم حذف السجل رقم ${selectedRecord.id} بنجاح`,
      type: "success",
    });
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مكتملة":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      case "قيد المعالجة":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
      case "قيد المتابعة":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "ملغية":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "شكوى":
        return <FileText className="h-4 w-4" />;
      case "استفسار":
        return <MessageSquare className="h-4 w-4" />;
      case "طلب خدمة":
        return <User className="h-4 w-4" />;
      case "متابعة":
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6 p-3 md:p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-bold">قسم الاستقبال</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="ml-2 h-4 w-4" />
                إضافة سجل جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>إضافة سجل استقبال جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات العميل والطلب لإضافته إلى سجل الاستقبال
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="date">التاريخ</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newRecord.date}
                    onChange={(e) =>
                      handleNewRecordChange("date", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerName">اسم العميل</Label>
                  <Input
                    id="customerName"
                    value={newRecord.customerName}
                    onChange={(e) =>
                      handleNewRecordChange("customerName", e.target.value)
                    }
                    placeholder="أدخل اسم العميل"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">رقم الجوال</Label>
                  <Input
                    id="phoneNumber"
                    value={newRecord.phoneNumber}
                    onChange={(e) =>
                      handleNewRecordChange("phoneNumber", e.target.value)
                    }
                    placeholder="05xxxxxxxx"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="project">المشروع</Label>
                  <Input
                    id="project"
                    value={newRecord.project}
                    onChange={(e) =>
                      handleNewRecordChange("project", e.target.value)
                    }
                    placeholder="أدخل اسم المشروع"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="employee">الموظف</Label>
                  <Input
                    id="employee"
                    value={newRecord.employee}
                    onChange={(e) =>
                      handleNewRecordChange("employee", e.target.value)
                    }
                    placeholder="اسم الموظف المستقبِل"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactMethod">طريقة التواصل</Label>
                  <Select
                    value={newRecord.contactMethod}
                    onValueChange={(value) =>
                      handleNewRecordChange("contactMethod", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر طريقة التواصل" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactMethods.map((method) => (
                        <SelectItem key={method.value} value={method.label}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">النوع</Label>
                  <Select
                    value={newRecord.type}
                    onValueChange={(value) =>
                      handleNewRecordChange("type", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الطلب" />
                    </SelectTrigger>
                    <SelectContent>
                      {requestTypes.map((type) => (
                        <SelectItem key={type.value} value={type.label}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">الحالة</Label>
                  <Select
                    value={newRecord.status}
                    onValueChange={(value) =>
                      handleNewRecordChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر حالة الطلب" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.filter(s => s.value !== "all").map((status) => (
                        <SelectItem key={status.value} value={status.label}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="customerRequest">طلب العميل</Label>
                  <Textarea
                    id="customerRequest"
                    value={newRecord.customerRequest}
                    onChange={(e) =>
                      handleNewRecordChange("customerRequest", e.target.value)
                    }
                    placeholder="أدخل تفاصيل طلب العميل"
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="action">الإجراء المتخذ</Label>
                  <Textarea
                    id="action"
                    value={newRecord.action}
                    onChange={(e) =>
                      handleNewRecordChange("action", e.target.value)
                    }
                    placeholder="أدخل الإجراء المتخذ"
                    className="min-h-[100px]"
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
                <Button type="button" onClick={handleAddRecord}>
                  إضافة السجل
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>سجل الاستقبال</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Filter className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث عن عميل، رقم جوال، مشروع، أو طلب..."
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
                    {statuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الرقم</TableHead>
                    <TableHead className="text-right">التاريخ</TableHead>
                    <TableHead className="text-right">اسم العميل</TableHead>
                    <TableHead className="text-right">رقم الجوال</TableHead>
                    <TableHead className="text-right">المشروع</TableHead>
                    <TableHead className="text-right">الموظف</TableHead>
                    <TableHead className="text-right">طريقة التواصل</TableHead>
                    <TableHead className="text-right">النوع</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-6">
                        لا توجد سجلات متطابقة مع معايير البحث
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          {record.id}
                        </TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.customerName}</TableCell>
                        <TableCell>{record.phoneNumber}</TableCell>
                        <TableCell>{record.project}</TableCell>
                        <TableCell>{record.employee}</TableCell>
                        <TableCell>{record.contactMethod}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTypeIcon(record.type)}
                            {record.type}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(record.status)}`}
                          >
                            {record.status}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleViewRecord(record)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditSetup(record)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteSetup(record)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
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

      {/* نافذة عرض التفاصيل */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-400" />
                  تفاصيل السجل #{selectedRecord.id}
                </DialogTitle>
                <DialogDescription>
                  تاريخ التسجيل: {formatDate(selectedRecord.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-400">
                      معلومات العميل
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <User className="w-4 h-4 text-blue-400" />
                        <div>
                          <div className="text-xs text-gray-400">اسم العميل</div>
                          <div className="font-medium">{selectedRecord.customerName}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-green-400" />
                        <div>
                          <div className="text-xs text-gray-400">رقم الجوال</div>
                          <div className="font-medium">{selectedRecord.phoneNumber}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Building className="w-4 h-4 text-purple-400" />
                        <div>
                          <div className="text-xs text-gray-400">المشروع</div>
                          <div className="font-medium">{selectedRecord.project}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-gray-400">
                      معلومات الطلب
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <MessageSquare className="w-4 h-4 text-yellow-400" />
                        <div>
                          <div className="text-xs text-gray-400">طريقة التواصل</div>
                          <div className="font-medium">{selectedRecord.contactMethod}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {getTypeIcon(selectedRecord.type)}
                        <div>
                          <div className="text-xs text-gray-400">النوع</div>
                          <div className="font-medium">{selectedRecord.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                        <div>
                          <div className="text-xs text-gray-400">الحالة</div>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedRecord.status)}`}>
                            {selectedRecord.status}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-400">
                    تفاصيل الطلب والإجراء
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs text-gray-400 mb-2">طلب العميل</div>
                      <div className="p-4 bg-gray-800/30 rounded-lg">
                        <p className="text-white leading-relaxed">
                          {selectedRecord.customerRequest}
                        </p>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 mb-2">الإجراء المتخذ</div>
                      <div className="p-4 bg-gray-800/30 rounded-lg">
                        <p className="text-white leading-relaxed">
                          {selectedRecord.action}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button onClick={() => setIsViewDialogOpen(false)}>
                  إغلاق
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* نافذة التعديل */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>تعديل السجل #{selectedRecord?.id}</DialogTitle>
            <DialogDescription>
              قم بتعديل بيانات السجل في النموذج أدناه
            </DialogDescription>
          </DialogHeader>
          {/* نفس نموذج الإضافة مع البيانات المحملة */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            {/* يمكن نسخ نفس الحقول من نموذج الإضافة */}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              إلغاء
            </Button>
            <Button type="button" onClick={handleUpdateRecord}>
              حفظ التعديلات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* نافذة تأكيد الحذف */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا السجل؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف السجل رقم {selectedRecord?.id} نهائيًا. هذا الإجراء
              لا يمكن التراجع عنه.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRecord}
              className="bg-red-500 hover:bg-red-600"
            >
              نعم، حذف السجل
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}
