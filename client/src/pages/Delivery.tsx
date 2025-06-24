
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataService } from "@/lib/dataService";
import { useNotification } from "@/context/NotificationContext";
import { Plus, Edit, Trash2, Search, Filter, Package, Truck, Clock, CheckCircle, AlertCircle } from "lucide-react";

interface DeliveryRecord {
  id: string;
  bookingId: string;
  bookingDate: string;
  customerName: string;
  customerPhone?: string;
  project: string;
  building?: string;
  unit: string;
  paymentMethod: string;
  saleType: string;
  unitValue: number;
  transferDate?: string;
  salesEmployee: string;
  constructionEndDate?: string;
  finalReceiptDate?: string;
  electricityTransferDate?: string;
  waterTransferDate?: string;
  deliveryDate?: string;
  projectNotes?: string;
  status: string;
  statusSalesFilled: boolean;
  statusProjectsFilled: boolean;
  statusCustomerFilled: boolean;
  isEvaluated: boolean;
  evaluationScore?: number;
  createdBy: string;
  updatedBy?: string;
}

const paymentMethods = ["نقدي", "تحويل بنكي", "شيك", "أقساط"];
const saleTypes = ["جاهز", "على الخارطة"];
const projects = ["مشروع النخيل", "مشروع الياسمين", "مشروع الورود"];

