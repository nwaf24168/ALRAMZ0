
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
import { DataService } from "@/lib/dataService";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { Plus, Edit, Trash2, Search, Filter, Package, Truck, Clock } from "lucide-react";

interface DeliveryRecord {
  id: string;
  date: string;
  customerName: string;
  project: string;
  unitNumber: string;
  deliveryType: string;
  status: string;
  notes: string;
  deliveryDate?: string;
  createdBy: string;
  updatedBy?: string;
}

const deliveryTypes = ["تسليم نهائي", "تسليم مؤقت", "استلام مفاتيح", "تسليم وثائق"];
const deliveryStatuses = ["مجدول", "قيد التنفيذ", "مكتمل", "مؤجل", "ملغي"];

export default function Delivery() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DeliveryRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<DeliveryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // بيانات النموذج
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    customerName: "",
    project: "",
    unitNumber: "",
    deliveryType: "",
    status: "مجدول",
    notes: "",
    deliveryDate: "",
  });

  // تحميل البيانات عند تحميل الصفحة
  useEffect(() => {
    loadDeliveryRecords();
  }, []);

  const loadDeliveryRecords = async () => {
    try {
      setLoading(true);
      // تحميل البيانات من نفس مصدر صفحة التحليل (الحجوزات)
      const bookingsData = await DataService.getBookings();
      
      // تحويل بيانات الحجوزات إلى سجلات تسليم
      const deliveryRecords = bookingsData.map(booking => ({
        id: booking.id,
        date: booking.bookingDate,
        customerName: booking.customerName,
        project: booking.project,
        unitNumber: booking.unit,
        deliveryType: booking.deliveryDate ? "تسليم نهائي" : "مجدول",
        status: booking.deliveryDate ? "مكتمل" : "مجدول", 
        notes: `${booking.saleType} - ${booking.paymentMethod}`,
        deliveryDate: booking.deliveryDate || "",
        createdBy: booking.salesEmployee,
        updatedBy: undefined,
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

  const filteredRecords = records.filter(record => {
    const matchesSearch =
      record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.unitNumber.includes(searchTerm);

    const matchesStatus = statusFilter === "all" || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSave = async () => {
    if (!formData.customerName || !formData.project || !formData.deliveryType) {
      addNotification({
        title: "خطأ",
        message: "يرجى ملء جميع الحقول المطلوبة",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const recordData = {
        ...formData,
        id: editingRecord ? editingRecord.id : `delivery_${Date.now()}`,
        createdBy: user?.username || "unknown",
        updatedBy: editingRecord ? user?.username : undefined,
      };

      // حفظ البيانات كحجز جديد أو تحديث حجز موجود
      const bookingData = {
        id: recordData.id,
        bookingDate: recordData.date,
        customerName: recordData.customerName,
        project: recordData.project,
        building: "1", // قيمة افتراضية
        unit: recordData.unitNumber,
        paymentMethod: "نقدي", // قيمة افتراضية
        saleType: recordData.deliveryType,
        unitValue: 0, // قيمة افتراضية
        transferDate: recordData.date,
        salesEmployee: recordData.createdBy,
        deliveryDate: recordData.deliveryDate || null,
      };

      if (editingRecord) {
        await DataService.updateBooking(recordData.id, bookingData);
      } else {
        await DataService.saveBooking(bookingData);
      }

      await loadDeliveryRecords();
      handleCancel();

      addNotification({
        title: "تم بنجاح",
        message: editingRecord ? "تم تحديث السجل بنجاح" : "تم إضافة السجل بنجاح",
        type: "success",
      });
    } catch (error) {
      console.error("خطأ في حفظ السجل:", error);
      addNotification({
        title: "خطأ",
        message: "فشل في حفظ السجل",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: DeliveryRecord) => {
    setEditingRecord(record);
    setFormData({
      date: record.date,
      customerName: record.customerName,
      project: record.project,
      unitNumber: record.unitNumber,
      deliveryType: record.deliveryType,
      status: record.status,
      notes: record.notes,
      deliveryDate: record.deliveryDate || "",
    });
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
    setFormData({
      date: new Date().toISOString().split("T")[0],
      customerName: "",
      project: "",
      unitNumber: "",
      deliveryType: "",
      status: "مجدول",
      notes: "",
      deliveryDate: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مكتمل":
        return "bg-green-100 text-green-800";
      case "قيد التنفيذ":
        return "bg-blue-100 text-blue-800";
      case "مجدول":
        return "bg-yellow-100 text-yellow-800";
      case "مؤجل":
        return "bg-orange-100 text-orange-800";
      case "ملغي":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "مكتمل":
        return <Package className="h-4 w-4" />;
      case "قيد التنفيذ":
        return <Truck className="h-4 w-4" />;
      case "مجدول":
        return <Clock className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">إدارة التسليم</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة سجل تسليم
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingRecord ? "تعديل سجل التسليم" : "إضافة سجل تسليم جديد"}
                </DialogTitle>
                <DialogDescription>
                  أدخل بيانات التسليم في النموذج أدناه
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">التاريخ</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="customerName">اسم العميل</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    placeholder="اسم العميل"
                  />
                </div>
                <div>
                  <Label htmlFor="project">المشروع</Label>
                  <Input
                    id="project"
                    value={formData.project}
                    onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
                    placeholder="اسم المشروع"
                  />
                </div>
                <div>
                  <Label htmlFor="unitNumber">رقم الوحدة</Label>
                  <Input
                    id="unitNumber"
                    value={formData.unitNumber}
                    onChange={(e) => setFormData(prev => ({ ...prev, unitNumber: e.target.value }))}
                    placeholder="رقم الوحدة"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryType">نوع التسليم</Label>
                  <Select value={formData.deliveryType} onValueChange={(value) => setFormData(prev => ({ ...prev, deliveryType: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع التسليم" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">الحالة</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryStatuses.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="deliveryDate">تاريخ التسليم المتوقع</Label>
                  <Input
                    id="deliveryDate"
                    type="date"
                    value={formData.deliveryDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, deliveryDate: e.target.value }))}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="notes">ملاحظات</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="ملاحظات حول التسليم"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleCancel}>
                  إلغاء
                </Button>
                <Button onClick={handleSave} disabled={loading}>
                  حفظ
                </Button>
              </div>
            </DialogContent>
          </Dialog>
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
              <CardTitle className="text-sm font-medium">قيد التنفيذ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {records.filter(r => r.status === "قيد التنفيذ").length}
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
              <CardTitle className="text-sm font-medium">مجدول</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {records.filter(r => r.status === "مجدول").length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>سجلات التسليم</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="البحث في السجلات..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8 w-64"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="فلترة بالحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    {deliveryStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
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
                    <TableHead>التاريخ</TableHead>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>المشروع</TableHead>
                    <TableHead>رقم الوحدة</TableHead>
                    <TableHead>نوع التسليم</TableHead>
                    <TableHead>تاريخ التسليم</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead className="text-right">العمليات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell className="font-medium">{record.customerName}</TableCell>
                      <TableCell>{record.project}</TableCell>
                      <TableCell>{record.unitNumber}</TableCell>
                      <TableCell>{record.deliveryType}</TableCell>
                      <TableCell>{record.deliveryDate || "غير محدد"}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(record.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(record.status)}
                            {record.status}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(record)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id)}>
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
