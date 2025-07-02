import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
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
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/dataService";
import { formatDateForDisplay, getCurrentDate, parseExcelDate, formatDateForExcel } from "@/lib/dateUtils";
import * as XLSX from 'xlsx';
import { 
  Phone, 
  Users, 
  MessageSquare, 
  Search, 
  Plus, 
  Upload, 
  Download,
  Edit, 
  Trash2, 
  Eye, 
  AlertCircle,
  UserCheck,
  FileText,
  Calendar,
  User,
  Mail
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowRight, CheckCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface ReceptionRecord {
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
}

const contactMethods = ["اتصال هاتفي", "بريد إلكتروني", "واتساب", "زيارة شخصية"];
const types = ["شكوى", "استفسار", "طلب خدمة", "متابعة"];
const statuses = ["جديد", "قيد المعالجة", "مكتمل", "مؤجل", "تم التحويل للشكاوى"];

export default function Reception() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReceptionRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<ReceptionRecord[]>([]);
  const [transferToComplaints, setTransferToComplaints] = useState(false);

  // بيانات النموذج
  const [date, setDate] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [project, setProject] = useState("");
  const [employee, setEmployee] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [type, setType] = useState("");
  const [customerRequest, setCustomerRequest] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState("");

  // تحميل البيانات عند تحميل الصفحة
  useEffect(() => {
    loadReceptionRecords();
  }, []);

  const loadReceptionRecords = async () => {
    try {
      setLoading(true);
      const data = await DataService.getReceptionRecords();
      const formattedRecords = data.map((record: any) => ({
        id: record.id,
        date: record.date,
        customerName: record.customer_name,
        phoneNumber: record.phone_number,
        project: record.project,
        employee: record.employee,
        contactMethod: record.contact_method,
        type: record.type,
        customerRequest: record.customer_request,
        action: record.action,
        status: record.status,
      }));
      setRecords(formattedRecords);
    } catch (error) {
      console.error("خطأ في تحميل سجلات الاستقبال:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل سجلات الاستقبال",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);

  // تفعيل زر رفع الملف
  const triggerFileUpload = () => {
    const fileInput = document.getElementById('excel-file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  // تصدير البيانات إلى Excel
  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');

      // تحضير البيانات للتصدير
      const exportData = records.map((record, index) => ({
        'ت': index + 1,
        'التاريخ': record.date,
        'اسم العميل': record.customerName,
        'رقم الجوال': record.phoneNumber,
        'المشروع': record.project,
        'الموظف المختص': record.employee,
        'طريقة التواصل': record.contactMethod,
        'نوع الطلب': record.type,
        'طلب العميل': record.customerRequest,
        'الإجراء المتخذ': record.action,
        'الحالة': record.status,
        'المنشئ': record.createdBy,
        'تاريخ الإنشاء': record.createdAt ? new Date(record.createdAt).toISOString().split('T')[0] : ''
      }));

      // إنشاء ورقة العمل
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'سجلات الاستقبال');

      // تصدير الملف
      const fileName = `سجلات_الاستقبال_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "تم التصدير",
        description: `تم تصدير ${records.length} سجل إلى ملف Excel بنجاح`
      });
    } catch (error) {
      console.error("خطأ في تصدير Excel:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تصدير البيانات"
      });
    }
  };

  // تفعيل زر الاستيراد الكامل
  const triggerFullImportUpload = () => {
    const fileInput = document.getElementById('excel-full-import-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  // معالجة رفع ملف Excel
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف Excel صالح (.xlsx أو .xls)",
        variant: "destructive",
      });
      return;
    }

    if (!user?.username) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // قراءة الملف
      const data = await file.arrayBuffer();
      const workbook = await import('xlsx').then(XLSX => XLSX.read(data, { type: 'array' }));

      // الحصول على أول ورقة عمل
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = await import('xlsx').then(XLSX => XLSX.utils.sheet_to_json(worksheet, { header: 1 }));

      if (jsonData.length < 2) {
        toast({
          title: "خطأ",
          description: "الملف فارغ أو لا يحتوي على بيانات صالحة",
          variant: "destructive",
        });
        return;
      }

      // تحويل البيانات إلى سجلات استقبال
      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as any[][];

      const newRecords: any[] = [];
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        try {
          // تحديد الحقول المطلوبة (يمكن تعديلها حسب تنسيق Excel المتوقع)
          const recordData = {
            date: row[0] ? new Date(row[0]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            customerName: row[1] || `عميل ${i + 1}`,
            phoneNumber: row[2] || "",
            project: row[3] || "مشروع افتراضي",
            employee: row[4] || user.username,
            contactMethod: row[5] || "اتصال هاتفي",
            type: row[6] || "استفسار",
            customerRequest: row[7] || "",
            action: row[8] || "",
            status: row[9] || "جديد",
            createdBy: user.username,
          };

          // التحقق من البيانات الأساسية
          if (!recordData.customerName || !recordData.phoneNumber) {
            errorCount++;
            continue;
          }

          // حفظ السجل في قاعدة البيانات
          await DataService.saveReceptionRecord(recordData);
          newRecords.push(recordData);
          successCount++;

        } catch (error) {
          console.error(`خطأ في معالجة السطر ${i + 1}:`, error);
          errorCount++;
        }
      }

      // تحديث قائمة السجلات
      await loadReceptionRecords();

      // إظهار نتيجة العملية
      toast({
        title: "تم الاستيراد",
        description: `تم استيراد ${successCount} سجل بنجاح${errorCount > 0 ? ` مع ${errorCount} خطأ` : ""}`,
      });

    } catch (error) {
      console.error("خطأ في معالجة ملف Excel:", error);
      toast({
        title: "خطأ",
        description: "فشل في معالجة ملف Excel",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // مسح اختيار الملف
      event.target.value = '';
    }
  };

  // معالجة الاستيراد الكامل للبيانات
  const handleFullImportUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast({
        title: "خطأ",
        description: "يرجى اختيار ملف Excel صالح (.xlsx أو .xls)",
        variant: "destructive",
      });
      return;
    }

    if (!user?.username) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    // تأكيد العملية
    const confirmImport = window.confirm(
      "سيتم استبدال جميع البيانات الموجودة بالبيانات من ملف Excel. هل أنت متأكد من المتابعة؟"
    );

    if (!confirmImport) {
      event.target.value = '';
      return;
    }

    setIsLoading(true);

    try {
      // قراءة الملف
      const data = await file.arrayBuffer();
      const workbook = await import('xlsx').then(XLSX => XLSX.read(data, { type: 'array' }));

      // الحصول على أول ورقة عمل
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = await import('xlsx').then(XLSX => XLSX.utils.sheet_to_json(worksheet, { header: 1 }));

      if (jsonData.length < 2) {
        toast({
          title: "خطأ",
          description: "الملف فارغ أو لا يحتوي على بيانات صالحة",
          variant: "destructive",
        });
        return;
      }

      // حذف جميع السجلات الموجودة أولاً
      for (const record of records) {
        await DataService.deleteReceptionRecord(record.id);
      }

      // تحويل البيانات إلى سجلات استقبال
      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as any[][];

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];

        try {
          // تحديد الحقول المطلوبة
          const recordData = {
            date: row[0] ? new Date(row[0]).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            customerName: row[1] || `عميل ${i + 1}`,
            phoneNumber: row[2] || "",
            project: row[3] || "مشروع افتراضي",
            employee: row[4] || user.username,
            contactMethod: row[5] || "اتصال هاتفي",
            type: row[6] || "استفسار",
            customerRequest: row[7] || "",
            action: row[8] || "",
            status: row[9] || "جديد",
            createdBy: user.username,
          };

          // التحقق من البيانات الأساسية
          if (!recordData.customerName || !recordData.phoneNumber) {
            errorCount++;
            continue;
          }

          // حفظ السجل في قاعدة البيانات
          await DataService.saveReceptionRecord(recordData);
          successCount++;

        } catch (error) {
          console.error(`خطأ في معالجة السطر ${i + 1}:`, error);
          errorCount++;
        }
      }

      // تحديث قائمة السجلات
      await loadReceptionRecords();

      // إظهار نتيجة العملية
      toast({
        title: "تم الاستيراد الكامل",
        description: `تم استيراد ${successCount} سجل بنجاح واستبدال جميع البيانات السابقة${errorCount > 0 ? ` مع ${errorCount} خطأ` : ""}`,
      });

    } catch (error) {
      console.error("خطأ في معالجة ملف Excel:", error);
      toast({
        title: "خطأ",
        description: "فشل في معالجة ملف Excel للاستيراد الكامل",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      // مسح اختيار الملف
      event.target.value = '';
    }
  };

  const filteredRecords = records.filter(record =>
    record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.phoneNumber.includes(searchTerm) ||
    record.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleEditRecord = (record: ReceptionRecord) => {
    setEditingRecord(record);
    setDate(record.date);
    setCustomerName(record.customerName);
    setPhoneNumber(record.phoneNumber);
    setProject(record.project);
    setEmployee(record.employee);
    setContactMethod(record.contactMethod);
    setType(record.type);
    setCustomerRequest(record.customerRequest);
    setAction(record.action);
    setStatus(record.status);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingRecord(null);
    setDate("");
    setCustomerName("");
    setPhoneNumber("");
    setProject("");
    setEmployee("");
    setContactMethod("");
    setType("");
    setCustomerRequest("");
    setAction("");
    setStatus("");
    setTransferToComplaints(false);
  };

  const handleCancelDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSaveRecord = async () => {
    if (!date || !customerName || !phoneNumber || !project || !employee || !contactMethod || !type) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      });
      return;
    }

    if (!user?.username) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    const recordData = {
      date,
      customerName,
      phoneNumber,
      project,
      employee,
      contactMethod,
      type,
      customerRequest,
      action,
      status: status || "جديد",
      createdBy: user.username,
      updatedBy: user.username,
    };

    try {
      setLoading(true);

      if (editingRecord) {
        await DataService.updateReceptionRecord(editingRecord.id, recordData);
        toast({
          title: "تم بنجاح",
          description: "تم تحديث السجل بنجاح",
        });
      } else {
          const newRecord = await DataService.saveReceptionRecord(recordData);
          if (transferToComplaints) {
            // تحويل سجل الاستقبال إلى شكوى
            const generateComplaintId = () => {
              return Math.floor(1000 + Math.random() * 9000).toString();
            };

            const complaintData = {
              id: generateComplaintId(),
              date: date,
              customerName: customerName,
              project: project,
              unitNumber: phoneNumber, // نستخدم رقم الهاتف كرقم الوحدة أو يمكن تركه فارغ
              source: "الاستقبال",
              status: "جديدة",
              description: `تم تحويل الطلب من الاستقبال - نوع الطلب: ${type}\nطلب العميل: ${customerRequest}`,
              action: action || "",
              duration: 0,
              createdBy: user.username,
              createdAt: new Date().toISOString(),
              updatedBy: null,
              updatedAt: null,
              updates: [],
            };

            // حفظ الشكوى في قاعدة البيانات
            await DataService.saveComplaint(complaintData);

             // تحديث حالة سجل الاستقبال إلى "تم التحويل"
            await DataService.updateReceptionRecord(newRecord.id, {
              ...newRecord,
              status: "تم التحويل للشكاوى",
              action: `${action || ""}\n\nتم تحويل الطلب إلى شكوى رقم: ${complaintData.id}`,
            });

            toast({
              title: "تم التحويل بنجاح",
              description: `تم حفظ الطلب وتحويله إلى شكوى رقم ${complaintData.id}`,
            });
          }
          toast({
            title: "تم بنجاح",
            description: "تم إضافة السجل بنجاح",
          });
      }

      await loadReceptionRecords();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("خطأ في حفظ السجل:", error);
      toast({
        title: "خطأ",
        description: "فشل في حفظ السجل",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (id: string) => {
    try {
      setLoading(true);
      await DataService.deleteReceptionRecord(id);
      await loadReceptionRecords();
      toast({
        title: "تم بنجاح",
        description: "تم حذف السجل بنجاح",
      });
    } catch (error) {
      console.error("خطأ في حذف السجل:", error);
      toast({
        title: "خطأ",
        description: "فشل في حذف السجل",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // وظائف التحديد الجماعي
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems(new Set());
      setSelectAll(false);
    } else {
      const allIds = filteredRecords.map(record => record.id);
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
    setSelectAll(newSelected.size === filteredRecords.length);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "لم يتم تحديد أي عناصر للحذف"
      });
      return;
    }

    const confirmDelete = window.confirm(
      `هل أنت متأكد من حذف ${selectedItems.size} سجل؟ لا يمكن التراجع عن هذا الإجراء.`
    );

    if (!confirmDelete) return;

    setLoading(true);
    try {
      const idsToDelete = Array.from(selectedItems);
      for (const id of idsToDelete) {
        await DataService.deleteReceptionRecord(id);
      }

      toast({
        title: "تم الحذف بنجاح",
        description: `تم حذف ${selectedItems.size} سجل`
      });

      setSelectedItems(new Set());
      setSelectAll(false);
      await loadReceptionRecords();
    } catch (error) {
      console.error("خطأ في الحذف الجماعي:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "حدث خطأ أثناء الحذف الجماعي"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConvertToComplaint = async (record: ReceptionRecord) => {
    if (!user?.username) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // تحويل سجل الاستقبال إلى شكوى
      const generateComplaintId = () => {
        return Math.floor(1000 + Math.random() * 9000).toString();
      };

      const complaintData = {
        id: generateComplaintId(),
        date: record.date,
        customerName: record.customerName,
        project: record.project,
        unitNumber: record.phoneNumber, // نستخدم رقم الهاتف كرقم الوحدة أو يمكن تركه فارغ
        source: "الاستقبال",
        status: "جديدة",
        description: `تم تحويل الطلب من الاستقبال - نوع الطلب: ${record.type}\nطلب العميل: ${record.customerRequest}`,
        action: record.action || "",
        duration: 0,
        createdBy: user.username,
        createdAt: new Date().toISOString(),
        updatedBy: null,
        updatedAt: null,
        updates: [],
      };

      // حفظ الشكوى في قاعدة البيانات
      await DataService.saveComplaint(complaintData);

      // تحديث حالة سجل الاستقبال إلى "تم التحويل"
      await DataService.updateReceptionRecord(record.id, {
        ...record,
        status: "تم التحويل للشكاوى",
        action: `${record.action || ""}\n\nتم تحويل الطلب إلى شكوى رقم: ${complaintData.id}`,
      });

      // إعادة تحميل البيانات
      await loadReceptionRecords();

      toast({
        title: "تم التحويل بنجاح",
        description: `تم تحويل الطلب إلى شكوى رقم ${complaintData.id}`,
      });

    } catch (error) {
      console.error("خطأ في تحويل الطلب إلى شكوى:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحويل الطلب إلى شكوى",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مكتمل":
        return "bg-green-100 text-green-800";
      case "قيد المعالجة":
        return "bg-yellow-100 text-yellow-800";
      case "مؤجل":
        return "bg-red-100 text-red-800";
      case "تم التحويل للشكاوى":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getContactMethodIcon = (method: string) => {
    switch (method) {
      case "اتصال هاتفي":
        return <Phone className="h-4 w-4" />;
      case "بريد إلكتروني":
        return <Mail className="h-4 w-4" />;
      case "واتساب":
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">اتصالات خدمة العملاء</h1>
          <div className="flex flex-wrap items-center gap-2 sm:space-x-2 sm:space-x-reverse">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="excel-file-upload"
              disabled={isLoading}
            />
            <Button 
              variant="outline" 
              onClick={triggerFileUpload}
              disabled={isLoading}
              className="mobile-button"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isLoading ? "جاري التحميل..." : "رفع ملف Excel"}
            </Button>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFullImportUpload}
              className="hidden"
              id="excel-full-import-upload"
              disabled={isLoading}
            />
            <Button 
              variant="outline" 
              onClick={triggerFullImportUpload}
              disabled={isLoading}
              className="mobile-button"
            >
              <Upload className="h-4 w-4 mr-2" />
              {isLoading ? "جاري الاستيراد..." : "استيراد البيانات"}
            </Button>
             <Button onClick={exportToExcel} variant="secondary" className="mobile-button">
              <Download className="h-4 w-4 mr-2" />
              تصدير Excel
            </Button>

            {/* أزرار التحديد الجماعي */}
            {filteredRecords.length > 0 && (
              <>
                <Button 
                  variant="outline"
                  onClick={handleSelectAll}
                  disabled={loading}
                  className="mobile-button"
                >
                  <CheckCircle className="ml-2 h-4 w-4" />
                  {selectAll ? "إلغاء تحديد الكل" : "تحديد الكل"}
                </Button>
                
                {selectedItems.size > 0 && (
                  <Button 
                    variant="destructive"
                    onClick={handleBulkDelete}
                    disabled={loading}
                    className="mobile-button"
                  >
                    <Trash2 className="ml-2 h-4 w-4" />
                    حذف المحدد ({selectedItems.size})
                  </Button>
                )}
              </>
            )}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="mobile-button">
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة عميل جديد
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingRecord ? "تعديل سجل الاستقبال" : "إضافة سجل استقبال جديد"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">التاريخ</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="customerName">اسم العميل</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="اسم العميل"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">رقم الجوال</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="رقم الجوال"
                  />
                </div>
                <div>
                  <Label htmlFor="project">المشروع</Label>
                  <Input
                    id="project"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    placeholder="اسم المشروع"
                  />
                </div>
                <div>
                  <Label htmlFor="employee">الموظف</Label>
                  <Input
                    id="employee"
                    value={employee}
                    onChange={(e) => setEmployee(e.target.value)}
                    placeholder="اسم الموظف"
                  />
                </div>
                <div>
                  <Label htmlFor="contactMethod">طريقة التواصل</Label>
                  <Select value={contactMethod} onValueChange={(value) => setContactMethod(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر طريقة التواصل" />
                    </SelectTrigger>
                    <SelectContent>
                      {contactMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type">النوع</Label>
                  <Select value={type} onValueChange={(value) => setType(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع الطلب" />
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">الحالة</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="customerRequest">طلب العميل</Label>
                  <Textarea
                    id="customerRequest"
                    value={customerRequest}
                    onChange={(e) => setCustomerRequest(e.target.value)}
                    placeholder="تفاصيل طلب العميل"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="action">الإجراء</Label>
                  <Textarea
                    id="action"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="الإجراء المتخذ"
                    rows={3}
                  />
                </div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox 
                      id="transferToComplaints"
                      checked={transferToComplaints}
                      onCheckedChange={(checked) => setTransferToComplaints(checked)}
                    />
                    <Label htmlFor="transferToComplaints" className="text-sm font-medium">
                      تحويل هذا الطلب إلى صفحة الشكاوى
                    </Label>
                  </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleCancelDialog}>
                  إلغاء
                </Button>
                <Button onClick={handleSaveRecord} disabled={loading}>
                  {transferToComplaints ? "حفظ وتحويل للشكاوى" : "حفظ"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">إجمالي السجلات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{records.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">قيد المعالجة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {records.filter(r => r.status === "قيد المعالجة").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">مكتمل</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {records.filter(r => r.status === "مكتمل").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">محول للشكاوى</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {records.filter(r => r.status === "تم التحويل للشكاوى").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>سجلات الاستقبال</CardTitle>
              <div className="relative w-64">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="البحث في السجلات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={selectAll}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>رقم الجوال</TableHead>
                    <TableHead>المشروع</TableHead>
                    <TableHead>الموظف</TableHead>
                    <TableHead>طريقة التواصل</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>طلب العميل</TableHead>
                    <TableHead>الإجراء</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-right">العمليات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedItems.has(record.id)}
                          onCheckedChange={() => handleItemSelect(record.id)}
                        />
                      </TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell className="font-medium">{record.customerName}</TableCell>
                      <TableCell>{record.phoneNumber}</TableCell>
                      <TableCell>{record.project}</TableCell>
                      <TableCell>{record.employee}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getContactMethodIcon(record.contactMethod)}
                          <span className="text-sm">{record.contactMethod}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={record.customerRequest}>
                          {record.customerRequest}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={record.action}>
                          {record.action}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          {record.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditRecord(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {record.status !== "تم التحويل للشكاوى" && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleConvertToComplaint(record)}
                              title="تحويل إلى شكوى"
                            >
                              <ArrowRight className="h-4 w-4 text-blue-600" />
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteRecord(record.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredRecords.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا توجد سجلات تطابق البحث
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}