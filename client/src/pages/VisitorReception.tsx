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
import { Plus, Edit, Trash2, Search, Users, Eye, MapPin, User } from "lucide-react";
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
  branch: string;
}

export default function VisitorReception() {
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<VisitorRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<VisitorRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState<VisitorRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("");

  // بيانات النموذج
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [visitReason, setVisitReason] = useState("");
  const [requestedEmployee, setRequestedEmployee] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  // متغيرات الاستيراد
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  // دالة للحصول على معلومات المنشئ
  const getCreatorInfo = (username: string) => {
    const creators = {
      'nouf': {
        name: 'نوف',
        department: 'الاستقبال',
        branch: 'فرع المبيعات'
      },
      'abdulrahman': {
        name: 'عبدالرحمن',
        department: 'الاستقبال',
        branch: 'الفرع الرئيسي'
      },
      'fahad': {
        name: 'فهد',
        department: 'الاستقبال',
        branch: 'فرع الشرقية'
      }
    };

    return creators[username.toLowerCase()] || {
      name: username,
      department: 'غير محدد',
      branch: 'غير محدد'
    };
  };

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

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.phoneNumber.includes(searchTerm) ||
      record.visitReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.requestedEmployee.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesBranch = selectedBranch === "" || 
      record.branch === selectedBranch || 
      getCreatorInfo(record.createdBy).branch === selectedBranch;

    return matchesSearch && matchesBranch;
  });

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

  const handleViewDetails = (record: VisitorRecord) => {
    setSelectedRecord(record);
    setIsDetailsDialogOpen(true);
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

    const creatorInfo = getCreatorInfo(user.username);
    const recordData = {
      name,
      phoneNumber,
      visitReason,
      requestedEmployee,
      date,
      time,
      createdBy: user.username,
      branch: creatorInfo.branch,
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
        'الاسم': record.name,
        'رقم الجوال': record.phoneNumber,
        'سبب الزيارة': record.visitReason,
        'الموظف المطلوب': record.requestedEmployee,
        'التاريخ': record.date,
        'الوقت': record.time
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
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      let successCount = 0;
      let errorCount = 0;

      // بدء من الصف الثاني (تخطي العناوين)
      for (let i = 1; i < data.length; i++) {
        const row = data[i] as any[];

        // التحقق من وجود البيانات الأساسية
        if (!row[0] || !row[1]) {
          errorCount++;
          continue;
        }

        try {
          // أخذ التاريخ كما هو من Excel
          let formattedDate = row[4] || new Date().toISOString().split('T')[0];

          // إذا كان التاريخ رقم من Excel، تحويله
          if (typeof formattedDate === 'number') {
            const excelDate = new Date((formattedDate - 25569) * 86400 * 1000);
            formattedDate = excelDate.toISOString().split('T')[0];
          } else if (formattedDate instanceof Date) {
            formattedDate = formattedDate.toISOString().split('T')[0];
          } else if (typeof formattedDate === 'string' && formattedDate.includes('/')) {
            // تحويل التاريخ من dd/mm/yyyy إلى yyyy-mm-dd
            const parts = formattedDate.split('/');
            if (parts.length === 3) {
              formattedDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            }
          }

          // معالجة الوقت من Excel
          let formattedTime = row[5] || new Date().toTimeString().slice(0, 5);

          // إذا كان الوقت رقم عشري من Excel، تحويله إلى صيغة الوقت
          if (typeof formattedTime === 'number') {
            // Excel يحفظ الوقت كجزء من اليوم (0.5 = 12:00 PM)
            const totalMinutes = formattedTime * 24 * 60;
            const hours = Math.floor(totalMinutes / 60);
            const minutes = Math.floor(totalMinutes % 60);
            formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
          } else if (typeof formattedTime === 'string') {
            // إزالة أي مسافات أو رموز غير مرغوبة
            formattedTime = formattedTime.trim();

            // معالجة صيغة AM/PM
            if (formattedTime.includes('AM') || formattedTime.includes('PM')) {
              const isPM = formattedTime.includes('PM');
              let timeOnly = formattedTime.replace(/AM|PM/g, '').trim();

              if (timeOnly.includes(':')) {
                const parts = timeOnly.split(':');
                let hours = parseInt(parts[0]);
                const minutes = parts[1] ? parseInt(parts[1]) : 0;

                // تحويل من 12-hour إلى 24-hour
                if (isPM && hours !== 12) {
                  hours += 12;
                } else if (!isPM && hours === 12) {
                  hours = 0;
                }

                formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
              }
            }
            // إذا كان الوقت بصيغة HH:MM:SS، اقتطاع الثواني
            else if (formattedTime.includes(':') && formattedTime.split(':').length === 3) {
              formattedTime = formattedTime.split(':').slice(0, 2).join(':');
            }
          }

          if (!user?.username) {
            toast({
              title: "خطأ",
              description: "يجب تسجيل الدخول أولاً",
              variant: "destructive",
            });
            return;
          }

          const creatorInfo = getCreatorInfo(user.username);
          const recordData = {
            name: row[0] || '',
            phoneNumber: row[1] || '',
            visitReason: row[2] || '',
            requestedEmployee: row[3] || '',
            date: formattedDate,
            time: formattedTime,
            createdBy: user.username,
            branch: creatorInfo.branch,
          };

          await DataService.saveVisitorRecord(recordData);
          successCount++;
        } catch (error) {
          console.error(`خطأ في معالجة السطر ${i + 1}:`, error);
          errorCount++;
        }
      }

      await loadVisitorRecords();

      toast({
        title: "تم الاستيراد",
        description: `تم استيراد ${successCount} سجل بنجاح. ${errorCount > 0 ? `فشل في ${errorCount} سجل.` : ''}`
      });

    } catch (error) {
      console.error("خطأ في استيراد البيانات:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في استيراد البيانات من ملف Excel"
      });
    } finally {
      setIsImporting(false);
      setImportFile(null);
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
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="excel-import"
                  />
                  <label
                    htmlFor="excel-import"
                    className="cursor-pointer bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                  >
                    اختيار ملف Excel
                  </label>
                  {importFile && (
                    <Button
                      onClick={importFromExcel}
                      disabled={isImporting}
                      size="sm"
                    >
                      {isImporting ? "جاري الاستيراد..." : "استيراد"}
                    </Button>
                  )}
                  <Button onClick={exportToExcel} size="sm" variant="outline">
                    تصدير إلى Excel
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">جميع الفروع</option>
                    <option value="فرع المبيعات">فرع المبيعات</option>
                    <option value="الفرع الرئيسي">الفرع الرئيسي</option>
                    <option value="فرع الشرقية">فرع الشرقية</option>
                    <option value="غير محدد">غير محدد</option>
                  </select>
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
                    <TableHead>الفرع</TableHead>
                    <TableHead className="text-right">العمليات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => {
                    const creatorInfo = getCreatorInfo(record.createdBy);
                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.name}</TableCell>
                        <TableCell>{record.phoneNumber}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{record.visitReason}</Badge>
                        </TableCell>
                        <TableCell>{record.requestedEmployee}</TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.time}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">
                            {record.branch || creatorInfo.branch}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleViewDetails(record)} title="تفاصيل العملية">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleEditRecord(record)} title="تعديل">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteRecord(record.id)} title="حذف">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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

        {/* نافذة تفاصيل العملية */}
        <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
          <DialogContent className="max-w-2xl bg-card text-card-foreground border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <Eye className="h-5 w-5 text-primary" />
                تفاصيل العملية
              </DialogTitle>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-6">
                {/* معلومات الزائر */}
                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <Users className="h-5 w-5 text-primary" />
                    معلومات الزائر
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">الاسم</Label>
                      <p className="text-sm font-semibold text-foreground mt-1">{selectedRecord.name}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">رقم الجوال</Label>
                      <p className="text-sm font-semibold text-foreground mt-1">{selectedRecord.phoneNumber}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">سبب الزيارة</Label>
                      <p className="text-sm font-semibold text-foreground mt-1">{selectedRecord.visitReason}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">الموظف المطلوب</Label>
                      <p className="text-sm font-semibold text-foreground mt-1">{selectedRecord.requestedEmployee}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">التاريخ</Label>
                      <p className="text-sm font-semibold text-foreground mt-1">{selectedRecord.date}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">الوقت</Label>
                      <p className="text-sm font-semibold text-foreground mt-1">{selectedRecord.time}</p>
                    </div>
                  </div>
                </div>

                {/* معلومات المنشئ */}
                <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-foreground">
                    <User className="h-5 w-5 text-primary" />
                    معلومات المنشئ
                  </h3>
                  {(() => {
                    const creatorInfo = getCreatorInfo(selectedRecord.createdBy);
                    return (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-primary" />
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">الاسم</Label>
                            <p className="text-sm font-semibold text-foreground mt-1">{creatorInfo.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-primary border-primary bg-primary/10">
                            {creatorInfo.department}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">الموقع</Label>
                            <p className="text-sm font-semibold text-foreground mt-1">
                              {selectedRecord.branch || getCreatorInfo(selectedRecord.createdBy).branch}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* معلومات النظام */}
                <div className="bg-muted/50 p-4 rounded-lg border border-border">
                  <h3 className="text-lg font-semibold mb-3 text-foreground">معلومات النظام</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">تاريخ الإنشاء</Label>
                      <p className="text-sm font-semibold text-foreground mt-1">
                        {selectedRecord.createdAt ? new Date(selectedRecord.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">وقت الإنشاء</Label>
                      <p className="text-sm font-semibold text-foreground mt-1">
                        {selectedRecord.createdAt ? new Date(selectedRecord.createdAt).toLocaleTimeString('ar-SA') : 'غير محدد'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" onClick={() => setIsDetailsDialogOpen(false)} className="border-border text-foreground">
                    إغلاق
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

      </div>
    </Layout>
  );
}