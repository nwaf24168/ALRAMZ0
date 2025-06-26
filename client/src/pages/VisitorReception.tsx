import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Search, Users } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { DataService } from "@/lib/dataService";
import { useAuth } from "@/context/AuthContext";
import Layout from "@/components/layout/Layout";

interface VisitorRecord {
  id: string;
  name: string;
  phoneNumber: string;
  visitReason: string;
  requestedEmployee: string;
  date: string;
  time: string;
  createdBy: string;
}

export default function VisitorReception() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<VisitorRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<VisitorRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // بيانات النموذج
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [visitReason, setVisitReason] = useState("");
  const [requestedEmployee, setRequestedEmployee] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // تحميل البيانات عند تحميل الصفحة
  useEffect(() => {
    loadVisitorRecords();
    // تعيين التاريخ والوقت الحالي عند تحميل الصفحة
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().slice(0, 5));
  }, []);

  const loadVisitorRecords = async () => {
    try {
      setLoading(true);
      const data = await DataService.getVisitorRecords();
      setRecords(data);
    } catch (error) {
      console.error("خطأ في تحميل سجلات الزوار:", error);
      toast({
        title: "خطأ",
        description: "فشل في تحميل سجلات الزوار",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = records.filter(record =>
    record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.phoneNumber.includes(searchTerm) ||
    record.visitReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.requestedEmployee.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDialog = () => {
    setIsDialogOpen(true);
  };

  const handleEditRecord = (record: VisitorRecord) => {
    setEditingRecord(record);
    setName(record.name);
    setPhoneNumber(record.phoneNumber);
    setVisitReason(record.visitReason);
    setRequestedEmployee(record.requestedEmployee);
    setDate(record.date);
    setTime(record.time);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setEditingRecord(null);
    setName("");
    setPhoneNumber("");
    setVisitReason("");
    setRequestedEmployee("");
    const now = new Date();
    setDate(now.toISOString().split('T')[0]);
    setTime(now.toTimeString().slice(0, 5));
  };

  const handleCancelDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleSaveRecord = async () => {
    if (!name || !phoneNumber || !visitReason || !requestedEmployee || !date || !time) {
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
      name,
      phoneNumber,
      visitReason,
      requestedEmployee,
      date,
      time,
      createdBy: user.username,
    };

    try {
      setLoading(true);

      if (editingRecord) {
        await DataService.updateVisitorRecord(editingRecord.id, recordData);
        toast({
          title: "تم بنجاح",
          description: "تم تحديث السجل بنجاح",
        });
      } else {
        await DataService.saveVisitorRecord(recordData);
        toast({
          title: "تم بنجاح",
          description: "تم إضافة السجل بنجاح",
        });
      }

      await loadVisitorRecords();
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
    if (!window.confirm("هل أنت متأكد من حذف هذا السجل؟")) {
      return;
    }

    try {
      setLoading(true);
      await DataService.deleteVisitorRecord(id);
      await loadVisitorRecords();
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
  // تصدير البيانات إلى Excel
  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');

      const exportData = records.map((record, index) => ({
        'ت': index + 1,
        'اسم الزائر': record.name,
        'رقم الجوال': record.phoneNumber,
        'سبب الزيارة': record.visitReason,
        'الموظف المطلوب': record.requestedEmployee,
        'التاريخ': record.date,
        'الوقت': record.time,
        'تاريخ الإنشاء': new Date(record.createdBy).toISOString().split('T')[0],
        'المنشئ': record.createdBy
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'سجلات الزوار');

      const fileName = `سجلات_الزوار_${new Date().toISOString().split('T')[0]}.xlsx`;
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

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">الاستقبال</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenDialog} className="mobile-button">
                <Plus className="h-4 w-4 ml-2" />
                إضافة زائر جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingRecord ? "تعديل سجل الزائر" : "إضافة زائر جديد"}</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">الاسم</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="اسم الزائر"
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
                <div className="md:col-span-2">
                  <Label htmlFor="visitReason">سبب الزيارة</Label>
                  <Input
                    id="visitReason"
                    value={visitReason}
                    onChange={(e) => setVisitReason(e.target.value)}
                    placeholder="سبب الزيارة"
                  />
                </div>
                <div>
                  <Label htmlFor="requestedEmployee">الموظف المطلوب</Label>
                  <Input
                    id="requestedEmployee"
                    value={requestedEmployee}
                    onChange={(e) => setRequestedEmployee(e.target.value)}
                    placeholder="اسم الموظف المطلوب"
                  />
                </div>
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
                  <Label htmlFor="time">الوقت</Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={handleCancelDialog}>
                  إلغاء
                </Button>
                <Button onClick={handleSaveRecord} disabled={loading}>
                  {loading ? "جاري الحفظ..." : "حفظ"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                إجمالي الزوار
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{records.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">زوار اليوم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {records.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">الأسبوع الحالي</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {records.filter(r => {
                  const recordDate = new Date(r.date);
                  const now = new Date();
                  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                  return recordDate >= weekStart;
                }).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>سجلات الزوار</CardTitle>
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
                    <TableHead>الاسم</TableHead>
                    <TableHead>رقم الجوال</TableHead>
                    <TableHead>سبب الزيارة</TableHead>
                    <TableHead>الموظف المطلوب</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الوقت</TableHead>
                    <TableHead className="text-right">العمليات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{record.name}</TableCell>
                      <TableCell>{record.phoneNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{record.visitReason}</Badge>
                      </TableCell>
                      <TableCell>{record.requestedEmployee}</TableCell>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.time}</TableCell>
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
        <Button onClick={exportToExcel}>تصدير الي Excel</Button>
      </div>
    </Layout>
  );
}