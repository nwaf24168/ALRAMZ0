import React, { useState, useEffect } from 'react';
import { Plus, FileUp, Download, Edit, Trash2, Search, Filter, Calendar, BarChart3, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import Layout from '@/components/layout/Layout';
import { DataService } from '@/lib/dataService';
import { useNotification } from '@/context/NotificationContext';
import { sendBookingEmail } from '@/lib/emailService';
import * as XLSX from 'xlsx';
import { Link } from 'react-router-dom';

// واجهة البيانات
interface DeliveryBooking {
  id: number;
  customerName: string;
  project: string;
  unit: string;
  status: string;
  booking_date: string;
  handover_date: string;
  sale_type: string;
  payment_method: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

// المكون الرئيسي
const Delivery = () => {
  const [bookings, setBookings] = useState<DeliveryBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<DeliveryBooking | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [isImporting, setIsImporting] = useState(false);
  const [currentUser] = useState('مستخدم النظام');

  const { addNotification } = useNotification();

  // نموذج الحجز الجديد
  const [newBooking, setNewBooking] = useState({
    customerName: '',
    project: '',
    unit: '',
    status: 'قيد الانتظار',
    booking_date: '',
    handover_date: '',
    sale_type: 'بيع',
    payment_method: 'نقدي',
    notes: ''
  });

  // تحميل البيانات
  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await DataService.getDeliveryBookings();
      console.log('تم تحميل حجوزات التسليم من قاعدة البيانات:', data.length);
      setBookings(data);
    } catch (error) {
      console.error('خطأ في تحميل حجوزات التسليم:', error);
      addNotification({
        title: 'خطأ في تحميل البيانات',
        message: 'حدث خطأ أثناء تحميل البيانات',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  // إنشاء حجز جديد
  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      const bookingData = {
        ...newBooking,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      await DataService.createDeliveryBooking(bookingData);
      
      // إرسال إيميل إشعار
      await sendBookingEmail({
        type: 'new',
        booking: {
          id: Date.now(),
          ...bookingData
        }
      });

      await loadBookings();
      setIsDialogOpen(false);
      setNewBooking({
        customerName: '',
        project: '',
        unit: '',
        status: 'قيد الانتظار',
        booking_date: '',
        handover_date: '',
        sale_type: 'بيع',
        payment_method: 'نقدي',
        notes: ''
      });

      addNotification({
        title: 'تم إنشاء الحجز بنجاح',
        message: 'تم إنشاء الحجز الجديد بنجاح',
        type: 'success'
      });
    } catch (error) {
      console.error('خطأ في إنشاء حجز التسليم:', error);
      addNotification({
        title: 'خطأ في إنشاء الحجز',
        message: 'حدث خطأ أثناء إنشاء الحجز',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // تحديث حجز
  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;

    try {
      setLoading(true);
      const updatedData = {
        ...editingBooking,
        updated_at: new Date().toISOString()
      };

      await DataService.updateDeliveryBooking(editingBooking.id, updatedData);
      
      // إرسال إيميل إشعار
      await sendBookingEmail({
        type: 'update',
        booking: {
          ...updatedData,
          updatedBy: currentUser
        }
      });

      await loadBookings();
      setEditingBooking(null);
      addNotification({
        title: 'تم تحديث الحجز بنجاح',
        message: 'تم تحديث الحجز بنجاح',
        type: 'success'
      });
    } catch (error) {
      console.error('خطأ في تحديث الحجز:', error);
      addNotification({
        title: 'خطأ في تحديث الحجز',
        message: 'حدث خطأ أثناء تحديث الحجز',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // حذف حجز
  const handleDeleteBooking = async (id: number) => {
    if (!confirm('هل أنت متأكد من حذف هذا الحجز؟')) return;

    try {
      setLoading(true);
      await DataService.deleteDeliveryBooking(id);
      await loadBookings();
      addNotification({
        title: 'تم حذف الحجز بنجاح',
        message: 'تم حذف الحجز بنجاح',
        type: 'success'
      });
    } catch (error) {
      console.error('خطأ في حذف الحجز:', error);
      addNotification({
        title: 'خطأ في حذف الحجز',
        message: 'حدث خطأ أثناء حذف الحجز',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // معالجة رفع ملف Excel
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportProgress(0);

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (jsonData.length < 2) {
        addNotification({
          title: 'الملف فارغ أو لا يحتوي على بيانات كافية',
          message: 'يرجى التأكد من وجود بيانات في الملف',
          type: 'error'
        });
        return;
      }

      const headers = jsonData[0];
      const rows = jsonData.slice(1);

      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        try {
          // التقدم
          setImportProgress(Math.round(((i + 1) / rows.length) * 100));

          // تخطي الصفوف الفارغة
          if (!row || row.length === 0 || !row.some(cell => cell && cell.toString().trim())) {
            continue;
          }

          // إنشاء كائن الحجز من البيانات
          const bookingData: any = {};

          // تعيين البيانات حسب أسماء الأعمدة
          headers.forEach((header: string, index: number) => {
            const cellValue = row[index];
            const headerName = header?.toString().toLowerCase().trim();

            if (cellValue !== undefined && cellValue !== null && cellValue !== '') {
              switch (headerName) {
                case 'اسم العميل':
                case 'customer_name':
                case 'customername':
                  bookingData.customerName = cellValue.toString().trim();
                  break;
                case 'المشروع':
                case 'project':
                  bookingData.project = cellValue.toString().trim();
                  break;
                case 'الوحدة':
                case 'unit':
                  bookingData.unit = cellValue.toString().trim();
                  break;
                case 'الحالة':
                case 'status':
                  bookingData.status = cellValue.toString().trim();
                  break;
                case 'تاريخ الحجز':
                case 'booking_date':
                case 'bookingdate':
                  try {
                    const dateValue = new Date(cellValue);
                    if (!isNaN(dateValue.getTime())) {
                      bookingData.booking_date = dateValue.toISOString().split('T')[0];
                    }
                  } catch (e) {
                    console.warn('تاريخ غير صحيح:', cellValue);
                  }
                  break;
                case 'تاريخ التسليم':
                case 'handover_date':
                case 'handoverdate':
                  try {
                    const dateValue = new Date(cellValue);
                    if (!isNaN(dateValue.getTime())) {
                      bookingData.handover_date = dateValue.toISOString().split('T')[0];
                    }
                  } catch (e) {
                    console.warn('تاريخ غير صحيح:', cellValue);
                  }
                  break;
                case 'نوع البيع':
                case 'sale_type':
                case 'saletype':
                  const saleTypeValue = cellValue.toString().trim();
                  // تطبيع القيم المختلفة
                  if (saleTypeValue.includes('بيع') || saleTypeValue.includes('البيع') || saleTypeValue.toLowerCase().includes('sale')) {
                    bookingData.sale_type = 'بيع';
                  } else if (saleTypeValue.includes('إيجار') || saleTypeValue.includes('ايجار') || saleTypeValue.toLowerCase().includes('rent')) {
                    bookingData.sale_type = 'إيجار';
                  } else if (saleTypeValue.includes('رهن') || saleTypeValue.toLowerCase().includes('mortgage')) {
                    bookingData.sale_type = 'رهن';
                  } else {
                    // استخدام قيمة افتراضية
                    bookingData.sale_type = 'بيع';
                    console.warn(`قيمة نوع البيع غير معروفة: ${saleTypeValue}, استخدام القيمة الافتراضية: بيع`);
                  }
                  break;
                case 'طريقة الدفع':
                case 'payment_method':
                case 'paymentmethod':
                  const paymentMethodValue = cellValue.toString().trim();
                  // تطبيع القيم المختلفة
                  if (paymentMethodValue.includes('نقد') || paymentMethodValue.includes('كاش') || paymentMethodValue.toLowerCase().includes('cash')) {
                    bookingData.payment_method = 'نقدي';
                  } else if (paymentMethodValue.includes('بنك') || paymentMethodValue.includes('تحويل') || paymentMethodValue.toLowerCase().includes('bank')) {
                    bookingData.payment_method = 'بنكي';
                  } else if (paymentMethodValue.includes('تقسيط') || paymentMethodValue.includes('اقساط') || paymentMethodValue.toLowerCase().includes('installment')) {
                    bookingData.payment_method = 'تقسيط';
                  } else if (paymentMethodValue.includes('شيك') || paymentMethodValue.toLowerCase().includes('cheque')) {
                    bookingData.payment_method = 'شيك';
                  } else {
                    // استخدام قيمة افتراضية
                    bookingData.payment_method = 'نقدي';
                    console.warn(`قيمة طريقة الدفع غير معروفة: ${paymentMethodValue}, استخدام القيمة الافتراضية: نقدي`);
                  }
                  break;
                case 'ملاحظات':
                case 'notes':
                  bookingData.notes = cellValue.toString().trim();
                  break;
              }
            }
          });

          // التحقق من البيانات المطلوبة
          if (!bookingData.customerName) {
            console.warn(`السطر ${i + 2}: اسم العميل مطلوب`);
            errorCount++;
            continue;
          }

          // تعيين القيم الافتراضية للحقول المطلوبة
          if (!bookingData.project) bookingData.project = '';
          if (!bookingData.unit) bookingData.unit = '';
          if (!bookingData.status) bookingData.status = 'قيد الانتظار';
          if (!bookingData.sale_type) bookingData.sale_type = 'بيع';
          if (!bookingData.payment_method) bookingData.payment_method = 'نقدي';
          if (!bookingData.notes) bookingData.notes = '';

          // إضافة البيانات التقنية
          bookingData.created_at = new Date().toISOString();
          bookingData.updated_at = new Date().toISOString();

          // حفظ الحجز
          await DataService.createDeliveryBooking(bookingData);
          successCount++;

        } catch (error) {
          console.error(`خطأ في معالجة السطر ${i + 2}:`, error);
          errorCount++;
        }
      }

      await loadBookings();
      setImportProgress(100);

      addNotification({
        title: `تم رفع ${successCount} حجز بنجاح${errorCount > 0 ? ` (${errorCount} خطأ)` : ''}`,
        message: `تم معالجة ${successCount + errorCount} سجل`,
        type: successCount > 0 ? 'success' : 'error'
      });

    } catch (error) {
      console.error('خطأ في رفع الملف:', error);
      addNotification({
        title: 'خطأ في رفع الملف',
        message: 'حدث خطأ أثناء رفع الملف',
        type: 'error'
      });
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      // إعادة تعيين قيمة input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // تصدير البيانات
  const handleExportData = () => {
    try {
      const exportData = filteredBookings.map(booking => ({
        'رقم الحجز': booking.id,
        'اسم العميل': booking.customerName,
        'المشروع': booking.project,
        'الوحدة': booking.unit,
        'الحالة': booking.status,
        'تاريخ الحجز': booking.booking_date,
        'تاريخ التسليم': booking.handover_date,
        'نوع البيع': booking.sale_type,
        'طريقة الدفع': booking.payment_method,
        'الملاحظات': booking.notes || '',
        'تاريخ الإنشاء': new Date(booking.created_at).toLocaleDateString('ar-SA')
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'حجوزات التسليم');
      XLSX.writeFile(wb, `حجوزات_التسليم_${new Date().toLocaleDateString('ar-SA')}.xlsx`);

      addNotification({
        title: 'تم تصدير البيانات بنجاح',
        message: 'تم تصدير البيانات إلى ملف Excel',
        type: 'success'
      });
    } catch (error) {
      console.error('خطأ في تصدير البيانات:', error);
      addNotification({
        title: 'خطأ في تصدير البيانات',
        message: 'حدث خطأ أثناء تصدير البيانات',
        type: 'error'
      });
    }
  };

  // تصفية البيانات
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = !searchTerm || 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.unit.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || statusFilter === 'all' || booking.status === statusFilter;
    const matchesProject = !projectFilter || projectFilter === 'all' || booking.project === projectFilter;
    
    return matchesSearch && matchesStatus && matchesProject;
  });

  // إحصائيات سريعة
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'قيد الانتظار').length,
    inProgress: bookings.filter(b => b.status === 'قيد التجهيز').length,
    completed: bookings.filter(b => b.status === 'تم التسليم').length
  };

  // الحصول على قوائم فريدة للمشاريع والحالات
  const uniqueProjects = [...new Set(bookings.map(b => b.project))].filter(Boolean);
  const uniqueStatuses = [...new Set(bookings.map(b => b.status))].filter(Boolean);

  return (
    <Layout>
      <div className="space-y-6">
        {/* العنوان والإحصائيات */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">إدارة التسليم</h1>
            <p className="text-muted-foreground">
              إدارة حجوزات التسليم ومتابعة حالة الوحدات
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/delivery-analytics">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                التحليلات
              </Button>
            </Link>
          </div>
        </div>

        {/* بطاقات الإحصائيات */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيد الانتظار</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيد التجهيز</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">تم التسليم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        {/* شريط الأدوات */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>حجوزات التسليم</CardTitle>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                  disabled={isImporting}
                />
                <label htmlFor="file-upload">
                  <Button variant="outline" size="sm" disabled={isImporting} asChild>
                    <span>
                      <FileUp className="w-4 h-4 mr-2" />
                      {isImporting ? 'جاري الرفع...' : 'رفع Excel'}
                    </span>
                  </Button>
                </label>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="w-4 h-4 mr-2" />
                  تصدير
                </Button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      حجز جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>إضافة حجز جديد</DialogTitle>
                      <DialogDescription>
                        أدخل بيانات الحجز الجديد
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateBooking} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="customerName">اسم العميل</Label>
                          <Input
                            id="customerName"
                            value={newBooking.customerName}
                            onChange={(e) => setNewBooking({...newBooking, customerName: e.target.value})}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="project">المشروع</Label>
                          <Input
                            id="project"
                            value={newBooking.project}
                            onChange={(e) => setNewBooking({...newBooking, project: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="unit">الوحدة</Label>
                          <Input
                            id="unit"
                            value={newBooking.unit}
                            onChange={(e) => setNewBooking({...newBooking, unit: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="status">الحالة</Label>
                          <Select value={newBooking.status} onValueChange={(value) => setNewBooking({...newBooking, status: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="قيد الانتظار">قيد الانتظار</SelectItem>
                              <SelectItem value="قيد التجهيز">قيد التجهيز</SelectItem>
                              <SelectItem value="جاهز للتسليم">جاهز للتسليم</SelectItem>
                              <SelectItem value="تم التسليم">تم التسليم</SelectItem>
                              <SelectItem value="ملغي">ملغي</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="booking_date">تاريخ الحجز</Label>
                          <Input
                            id="booking_date"
                            type="date"
                            value={newBooking.booking_date}
                            onChange={(e) => setNewBooking({...newBooking, booking_date: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="handover_date">تاريخ التسليم</Label>
                          <Input
                            id="handover_date"
                            type="date"
                            value={newBooking.handover_date}
                            onChange={(e) => setNewBooking({...newBooking, handover_date: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="sale_type">نوع البيع</Label>
                          <Select value={newBooking.sale_type} onValueChange={(value) => setNewBooking({...newBooking, sale_type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="بيع">بيع</SelectItem>
                              <SelectItem value="إيجار">إيجار</SelectItem>
                              <SelectItem value="رهن">رهن</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="payment_method">طريقة الدفع</Label>
                          <Select value={newBooking.payment_method} onValueChange={(value) => setNewBooking({...newBooking, payment_method: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="نقدي">نقدي</SelectItem>
                              <SelectItem value="بنكي">بنكي</SelectItem>
                              <SelectItem value="تقسيط">تقسيط</SelectItem>
                              <SelectItem value="شيك">شيك</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="notes">الملاحظات</Label>
                        <Textarea
                          id="notes"
                          value={newBooking.notes}
                          onChange={(e) => setNewBooking({...newBooking, notes: e.target.value})}
                          rows={3}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          إلغاء
                        </Button>
                        <Button type="submit" disabled={loading}>
                          {loading ? 'جاري الحفظ...' : 'حفظ'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* شريط البحث والتصفية */}
            <div className="flex items-center gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في الحجوزات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="تصفية حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  {uniqueStatuses.map(status => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="تصفية حسب المشروع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع المشاريع</SelectItem>
                  {uniqueProjects.map(project => (
                    <SelectItem key={project} value={project}>{project}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* شريط تقدم الرفع */}
            {isImporting && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">جاري رفع البيانات...</span>
                  <span className="text-sm text-muted-foreground">{importProgress}%</span>
                </div>
                <Progress value={importProgress} className="w-full" />
              </div>
            )}

            {/* جدول البيانات */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الحجز</TableHead>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>المشروع</TableHead>
                    <TableHead>الوحدة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الحجز</TableHead>
                    <TableHead>تاريخ التسليم</TableHead>
                    <TableHead>نوع البيع</TableHead>
                    <TableHead>طريقة الدفع</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        جاري التحميل...
                      </TableCell>
                    </TableRow>
                  ) : filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center py-8">
                        لا توجد حجوزات
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.id}</TableCell>
                        <TableCell>{booking.customerName}</TableCell>
                        <TableCell>{booking.project}</TableCell>
                        <TableCell>{booking.unit}</TableCell>
                        <TableCell>
                          <Badge variant={
                            booking.status === 'تم التسليم' ? 'default' :
                            booking.status === 'قيد التجهيز' ? 'secondary' :
                            booking.status === 'جاهز للتسليم' ? 'outline' :
                            'destructive'
                          }>
                            {booking.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('ar-SA') : '-'}
                        </TableCell>
                        <TableCell>
                          {booking.handover_date ? new Date(booking.handover_date).toLocaleDateString('ar-SA') : '-'}
                        </TableCell>
                        <TableCell>{booking.sale_type}</TableCell>
                        <TableCell>{booking.payment_method}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setEditingBooking(booking)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBooking(booking.id)}
                            >
                              <Trash2 className="w-4 h-4" />
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

        {/* حوار التعديل */}
        <Dialog open={!!editingBooking} onOpenChange={(open) => !open && setEditingBooking(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تعديل الحجز</DialogTitle>
              <DialogDescription>
                تعديل بيانات الحجز رقم {editingBooking?.id}
              </DialogDescription>
            </DialogHeader>
            {editingBooking && (
              <form onSubmit={handleUpdateBooking} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-customerName">اسم العميل</Label>
                    <Input
                      id="edit-customerName"
                      value={editingBooking.customerName}
                      onChange={(e) => setEditingBooking({...editingBooking, customerName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-project">المشروع</Label>
                    <Input
                      id="edit-project"
                      value={editingBooking.project}
                      onChange={(e) => setEditingBooking({...editingBooking, project: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-unit">الوحدة</Label>
                    <Input
                      id="edit-unit"
                      value={editingBooking.unit}
                      onChange={(e) => setEditingBooking({...editingBooking, unit: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-status">الحالة</Label>
                    <Select value={editingBooking.status} onValueChange={(value) => setEditingBooking({...editingBooking, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="قيد الانتظار">قيد الانتظار</SelectItem>
                        <SelectItem value="قيد التجهيز">قيد التجهيز</SelectItem>
                        <SelectItem value="جاهز للتسليم">جاهز للتسليم</SelectItem>
                        <SelectItem value="تم التسليم">تم التسليم</SelectItem>
                        <SelectItem value="ملغي">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-booking_date">تاريخ الحجز</Label>
                    <Input
                      id="edit-booking_date"
                      type="date"
                      value={editingBooking.booking_date}
                      onChange={(e) => setEditingBooking({...editingBooking, booking_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-handover_date">تاريخ التسليم</Label>
                    <Input
                      id="edit-handover_date"
                      type="date"
                      value={editingBooking.handover_date}
                      onChange={(e) => setEditingBooking({...editingBooking, handover_date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-sale_type">نوع البيع</Label>
                    <Select value={editingBooking.sale_type} onValueChange={(value) => setEditingBooking({...editingBooking, sale_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="بيع">بيع</SelectItem>
                        <SelectItem value="إيجار">إيجار</SelectItem>
                        <SelectItem value="رهن">رهن</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-payment_method">طريقة الدفع</Label>
                    <Select value={editingBooking.payment_method} onValueChange={(value) => setEditingBooking({...editingBooking, payment_method: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="نقدي">نقدي</SelectItem>
                        <SelectItem value="بنكي">بنكي</SelectItem>
                        <SelectItem value="تقسيط">تقسيط</SelectItem>
                        <SelectItem value="شيك">شيك</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-notes">الملاحظات</Label>
                  <Textarea
                    id="edit-notes"
                    value={editingBooking.notes || ''}
                    onChange={(e) => setEditingBooking({...editingBooking, notes: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setEditingBooking(null)}>
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'جاري التحديث...' : 'تحديث'}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Delivery;