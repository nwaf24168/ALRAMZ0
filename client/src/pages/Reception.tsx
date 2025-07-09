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
  creatorName: string;
}

const contactMethods = ["اتصال هاتفي", "بريد إلكتروني", "واتساب", "زيارة شخصية"];
const types = ["شكوى", "استفسار", "طلب خدمة", "متابعة", "اهتمام"];
const statuses = ["جديدة", "قائمة", "تمت"];

export default function Reception() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReceptionRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [records, setRecords] = useState<ReceptionRecord[]>([]);
  const [transferToComplaints, setTransferToComplaints] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ReceptionRecord | null>(null);

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
        creatorName: record.creator_name || record.created_by || 'غير محدد',
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

      // تحضير البيانات للتصدير بنفس ترتيب الحقول في النموذج
      const exportData = records.map((record) => ({
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
        'المنشئ': record.creatorName
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
      const workbook = await import('xlsx').then(XLSX => XLSX.read(data, { type: 'array', cellDates: true }));

      // الحصول على أول ورقة عمل
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = await import('xlsx').then(XLSX => XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, dateNF: 'yyyy-mm-dd' }));

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

      // إزالة حد 1000 عميل - يمكن الآن معالجة أي عدد من السجلات
      const batchSize = 100; // تقليل حجم الدفعة لضمان الاستقرار
      const totalRows = rows.length;

      console.log(`بدء معالجة ${totalRows} سجل من ملف Excel`);

      // تقسيم الصفوف إلى دفعات
      const batches = [];
      for (let i = 0; i < totalRows; i += batchSize) {
        batches.push(rows.slice(i, i + batchSize));
      }

      let successCount = 0;
      let errorCount = 0;

      // معالجة كل دفعة
        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];
          const startIndex = batchIndex * batchSize;

          // إظهار تقدم المعالجة
          toast({
            title: "جاري المعالجة",
            description: `معالجة الدفعة ${batchIndex + 1} من ${batches.length} (السجلات ${startIndex + 1}-${Math.min(startIndex + batchSize, totalRows)})`,
          });

          const batchRecords = [];

          for (let i = 0; i < batch.length; i++) {
            const row = batch[i];
            const globalIndex = startIndex + i;

            try {
              // معالجة التاريخ بعناية أكبر
              let dateValue = row[0];
              let formattedDate = new Date().toISOString().split('T')[0];

              if (dateValue) {
                // إذا كان التاريخ من Excel
                if (typeof dateValue === 'number') {
                  // Excel date serial number
                  const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
                  formattedDate = excelDate.toISOString().split('T')[0];
                } else if (typeof dateValue === 'string') {
                  // نص التاريخ
                  const parsedDate = new Date(dateValue);
                  if (!isNaN(parsedDate.getTime())) {
                    formattedDate = parsedDate.toISOString().split('T')[0];
                  }
                } else if (dateValue instanceof Date) {
                  // كائن التاريخ
                  formattedDate = dateValue.toISOString().split('T')[0];
                }
              }

              // تطابق الأعمدة مع التصدير والنموذج بالضبط
              const recordData = {
                date: formattedDate,                                    // 0: التاريخ
                customerName: String(row[1] || '').trim(),             // 1: اسم العميل
                phoneNumber: String(row[2] || '').trim(),              // 2: رقم الجوال
                project: String(row[3] || '').trim(),                  // 3: المشروع
                employee: String(row[4] || user.username).trim(),      // 4: الموظف المختص
                contactMethod: String(row[5] || 'اتصال هاتفي').trim(), // 5: طريقة التواصل
                type: String(row[6] || 'استفسار').trim(),              // 6: نوع الطلب
                customerRequest: String(row[7] || '').trim(),          // 7: طلب العميل
                action: String(row[8] || '').trim(),                   // 8: الإجراء المتخذ
                status: String(row[9] || 'جديد').trim(),               // 9: الحالة
                creatorName: String(row[10] || user.username).trim(),  // 10: المنشئ
                createdBy: user.username,
              };

              // التحقق من البيانات الأساسية
              if (!recordData.customerName || !recordData.phoneNumber) {
                console.warn(`تخطي السطر ${globalIndex + 1}: بيانات ناقصة`);
                errorCount++;
                continue;
              }

              // التحقق من صحة طريقة التواصل
              if (!contactMethods.includes(recordData.contactMethod)) {
                recordData.contactMethod = 'اتصال هاتفي';
              }

              // التحقق من صحة نوع الطلب
              if (!types.includes(recordData.type)) {
                recordData.type = 'استفسار';
              }

              // التحقق من صحة الحالة
              if (!statuses.includes(recordData.status)) {
                recordData.status = 'جديد';
              }

              batchRecords.push(recordData);

            } catch (error) {
              console.error(`خطأ في معالجة السطر ${globalIndex + 1}:`, error);
              errorCount++;
            }
          }

          // حفظ الدفعة كاملة في قاعدة البيانات
          if (batchRecords.length > 0) {
            try {
              await DataService.saveReceptionRecordsBatch(batchRecords);
              successCount += batchRecords.length;
              console.log(`تم حفظ ${batchRecords.length} سجل في الدفعة ${batchIndex + 1}`);
            } catch (error) {
              console.error(`خطأ في حفظ الدفعة ${batchIndex + 1}:`, error);
              // محاولة حفظ السجلات واحداً تلو الآخر في حالة فشل الدفعة
              for (const record of batchRecords) {
                try {
                  await DataService.saveReceptionRecord(record);
                  successCount++;
                } catch (recordError) {
                  console.error(`خطأ في حفظ سجل فردي:`, recordError);
                  errorCount++;
                }
              }
            }
          }

          // إضافة تأخير قصير بين الدفعات لتجنب إرهاق الخادم
          if (batchIndex < batches.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }

      // تحديث قائمة السجلات
      console.log(`إجمالي السجلات المحفوظة: ${successCount}, الأخطاء: ${errorCount}`);
      await loadReceptionRecords();

      // إظهار نتيجة العملية
      toast({
        title: "تم الاستيراد",
        description: `تم استيراد ${successCount} سجل بنجاح${errorCount > 0 ? ` مع ${errorCount} خطأ` : ""} من إجمالي ${totalRows} سجل`,
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
      status: status || "جديدة",
      createdBy: user.username,
      updatedBy: user.username,
      creatorName: user.username,
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

             // تحديث حالة سجل الاستقبال إلى "تمت"
            await DataService.updateReceptionRecord(newRecord.id, {
              ...newRecord,
              status: "تمت",
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

  const handleViewDetails = (record: ReceptionRecord) => {
    setSelectedRecord(record);
    setIsDetailsDialogOpen(true);
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

      // تحديث حالة سجل الاستقبال إلى "تمت"
      await DataService.updateReceptionRecord(record.id, {
        ...record,
        status: "تمت",
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
      case "تمت":
        return "bg-green-100 text-green-800";
      case "قائمة":
        return "bg-yellow-100 text-yellow-800";
      case "جديدة":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
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
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">سجلات خدمة العملاء</h1>
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
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900 dark:bg-gray-950 text-white border-gray-700 [&>*]:text-white">
              <DialogHeader>
                <DialogTitle className="text-white">{editingRecord ? "تعديل سجل خدمة العملاء" : "إضافة سجل خدمة عملاء جديد"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date" className="text-gray-200 font-medium">التاريخ</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="bg-gray-800 dark:bg-gray-900 border-gray-600 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="customerName" className="text-gray-200 font-medium">اسم العميل</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="اسم العميل"
                    className="bg-gray-800 dark:bg-gray-900 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber" className="text-gray-200 font-medium">رقم الجوال</Label>
                  <Input
                    id="phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="رقم الجوال"
                    className="bg-gray-800 dark:bg-gray-900 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="project" className="text-gray-200 font-medium">المشروع</Label>
                  <Input
                    id="project"
                    value={project}
                    onChange={(e) => setProject(e.target.value)}
                    placeholder="اسم المشروع"
                    className="bg-gray-800 dark:bg-gray-900 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="employee" className="text-gray-200 font-medium">الموظف</Label>
                  <Input
                    id="employee"
                    value={employee}
                    onChange={(e) => setEmployee(e.target.value)}
                    placeholder="اسم الموظف"
                    className="bg-gray-800 dark:bg-gray-900 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div>
                  <Label htmlFor="contactMethod" className="text-gray-200 font-medium">طريقة التواصل</Label>
                  <Select value={contactMethod} onValueChange={(value) => setContactMethod(value)}>
                    <SelectTrigger className="bg-gray-800 dark:bg-gray-900 border-gray-600 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400">
                      <SelectValue placeholder="اختر طريقة التواصل" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 dark:bg-gray-900 border-gray-600">
                      {contactMethods.map((method) => (
                        <SelectItem key={method} value={method} className="text-white hover:bg-gray-600 focus:bg-gray-600">
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="type" className="text-gray-200 font-medium">النوع</Label>
                  <Select value={type} onValueChange={(value) => setType(value)}>
                    <SelectTrigger className="bg-gray-800 dark:bg-gray-900 border-gray-600 text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400">
                      <SelectValue placeholder="اختر نوع الطلب" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 dark:bg-gray-900 border-gray-600">
                      {types.map((type) => (
                        <SelectItem key={type} value={type} className="text-white hover:bg-gray-600 focus:bg-gray-600">
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status" className="text-gray-200 font-medium">الحالة</Label>
                  <Select value={status} onValueChange={(value) => setStatus(value)}>
                    <SelectTrigger className="bg-gray-800 dark:bg-gray-900 border-gray-600text-white focus:border-blue-400 focus:ring-1 focus:ring-blue-400">
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 dark:bg-gray-900 border-gray-600">
                      {statuses.map((status) => (
                        <SelectItem key={status} value={status} className="text-white hover:bg-gray-600 focus:bg-gray-600">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="customerRequest" className="text-gray-200 font-medium">طلب العميل</Label>
                  <Textarea
                    id="customerRequest"
                    value={customerRequest}
                    onChange={(e) => setCustomerRequest(e.target.value)}
                    placeholder="تفاصيل طلب العميل"
                    rows={3}
                    className="bg-gray-800 dark:bg-gray-900 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="action" className="text-gray-200 font-medium">الإجراء</Label>
                  <Textarea
                    id="action"
                    value={action}
                    onChange={(e) => setAction(e.target.value)}
                    placeholder="الإجراء المتخذ"
                    rows={3}
                    className="bg-gray-800 dark:bg-gray-900 border-gray-600 text-white placeholder:text-gray-400 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                </div>
                  <div className="flex items-center space-x-2 mb-4">
                    <Checkbox 
                      id="transferToComplaints"
                      checked={transferToComplaints}
                      onCheckedChange={(checked) => setTransferToComplaints(checked)}
                    />
                    <Label htmlFor="transferToComplaints" className="text-sm font-medium text-gray-200">
                      تحويل هذا الطلب إلى صفحة الشكاوى
                    </Label>
                  </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleCancelDialog} className="border-gray-500 text-gray-300 hover:bg-gray-700 hover:text-white bg-transparent">
                  إلغاء
                </Button>
                <Button onClick={handleSaveRecord} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50">
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
              <CardTitle className="text-sm font-medium">قائمة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {records.filter(r => r.status === "قائمة").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">تمت</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {records.filter(r => r.status === "تمت").length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">جديدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {records.filter(r => r.status === "جديدة").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between"><CardTitle>سجلات خدمة العملاء</CardTitle>
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
                    <TableHead>المنشئ</TableHead>
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
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{record.creatorName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(record)} title="عرض التفاصيل">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditRecord(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {record.status !== "تمت" && (
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

      {/* نافذة تفاصيل العميل */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card text-card-foreground border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              تفاصيل عميل خدمة العملاء
            </DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* معلومات العميل الأساسية */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-blue-600" />
                    معلومات العميل
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">اسم العميل</Label>
                      <p className="text-lg font-semibold">{selectedRecord.customerName}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">رقم الجوال</Label>
                      <p className="text-lg font-semibold flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {selectedRecord.phoneNumber}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">المشروع</Label>
                      <p className="text-lg">{selectedRecord.project}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">الموظف المختص</Label>
                      <p className="text-lg">{selectedRecord.employee}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">طريقة التواصل</Label>
                      <div className="flex items-center gap-2">
                        {getContactMethodIcon(selectedRecord.contactMethod)}
                        <span>{selectedRecord.contactMethod}</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">نوع الطلب</Label>
                      <Badge variant="outline" className="text-sm">
                        {selectedRecord.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* تفاصيل الطلب */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <FileText className="h-5 w-5 text-green-600" />
                    تفاصيل الطلب
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">طلب العميل</Label>
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded border text-gray-900 dark:text-gray-100 min-h-[80px]">
                        {selectedRecord.customerRequest || "لا توجد تفاصيل"}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">الإجراء المتخذ</Label>
                      <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded border text-gray-900 dark:text-gray-100 min-h-[80px]">
                        {selectedRecord.action || "لم يتم اتخاذ إجراء بعد"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* معلومات النظام */}
              <div className="space-y-6">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-blue-600" />
                    معلومات النظام
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">التاريخ</Label>
                      <p className="text-sm font-mono">{selectedRecord.date}</p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">الحالة</Label>
                      <Badge className={getStatusColor(selectedRecord.status)}>
                        {selectedRecord.status}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-medium text-gray-600 dark:text-gray-400">تم الإنشاء بواسطة</Label>
                      <p className="text-sm flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {selectedRecord.creatorName || "غير محدد"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* إحصائيات سريعة */}
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-green-600" />
                    معلومات إضافية
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">رقم السجل</span>
                      <span className="text-sm font-mono">{selectedRecord.id}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">مدة المعالجة</span>
                      <span className="text-sm">
                        {(() => {
                          const createdDate = new Date(selectedRecord.date);
                          const now = new Date();
                          const diffTime = Math.abs(now.getTime() - createdDate.getTime());
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          return `${diffDays} يوم`;
                        })()}
                      </span>
                    </div>
                    {selectedRecord.action && selectedRecord.action.includes("تم تحويل الطلب إلى شكوى") && (
                      <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded text-sm">
                        <span className="text-purple-700 dark:text-purple-300">
                          تم تحويل هذا الطلب إلى نظام الشكاوى
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)}>
              إغلاق
            </Button>
            {selectedRecord && (
              <Button onClick={() => {
                setIsDetailsDialogOpen(false);
                handleEditRecord(selectedRecord);
              }}>
                تعديل السجل
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}