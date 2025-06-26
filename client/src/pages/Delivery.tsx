import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Eye, Calendar, User, Building, CreditCard, CheckCircle, Trash2, BarChart3, TrendingUp, Upload, Download, FileSpreadsheet } from "lucide-react";
import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/dataService";

interface DeliveryBooking {
  id?: number;
  // مرحلة المبيعات
  booking_date?: string;
  customer_name: string;
  customer_phone?: string;
  project?: string;
  building?: string;
  unit?: string;
  payment_method?: string;
  sale_type?: string;
  unit_value?: number;
  handover_date?: string;
  sales_employee?: string;
  sales_completed?: boolean;

  // مرحلة إدارة المشاريع
  construction_completion_date?: string;
  final_handover_date?: string;
  electricity_meter_transfer_date?: string;
  water_meter_transfer_date?: string;
  customer_delivery_date?: string;
  project_notes?: string;
  projects_completed?: boolean;

  // مرحلة راحة العملاء
  customer_evaluation_done?: boolean;
  evaluation_percentage?: number;
  customer_service_completed?: boolean;

  status?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export default function Delivery() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<DeliveryBooking[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<DeliveryBooking | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [activeTab, setActiveTab] = useState("sales");
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const [formData, setFormData] = useState<DeliveryBooking>({
    customer_name: "",
    customer_phone: "",
    project: "",
    building: "",
    unit: "",
    payment_method: "",
    sale_type: "",
    unit_value: 0,
    sales_employee: user?.username || "",
    sales_completed: false,
    projects_completed: false,
    customer_evaluation_done: false,
    customer_service_completed: false,
    evaluation_percentage: 0
  });

  useEffect(() => {
    loadBookings();
    // إعداد تحديث دوري للبيانات كل 30 ثانية
    const interval = setInterval(() => {
      loadBookings();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await DataService.getDeliveryBookings();
      console.log("تم تحميل حجوزات التسليم من قاعدة البيانات:", data.length);
      setBookings(data);
    } catch (error) {
      console.error("خطأ في تحميل الحجوزات:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحميل بيانات الحجوزات"
      });
    } finally {
      setLoading(false);
    }
  };

  // تحديد الحالة بناءً على المراحل المكتملة
  const getBookingStatus = (booking: DeliveryBooking): string => {
    if (booking.customer_service_completed) {
      return "مكتمل";
    } else if (booking.projects_completed) {
      return "في راحة العملاء";
    } else if (booking.sales_completed) {
      return "في إدارة المشاريع";
    } else {
      return "في المبيعات";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      // تحديث المرحلة والحالة بناءً على البيانات
      const dataToSave = {
        ...formData,
        created_by: formData.created_by || user?.username,
        status: getBookingStatus(formData)
      };

      if (selectedBooking?.id) {
        await DataService.updateDeliveryBooking(selectedBooking.id, dataToSave);
        toast({
          title: "تم التحديث",
          description: "تم تحديث بيانات الحجز بنجاح"
        });
      } else {
        await DataService.createDeliveryBooking(dataToSave);
        toast({
          title: "تم الحفظ",
          description: "تم إضافة الحجز الجديد بنجاح"
        });
      }

      await loadBookings();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("خطأ في حفظ الحجز:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في حفظ بيانات الحجز"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: "",
      customer_phone: "",
      project: "",
      building: "",
      unit: "",
      payment_method: "",
      sale_type: "",
      unit_value: 0,
      sales_employee: user?.username || "",
      sales_completed: false,
      projects_completed: false,
      customer_evaluation_done: false,
      customer_service_completed: false,
      evaluation_percentage: 0
    });
    setSelectedBooking(null);
    setIsViewMode(false);
    setActiveTab("sales");
  };

  const handleEdit = (booking: DeliveryBooking) => {
    setSelectedBooking(booking);
    setFormData({ ...booking });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleView = (booking: DeliveryBooking) => {
    setSelectedBooking(booking);
    setFormData({ ...booking });
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const handleDelete = async (bookingId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحجز؟")) return;

    try {
      setLoading(true);
      await DataService.deleteDeliveryBooking(bookingId);
      toast({
        title: "تم الحذف",
        description: "تم حذف الحجز بنجاح"
      });
      await loadBookings();
    } catch (error) {
      console.error("خطأ في حذف الحجز:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في حذف الحجز"
      });
    } finally {
      setLoading(false);
    }
  };

  // تصدير البيانات إلى Excel
  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');

      // تحضير البيانات للتصدير
      const exportData = bookings.map((booking, index) => ({
        'ت': index + 1,
        'تاريخ الحجز': booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('ar-SA') : '',
        'اسم العميل': booking.customer_name || '',
        'رقم العميل': booking.customer_phone || '',
        'المشروع': booking.project || '',
        'العمارة': booking.building || '',
        'الوحدة': booking.unit || '',
        'طريقة الدفع': booking.payment_method || '',
        'نوع البيع': booking.sale_type || '',
        'قيمة الوحدة': booking.unit_value || 0,
        'تاريخ الإفراغ': booking.handover_date ? new Date(booking.handover_date).toLocaleDateString('ar-SA') : '',
        'موظف المبيعات': booking.sales_employee || '',
        'مكتملة - المبيعات': booking.sales_completed ? 'نعم' : 'لا',
        'تاريخ انتهاء البناء': booking.construction_completion_date ? new Date(booking.construction_completion_date).toLocaleDateString('ar-SA') : '',
        'تاريخ الاستلام النهائي': booking.final_handover_date ? new Date(booking.final_handover_date).toLocaleDateString('ar-SA') : '',
        'تاريخ نقل عداد الكهرباء': booking.electricity_meter_transfer_date ? new Date(booking.electricity_meter_transfer_date).toLocaleDateString('ar-SA') : '',
        'تاريخ نقل عداد الماء': booking.water_meter_transfer_date ? new Date(booking.water_meter_transfer_date).toLocaleDateString('ar-SA') : '',
        'تاريخ التسليم للعميل': booking.customer_delivery_date ? new Date(booking.customer_delivery_date).toLocaleDateString('ar-SA') : '',
        'ملاحظات المشروع': booking.project_notes || '',
        'مكتملة - المشاريع': booking.projects_completed ? 'نعم' : 'لا',
        'تم التقييم': booking.customer_evaluation_done ? 'نعم' : 'لا',
        'نسبة التقييم': booking.evaluation_percentage || 0,
        'مكتملة - راحة العملاء': booking.customer_service_completed ? 'نعم' : 'لا',
        'الحالة': getBookingStatus(booking),
        'تاريخ الإنشاء': booking.created_at ? new Date(booking.created_at).toLocaleDateString('ar-SA') : '',
        'المنشئ': booking.created_by || ''
      }));

      // إنشاء ورقة العمل
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'حجوزات التسليم');

      // تصدير الملف
      const fileName = `حجوزات_التسليم_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "تم التصدير",
        description: `تم تصدير ${bookings.length} حجز إلى ملف Excel بنجاح`
      });
    } catch (error) {
      console.error("خطأ في تصدير Excel:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تصدير البيانات إلى Excel"
      });
    }
  };

  // استيراد البيانات من Excel
  const handleExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى اختيار ملف Excel صالح (.xlsx أو .xls)"
      });
      return;
    }

    if (!user?.username) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً"
      });
      return;
    }

    setLoading(true);

    try {
      const XLSX = await import('xlsx');

      // قراءة الملف
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      // الحصول على أول ورقة عمل
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (jsonData.length < 2) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "الملف فارغ أو لا يحتوي على بيانات صالحة"
        });
        return;
      }

      // معالجة البيانات
      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];

        // التحقق من وجود البيانات الأساسية
        if (!row[1]) { // اسم العميل
          errorCount++;
          continue;
        }

        try {
          const bookingData: DeliveryBooking = {
            booking_date: row[0] ? new Date(row[0]).toISOString().split('T')[0] : undefined,
            customer_name: row[1] || '',
            customer_phone: row[2] || '',
            project: row[3] || '',
            building: row[4] || '',
            unit: row[5] || '',
            payment_method: row[6] || '',
            sale_type: row[7] || '',
            unit_value: parseFloat(row[8]) || 0,
            handover_date: row[9] ? new Date(row[9]).toISOString().split('T')[0] : undefined,
            projects_completed: row[10] === 'نعم',
            sales_employee: row[11] || user.username,
            sales_completed: row[12] === 'نعم',
            construction_completion_date: row[13] ? new Date(row[13]).toISOString().split('T')[0] : undefined,
            final_handover_date: row[14] ? new Date(row[14]).toISOString().split('T')[0] : undefined,
            electricity_meter_transfer_date: row[15] ? new Date(row[15]).toISOString().split('T')[0] : undefined,
            water_meter_transfer_date: row[16] ? new Date(row[16]).toISOString().split('T')[0] : undefined,
            customer_delivery_date: row[17] ? new Date(row[17]).toISOString().split('T')[0] : undefined,
            project_notes: row[18] || '',
            customer_evaluation_done: row[19] === 'نعم',
            evaluation_percentage: parseFloat(row[20]) || 0,
            customer_service_completed: row[19] === 'نعم' && row[20] > 0,
            created_by: user.username
          };

          // تحديد الحالة
          bookingData.status = getBookingStatus(bookingData);

          await DataService.createDeliveryBooking(bookingData);
          successCount++;
        } catch (error) {
          console.error(`خطأ في معالجة السطر ${i + 1}:`, error);
          errorCount++;
        }
      }

      // تحديث قائمة الحجوزات
      await loadBookings();

      // إظهار نتيجة العملية
      toast({
        title: "تم الاستيراد",
        description: `تم استيراد ${successCount} حجز بنجاح${errorCount > 0 ? ` مع ${errorCount} خطأ` : ""}`
      });

    } catch (error) {
      console.error("خطأ في معالجة ملف Excel:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في معالجة ملف Excel"
      });
    } finally {
      setLoading(false);
      // مسح اختيار الملف
      event.target.value = '';
    }
  };

  // استيراد كامل مع استبدال البيانات
  const handleFullExcelImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى اختيار ملف Excel صالح (.xlsx أو .xls)"
      });
      return;
    }

    // تأكيد العملية
    const confirmImport = window.confirm(
      "سيتم حذف جميع الحجوزات الموجودة واستبدالها بالبيانات من ملف Excel. هل أنت متأكد من المتابعة؟"
    );

    if (!confirmImport) {
      event.target.value = '';
      return;
    }

    if (!user?.username) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً"
      });
      return;
    }

    setLoading(true);

    try {
      const XLSX = await import('xlsx');

      // قراءة الملف
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      // الحصول على أول ورقة عمل
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (jsonData.length < 2) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "الملف فارغ أو لا يحتوي على بيانات صالحة"
        });
        return;
      }

      // حذف جميع الحجوزات الموجودة أولاً
      for (const booking of bookings) {
        if (booking.id) {
          await DataService.deleteDeliveryBooking(booking.id);
        }
      }

      // معالجة البيانات الجديدة
      let successCount = 0;
      let errorCount = 0;

      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];

        // التحقق من وجود البيانات الأساسية
        if (!row[1]) { // اسم العميل
          errorCount++;
          continue;
        }

        try {
          const bookingData: DeliveryBooking = {
            booking_date: row[0] ? new Date(row[0]).toISOString().split('T')[0] : undefined,
            customer_name: row[1] || '',
            customer_phone: row[2] || '',
            project: row[3] || '',
            building: row[4] || '',
            unit: row[5] || '',
            payment_method: row[6] || '',
            sale_type: row[7] || '',
            unit_value: parseFloat(row[8]) || 0,
            handover_date: row[9] ? new Date(row[9]).toISOString().split('T')[0] : undefined,
            projects_completed: row[10] === 'نعم',
            sales_employee: row[11] || user.username,
            sales_completed: row[12] === 'نعم',
            construction_completion_date: row[13] ? new Date(row[13]).toISOString().split('T')[0] : undefined,
            final_handover_date: row[14] ? new Date(row[14]).toISOString().split('T')[0] : undefined,
            electricity_meter_transfer_date: row[15] ? new Date(row[15]).toISOString().split('T')[0] : undefined,
            water_meter_transfer_date: row[16] ? new Date(row[16]).toISOString().split('T')[0] : undefined,
            customer_delivery_date: row[17] ? new Date(row[17]).toISOString().split('T')[0] : undefined,
            project_notes: row[18] || '',
            customer_evaluation_done: row[19] === 'نعم',
            evaluation_percentage: parseFloat(row[20]) || 0,
            customer_service_completed: row[19] === 'نعم' && row[20] > 0,
            created_by: user.username
          };

          // تحديد الحالة
          bookingData.status = getBookingStatus(bookingData);

          await DataService.createDeliveryBooking(bookingData);
          successCount++;
        } catch (error) {
          console.error(`خطأ في معالجة السطر ${i + 1}:`, error);
          errorCount++;
        }
      }

      // تحديث قائمة الحجوزات
      await loadBookings();

      // إظهار نتيجة العملية
      toast({
        title: "تم الاستيراد الكامل",
        description: `تم استبدال البيانات بـ ${successCount} حجز جديد${errorCount > 0 ? ` مع ${errorCount} خطأ` : ""}`
      });

    } catch (error) {
      console.error("خطأ في معالجة ملف Excel:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في معالجة ملف Excel"
      });
    } finally {
      setLoading(false);
      // مسح اختيار الملف
      event.target.value = '';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "في المبيعات":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">في المبيعات</Badge>;
      case "في إدارة المشاريع":
        return <Badge variant="outline" className="bg-orange-100 text-orange-800">في إدارة المشاريع</Badge>;
      case "في راحة العملاء":
        return <Badge variant="default" className="bg-purple-100 text-purple-800">في راحة العملاء</Badge>;
      case "مكتمل":
        return <Badge variant="destructive" className="bg-green-100 text-green-800">مكتمل</Badge>;
      default:
        return <Badge>غير محدد</Badge>;
    }
  };

  const canEditStage = (stage: string) => {
    if (isViewMode) return false;

    switch (stage) {
      case "sales":
        return user?.role?.includes("مبيعات") || user?.role?.includes("مدير") || user?.permissions?.scope === "full";
      case "projects":
        return user?.role?.includes("مشاريع") || user?.role?.includes("مدير") || user?.permissions?.scope === "full";
      case "customer_service":
        return user?.role?.includes("راحة العملاء") || user?.role?.includes("مدير") || user?.permissions?.scope === "full";
      default:
        return false;
    }
  };

  // تصفية البيانات حسب الحالة
  const filteredBookings = filterStatus === "all" 
    ? bookings 
    : bookings.filter(booking => getBookingStatus(booking) === filterStatus);

  // إحصائيات سريعة
  const stats = {
    inSales: bookings.filter(b => getBookingStatus(b) === "في المبيعات").length,
    inProjects: bookings.filter(b => getBookingStatus(b) === "في إدارة المشاريع").length,
    inCustomerService: bookings.filter(b => getBookingStatus(b) === "في راحة العملاء").length,
    completed: bookings.filter(b => getBookingStatus(b) === "مكتمل").length,
    total: bookings.length
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">إدارة التسليم</h1>
            <p className="text-muted-foreground mt-1">
              إدارة مراحل التسليم الثلاث: المبيعات، إدارة المشاريع، راحة العملاء
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/delivery-analytics">
              <Button variant="outline">
                <BarChart3 className="ml-2 h-4 w-4" />
                تحليلات التسليم
              </Button>
            </Link>

            {/* أزرار Excel */}
            <Button 
              variant="outline" 
              onClick={exportToExcel}
              disabled={loading || bookings.length === 0}
            >
              <Download className="ml-2 h-4 w-4" />
              تصدير Excel
            </Button>

            <Button 
              variant="outline"
              onClick={() => document.getElementById('excel-import')?.click()}
              disabled={loading}
            >
              <Upload className="ml-2 h-4 w-4" />
              استيراد Excel
            </Button>

            <Button 
              variant="outline"
              onClick={() => document.getElementById('excel-full-import')?.click()}
              disabled={loading}
              className="text-orange-600 hover:text-orange-700"
            >
              <FileSpreadsheet className="ml-2 h-4 w-4" />
              استيراد كامل
            </Button>

            <Button 
              onClick={() => {
                resetForm();
                setIsDialogOpen(true);
              }}
              disabled={loading}
            >
              <Plus className="ml-2 h-4 w-4" />
              إضافة حجز جديد
            </Button>

            {/* حقول الملفات المخفية */}
            <input
              id="excel-import"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleExcelImport}
              style={{ display: 'none' }}
            />

            <input
              id="excel-full-import"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFullExcelImport}
              style={{ display: 'none' }}
            />
          </div>
        </div>

        {/* إحصائيات سريعة محسنة */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">في المبيعات</p>
                  <p className="text-2xl font-bold text-blue-900">{stats.inSales}</p>
                </div>
                <Building className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">في إدارة المشاريع</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.inProjects}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">في راحة العملاء</p>
                  <p className="text-2xl font-bold text-purple-900">{stats.inCustomerService}</p>
                </div>
                <User className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">مكتمل</p>
                  <p className="text-2xl font-bold text-green-900">{stats.completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">إجمالي الحجوزات</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-gray-600" />
              </div>
            </CardContent>
          </Card>
        </div>



        {/* فلتر الحالة */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Label htmlFor="status-filter">تصفية حسب الحالة:</Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحجوزات</SelectItem>
                <SelectItem value="في المبيعات">في المبيعات</SelectItem>
                <SelectItem value="في إدارة المشاريع">في إدارة المشاريع</SelectItem>
                <SelectItem value="في راحة العملاء">في راحة العملاء</SelectItem>
                <SelectItem value="مكتمل">مكتمل</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Badge variant="outline">
            {loading ? "جاري التحديث..." : `آخر تحديث: ${new Date().toLocaleTimeString('ar-SA')}`}
          </Badge>
        </div>

        {/* جدول الحجوزات */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الحجوزات ({filteredBookings.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>رقم العميل</TableHead>
                    <TableHead>المشروع</TableHead>
                    <TableHead>العمارة/الوحدة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الحجز</TableHead>
                    <TableHead>موظف المبيعات</TableHead>
                    <TableHead>المراحل</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.customer_name}</TableCell>
                      <TableCell>{booking.customer_phone || '-'}</TableCell>
                      <TableCell>{booking.project || '-'}</TableCell>
                      <TableCell>{`${booking.building || '-'} / ${booking.unit || '-'}`}</TableCell>
                      <TableCell>{getStatusBadge(getBookingStatus(booking))}</TableCell>
                      <TableCell>
                        {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('ar-SA') : '-'}
                      </TableCell>
                      <TableCell>{booking.sales_employee || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Badge variant={booking.sales_completed ? "default" : "secondary"} className="text-xs">
                            مبيعات
                          </Badge>
                          <Badge variant={booking.projects_completed ? "default" : "secondary"} className="text-xs">
                            مشاريع
                          </Badge>
                          <Badge variant={booking.customer_service_completed ? "default" : "secondary"} className="text-xs">
                            عملاء
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(booking)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(booking)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(booking.id!)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredBookings.length === 0 && (
<TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        {loading ? "جاري تحميل البيانات..." : "لا توجد حجوزات"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* نافذة الحوار للإضافة/التعديل */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl">
                {isViewMode ? "عرض" : selectedBooking ? "تعديل" : "إضافة"} حجز
                {selectedBooking && (
                  <span className="mr-2">
                    {getStatusBadge(getBookingStatus(selectedBooking))}
                  </span>
                )}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger 
                    value="sales"
                    className={formData.sales_completed ? "bg-green-100 text-green-800" : ""}
                  >
                    مرحلة المبيعات
                    {formData.sales_completed && <CheckCircle className="mr-1 h-4 w-4" />}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="projects"
                    className={formData.projects_completed ? "bg-green-100 text-green-800" : ""}
                    disabled={!canEditStage("projects") && !isViewMode}
                  >
                    إدارة المشاريع
                    {formData.projects_completed && <CheckCircle className="mr-1 h-4 w-4" />}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="customer_service"
                    className={formData.customer_service_completed ? "bg-green-100 text-green-800" : ""}
                    disabled={!canEditStage("customer_service") && !isViewMode}
                  >
                    راحة العملاء
                    {formData.customer_service_completed && <CheckCircle className="mr-1 h-4 w-4" />}
                  </TabsTrigger>
                </TabsList>

                {/* مرحلة المبيعات */}
                <TabsContent value="sales" className="space-y-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-semibold text-blue-800 mb-2">المرحلة الأولى: المبيعات</h3>
                    <p className="text-sm text-blue-600">يتم تعبئة هذه البيانات من قبل قسم المبيعات</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="booking_date">تاريخ الحجز *</Label>
                      <Input
                        id="booking_date"
                        type="date"
                        value={formData.booking_date || ""}
                        onChange={(e) => setFormData({...formData, booking_date: e.target.value})}
                        disabled={!canEditStage("sales")}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="customer_name">اسم العميل *</Label>
                      <Input
                        id="customer_name"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                        disabled={!canEditStage("sales")}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="customer_phone">رقم العميل</Label>
                      <Input
                        id="customer_phone"
                        value={formData.customer_phone || ""}
                        onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                        disabled={!canEditStage("sales")}
                        placeholder="05xxxxxxxx"
                      />
                    </div>

                    <div>
                      <Label htmlFor="project">المشروع</Label>
                      <Input
                        id="project"
                        value={formData.project || ""}
                        onChange={(e) => setFormData({...formData, project: e.target.value})}
                        disabled={!canEditStage("sales")}
                        placeholder="أدخل اسم المشروع"
                      />
                    </div>

                    <div>
                      <Label htmlFor="building">العمارة</Label>
                      <Input
                        id="building"
                        value={formData.building || ""}
                        onChange={(e) => setFormData({...formData, building: e.target.value})}
                        disabled={!canEditStage("sales")}
                        placeholder="رقم أو اسم العمارة"
                      />
                    </div>

                    <div>
                      <Label htmlFor="unit">الوحدة</Label>
                      <Input
                        id="unit"
                        value={formData.unit || ""}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        disabled={!canEditStage("sales")}
                        placeholder="رقم الوحدة"
                      />
                    </div>

                    <div>
                      <Label htmlFor="payment_method">طريقة الدفع</Label>
                      <Select
                        value={formData.payment_method || ""}
                        onValueChange={(value) => setFormData({...formData, payment_method: value})}
                        disabled={!canEditStage("sales")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر طريقة الدفع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="نقد">نقد</SelectItem>
                          <SelectItem value="بنك">بنك</SelectItem>
                          <SelectItem value="تقسيط">تقسيط</SelectItem>
                          <SelectItem value="شيك">شيك</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="sale_type">نوع البيع</Label>
                      <Select
                        value={formData.sale_type || ""}
                        onValueChange={(value) => setFormData({...formData, sale_type: value})}
                        disabled={!canEditStage("sales")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع البيع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="بيع على الخارطة">بيع على الخارطة</SelectItem>
                          <SelectItem value="جاهز">جاهز</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="unit_value">قيمة الوحدة (ريال)</Label>
                      <Input
                        id="unit_value"
                        type="number"
                        value={formData.unit_value || ""}
                        onChange={(e) => setFormData({...formData, unit_value: parseFloat(e.target.value)})}
                        disabled={!canEditStage("sales")}
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <Label htmlFor="handover_date">تاريخ الإفراغ</Label>
                      <Input
                        id="handover_date"
                        type="date"
                        value={formData.handover_date || ""}
                        onChange={(e) => setFormData({...formData, handover_date: e.target.value})}
                        disabled={!canEditStage("sales")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="sales_employee">اسم موظف المبيعات</Label>
                      <Input
                        id="sales_employee"
                        value={formData.sales_employee || ""}
                        onChange={(e) => setFormData({...formData, sales_employee: e.target.value})}
                        disabled={!canEditStage("sales")}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg">
                    <Checkbox
                      id="sales_completed"
                      checked={formData.sales_completed || false}
                      onCheckedChange={(checked) => setFormData({...formData, sales_completed: !!checked})}
                      disabled={!canEditStage("sales")}
                    />
                    <Label htmlFor="sales_completed" className="font-medium">
                      ✅ تم تعبئة البيانات من قبل المبيعات وجاهزة للمرحلة التالية
                    </Label>
                  </div>
                </TabsContent>

                {/* مرحلة إدارة المشاريع */}
                <TabsContent value="projects" className="space-y-4">
                  <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h3 className="font-semibold text-orange-800 mb-2">المرحلة الثانية: إدارة المشاريع</h3>
                    <p className="text-sm text-orange-600">يتم تعبئة هذه البيانات من قبل قسم إدارة المشاريع</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="construction_completion_date">تاريخ انتهاء أعمال البناء</Label>
                      <Input
                        id="construction_completion_date"
                        type="date"
                        value={formData.construction_completion_date || ""}
                        onChange={(e) => setFormData({...formData, construction_completion_date: e.target.value})}
                        disabled={!canEditStage("projects")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="final_handover_date">تاريخ الاستلام النهائي للوحدة</Label>
                      <Input
                        id="final_handover_date"
                        type="date"
                        value={formData.final_handover_date || ""}
                        onChange={(e) => setFormData({...formData, final_handover_date: e.target.value})}
                        disabled={!canEditStage("projects")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="electricity_meter_transfer_date">تاريخ نقل عداد الكهرباء</Label>
                      <Input
                        id="electricity_meter_transfer_date"
                        type="date"
                        value={formData.electricity_meter_transfer_date || ""}
                        onChange={(e) => setFormData({...formData, electricity_meter_transfer_date: e.target.value})}
                        disabled={!canEditStage("projects")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="water_meter_transfer_date">تاريخ نقل عداد الماء</Label>
                      <Input
                        id="water_meter_transfer_date"
                        type="date"
                        value={formData.water_meter_transfer_date || ""}
                        onChange={(e) => setFormData({...formData, water_meter_transfer_date: e.target.value})}
                        disabled={!canEditStage("projects")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="customer_delivery_date">تاريخ التسليم للعميل</Label>
                      <Input
                        id="customer_delivery_date"
                        type="date"
                        value={formData.customer_delivery_date || ""}
                        onChange={(e) => setFormData({...formData, customer_delivery_date: e.target.value})}
                        disabled={!canEditStage("projects")}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="project_notes">ملاحظات</Label>
                    <Textarea
                      id="project_notes"
                      value={formData.project_notes || ""}
                      onChange={(e) => setFormData({...formData, project_notes: e.target.value})}
                      disabled={!canEditStage("projects")}
                      placeholder="اكتب أي ملاحظات خاصة بالمشروع..."
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg">
                    <Checkbox
                      id="projects_completed"
                      checked={formData.projects_completed || false}
                      onCheckedChange={(checked) => setFormData({...formData, projects_completed: !!checked})}
                      disabled={!canEditStage("projects")}
                    />
                    <Label htmlFor="projects_completed" className="font-medium">
                      ✅ تم تعبئة البيانات من قبل إدارة المشاريع وجاهزة للمرحلة التالية
                    </Label>
                  </div>
                </TabsContent>

                {/* مرحلة راحة العملاء */}
                <TabsContent value="customer_service" className="space-y-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h3 className="font-semibold text-purple-800 mb-2">المرحلة الثالثة: راحة العملاء</h3>
                    <p className="text-sm text-purple-600">يتم تعبئة هذه البيانات من قبل قسم راحة العملاء</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2 bg-blue-50 p-3 rounded-lg">
                      <Checkbox
                        id="customer_evaluation_done"
                        checked={formData.customer_evaluation_done || false}
                        onCheckedChange={(checked) => setFormData({...formData, customer_evaluation_done: !!checked})}
                        disabled={!canEditStage("customer_service")}
                      />
                      <Label htmlFor="customer_evaluation_done" className="font-medium">
                        هل تم تقييم العميل؟
                      </Label>
                    </div>

                    <div>
                      <Label htmlFor="evaluation_percentage">نسبة التقييم (%)</Label>
                      <Input
                        id="evaluation_percentage"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.evaluation_percentage || ""}
                        onChange={(e) => setFormData({...formData, evaluation_percentage: parseFloat(e.target.value)})}
                        disabled={!canEditStage("customer_service") || !formData.customer_evaluation_done}
                        placeholder="من 0 إلى 100"
                      />
                    </div>
                  </div>

                  {formData.evaluation_percentage && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium">تقييم العميل:</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              formData.evaluation_percentage >= 80 ? 'bg-green-500' :
                              formData.evaluation_percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${formData.evaluation_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium">{formData.evaluation_percentage}%</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-2 bg-green-50 p-3 rounded-lg">
                    <Checkbox
                      id="customer_service_completed"
                      checked={formData.customer_service_completed || false}
                      onCheckedChange={(checked) => setFormData({...formData, customer_service_completed: !!checked})}
                      disabled={!canEditStage("customer_service")}
                    />
                    <Label htmlFor="customer_service_completed" className="font-medium">
                      ✅ تم إنهاء جميع إجراءات راحة العملاء - الحجز مكتمل
                    </Label>
                  </div>
                </TabsContent>
              </Tabs>

              {!isViewMode && (
                <div className="flex justify-end space-x-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "جاري الحفظ..." : selectedBooking ? "تحديث" : "حفظ"}
                  </Button>
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}