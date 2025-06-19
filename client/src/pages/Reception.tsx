
import React, { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Phone, Mail, MessageSquare } from "lucide-react";

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

const mockData: ReceptionRecord[] = [
  {
    id: "1",
    date: "2025-06-19",
    customerName: "أحمد محمد السالم",
    phoneNumber: "0501234567",
    project: "النخيل",
    employee: "فاطمة أحمد",
    contactMethod: "اتصال هاتفي",
    type: "شكوى",
    customerRequest: "مشكلة في تسليم الوحدة",
    action: "تم التواصل مع قسم التسليم",
    status: "قيد المعالجة"
  },
  {
    id: "2",
    date: "2025-06-19",
    customerName: "نورا عبدالله",
    phoneNumber: "0559876543",
    project: "المعالي",
    employee: "خالد العتيبي",
    contactMethod: "واتساب",
    type: "استفسار",
    customerRequest: "استفسار عن موعد التسليم",
    action: "تم توضيح الموعد المتوقع",
    status: "مكتمل"
  },
  {
    id: "3",
    date: "2025-06-18",
    customerName: "سعد الشمري",
    phoneNumber: "0541239876",
    project: "سديم تاون",
    employee: "مريم الزهراني",
    contactMethod: "بريد إلكتروني",
    type: "طلب خدمة",
    customerRequest: "طلب تعديل في الوحدة",
    action: "تم إحالة الطلب لقسم المشاريع",
    status: "قيد المعالجة"
  }
];

export default function Reception() {
  const [records, setRecords] = useState<ReceptionRecord[]>(mockData);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newRecord, setNewRecord] = useState<Partial<ReceptionRecord>>({
    date: new Date().toISOString().split('T')[0],
    customerName: "",
    phoneNumber: "",
    project: "",
    employee: "",
    contactMethod: "",
    type: "",
    customerRequest: "",
    action: "",
    status: "جديد"
  });

  const filteredRecords = records.filter(record =>
    record.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.phoneNumber.includes(searchTerm) ||
    record.project.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddRecord = () => {
    if (newRecord.customerName && newRecord.phoneNumber) {
      const record: ReceptionRecord = {
        id: (records.length + 1).toString(),
        date: newRecord.date || new Date().toISOString().split('T')[0],
        customerName: newRecord.customerName || "",
        phoneNumber: newRecord.phoneNumber || "",
        project: newRecord.project || "",
        employee: newRecord.employee || "",
        contactMethod: newRecord.contactMethod || "",
        type: newRecord.type || "",
        customerRequest: newRecord.customerRequest || "",
        action: newRecord.action || "",
        status: newRecord.status || "جديد"
      };
      
      setRecords([record, ...records]);
      setNewRecord({
        date: new Date().toISOString().split('T')[0],
        customerName: "",
        phoneNumber: "",
        project: "",
        employee: "",
        contactMethod: "",
        type: "",
        customerRequest: "",
        action: "",
        status: "جديد"
      });
      setIsAddDialogOpen(false);
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
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                إضافة سجل جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة سجل استقبال جديد</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">التاريخ</Label>
                  <Input
                    id="date"
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="customerName">اسم العميل</Label>
                  <Input
                    id="customerName"
                    value={newRecord.customerName}
                    onChange={(e) => setNewRecord({...newRecord, customerName: e.target.value})}
                    placeholder="اسم العميل"
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">رقم الجوال</Label>
                  <Input
                    id="phoneNumber"
                    value={newRecord.phoneNumber}
                    onChange={(e) => setNewRecord({...newRecord, phoneNumber: e.target.value})}
                    placeholder="رقم الجوال"
                  />
                </div>
                <div>
                  <Label htmlFor="project">المشروع</Label>
                  <Input
                    id="project"
                    value={newRecord.project}
                    onChange={(e) => setNewRecord({...newRecord, project: e.target.value})}
                    placeholder="اسم المشروع"
                  />
                </div>
                <div>
                  <Label htmlFor="employee">الموظف</Label>
                  <Input
                    id="employee"
                    value={newRecord.employee}
                    onChange={(e) => setNewRecord({...newRecord, employee: e.target.value})}
                    placeholder="اسم الموظف"
                  />
                </div>
                <div>
                  <Label htmlFor="contactMethod">طريقة التواصل</Label>
                  <Select value={newRecord.contactMethod} onValueChange={(value) => setNewRecord({...newRecord, contactMethod: value})}>
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
                  <Select value={newRecord.type} onValueChange={(value) => setNewRecord({...newRecord, type: value})}>
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
                  <Select value={newRecord.status} onValueChange={(value) => setNewRecord({...newRecord, status: value})}>
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
                    value={newRecord.customerRequest}
                    onChange={(e) => setNewRecord({...newRecord, customerRequest: e.target.value})}
                    placeholder="تفاصيل طلب العميل"
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="action">الإجراء</Label>
                  <Textarea
                    id="action"
                    value={newRecord.action}
                    onChange={(e) => setNewRecord({...newRecord, action: e.target.value})}
                    placeholder="الإجراء المتخذ"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddRecord}>
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
