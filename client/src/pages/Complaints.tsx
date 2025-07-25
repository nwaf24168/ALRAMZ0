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
import { Checkbox } from "@/components/ui/checkbox";
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
  CheckCircle,
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
  Star,
  Settings,
  Upload,
  Download,
} from "lucide-react";

// أولويات الشكاوى
const complaintPriorities = [
  { value: "عالية", label: "عالية" },
  { value: "متوسطة", label: "متوسطة" },
  { value: "منخفضة", label: "منخفضة" },
  { value: "عاجلة", label: "عاجلة" },
];

// حالات الشكاوى
const complaintStatuses = [
  { value: "all", label: "جميع الحالات" },
  { value: "تم حلها", label: "تم حلها" },
  { value: "لازالت قائمة", label: "لازالت قائمة" },
  { value: "لم يتم حلها", label: "لم يتم حلها" },
  { value: "جديدة", label: "جديدة" },
  { value: "قيد المعالجة", label: "قيد المعالجة" },
  { value: "مغلقة", label: "مغلقة" },
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
  priority: string;
  date: string;
  customerName: string;
  project: string;
  unitNumber: string;
  source: string;
  status: string;
  requestNumber: string;
  description: string;
  maintenanceDeliveryAction: string;
  action: string;
  duration: number;
  expectedClosureTime: string;
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
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

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
      | "requestNumber"
    >
  >({
    priority: "متوسطة",
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    project: "",
    unitNumber: "",
    source: "",
    status: "جديدة",
    description: "",
    maintenanceDeliveryAction: "",
    action: "",
    expectedClosureTime: "",
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

  // وظائف تحديد الكل
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      const allIds = filteredComplaints.map(complaint => complaint.id);
      setSelectedItems(new Set(allIds));
      setSelectAll(true);
    }
  };

  const handleItemSelect = (id: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedItems(newSelected);
    setSelectAll(newSelected.size === filteredComplaints.length);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      addNotification({
        title: "خطأ",
        message: "لم يتم تحديد أي عناصر للحذف",
        type: "error"
      });
      return;
    }

    const confirmDelete = window.confirm(
      `هل أنت متأكد من حذف ${selectedItems.size} شكوى؟ لا يمكن التراجع عن هذا الإجراء.`
    );

    if (!confirmDelete) return;

    setLoading(true);
    try {
      const idsToDelete = Array.from(selectedItems);
      for (const id of idsToDelete) {
        await DataService.deleteComplaint(id);
      }

      addNotification({
        title: "تم الحذف بنجاح",
        message: `تم حذف ${selectedItems.size} شكوى`,
        type: "success"
      });

      setSelectedItems(new Set());
      setSelectAll(false);
      await loadComplaints();
    } catch (error) {
      console.error("خطأ في الحذف الجماعي:", error);
      addNotification({
        title: "خطأ",
        message: "حدث خطأ أثناء الحذف الجماعي",
        type: "error"
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

  // تحديث الوقت الحالي كل ساعة لحساب المدة بشكل مباشر
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 3600000); // تحديث كل ساعة (3600000 ميلي ثانية)

    return () => clearInterval(timer);
  }, []);

  const filteredComplaints = complaints.filter((complaint) => {
    const matchesSearch =
      complaint.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.requestNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      complaint.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || complaint.status === selectedStatus;

    const matchesPriority =
      selectedPriority === "all" || complaint.priority === selectedPriority;

    return matchesSearch && matchesStatus && matchesPriority;
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
      priority: complaint.priority,
      date: complaint.date,
      customerName: complaint.customerName,
      project: complaint.project,
      unitNumber: complaint.unitNumber,
      source: complaint.source,
      status: complaint.status,
      description: complaint.description,
      maintenanceDeliveryAction: complaint.maintenanceDeliveryAction,
      action: complaint.action,
      expectedClosureTime: complaint.expectedClosureTime,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteSetup = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsDeleteDialogOpen(true);
  };

  const generateComplaintId = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const generateRequestNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    return `REQ-${timestamp}`;
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
    const requestNumber = generateRequestNumber();
    const now = new Date().toISOString();

    const complaint: Complaint = {
      ...newComplaint,
      id: newId,
      requestNumber: requestNumber,
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
        message: `تم إضافة الشكوى رقم ${requestNumber} بنجاح في قاعدة البيانات`,
        type: "success",
      });

      // إعادة تحميل البيانات
      await loadComplaints();
      setIsAddDialogOpen(false);

      // إعادة تعيين النموذج
      setNewComplaint({
        priority: "متوسطة",
        date: new Date().toISOString().split("T")[0],
        customerName: "",
        project: "",
        unitNumber: "",
        source: "",
        status: "جديدة",
        description: "",
        maintenanceDeliveryAction: "",
        action: "",
        expectedClosureTime: "",
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
      priority: "الأولوية",
      date: "التاريخ",
      customerName: "اسم العميل",
      project: "المشروع",
      unitNumber: "رقم الوحدة",
      source: "مصدر الشكوى",
      status: "الحالة",
      description: "تفاصيل الشكوى",
      maintenanceDeliveryAction: "إجراء الصيانة والتسليم",
      action: "الإجراء المتخذ",
      expectedClosureTime: "الوقت المتوقع لإغلاق الشكوى",
    };

    Object.entries(fieldsToCheck).forEach(([field, label]) => {
      const oldValue = (selectedComplaint as any)[field];
      const newValue = (newComplaint as any)[field];

      // معالجة خاصة للتاريخ المحدث من selectedComplaint
      let actualNewValue = newValue;
      if (field === 'date' && selectedComplaint.createdAt) {
        // استخدام التاريخ المحدث من selectedComplaint إذا كان متوفراً
        const updatedCreatedAt = selectedComplaint.createdAt.split('T')[0];
        if (updatedCreatedAt !== newValue) {
          actualNewValue = updatedCreatedAt;
        }
      }

      if (oldValue !== actualNewValue) {
        newUpdates.push({
          field,
          oldValue: oldValue || "",
          newValue: actualNewValue || "",
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
        createdAt: selectedComplaint.createdAt, // التأكد من تضمين تاريخ الإنشاء المحدث
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
        message: `تم حذف الشكوى رقم ${selectedComplaint.requestNumber} بنجاح من قاعدة البيانات`,
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
    if (!dateString) return "غير محدد";

    const date = new Date(dateString);

    // التحقق من صحة التاريخ
    if (isNaN(date.getTime())) {
      return "تاريخ غير صحيح";
    }

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
      priority: "الأولوية",
      status: "الحالة",
      action: "الإجراء المتخذ",
      description: "تفاصيل الشكوى",
      customerName: "اسم العميل",
      project: "المشروع",
      unitNumber: "رقم الوحدة",
      source: "مصدر الشكوى",
      maintenanceDeliveryAction: "إجراء الصيانة والتسليم",
      expectedClosureTime: "الوقت المتوقع لإغلاق الشكوى",
    };
    return fieldNames[field] || field;
  };

  // دالة لحساب مدة الشكوى من تاريخ الإنشاء إلى اليوم الحالي (مباشرة)
  const calculateComplaintDuration = (createdAt: string, date: string) => {
    try {
      // استخدام تاريخ الشكوى الظاهر في الجدول (العمود الثاني)
      const startDate = new Date(date);

      // التحقق من صحة التاريخ
      if (isNaN(startDate.getTime())) {
        return 0;
      }

      // إنشاء تاريخ اليوم الحالي بدون وقت (فقط التاريخ)
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // تعيين وقت البداية إلى بداية اليوم
      startDate.setHours(0, 0, 0, 0);

      // حساب الفرق بالأيام
      const timeDifference = today.getTime() - startDate.getTime();
      const daysDifference = Math.floor(timeDifference / (1000 * 3600 * 24));

      return Math.max(0, daysDifference);
    } catch (error) {
      console.error("خطأ في حساب مدة الشكوى:", error);
      return 0;
    }
  };

  // دالة للحصول على لون الأولوية
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "عاجلة":
        return "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400";
      case "عالية":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400";
      case "متوسطة":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "منخفضة":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
    }
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

  // تصدير البيانات إلى Excel
  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');

      const exportData = complaints.map((complaint, index) => ({
        'ت': index + 1,
        'الأولوية': complaint.priority,
        'التاريخ': complaint.date,
        'اسم العميل': complaint.customerName,
        'المشروع': complaint.project,
        'رقم الوحدة': complaint.unitNumber || '',
        'مصدر الشكوى': complaint.source,
        'الحالة': complaint.status,
        'مدة الشكوى (أيام)': calculateComplaintDuration(complaint.createdAt, complaint.date),
        'الشكوى': complaint.description,
        'إجراء الصيانة والتسليم': complaint.maintenanceDeliveryAction || '',
        'الإجراء': complaint.action || '',
        'الوقت المتوقع لإغلاق الشكوى': complaint.expectedClosureTime || '',
        'المنشئ': complaint.createdBy
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'الشكاوى');

      const fileName = `الشكاوى_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      addNotification({
        title: "تم التصدير",
        message: `تم تصدير ${complaints.length} شكوى إلى ملف Excel بنجاح`,
        type: "success"
      });
    } catch (error) {
      console.error("خطأ في تصدير Excel:", error);
      addNotification({
        title: "خطأ",
        message: "فشل في تصدير البيانات",
        type: "error",
      });
    }
  };

  // معالجة استيراد ملف Excel للشكاوى
  const handleImportExcel = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      addNotification({
        title: "خطأ",
        message: "يرجى اختيار ملف Excel صالح (.xlsx أو .xls)",
        type: "error",
      });
      return;
    }

    if (!user) {
      addNotification({
        title: "خطأ",
        message: "يجب تسجيل الدخول أولاً",
        type: "error",
      });
      return;
    }

    setLoading(true);

    try {
      // قراءة الملف
      const data = await file.arrayBuffer();
      const XLSX = await import('xlsx');
      const workbook = XLSX.read(data, { type: 'array', cellDates: true });

      // الحصول على أول ورقة عمل
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' });

      if (jsonData.length < 2) {
        addNotification({
          title: "خطأ",
          message: "الملف فارغ أو لا يحتوي على بيانات صالحة",
          type: "error",
        });
        return;
      }

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as any[][];

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        try {
          // معالجة التاريخ
          let dateValue = row[2]; // عمود التاريخ
          let formattedDate = new Date().toISOString().split('T')[0];

          if (dateValue) {
            if (typeof dateValue === 'number') {
              // Excel date serial number
              const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
              formattedDate = excelDate.toISOString().split('T')[0];
            } else if (typeof dateValue === 'string') {
              const parsedDate = new Date(dateValue);
              if (!isNaN(parsedDate.getTime())) {
                formattedDate = parsedDate.toISOString().split('T')[0];
              }
            } else if (dateValue instanceof Date) {
              formattedDate = dateValue.toISOString().split('T')[0];
            }
          }

          const complaint: Complaint = {
            id: generateComplaintId(),
            priority: row[1] || "متوسطة",
            date: formattedDate,
            customerName: row[3] || "",
            project: row[4] || "",
            unitNumber: row[5] || "",
            source: row[6] || "الاستيراد",
            status: row[7] || "جديدة",
            requestNumber: generateRequestNumber(),
            description: row[8] || "",
            maintenanceDeliveryAction: row[9] || "",
            action: row[10] || "",
            expectedClosureTime: row[11] || "",
            duration: 0,
            createdBy: user.username,
            createdAt: new Date().toISOString(),
            updatedBy: null,
            updatedAt: null,
            updates: [],
          };

          // التحقق من البيانات الأساسية
          if (!complaint.customerName || !complaint.description) {
            errorCount++;
            continue;
          }

          // حفظ الشكوى في قاعدة البيانات
          await DataService.saveComplaint(complaint);
          successCount++;

        } catch (error) {
          console.error(`خطأ في معالجة السطر ${i + 1}:`, error);
          errorCount++;
        }
      }

      // إعادة تحميل البيانات
      await loadComplaints();

      // إظهار نتيجة العملية
      addNotification({
        title: "تم الاستيراد",
        message: `تم استيراد ${successCount} شكوى بنجاح${errorCount > 0 ? ` مع ${errorCount} خطأ` : ""}`,
        type: "success",
      });

    } catch (error) {
      console.error("خطأ في معالجة ملف Excel:", error);
      addNotification({
        title: "خطأ",
        message: "فشل في معالجة ملف Excel",
        type: "error",
      });
    } finally {
      setLoading(false);
      // مسح اختيار الملف
      event.target.value = '';
    }
  };

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6 p-3 md:p-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl md:text-2xl font-bold">
            اتصالات خدمة العملاء {readOnly && <span className="text-sm text-gray-500">(قراءة فقط)</span>}
          </h1>
          {hasEditAccess("complaints") && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center">
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة شكوى جديدة
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة شكوى جديدة</DialogTitle>
                <DialogDescription>
                  أدخل بيانات الشكوى لإضافتها إلى السجل وتعيين رقم طلب جديد
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">الأولوية</Label>
                  <Select
                    value={newComplaint.priority}
                    onValueChange={(value) =>
                      handleNewComplaintChange("priority", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الأولوية" />
                    </SelectTrigger>
                    <SelectContent>
                      {complaintPriorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          {priority.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

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
                  <Label htmlFor="customerName">العميل</Label>
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

                <div className="space-y-2">
<Label htmlFor="expectedClosureTime">الوقت المتوقع لإغلاق الشكوى</Label>
                  <Input
                    id="expectedClosureTime"
                    value={newComplaint.expectedClosureTime}
                    onChange={(e) =>
                      handleNewComplaintChange("expectedClosureTime", e.target.value)
                    }
                    placeholder="مثال: 3 أيام"
                  />
                </div>

                <div className="col-span-1 md:col-span-3 space-y-2">
                  <Label htmlFor="description">الشكوى</Label>
                  <Textarea
                    id="description"
                    value={newComplaint.description}
                    onChange={(e) =>
                      handleNewComplaintChange("description", e.target.value)
                    }
                    placeholder="أدخل تفاصيل الشكوى هنا..."
                    className="min-h-[100px]"
                    required
                  />
                </div>

                <div className="col-span-1 md:col-span-3 space-y-2">
                  <Label htmlFor="maintenanceDeliveryAction">إجراء الصيانة والتسليم</Label>
                  <Textarea
                    id="maintenanceDeliveryAction"
                    value={newComplaint.maintenanceDeliveryAction}
                    onChange={(e) =>
                      handleNewComplaintChange("maintenanceDeliveryAction", e.target.value)
                    }
                    placeholder="أدخل إجراءات الصيانة والتسليم"
                    className="min-h-[80px]"
                  />
                </div>

                <div className="col-span-1 md:col-span-3 space-y-2">
                  <Label htmlFor="action">الإجراء</Label>
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
                  placeholder="بحث عن عميل، مشروع، رقم طلب، أو شكوى..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleImportExcel}
                  className="hidden"
                  id="excel-import-upload"
                  disabled={loading}
                />
                <Button 
                  variant="outline" 
                  onClick={() => document.getElementById('excel-import-upload')?.click()}
                  disabled={loading || readOnly}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  استيراد Excel
                </Button>
                <Button onClick={exportToExcel}>
                  <Download className="h-4 w-4 mr-2" />
                  تصدير إلى Excel
                </Button>
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
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={selectedPriority}
                  onValueChange={setSelectedPriority}
                >
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="جميع الأولويات" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأولويات</SelectItem>
                    {complaintPriorities.map((priority) => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
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
                    <TableHead className="text-right whitespace-nowrap">الأولوية</TableHead>
                    <TableHead className="text-right whitespace-nowrap">التاريخ</TableHead>
                    <TableHead className="text-right whitespace-nowrap">العميل</TableHead>
                    <TableHead className="text-right whitespace-nowrap">المشروع</TableHead>
                    <TableHead className="text-right whitespace-nowrap">رقم الوحدة</TableHead>
                    <TableHead className="text-right whitespace-nowrap">مصدر الشكوى</TableHead>
                    <TableHead className="text-right whitespace-nowrap">الحالة</TableHead>
                    <TableHead className="text-right whitespace-nowrap">رقم الطلب</TableHead>
                    <TableHead className="text-right whitespace-nowrap">مدة الشكوى</TableHead>
                    <TableHead className="text-right whitespace-nowrap">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-6">
                        {complaints.length === 0 
                          ? "لا توجد شكاوى في قاعدة البيانات"
                          : "لا توجد شكاوى متطابقة مع معايير البحث"
                        }
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComplaints.map((complaint) => (
                      <TableRow key={complaint.id}>
                        <TableCell>
                          <div
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(complaint.priority)}`}
                          >
                            {complaint.priority}
                          </div>
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{complaint.date}</TableCell>
                        <TableCell>{complaint.customerName}</TableCell>
                        <TableCell>{complaint.project}</TableCell>
                        <TableCell>{complaint.unitNumber || "غير محدد"}</TableCell>
                        <TableCell className="whitespace-nowrap">{complaint.source}</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              complaint.status === "تم حلها" ||
                              complaint.status === "تم الحل"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                                : complaint.status === "لازالت قائمة" ||
                                  complaint.status === "قيد المعالجة"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                  : complaint.status === "لم يتم حلها"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
                            }`}
                          >
                            {complaint.status}
                          </div>
                        </TableCell>
                        <TableCell className="font-medium whitespace-nowrap">
                          {complaint.requestNumber || complaint.id}
                        </TableCell>
                        <TableCell className="whitespace-nowrap">
                          {calculateComplaintDuration(complaint.createdAt, complaint.date)} يوم
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

      {/* مربع حوار عرض التفاصيل - سيتم تحديثه لاحقاً ليشمل الحقول الجديدة */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          {selectedComplaint && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  تفاصيل الشكوى {selectedComplaint.requestNumber || selectedComplaint.id}
                </DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">الأولوية</Label>
                  <div className={"inline-flex items-center px-3 py-1 rounded-full text-sm font-medium " + getPriorityColor(selectedComplaint.priority)}>
                    {selectedComplaint.priority}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">التاريخ</Label>
                  <p className="text-sm">{selectedComplaint.date}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">العميل</Label>
                  <p className="text-sm">{selectedComplaint.customerName}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">المشروع</Label>
                  <p className="text-sm">{selectedComplaint.project}</p>
                </div>
                <div className="space-y-2">                  <Label className="text-sm font-medium">رقم الوحدة / العمارة</Label>
                  <p className="text-sm">{selectedComplaint.unitNumber || "غير محدد"}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">مصدر الشكوى</Label>
                  <p className="text-sm">{selectedComplaint.source}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">الحالة</Label>
                  <p className="text-sm">{selectedComplaint.status}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">رقم الطلب</Label>
                  <p className="text-sm font-mono">{selectedComplaint.requestNumber || selectedComplaint.id}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">مدة الشكوى</Label>
                  <p className="text-sm">
                    {calculateComplaintDuration(selectedComplaint.createdAt, selectedComplaint.date)} يوم
                  </p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium">الوقت المتوقع لإغلاق الشكوى</Label>
                  <p className="text-sm">{selectedComplaint.expectedClosureTime || "غير محدد"}</p>
                </div>
                <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-2">
                  <Label className="text-sm font-medium">الشكوى</Label>
                  <div className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded border min-h-[100px] border-gray-300 dark:border-gray-600">
                    {selectedComplaint.description}
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-2">
                  <Label className="text-sm font-medium">إجراء الصيانة والتسليم</Label>
                  <div className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded border min-h-[80px] border-gray-300 dark:border-gray-600">
                    {selectedComplaint.maintenanceDeliveryAction || "لم يتم اتخاذ إجراء بعد"}
                  </div>
                </div>
                <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-2">
                  <Label className="text-sm font-medium">الإجراء</Label>
                  <div className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded border min-h-[80px] border-gray-300 dark:border-gray-600">
                    {selectedComplaint.action || "لم يتم اتخاذ إجراء بعد"}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={() => setIsViewDialogOpen(false)}>إغلاق</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* مربع حوار التعديل */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل الشكوى {selectedComplaint?.requestNumber || selectedComplaint?.id}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-priority">الأولوية</Label>
              <Select
                value={newComplaint.priority}
                onValueChange={(value) =>
                  handleNewComplaintChange("priority", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر الأولوية" />
                </SelectTrigger>
                <SelectContent>
                  {complaintPriorities.map((priority) => (
                    <SelectItem key={priority.value} value={priority.value}>
                      {priority.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-date">التاريخ</Label>
              <Input
                id="edit-date"
                type="date"
                value={newComplaint.date}
                onChange={(e) =>
                  handleNewComplaintChange("date", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-createdAt">تاريخ الإنشاء الفعلي</Label>
              <Input
                id="edit-createdAt"
                type="date"
                value={selectedComplaint?.createdAt ? selectedComplaint.createdAt.split('T')[0] : ''}
                onChange={(e) => {
                  if (selectedComplaint) {
                    const newCreatedAt = e.target.value + 'T00:00:00.000Z';
                    setSelectedComplaint({
                      ...selectedComplaint,
                      createdAt: newCreatedAt
                    });
                  }
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-customerName">العميل</Label>
              <Input
                id="edit-customerName"
                value={newComplaint.customerName}
                onChange={(e) =>
                  handleNewComplaintChange("customerName", e.target.value)
                }
                placeholder="أدخل اسم العميل"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-project">المشروع</Label>
              <Input
                id="edit-project"
                value={newComplaint.project}
                onChange={(e) =>
                  handleNewComplaintChange("project", e.target.value)
                }
                placeholder="أدخل اسم المشروع"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-unitNumber">رقم الوحدة / العمارة</Label>
              <Input
                id="edit-unitNumber"
                value={newComplaint.unitNumber}
                onChange={(e) =>
                  handleNewComplaintChange("unitNumber", e.target.value)
                }
                placeholder="أدخل رقم الوحدة"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-source">مصدر الشكوى</Label>
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
              <Label htmlFor="edit-status">الحالة</Label>
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

            <div className="space-y-2">
              <Label htmlFor="edit-expectedClosureTime">الوقت المتوقع لإغلاق الشكوى</Label>
              <Input
                id="edit-expectedClosureTime"
                value={newComplaint.expectedClosureTime}
                onChange={(e) =>
                  handleNewComplaintChange("expectedClosureTime", e.target.value)
                }
                placeholder="مثال: 3 أيام"
              />
            </div>

            <div className="col-span-1 md:col-span-3 space-y-2">
              <Label htmlFor="edit-description">الشكوى</Label>
              <Textarea
                id="edit-description"
                value={newComplaint.description}
                onChange={(e) =>
                  handleNewComplaintChange("description", e.target.value)
                }
                placeholder="أدخل تفاصيل الشكوى هنا..."
                className="min-h-[100px]"
                required
              />
            </div>

            <div className="col-span-1 md:col-span-3 space-y-2">
              <Label htmlFor="edit-maintenanceDeliveryAction">إجراء الصيانة والتسليم</Label>
              <Textarea
                id="edit-maintenanceDeliveryAction"
                value={newComplaint.maintenanceDeliveryAction}
                onChange={(e) =>
                  handleNewComplaintChange("maintenanceDeliveryAction", e.target.value)
                }
                placeholder="أدخل إجراءات الصيانة والتسليم"
                className="min-h-[80px]"
              />
            </div>

            <div className="col-span-1 md:col-span-3 space-y-2">
              <Label htmlFor="edit-action">الإجراء</Label>
              <Textarea
                id="edit-action"
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
              onClick={() => setIsEditDialogOpen(false)}
              variant="outline"
            >
              إلغاء
            </Button>
            <Button onClick={handleUpdateComplaint}>
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* مربع حوار تأكيد الحذف */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              تأكيد حذف الشكوى
            </AlertDialogTitle>
            <AlertDialogDescription>
              هل أنت متأكد من رغبتك في حذف الشكوى رقم{" "}
              <span className="font-bold">
                {selectedComplaint?.requestNumber || selectedComplaint?.id}
              </span>
              ؟ لا يمكن التراجع عن هذا الإجراء.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteComplaint}
              className="bg-red-600 hover:bg-red-700"
            >
              حذف الشكوى
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
}