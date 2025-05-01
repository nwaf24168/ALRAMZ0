
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Filter, Plus, Trash2, Edit, Eye } from "lucide-react";

interface BookingRecord {
  id: string;
  bookingDate: string;
  customerName: string;
  customerPhone: string;
  project: string;
  building: string;
  unit: string;
  saleType: string;
  unitValue: number;
  paymentMethod: string;
  salesEmployee: string;
  status_sales_filled: string | boolean;
  status_projects_filled: string | boolean;
  status_customer_filled: string | boolean;
  final_status: string;
  transferDate: string;
  constructionEndDate: string;
  finalReceiptDate: string;
  electricityTransferDate: string;
  waterTransferDate: string;
  deliveryDate: string;
  isEvaluated: boolean;
  evaluationScore: number;
}

const saleTypes = ["جاهز", "على الخارطة"];
const paymentMethods = ["كاش", "تمويل", "دفعات"];

export default function Delivery() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  const [newBooking, setNewBooking] = useState<Partial<BookingRecord>>({
    bookingDate: new Date().toISOString().split("T")[0],
    customerName: "",
    customerPhone: "",
    project: "",
    building: "",
    unit: "",
    saleType: "",
    unitValue: 0,
    paymentMethod: "",
    salesEmployee: user?.username || "",
    status_sales_filled: false,
    status_projects_filled: false,
    status_customer_filled: false,
    final_status: "بانتظار المبيعات"
  });

  const handleNewBookingChange = (field: string, value: any) => {
    setNewBooking((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddBooking = () => {
    const newId = (bookings.length + 1).toString();
    const booking: BookingRecord = {
      id: newId,
      ...newBooking as BookingRecord,
      status_sales_filled: user?.role === "قسم المبيعات" ? new Date().toISOString() : false,
      final_status: "بانتظار المشاريع وراحة العميل"
    };

    setBookings([booking, ...bookings]);
    setIsAddDialogOpen(false);

    addNotification({
      title: "تمت الإضافة",
      message: `تم إضافة حجز جديد برقم ${newId} بنجاح`,
      type: "success"
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مكتمل":
        return "bg-green-100 text-green-800";
      case "بانتظار المشاريع":
      case "بانتظار راحة العميل":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canEditFields = (role: string) => {
    switch (role) {
      case "قسم المبيعات":
        return ["customerName", "project", "building", "unit", "paymentMethod", "saleType", "unitValue", "salesEmployee"];
      case "قسم المشاريع":
        return ["transferDate", "constructionEndDate", "finalReceiptDate", "electricityTransferDate", "waterTransferDate"];
      case "إدارة راحة العملاء":
        return ["deliveryDate", "isEvaluated", "evaluationScore"];
      default:
        return [];
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.customerName.includes(searchTerm) ||
      booking.project.includes(searchTerm) ||
      booking.id.includes(searchTerm);
    
    const matchesStatus = statusFilter === "الكل" || booking.final_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">قسم الحجز</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="ml-2 h-4 w-4" />
                إضافة حجز جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة حجز جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات الحجز الجديد
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                <div className="space-y-2">
                  <Label>تاريخ الحجز</Label>
                  <Input
                    type="date"
                    value={newBooking.bookingDate}
                    onChange={(e) => handleNewBookingChange("bookingDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>اسم العميل</Label>
                  <Input
                    value={newBooking.customerName}
                    onChange={(e) => handleNewBookingChange("customerName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>رقم العميل</Label>
                  <Input
                    value={newBooking.customerPhone}
                    onChange={(e) => handleNewBookingChange("customerPhone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>المشروع</Label>
                  <Input
                    value={newBooking.project}
                    onChange={(e) => handleNewBookingChange("project", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>العمارة</Label>
                  <Input
                    value={newBooking.building}
                    onChange={(e) => handleNewBookingChange("building", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>الوحدة</Label>
                  <Input
                    value={newBooking.unit}
                    onChange={(e) => handleNewBookingChange("unit", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>نوع البيع</Label>
                  <Select
                    value={newBooking.saleType}
                    onValueChange={(value) => handleNewBookingChange("saleType", value)}
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

                <div className="space-y-2">
                  <Label>طريقة الدفع</Label>
                  <Select
                    value={newBooking.paymentMethod}
                    onValueChange={(value) => handleNewBookingChange("paymentMethod", value)}
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

                <div className="space-y-2">
                  <Label>قيمة الوحدة</Label>
                  <Input
                    type="number"
                    value={newBooking.unitValue}
                    onChange={(e) => handleNewBookingChange("unitValue", parseFloat(e.target.value))}
                  />
                </div>

                {user?.role === "قسم المبيعات" && (
                  <div className="space-y-2">
                    <Label>اسم موظف المبيعات</Label>
                    <Input
                      value={newBooking.salesEmployee}
                      onChange={(e) => handleNewBookingChange("salesEmployee", e.target.value)}
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddBooking}>
                  إضافة
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>سجل الحجز</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Filter className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="فلتر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="الكل">الكل</SelectItem>
                  <SelectItem value="مكتمل">مكتمل</SelectItem>
                  <SelectItem value="بانتظار المشاريع">بانتظار المشاريع</SelectItem>
                  <SelectItem value="بانتظار راحة العميل">بانتظار راحة العميل</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الرقم المتسلسل</TableHead>
                    <TableHead className="text-right">تاريخ الحجز</TableHead>
                    <TableHead className="text-right">اسم العميل</TableHead>
                    <TableHead className="text-right">المشروع</TableHead>
                    <TableHead className="text-right">الوحدة</TableHead>
                    <TableHead className="text-right">حالة الحجز</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        لا توجد سجلات حجز متطابقة مع معايير البحث
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.id}</TableCell>
                        <TableCell>{booking.bookingDate}</TableCell>
                        <TableCell>{booking.customerName}</TableCell>
                        <TableCell>{booking.project}</TableCell>
                        <TableCell>{booking.unit}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            getStatusColor(booking.final_status)
                          }`}>
                            {booking.final_status}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
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
      </div>
    </Layout>
  );
}