export default function Delivery() {
  const { user } = useAuth();
  const { canAccessPage, hasEditAccess, isReadOnly } = usePermissions();
  const { addNotification } = useNotification();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DeliveryRecord | null>(null);
  const [currentStage, setCurrentStage] = useState<"sales" | "projects" | "customer">("sales");
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<DeliveryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // بيانات النموذج للمبيعات
  const [salesFormData, setSalesFormData] = useState({
    bookingDate: new Date().toISOString().split("T")[0],
    customerName: "",
    customerPhone: "",
    project: "",
    building: "",
    unit: "",
    paymentMethod: "",
    saleType: "",
    unitValue: 0,
    transferDate: "",
    salesEmployee: "",
  });

  // بيانات النموذج للمشاريع
  const [projectsFormData, setProjectsFormData] = useState({
    constructionEndDate: "",
    finalReceiptDate: "",
    electricityTransferDate: "",
    waterTransferDate: "",
    deliveryDate: "",
    projectNotes: "",
  });

  // بيانات النموذج لراحة العملاء
  const [customerFormData, setCustomerFormData] = useState({
    isEvaluated: false,
    evaluationScore: 0,
  });

  // تحميل البيانات عند تحميل الصفحة
  useEffect(() => {
    loadDeliveryRecords();
  }, []);

  const loadDeliveryRecords = async () => {
    try {
      setLoading(true);
      const bookingsData = await DataService.getBookings();

      const deliveryRecords = bookingsData.map(booking => ({
        id: booking.id.toString(),
        bookingId: booking.bookingId || booking.id.toString(),
        bookingDate: booking.bookingDate,
        customerName: booking.customerName,
        customerPhone: booking.customerPhone || "",
        project: booking.project,
        building: booking.building || "",
        unit: booking.unit,
        paymentMethod: booking.paymentMethod,
        saleType: booking.saleType,
        unitValue: booking.unitValue || 0,
        transferDate: booking.transferDate || "",
        salesEmployee: booking.salesEmployee,
        constructionEndDate: booking.constructionEndDate || "",
        finalReceiptDate: booking.finalReceiptDate || "",
        electricityTransferDate: booking.electricityTransferDate || "",
        waterTransferDate: booking.waterTransferDate || "",
        deliveryDate: booking.deliveryDate || "",
        projectNotes: booking.projectNotes || "",
        status: getOverallStatus(booking),
        statusSalesFilled: booking.statusSalesFilled || false,
        statusProjectsFilled: booking.statusProjectsFilled || false,
        statusCustomerFilled: booking.statusCustomerFilled || false,
        isEvaluated: booking.isEvaluated || false,
        evaluationScore: booking.evaluationScore || 0,
        createdBy: booking.createdBy || "unknown",
        updatedBy: booking.updatedBy,
      }));

      setRecords(deliveryRecords);
      console.log("تم تحميل سجلات التسليم:", deliveryRecords.length);
    } catch (error) {
      console.error("خطأ في تحميل سجلات التسليم:", error);
      addNotification({
        title: "خطأ",
        message: "فشل في تحميل سجلات التسليم",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const getOverallStatus = (booking: any) => {
    if (booking.statusCustomerFilled) return "مكتمل من جميع الأقسام";
    if (booking.statusProjectsFilled) return "مكتمل من المبيعات والمشاريع - باقي راحة العملاء";
    if (booking.statusSalesFilled) return "مكتمل من المبيعات - باقي المشاريع وراحة العملاء";
    return "جديد - لم يتم التعبئة من أي قسم";
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.unit.includes(searchTerm) ||
      record.bookingId.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || record.status.includes(statusFilter);

    return matchesSearch && matchesStatus;
  });

  const generateBookingId = () => {
    return `BK${Date.now()}`;
  };

  const handleSaveSales = async () => {
    if (!salesFormData.customerName || !salesFormData.project || !salesFormData.unit) {
      addNotification({
        title: "خطأ",
        message: "يرجى ملء جميع الحقول المطلوبة للمبيعات",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const bookingData = {
        id: editingRecord ? editingRecord.id : generateBookingId(),
        bookingId: editingRecord ? editingRecord.bookingId : generateBookingId(),
        bookingDate: salesFormData.bookingDate,
        customerName: salesFormData.customerName,
        customerPhone: salesFormData.customerPhone,
        project: salesFormData.project,
        building: salesFormData.building,
        unit: salesFormData.unit,
        paymentMethod: salesFormData.paymentMethod,
        saleType: salesFormData.saleType,
        unitValue: salesFormData.unitValue,
        transferDate: salesFormData.transferDate,
        salesEmployee: salesFormData.salesEmployee,
        status: "مكتمل من المبيعات",
        statusSalesFilled: true,
        statusProjectsFilled: editingRecord ? editingRecord.statusProjectsFilled : false,
        statusCustomerFilled: editingRecord ? editingRecord.statusCustomerFilled : false,
        isEvaluated: editingRecord ? editingRecord.isEvaluated : false,
        evaluationScore: editingRecord ? editingRecord.evaluationScore : undefined,
        createdBy: editingRecord ? editingRecord.createdBy : user?.username || "unknown",
        updatedBy: user?.username,
      };

      if (editingRecord) {
        await DataService.updateBooking(editingRecord.id, bookingData);
      } else {
        await DataService.saveBooking(bookingData);
      }

      await loadDeliveryRecords();
      handleCancel();

      addNotification({
        title: "تم بنجاح",
        message: "تم حفظ بيانات المبيعات بنجاح",
        type: "success",
      });
    } catch (error) {
      console.error("خطأ في حفظ بيانات المبيعات:", error);
      addNotification({
        title: "خطأ",
        message: "فشل في حفظ بيانات المبيعات",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProjects = async () => {
    if (!editingRecord || !editingRecord.statusSalesFilled) {
      addNotification({
        title: "خطأ",
        message: "يجب إكمال بيانات المبيعات أولاً",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const bookingData = {
        ...editingRecord,
        constructionEndDate: projectsFormData.constructionEndDate,
        finalReceiptDate: projectsFormData.finalReceiptDate,
        electricityTransferDate: projectsFormData.electricityTransferDate,
        waterTransferDate: projectsFormData.waterTransferDate,
        deliveryDate: projectsFormData.deliveryDate,
        projectNotes: projectsFormData.projectNotes,
        statusProjectsFilled: true,
        updatedBy: user?.username,
      };

      await DataService.updateBooking(editingRecord.id, bookingData);
      await loadDeliveryRecords();
      handleCancel();

      addNotification({
        title: "تم بنجاح",
        message: "تم حفظ بيانات المشاريع بنجاح",
        type: "success",
      });
    } catch (error) {
      console.error("خطأ في حفظ بيانات المشاريع:", error);
      addNotification({
        title: "خطأ",
        message: "فشل في حفظ بيانات المشاريع",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCustomer = async () => {
    if (!editingRecord || !editingRecord.statusProjectsFilled) {
      addNotification({
        title: "خطأ",
        message: "يجب إكمال بيانات المبيعات والمشاريع أولاً",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const bookingData = {
        ...editingRecord,
        isEvaluated: customerFormData.isEvaluated,
        evaluationScore: customerFormData.isEvaluated ? customerFormData.evaluationScore : undefined,
        statusCustomerFilled: true,
        updatedBy: user?.username,
      };

      await DataService.updateBooking(editingRecord.id, bookingData);
      await loadDeliveryRecords();
      handleCancel();

      addNotification({
        title: "تم بنجاح",
        message: "تم حفظ بيانات راحة العملاء بنجاح",
        type: "success",
      });
    } catch (error) {
      console.error("خطأ في حفظ بيانات راحة العملاء:", error);
      addNotification({
        title: "خطأ",
        message: "فشل في حفظ بيانات راحة العملاء",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: DeliveryRecord) => {
    setEditingRecord(record);
    
    // تعبئة نموذج المبيعات
    setSalesFormData({
      bookingDate: record.bookingDate,
      customerName: record.customerName,
      customerPhone: record.customerPhone || "",
      project: record.project,
      building: record.building || "",
      unit: record.unit,
      paymentMethod: record.paymentMethod,
      saleType: record.saleType,
      unitValue: record.unitValue,
      transferDate: record.transferDate || "",
      salesEmployee: record.salesEmployee,
    });

    // تعبئة نموذج المشاريع
    setProjectsFormData({
      constructionEndDate: record.constructionEndDate || "",
      finalReceiptDate: record.finalReceiptDate || "",
      electricityTransferDate: record.electricityTransferDate || "",
      waterTransferDate: record.waterTransferDate || "",
      deliveryDate: record.deliveryDate || "",
      projectNotes: record.projectNotes || "",
    });

    // تعبئة نموذج راحة العملاء
    setCustomerFormData({
      isEvaluated: record.isEvaluated,
      evaluationScore: record.evaluationScore || 0,
    });

    // تحديد المرحلة المناسبة
    if (!record.statusSalesFilled) {
      setCurrentStage("sales");
    } else if (!record.statusProjectsFilled) {
      setCurrentStage("projects");
    } else if (!record.statusCustomerFilled) {
      setCurrentStage("customer");
    } else {
      setCurrentStage("sales"); // للمراجعة
    }

    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      setLoading(true);
      await DataService.deleteBooking(id);
      await loadDeliveryRecords();
      addNotification({
        title: "تم بنجاح",
        message: "تم حذف السجل بنجاح",
        type: "success",
      });
    } catch (error) {
      console.error("خطأ في حذف السجل:", error);
      addNotification({
        title: "خطأ",
        message: "فشل في حذف السجل",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsDialogOpen(false);
    setEditingRecord(null);
    setCurrentStage("sales");
    
    setSalesFormData({
      bookingDate: new Date().toISOString().split("T")[0],
      customerName: "",
      customerPhone: "",
      project: "",
      building: "",
      unit: "",
      paymentMethod: "",
      saleType: "",
      unitValue: 0,
      transferDate: "",
      salesEmployee: "",
    });

    setProjectsFormData({
      constructionEndDate: "",
      finalReceiptDate: "",
      electricityTransferDate: "",
      waterTransferDate: "",
      deliveryDate: "",
      projectNotes: "",
    });

    setCustomerFormData({
      isEvaluated: false,
      evaluationScore: 0,
    });
  };

  const getStatusColor = (record: DeliveryRecord) => {
    if (record.statusCustomerFilled) return "bg-green-100 text-green-800";
    if (record.statusProjectsFilled) return "bg-blue-100 text-blue-800";
    if (record.statusSalesFilled) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getStatusIcon = (record: DeliveryRecord) => {
    if (record.statusCustomerFilled) return <CheckCircle className="h-4 w-4" />;
    if (record.statusProjectsFilled) return <Truck className="h-4 w-4" />;
    if (record.statusSalesFilled) return <Package className="h-4 w-4" />;
    return <AlertCircle className="h-4 w-4" />;
  };

  // فحص صلاحيات الوصول للصفحة
  if (!canAccessPage("delivery")) {
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

  const readOnly = isReadOnly("delivery");

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            إدارة التسليم - مراحل متعددة {readOnly && <span className="text-sm text-gray-500">(قراءة فقط)</span>}
          </h1>
          <div className="flex flex-wrap items-center gap-2 sm:space-x-2 sm:space-x-reverse">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
              {hasEditAccess("delivery") && (
                <Button variant="outline" className="mobile-button">
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة حجز جديد
                </Button>
              )}
              </DialogTrigger>

              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRecord ? "تعديل بيانات الحجز" : "إضافة حجز جديد"}
                </DialogTitle>
                <DialogDescription>
                  يمر الحجز بثلاث مراحل: المبيعات، إدارة المشاريع، راحة العملاء
                </DialogDescription>
              </DialogHeader>

              <Tabs value={currentStage} onValueChange={(value) => setCurrentStage(value as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sales">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      المبيعات
                      {editingRecord?.statusSalesFilled && <CheckCircle className="h-3 w-3 text-green-600" />}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="projects" disabled={!editingRecord?.statusSalesFilled && !editingRecord}>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      إدارة المشاريع
                      {editingRecord?.statusProjectsFilled && <CheckCircle className="h-3 w-3 text-green-600" />}
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="customer" disabled={!editingRecord?.statusProjectsFilled}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      راحة العملاء
                      {editingRecord?.statusCustomerFilled && <CheckCircle className="h-3 w-3 text-green-600" />}
                    </div>
                  </TabsTrigger>
                </TabsList>

                {/* مرحلة المبيعات */}
                <TabsContent value="sales" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="bookingDate">تاريخ الحجز</Label>
                      <Input
                        id="bookingDate"
                        type="date"
                        value={salesFormData.bookingDate}
                        onChange={(e) => setSalesFormData(prev => ({ ...prev, bookingDate: e.target.value }))}
                        disabled={readOnly || (editingRecord?.statusSalesFilled && editingRecord)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerName">اسم العميل *</Label>
                      <Input
                        id="customerName"
                        value={salesFormData.customerName}
                        onChange={(e) => setSalesFormData(prev => ({ ...prev, customerName: e.target.value }))}
                        placeholder="اسم العميل"
                        disabled={readOnly || (editingRecord?.statusSalesFilled && editingRecord)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="customerPhone">رقم العميل</Label>
                      <Input
                        id="customerPhone"
                        value={salesFormData.customerPhone}
                        onChange={(e) => setSalesFormData(prev => ({ ...prev, customerPhone: e.target.value }))}
                        placeholder="رقم الهاتف"
                        disabled={readOnly || (editingRecord?.statusSalesFilled && editingRecord)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="project">المشروع *</Label>
                      <Select 
                        value={salesFormData.project} 
                        onValueChange={(value) => setSalesFormData(prev => ({ ...prev, project: value }))}
                        disabled={readOnly || (editingRecord?.statusSalesFilled && editingRecord)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المشروع" />
                        </SelectTrigger>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem key={project} value={project}>
                              {project}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="building">العمارة</Label>
                      <Input
                        id="building"
                        value={salesFormData.building}
                        onChange={(e) => setSalesFormData(prev => ({ ...prev, building: e.target.value }))}
                        placeholder="رقم العمارة"
                        disabled={readOnly || (editingRecord?.statusSalesFilled && editingRecord)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="unit">الوحدة *</Label>
                      <Input
                        id="unit"
                        value={salesFormData.unit}
                        onChange={(e) => setSalesFormData(prev => ({ ...prev, unit: e.target.value }))}
                        placeholder="رقم الوحدة"
                        disabled={readOnly || (editingRecord?.statusSalesFilled && editingRecord)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                      <Select 
                        value={salesFormData.paymentMethod} 
                        onValueChange={(value) => setSalesFormData(prev => ({ ...prev, paymentMethod: value }))}
                        disabled={readOnly || (editingRecord?.statusSalesFilled && editingRecord)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر طريقة الدفع" />
                        </SelectTrigger>
                        <SelectContent>
                          {paymentMethods.map((method) => (
                            <SelectItem key={method} value={method}>
                              {method}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="saleType">نوع البيع</Label>
                      <Select 
                        value={salesFormData.saleType} 
                        onValueChange={(value) => setSalesFormData(prev => ({ ...prev, saleType: value }))}
                        disabled={readOnly || (editingRecord?.statusSalesFilled && editingRecord)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع البيع" />
                        </SelectTrigger>
                        <SelectContent>
                          {saleTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="unitValue">قيمة الوحدة</Label>
                      <Input
                        id="unitValue"
                        type="number"
                        value={salesFormData.unitValue}
                        onChange={(e) => setSalesFormData(prev => ({ ...prev, unitValue: Number(e.target.value) }))}
                        placeholder="قيمة الوحدة بالريال"
                        disabled={readOnly || (editingRecord?.statusSalesFilled && editingRecord)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="transferDate">تاريخ الإفراغ</Label>
                      <Input
                        id="transferDate"
                        type="date"
                        value={salesFormData.transferDate}
                        onChange={(e) => setSalesFormData(prev => ({ ...prev, transferDate: e.target.value }))}
                        disabled={readOnly || (editingRecord?.statusSalesFilled && editingRecord)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="salesEmployee">اسم موظف المبيعات</Label>
                      <Input
                        id="salesEmployee"
                        value={salesFormData.salesEmployee}
                        onChange={(e) => setSalesFormData(prev => ({ ...prev, salesEmployee: e.target.value }))}
                        placeholder="اسم الموظف"
                        disabled={readOnly || (editingRecord?.statusSalesFilled && editingRecord)}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={handleCancel}>
                      إلغاء
                    </Button>
                    {!editingRecord?.statusSalesFilled && (
                      <Button onClick={handleSaveSales} disabled={loading || readOnly}>
                        حفظ بيانات المبيعات
                      </Button>
                    )}
                  </div>
                </TabsContent>

                {/* مرحلة إدارة المشاريع */}
                <TabsContent value="projects" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="constructionEndDate">تاريخ انتهاء أعمال البناء</Label>
                      <Input
                        id="constructionEndDate"
                        type="date"
                        value={projectsFormData.constructionEndDate}
                        onChange={(e) => setProjectsFormData(prev => ({ ...prev, constructionEndDate: e.target.value }))}
                        disabled={readOnly || editingRecord?.statusProjectsFilled}
                      />
                    </div>
                    <div>
                      <Label htmlFor="finalReceiptDate">تاريخ الاستلام النهائي للوحدة</Label>
                      <Input
                        id="finalReceiptDate"
                        type="date"
                        value={projectsFormData.finalReceiptDate}
                        onChange={(e) => setProjectsFormData(prev => ({ ...prev, finalReceiptDate: e.target.value }))}
                        disabled={readOnly || editingRecord?.statusProjectsFilled}
                      />
                    </div>
                    <div>
                      <Label htmlFor="electricityTransferDate">تاريخ نقل عداد الكهرباء</Label>
                      <Input
                        id="electricityTransferDate"
                        type="date"
                        value={projectsFormData.electricityTransferDate}
                        onChange={(e) => setProjectsFormData(prev => ({ ...prev, electricityTransferDate: e.target.value }))}
                        disabled={readOnly || editingRecord?.statusProjectsFilled}
                      />
                    </div>
                    <div>
                      <Label htmlFor="waterTransferDate">تاريخ نقل عداد الماء</Label>
                      <Input
                        id="waterTransferDate"
                        type="date"
                        value={projectsFormData.waterTransferDate}
                        onChange={(e) => setProjectsFormData(prev => ({ ...prev, waterTransferDate: e.target.value }))}
                        disabled={readOnly || editingRecord?.statusProjectsFilled}
                      />
                    </div>
                    <div>
                      <Label htmlFor="deliveryDate">تاريخ التسليم للعميل</Label>
                      <Input
                        id="deliveryDate"
                        type="date"
                        value={projectsFormData.deliveryDate}
                        onChange={(e) => setProjectsFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                        disabled={readOnly || editingRecord?.statusProjectsFilled}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="projectNotes">ملاحظات المشاريع</Label>
                      <Textarea
                        id="projectNotes"
                        value={projectsFormData.projectNotes}
                        onChange={(e) => setProjectsFormData(prev => ({ ...prev, projectNotes: e.target.value }))}
                        placeholder="ملاحظات إدارة المشاريع"
                        rows={3}
                        disabled={readOnly || editingRecord?.statusProjectsFilled}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={handleCancel}>
                      إلغاء
                    </Button>
                    {editingRecord?.statusSalesFilled && !editingRecord?.statusProjectsFilled && (
                      <Button onClick={handleSaveProjects} disabled={loading || readOnly}>
                        حفظ بيانات المشاريع
                      </Button>
                    )}
                  </div>
                </TabsContent>

                {/* مرحلة راحة العملاء */}
                <TabsContent value="customer" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        id="isEvaluated"
                        checked={customerFormData.isEvaluated}
                        onChange={(e) => setCustomerFormData(prev => ({ ...prev, isEvaluated: e.target.checked }))}
                        disabled={readOnly || editingRecord?.statusCustomerFilled}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="isEvaluated">هل تم تقييم العميل؟</Label>
                    </div>
                    
                    {customerFormData.isEvaluated && (
                      <div>
                        <Label htmlFor="evaluationScore">نسبة التقييم (من 1 إلى 10)</Label>
                        <Input
                          id="evaluationScore"
                          type="number"
                          min="1"
                          max="10"
                          value={customerFormData.evaluationScore}
                          onChange={(e) => setCustomerFormData(prev => ({ ...prev, evaluationScore: Number(e.target.value) }))}
                          placeholder="أدخل التقييم من 1 إلى 10"
                          disabled={readOnly || editingRecord?.statusCustomerFilled}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={handleCancel}>
                      إلغاء
                    </Button>
                    {editingRecord?.statusProjectsFilled && !editingRecord?.statusCustomerFilled && (
                      <Button onClick={handleSaveCustomer} disabled={loading || readOnly}>
                        حفظ بيانات راحة العملاء
                      </Button>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{records.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">مكتمل من المبيعات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {records.filter(r => r.statusSalesFilled).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">مكتمل من المشاريع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {records.filter(r => r.statusProjectsFilled).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">مكتمل من جميع الأقسام</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {records.filter(r => r.statusCustomerFilled).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>سجلات الحجوزات</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في الحجوزات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="فلترة بالحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="جديد">جديد</SelectItem>
                    <SelectItem value="المبيعات">مكتمل من المبيعات</SelectItem>
                    <SelectItem value="المشاريع">مكتمل من المشاريع</SelectItem>
                    <SelectItem value="مكتمل">مكتمل من جميع الأقسام</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الحجز</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>المشروع</TableHead>
                    <TableHead>الوحدة</TableHead>
                    <TableHead>نوع البيع</TableHead>
                    <TableHead>موظف المبيعات</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-right">العمليات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.bookingId}</TableCell>
                      <TableCell>{record.bookingDate}</TableCell>
                      <TableCell className="font-medium">{record.customerName}</TableCell>
                      <TableCell>{record.project}</TableCell>
                      <TableCell>{record.unit}</TableCell>
                      <TableCell>{record.saleType}</TableCell>
                      <TableCell>{record.salesEmployee}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(record)}
                            <span className="text-xs">
                              {record.status.length > 30 ? `${record.status.substring(0, 30)}...` : record.status}
                            </span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {hasEditAccess("delivery") ? (
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">قراءة فقط</span>
                          )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredRecords.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  لا توجد حجوزات تطابق البحث
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
