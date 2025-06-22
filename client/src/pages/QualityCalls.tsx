import React, { useState, useEffect, useCallback } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogTrigger
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotification } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/dataService";
import { 
  Upload, 
  Download, 
  Phone, 
  Users, 
  CheckCircle, 
  TrendingUp,
  Search,
  Filter,
  Edit,
  Trash2
} from "lucide-react";
import * as XLSX from 'xlsx';

interface Customer {
  id: string;
  customerName: string;
  phoneNumber: string;
  salesEmployee: string;
  salesResponse: string;
  status: "غير مؤهل" | "مؤهل" | "قيد المراجعة";
  qualificationReason?: string;
  convertedDate?: string;
  convertedBy?: string;
  callAttempts: number;
  lastCallDate?: string;
  notes?: string;
}

const QualityCalls = () => {
  const { addNotification } = useNotification();
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("الكل");
  const [qualificationReason, setQualificationReason] = useState("");
  const [notes, setNotes] = useState("");

  // إحصائيات سريعة
  const totalCustomers = customers.length;
  const qualifiedCustomers = customers.filter(c => c.status === "مؤهل").length;
  const conversionRate = totalCustomers > 0 ? ((qualifiedCustomers / totalCustomers) * 100).toFixed(1) : "0";
  const pendingCustomers = customers.filter(c => c.status === "قيد المراجعة").length;

  // تحميل البيانات من قاعدة البيانات عند بدء التطبيق
  const loadQualityCallsFromDB = useCallback(async () => {
    try {
      setIsLoading(true);
      const qualityCalls = await DataService.getQualityCalls();

      const formattedCustomers: Customer[] = qualityCalls.map(call => ({
        id: call.id,
        customerName: call.customer_name,
        phoneNumber: call.phone_number,
        salesEmployee: call.created_by || 'غير محدد',
        salesResponse: call.notes || '',
        status: call.qualification_status as Customer['status'],
        qualificationReason: call.qualification_reason,
        convertedDate: call.call_date,
        convertedBy: call.updated_by,
        callAttempts: 1,
        lastCallDate: call.call_date,
        notes: call.notes
      }));

      setCustomers(formattedCustomers);
      console.log('تم تحميل مكالمات الجودة من قاعدة البيانات:', formattedCustomers.length);
    } catch (error) {
      console.error('خطأ في تحميل مكالمات الجودة:', error);
      addNotification({
        title: "خطأ في التحميل",
        message: "فشل في تحميل البيانات من قاعدة البيانات",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    loadQualityCallsFromDB();
  }, [loadQualityCallsFromDB]);

  // تحديث القائمة المفلترة عند تغيير البحث أو الفلتر
  useEffect(() => {
    let filtered = customers;

    if (searchTerm) {
      filtered = filtered.filter(customer =>
        customer.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phoneNumber.includes(searchTerm) ||
        customer.salesEmployee.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "الكل") {
      filtered = filtered.filter(customer => customer.status === statusFilter);
    }

    setFilteredCustomers(filtered);
  }, [customers, searchTerm, statusFilter]);

  // حفظ العملاء في قاعدة البيانات
  const saveCustomerToDB = async (customer: Customer) => {
    try {
      const qualityCallData = {
        callId: `QC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        callDate: new Date().toLocaleDateString('ar-SA'),
        customerName: customer.customerName,
        phoneNumber: customer.phoneNumber,
        project: 'مشروع افتراضي',
        callType: 'مكالمة جودة',
        qualificationStatus: customer.status,
        qualificationReason: customer.qualificationReason || '',
        notes: customer.salesResponse || '',
        createdBy: user?.username || 'مجهول'
      };

      console.log('محاولة حفظ العميل:', qualityCallData);
      await DataService.saveQualityCall(qualityCallData);
      console.log('تم حفظ العميل في قاعدة البيانات:', customer.customerName);
    } catch (error) {
      console.error('خطأ في حفظ العميل:', customer.customerName, error);
      throw error;
    }
  };

  // معالجة البيانات من Excel
  const processExcelData = async (data: any[]) => {
    console.log("البيانات المقروءة من Excel:", data);
    
    if (!data || data.length === 0) {
      addNotification({
        title: "خطأ في البيانات",
        message: "الملف فارغ أو لا يحتوي على بيانات صالحة",
        type: "error",
      });
      return;
    }

    setIsLoading(true);

    try {
      const newCustomers: Customer[] = data.map((row: any, index: number) => {
        // محاولة قراءة الاسم من عدة أعمدة محتملة
        const customerName = String(row['اسم العميل'] || row['Customer Name'] || row['العميل'] || row['الاسم'] || row['Name'] || '').trim();

        // محاولة قراءة رقم الجوال من عدة أعمدة محتملة
        const phoneNumber = String(row['رقم الجوال'] || row['Phone Number'] || row['الجوال'] || row['رقم الهاتف'] || row['الهاتف'] || row['Phone'] || '').trim();

        // باقي البيانات
        const salesEmployee = String(row['موظف المبيعات'] || row['Sales Employee'] || row['الموظف'] || row['Employee'] || '').trim();
        const salesResponse = String(row['رد موظف المبيعات'] || row['Sales Response'] || row['الرد'] || row['الملاحظات'] || row['Response'] || '').trim();

        return {
          id: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${index}`,
          customerName,
          phoneNumber,
          salesEmployee,
          salesResponse,
          status: "غير مؤهل" as const,
          qualificationReason: String(row['سبب التأهيل'] || row['Qualification Reason'] || '').trim(),
          notes: String(row['ملاحظات'] || row['Notes'] || '').trim(),
          callAttempts: parseInt(String(row['عدد المحاولات'] || row['Call Attempts'] || '0')) || 0,
          lastCallDate: String(row['تاريخ آخر مكالمة'] || row['Last Call Date'] || '').trim(),
          convertedDate: String(row['تاريخ التحويل'] || row['Converted Date'] || '').trim(),
          convertedBy: String(row['محول بواسطة'] || row['Converted By'] || '').trim(),
        };
      });

      console.log("العملاء المعالجين:", newCustomers);

      // التحقق من صحة البيانات الأساسية
      const validCustomers = newCustomers.filter(customer => {
        const hasName = customer.customerName && customer.customerName.length > 0;
        const hasPhone = customer.phoneNumber && customer.phoneNumber.length > 0;
        return hasName && hasPhone;
      });

      console.log("العملاء الصالحين:", validCustomers);

      if (validCustomers.length === 0) {
        addNotification({
          title: "خطأ في البيانات",
          message: "لم يتم العثور على بيانات صحيحة. تأكد من وجود أعمدة 'اسم العميل' و 'رقم الجوال' وأن البيانات غير فارغة",
          type: "error",
        });
        return;
      }

      // حفظ العملاء في قاعدة البيانات
      let savedCount = 0;
      let errorCount = 0;

      // حفظ العملاء بشكل متسلسل لتجنب مشاكل قاعدة البيانات
      for (const customer of validCustomers) {
        try {
          await saveCustomerToDB(customer);
          savedCount++;
        } catch (error) {
          console.error('خطأ في حفظ العميل:', customer.customerName, error);
          errorCount++;
        }
      }

      // تحديث القائمة من قاعدة البيانات
      if (savedCount > 0) {
        await loadQualityCallsFromDB();
        addNotification({
          title: "تم الرفع بنجاح",
          message: `تم رفع وحفظ ${savedCount} عميل جديد في قاعدة البيانات`,
          type: "success",
        });
      }

      if (errorCount > 0) {
        addNotification({
          title: "تحذير",
          message: `فشل في حفظ ${errorCount} عميل في قاعدة البيانات`,
          type: "warning",
        });
      }

      if (validCustomers.length < newCustomers.length) {
        const skippedCount = newCustomers.length - validCustomers.length;
        addNotification({
          title: "تحذير",
          message: `تم تجاهل ${skippedCount} صف بسبب بيانات ناقصة (اسم العميل أو رقم الجوال فارغ)`,
          type: "warning",
        });
      }
    } catch (error) {
      console.error('خطأ في معالجة البيانات:', error);
      addNotification({
        title: "خطأ في المعالجة",
        message: "حدث خطأ أثناء معالجة البيانات",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // رفع ملف Excel
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      addNotification({
        title: "نوع ملف غير صحيح",
        message: "يرجى اختيار ملف Excel بصيغة .xlsx أو .xls",
        type: "error",
      });
      // إعادة تعيين قيمة الإدخال
      event.target.value = '';
      return;
    }

    // التحقق من حجم الملف (5MB حد أقصى)
    if (file.size > 5 * 1024 * 1024) {
      addNotification({
        title: "حجم الملف كبير",
        message: "حجم الملف يجب أن يكون أقل من 5 ميجابايت",
        type: "error",
      });
      event.target.value = '';
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { 
          type: 'array',
          cellText: false,
          cellDates: true
        });

        if (workbook.SheetNames.length === 0) {
          addNotification({
            title: "ملف فارغ",
            message: "الملف لا يحتوي على أي أوراق عمل",
            type: "error",
          });
          setIsLoading(false);
          return;
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        if (!worksheet) {
          addNotification({
            title: "ورقة عمل فارغة",
            message: "ورقة العمل الأولى فارغة",
            type: "error",
          });
          setIsLoading(false);
          return;
        }

        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          defval: "",
          raw: false,
          dateNF: 'yyyy-mm-dd'
        });

        if (jsonData.length === 0) {
          addNotification({
            title: "لا توجد بيانات",
            message: "الملف لا يحتوي على أي بيانات",
            type: "error",
          });
          setIsLoading(false);
          return;
        }

        console.log("البيانات المستخرجة من Excel:", jsonData);

        // استخدام الدالة المحدثة لمعالجة البيانات
        processExcelData(jsonData);

      } catch (error) {
        console.error("خطأ في معالجة ملف Excel:", error);
        addNotification({
          title: "خطأ في رفع الملف",
          message: `حدث خطأ أثناء قراءة الملف: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`,
          type: "error",
        });
        setIsLoading(false);
      }
    };

    reader.onerror = () => {
      addNotification({
        title: "خطأ في قراءة الملف",
        message: "فشل في قراءة الملف. يرجى المحاولة مرة أخرى",
        type: "error",
      });
      setIsLoading(false);
    };

    reader.readAsArrayBuffer(file);

    // إعادة تعيين قيمة الإدخال لإتاحة رفع نفس الملف مرة أخرى
    event.target.value = '';
  };

  // إضافة عميل جديد يدوياً
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    customerName: '',
    phoneNumber: '',
    salesEmployee: '',
    salesResponse: ''
  });

  const addNewCustomer = async () => {
    if (!newCustomer.customerName.trim() || !newCustomer.phoneNumber.trim()) {
      addNotification({
        title: "بيانات ناقصة",
        message: "يرجى إدخال اسم العميل ورقم الجوال على الأقل",
        type: "error",
      });
      return;
    }

    const customer: Customer = {
      id: `customer_${Date.now()}`,
      customerName: newCustomer.customerName.trim(),
      phoneNumber: newCustomer.phoneNumber.trim(),
      salesEmployee: newCustomer.salesEmployee.trim(),
      salesResponse: newCustomer.salesResponse.trim(),
      status: "غير مؤهل",
      callAttempts: 0,
    };

    try {
      setIsLoading(true);
      await saveCustomerToDB(customer);
      // Removed local state update, will reload from DB
      loadQualityCallsFromDB();
      setNewCustomer({
        customerName: '',
        phoneNumber: '',
        salesEmployee: '',
        salesResponse: ''
      });
      setIsAddDialogOpen(false);

      addNotification({
        title: "تم الإضافة",
        message: "تم إضافة العميل وحفظه في قاعدة البيانات بنجاح",
        type: "success",
      });
    } catch (error) {
      console.error('خطأ في إضافة العميل:', error);
      addNotification({
        title: "خطأ في الإضافة",
        message: "فشل في حفظ العميل في قاعدة البيانات",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // تصدير البيانات
  const exportToExcel = () => {
    const exportData = customers.map(customer => ({
      'اسم العميل': customer.customerName,
      'رقم الجوال': customer.phoneNumber,
      'موظف المبيعات': customer.salesEmployee,
      'رد موظف المبيعات': customer.salesResponse,
      'الحالة': customer.status,
      'سبب التأهيل': customer.qualificationReason || '',
      'تاريخ التحويل': customer.convertedDate || '',
      'محول بواسطة': customer.convertedBy || '',
      'عدد المحاولات': customer.callAttempts,
      'تاريخ آخر مكالمة': customer.lastCallDate || '',
      'ملاحظات': customer.notes || ''
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "مكالمات الجودة");
    XLSX.writeFile(workbook, `quality_calls_${new Date().toISOString().split('T')[0]}.xlsx`);

    addNotification({
      title: "تم التصدير",
      message: "تم تصدير البيانات بنجاح",
      type: "success",
    });
  };

  // تحويل العميل إلى مؤهل
  const convertToQualified = async () => {
    if (!selectedCustomer || !qualificationReason.trim()) {
      addNotification({
        title: "بيانات ناقصة",
        message: "يرجى إدخال سبب التأهيل",
        type: "error",
      });
      return;
    }

    // Prepare the data for updating in DB
    const updateData = {
      qualificationStatus: "مؤهل" as const,
      qualificationReason: qualificationReason.trim(),
      convertedDate: new Date().toLocaleDateString('ar-SA'),
      convertedBy: user?.username || "المستخدم الحالي",
      notes: notes.trim() || selectedCustomer.notes,
      callAttempts: selectedCustomer.callAttempts + 1,
      lastCallDate: new Date().toLocaleDateString('ar-SA')
    };

    try {
      setIsLoading(true);
      await DataService.updateQualityCall(selectedCustomer.id, updateData);

      // Reload data from DB
      loadQualityCallsFromDB();

      setIsDialogOpen(false);
      setQualificationReason("");
      setNotes("");
      setSelectedCustomer(null);

      addNotification({
        title: "تم التحويل",
        message: "تم تحويل العميل إلى مؤهل بنجاح",
        type: "success",
      });
    } catch (error) {
      console.error('خطأ في تحويل العميل:', error);
      addNotification({
        title: "خطأ في التحويل",
        message: "فشل في تحويل العميل",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // تحديث حالة العميل
  const updateCustomerStatus = async (customerId: string, newStatus: Customer['status']) => {
    try {
      setIsLoading(true);
      await DataService.updateQualityCall(customerId, {
        qualificationStatus: newStatus,
        callAttempts: customers.find(c => c.id === customerId)?.callAttempts + 1,
        lastCallDate: new Date().toLocaleDateString('ar-SA')
      });

      // Reload data from DB
      loadQualityCallsFromDB();

      addNotification({
        title: "تم التحديث",
        message: "تم تحديث حالة العميل بنجاح",
        type: "success",
      });
    } catch (error) {
      console.error('خطأ في تحديث حالة العميل:', error);
      addNotification({
        title: "خطأ في التحديث",
        message: "فشل في تحديث حالة العميل",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // تفعيل زر رفع الملف
  const triggerFileUpload = () => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  };

  // حذف عميل
  const deleteCustomer = async (customerId: string) => {
    try {
      setIsLoading(true);
      await DataService.deleteQualityCall(customerId);

      // Reload data from DB
      loadQualityCallsFromDB();

      addNotification({
        title: "تم الحذف",
        message: "تم حذف العميل بنجاح",
        type: "success",
      });
    } catch (error) {
      console.error('خطأ في حذف العميل:', error);
      addNotification({
        title: "خطأ في الحذف",
        message: "فشل في حذف العميل",
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">مكالمات الجودة</h1>
          <div className="flex gap-2">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              disabled={isLoading}
            />
            <Button 
              variant="outline" 
              onClick={triggerFileUpload}
              disabled={isLoading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isLoading ? "جاري التحميل..." : "رفع ملف Excel"}
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  إضافة عميل
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>إضافة عميل جديد</DialogTitle>
                  <DialogDescription>
                    أدخل بيانات العميل الجديد
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <div>
                    <Label htmlFor="customerName">اسم العميل *</Label>
                    <Input
                      id="customerName"
                      value={newCustomer.customerName}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="أدخل اسم العميل"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phoneNumber">رقم الجوال *</Label>
                    <Input
                      id="phoneNumber"
                      value={newCustomer.phoneNumber}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, phoneNumber: e.target.value }))}
                      placeholder="أدخل رقم الجوال"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salesEmployee">موظف المبيعات</Label>
                    <Input
                      id="salesEmployee"
                      value={newCustomer.salesEmployee}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, salesEmployee: e.target.value }))}
                      placeholder="أدخل اسم موظف المبيعات"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salesResponse">رد موظف المبيعات</Label>
                    <Textarea
                      id="salesResponse"
                      value={newCustomer.salesResponse}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, salesResponse: e.target.value }))}
                      placeholder="أدخل رد موظف المبيعات"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      إلغاء
                    </Button>
                    <Button onClick={addNewCustomer}>
                      إضافة العميل
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Button onClick={exportToExcel} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              تصدير
            </Button>
          </div>
        </div>

        {/* رسالة مساعدة لرفع الملفات */}
        {customers.length === 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="pt-6">
              <div className="text-center text-blue-800">
                <Upload className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold mb-2">رفع ملف العملاء</h3>
                <p className="text-sm mb-3">
                  لرفع بيانات العملاء، يرجى التأكد من أن ملف Excel يحتوي على الأعمدة التالية:
                </p>
                <div className="text-xs space-y-1 text-right">
                  <div>• <span className="font-medium">اسم العميل</span> (مطلوب)</div>
                  <div>• <span className="font-medium">رقم الجوال</span> (مطلوب)</div>
                  <div>• موظف المبيعات</div>
                  <div>• رد موظف المبيعات</div>
                  <div>• ملاحظات</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* كروت الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">العملاء المؤهلين</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{qualifiedCustomers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{conversionRate}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيد المراجعة</CardTitle>
              <Phone className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{pendingCustomers}</div>
            </CardContent>
          </Card>
        </div>

        {/* فلاتر البحث */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">البحث</Label>
                <div className="relative">
                  <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="البحث بالاسم، رقم الجوال، أو موظف المبيعات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-8"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status-filter">فلترة حسب الحالة</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="الكل">جميع الحالات</SelectItem>
                    <SelectItem value="غير مؤهل">غير مؤهل</SelectItem>
                    <SelectItem value="مؤهل">مؤهل</SelectItem>
                    <SelectItem value="قيد المراجعة">قيد المراجعة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* جدول العملاء */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة العملاء ({filteredCustomers.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-3">اسم العميل</th>
                    <th className="text-right p-3">رقم الجوال</th>
                    <th className="text-right p-3">موظف المبيعات</th>
                    <th className="text-right p-3">رد موظف المبيعات</th>
                    <th className="text-right p-3">الحالة</th>
                    <th className="text-right p-3">عدد المحاولات</th>
                    <th className="text-right p-3">آخر مكالمة</th>
                    <th className="text-right p-3">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id} className="border-b hover:bg-muted/50">
                      <td className="p-3 font-medium">{customer.customerName}</td>
                      <td className="p-3 font-mono">{customer.phoneNumber}</td>
                      <td className="p-3">{customer.salesEmployee}</td>
                      <td className="p-3 text-sm">{customer.salesResponse}</td>
                      <td className="p-3">
                        <Badge 
                          variant={
                            customer.status === "مؤهل" ? "default" :
                            customer.status === "قيد المراجعة" ? "secondary" : "destructive"
                          }
                        >
                          {customer.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">{customer.callAttempts}</td>
                      <td className="p-3 text-sm">{customer.lastCallDate || "لا يوجد"}</td>
                      <td className="p-3">
                        <div className="flex gap-2">
                          <Dialog open={isDialogOpen && selectedCustomer?.id === customer.id} 
                                  onOpenChange={(open) => {
                                    setIsDialogOpen(open);
                                    if (open) setSelectedCustomer(customer);
                                    else setSelectedCustomer(null);
                                  }}>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>تحديث حالة العميل</DialogTitle>
                                <DialogDescription>
                                  {customer.customerName} - {customer.phoneNumber}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 pt-4">
                                <div>
                                  <Label htmlFor="status">الحالة الجديدة</Label>
                                  <Select
                                    onValueChange={(value: Customer['status']) => 
                                      updateCustomerStatus(customer.id, value)
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="اختر الحالة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="غير مؤهل">غير مؤهل</SelectItem>
                                      <SelectItem value="مؤهل">مؤهل</SelectItem>
                                      <SelectItem value="قيد المراجعة">قيد المراجعة</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>

                                <div>
                                  <Label htmlFor="reason">سبب التأهيل</Label>
                                  <Input
                                    id="reason"
                                    value={qualificationReason}
                                    onChange={(e) => setQualificationReason(e.target.value)}
                                    placeholder="اكتب سبب تأهيل العميل..."
                                  />
                                </div>

                                <div>
                                  <Label htmlFor="notes">ملاحظات</Label>
                                  <Textarea
                                    id="notes"
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="ملاحظات إضافية..."
                                    rows={3}
                                  />
                                </div>

                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    إلغاء
                                  </Button>
                                  <Button onClick={convertToQualified}>
                                    تأهيل العميل
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>

                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => deleteCustomer(customer.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  لا توجد بيانات للعرض
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default QualityCalls;