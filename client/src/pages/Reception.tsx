import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Phone, Mail, MessageSquare, Users } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { DataService } from "@/lib/dataService";
import { useAuth } from "@/context/AuthContext";

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
const statuses = ["جديد", "قيد المعالجة", "مكتمل", "مؤجل"];

export default function Reception() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ReceptionRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<ReceptionRecord[]>([]);

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
        await DataService.saveReceptionRecord(recordData);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مكتمل":
        return "bg-green-100 text-green-800";
      case "قيد المعالجة":
        return "bg-yellow-100 text-yellow-800";
      case "مؤجل":
        return "bg-red-100 text-red-800";
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">الاستقبال</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog}>
                <Plus className="h-4 w-4 ml-2" />
                إضافة سجل جديد
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
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleCancelDialog}>
                  إلغاء
                </Button>
                <Button onClick={handleSaveRecord} disabled={loading}>
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
              <CardTitle className="text-sm font-medium">اليوم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {records.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
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