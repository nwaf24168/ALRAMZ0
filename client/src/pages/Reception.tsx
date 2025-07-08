
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { DataService } from '@/lib/dataService';
import { 
  Plus, 
  Search, 
  Download, 
  Upload, 
  FileText, 
  Phone, 
  MessageSquare, 
  Calendar,
  User,
  Building,
  Clock,
  Filter,
  RefreshCw,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';

// واجهة بيانات سجل الاستقبال
interface ReceptionRecord {
  id?: string;
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
  createdAt?: string;
  updatedAt?: string;
}

export default function Reception() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ReceptionRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<ReceptionRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<ReceptionRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // بيانات النموذج
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [project, setProject] = useState("");
  const [employee, setEmployee] = useState("");
  const [contactMethod, setContactMethod] = useState("");
  const [type, setType] = useState("");
  const [customerRequest, setCustomerRequest] = useState("");
  const [action, setAction] = useState("");
  const [status, setStatus] = useState("جديد");

  // متغيرات الاستيراد
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // البيانات المرجعية
  const contactMethods = [
    "اتصال هاتفي",
    "واتساب",
    "بريد إلكتروني",
    "زيارة شخصية",
    "رسالة نصية"
  ];

  const types = [
    "استفسار",
    "شكوى",
    "طلب خدمة",
    "متابعة",
    "حجز موعد",
    "إلغاء",
    "تعديل"
  ];

  const statuses = [
    "جديد",
    "قيد المتابعة",
    "مكتمل",
    "محول"
  ];

  const projects = [
    "مشروع الرمز",
    "سديم تاون",
    "المعالي",
    "تل الرمال",
    "النخيل",
    "الواحة",
    "المروج"
  ];

  // تحميل السجلات
  const loadRecords = async () => {
    try {
      setLoading(true);
      const data = await DataService.getReceptionRecords();
      setRecords(data || []);
    } catch (error) {
      console.error("خطأ في تحميل السجلات:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحميل سجلات الاستقبال"
      });
    } finally {
      setLoading(false);
    }
  };

  // تحميل السجلات عند بداية التحميل
  useEffect(() => {
    loadRecords();
  }, []);

  // إعادة تعيين النموذج
  const resetForm = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setCustomerName("");
    setPhoneNumber("");
    setProject("");
    setEmployee("");
    setContactMethod("");
    setType("");
    setCustomerRequest("");
    setAction("");
    setStatus("جديد");
    setEditingRecord(null);
  };

  // معالجة حفظ السجل
  const handleSave = async () => {
    if (!customerName || !phoneNumber || !project || !employee || !contactMethod || !type) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة"
      });
      return;
    }

    try {
      setLoading(true);

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
        status,
        createdBy: user.username,
        ...(editingRecord && { id: editingRecord.id })
      };

      if (editingRecord) {
        await DataService.updateReceptionRecord(editingRecord.id!, recordData);
        toast({
          title: "تم التحديث",
          description: "تم تحديث سجل الاستقبال بنجاح"
        });
      } else {
        await DataService.saveReceptionRecord(recordData);
        toast({
          title: "تم الحفظ",
          description: "تم حفظ سجل الاستقبال بنجاح"
        });
      }

      resetForm();
      setIsDialogOpen(false);
      loadRecords();
    } catch (error) {
      console.error("خطأ في حفظ السجل:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في حفظ سجل الاستقبال"
      });
    } finally {
      setLoading(false);
    }
  };

  // معالجة تحرير السجل
  const handleEdit = (record: ReceptionRecord) => {
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

  // معالجة حذف السجل
  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا السجل؟")) return;

    try {
      setLoading(true);
      await DataService.deleteReceptionRecord(id);
      toast({
        title: "تم الحذف",
        description: "تم حذف سجل الاستقبال بنجاح"
      });
      loadRecords();
    } catch (error) {
      console.error("خطأ في حذف السجل:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في حذف سجل الاستقبال"
      });
    } finally {
      setLoading(false);
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
        'الحالة': record.status
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

  // استيراد البيانات من Excel
  const importFromExcel = async () => {
    if (!importFile) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى اختيار ملف Excel أولاً"
      });
      return;
    }

    setIsImporting(true);

    try {
      const XLSX = await import('xlsx');
      const arrayBuffer = await importFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "الملف فارغ أو لا يحتوي على بيانات صالحة"
        });
        return;
      }

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1) as any[][];

      // الأعمدة المتوقعة بنفس ترتيب النموذج والتصدير
      const expectedHeaders = [
        'التاريخ', 'اسم العميل', 'رقم الجوال', 'المشروع', 'الموظف المختص', 
        'طريقة التواصل', 'نوع الطلب', 'طلب العميل', 'الإجراء المتخذ', 'الحالة'
      ];

      // التحقق من الأعمدة
      const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
      if (missingHeaders.length > 0) {
        toast({
          variant: "destructive",
          title: "خطأ في تنسيق الملف",
          description: `الأعمدة المفقودة: ${missingHeaders.join(', ')}`
        });
        return;
      }

      let successCount = 0;
      let errorCount = 0;
      const recordsToSave: any[] = [];

      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        
        // تخطي الصفوف الفارغة
        if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
          continue;
        }

        try {
          // معالجة التاريخ
          let formattedDate = row[0];
          if (formattedDate) {
            if (typeof formattedDate === 'number') {
              const excelDate = new Date((formattedDate - 25569) * 86400 * 1000);
              formattedDate = excelDate.toISOString().split('T')[0];
            } else if (typeof formattedDate === 'string') {
              const parsedDate = new Date(formattedDate);
              if (!isNaN(parsedDate.getTime())) {
                formattedDate = parsedDate.toISOString().split('T')[0];
              } else {
                formattedDate = new Date().toISOString().split('T')[0];
              }
            } else {
              formattedDate = new Date().toISOString().split('T')[0];
            }
          } else {
            formattedDate = new Date().toISOString().split('T')[0];
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
            createdBy: user.username,
          };

          // التحقق من البيانات الأساسية
          if (!recordData.customerName || !recordData.phoneNumber) {
            console.warn(`تخطي السطر ${i + 1}: بيانات ناقصة`);
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

          // التحقق من صحة الحالة - قراءة من Excel
          if (!statuses.includes(recordData.status)) {
            recordData.status = 'جديد';
          }

          recordsToSave.push(recordData);
          successCount++;
        } catch (error) {
          console.error(`خطأ في معالجة السطر ${i + 1}:`, error);
          errorCount++;
        }
      }

      if (recordsToSave.length > 0) {
        // حفظ جميع السجلات دفعة واحدة
        await DataService.saveReceptionRecordsBatch(recordsToSave);
        await loadRecords();

        toast({
          title: "تم الاستيراد",
          description: `تم استيراد ${successCount} سجل بنجاح${errorCount > 0 ? ` (${errorCount} خطأ)` : ''}`
        });
      } else {
        toast({
          variant: "destructive",
          title: "فشل الاستيراد",
          description: "لم يتم العثور على بيانات صالحة للاستيراد"
        });
      }

      setImportFile(null);
    } catch (error) {
      console.error("خطأ في رفع الملف:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في استيراد البيانات من ملف Excel"
      });
    } finally {
      setIsImporting(false);
    }
  };

  // تصفية السجلات
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.phoneNumber.includes(searchTerm) ||
      record.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employee.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "" || statusFilter === "all" || record.status === statusFilter;
    const matchesType = typeFilter === "" || typeFilter === "all" || record.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  // حساب الإحصائيات
  const stats = {
    total: records.length,
    new: records.filter(r => r.status === 'جديد').length,
    inProgress: records.filter(r => r.status === 'قيد المتابعة').length,
    completed: records.filter(r => r.status === 'مكتمل').length,
    transferred: records.filter(r => r.status === 'محول').length
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* العنوان والإحصائيات */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">اتصالات خدمة العملاء</h1>
          <p className="text-muted-foreground">إدارة وتتبع اتصالات العملاء</p>
        </div>
        <div className="flex gap-4">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-muted-foreground">إجمالي السجلات</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.new}</div>
              <div className="text-sm text-muted-foreground">جديد</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
              <div className="text-sm text-muted-foreground">قيد المعالجة</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-sm text-muted-foreground">مكتمل</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.transferred}</div>
              <div className="text-sm text-muted-foreground">محول</div>
            </div>
          </Card>
        </div>
      </div>

      {/* شريط الأدوات */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-4 items-center">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    إضافة سجل جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingRecord ? 'تحرير سجل الاستقبال' : 'إضافة سجل استقبال جديد'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">التاريخ</Label>
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerName">اسم العميل *</Label>
                      <Input
                        id="customerName"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="أدخل اسم العميل"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phoneNumber">رقم الجوال *</Label>
                      <Input
                        id="phoneNumber"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="05xxxxxxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="project">المشروع *</Label>
                      <Select value={project} onValueChange={setProject}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المشروع" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((proj) => (
                            <SelectItem key={proj} value={proj}>
                              {proj}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="employee">الموظف المختص *</Label>
                      <Input
                        id="employee"
                        value={employee}
                        onChange={(e) => setEmployee(e.target.value)}
                        placeholder="اسم الموظف"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactMethod">طريقة التواصل *</Label>
                      <Select value={contactMethod} onValueChange={setContactMethod}>
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
                    <div className="space-y-2">
                      <Label htmlFor="type">نوع الطلب *</Label>
                      <Select value={type} onValueChange={setType}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع الطلب" />
                        </SelectTrigger>
                        <SelectContent>
                          {types.map((t) => (
                            <SelectItem key={t} value={t}>
                              {t}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="status">الحالة</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الحالة" />
                        </SelectTrigger>
                        <SelectContent>
                          {statuses.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="customerRequest">طلب العميل</Label>
                      <Textarea
                        id="customerRequest"
                        value={customerRequest}
                        onChange={(e) => setCustomerRequest(e.target.value)}
                        placeholder="اكتب تفاصيل طلب العميل..."
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="action">الإجراء المتخذ</Label>
                      <Textarea
                        id="action"
                        value={action}
                        onChange={(e) => setAction(e.target.value)}
                        placeholder="اكتب الإجراء المتخذ..."
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={handleSave} disabled={loading}>
                      {loading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                      {editingRecord ? 'تحديث' : 'حفظ'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>

              <Button variant="outline" onClick={exportToExcel} disabled={records.length === 0}>
                <Download className="h-4 w-4 mr-2" />
                تصدير Excel
              </Button>

              <div className="flex items-center gap-2">
                <Input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="import-file"
                />
                <Label htmlFor="import-file" className="cursor-pointer">
                  <Button variant="outline" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      اختيار ملف
                    </span>
                  </Button>
                </Label>
                {importFile && (
                  <Button onClick={importFromExcel} disabled={isImporting}>
                    {isImporting ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-2" />}
                    استيراد من Excel
                  </Button>
                )}
              </div>
            </div>

            <Button variant="outline" onClick={loadRecords} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              تحديث
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* شريط البحث والفلترة */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="البحث في السجلات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="جميع الحالات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="جميع الأنواع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {types.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* جدول السجلات */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            سجلات الاستقبال ({filteredRecords.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>الجوال</TableHead>
                    <TableHead>المشروع</TableHead>
                    <TableHead>الموظف</TableHead>
                    <TableHead>طريقة التواصل</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            {record.date}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {record.customerName}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            {record.phoneNumber}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4 text-muted-foreground" />
                            {record.project}
                          </div>
                        </TableCell>
                        <TableCell>{record.employee}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {record.contactMethod === 'اتصال هاتفي' ? <Phone className="h-4 w-4" /> : <MessageSquare className="h-4 w-4" />}
                            {record.contactMethod}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              record.status === 'مكتمل' ? 'default' :
                              record.status === 'قيد المتابعة' ? 'secondary' :
                              record.status === 'محول' ? 'outline' : 'destructive'
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedRecord(record);
                                setIsDetailsDialogOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(record)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => record.id && handleDelete(record.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8">
                        لا توجد سجلات للعرض
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* نافذة تفاصيل السجل */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>تفاصيل سجل الاستقبال</DialogTitle>
          </DialogHeader>
          {selectedRecord && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">التاريخ</Label>
                  <p className="text-sm">{selectedRecord.date}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">اسم العميل</Label>
                  <p className="text-sm">{selectedRecord.customerName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">رقم الجوال</Label>
                  <p className="text-sm">{selectedRecord.phoneNumber}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">المشروع</Label>
                  <p className="text-sm">{selectedRecord.project}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">الموظف المختص</Label>
                  <p className="text-sm">{selectedRecord.employee}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">طريقة التواصل</Label>
                  <p className="text-sm">{selectedRecord.contactMethod}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">نوع الطلب</Label>
                  <p className="text-sm">{selectedRecord.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">الحالة</Label>
                  <Badge 
                    variant={
                      selectedRecord.status === 'مكتمل' ? 'default' :
                      selectedRecord.status === 'قيد المتابعة' ? 'secondary' :
                      selectedRecord.status === 'محول' ? 'outline' : 'destructive'
                    }
                  >
                    {selectedRecord.status}
                  </Badge>
                </div>
              </div>
              
              {selectedRecord.customerRequest && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">طلب العميل</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedRecord.customerRequest}</p>
                </div>
              )}
              
              {selectedRecord.action && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">الإجراء المتخذ</Label>
                  <p className="text-sm mt-1 p-3 bg-muted rounded-md">{selectedRecord.action}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">تم الإنشاء بواسطة</Label>
                  <p className="text-sm">{selectedRecord.createdBy}</p>
                </div>
                {selectedRecord.createdAt && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">تاريخ الإنشاء</Label>
                    <p className="text-sm">{new Date(selectedRecord.createdAt).toLocaleString('ar-SA')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
