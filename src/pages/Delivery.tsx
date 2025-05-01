
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BookingRecord {
  id: string;
  // Sales Department Fields
  bookingDate: string;
  customerName: string;
  project: string;
  building: string;
  unit: string;
  paymentMethod: string;
  saleType: string;
  unitValue: number;
  transferDate: string;
  salesEmployee: string;
  // Projects Department Fields
  constructionEndDate: string;
  finalReceiptDate: string;
  electricityTransferDate: string;
  waterTransferDate: string;
  deliveryDate: string;
  // Customer Comfort Department Fields
  isEvaluated: boolean;
  evaluationScore: number;
  // Status Fields
  status_sales_filled: boolean | string;
  status_projects_filled: boolean | string;
  status_customer_filled: boolean | string;
  final_status: string;
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
  const [activeTab, setActiveTab] = useState("sales");

  const [newBooking, setNewBooking] = useState<Partial<BookingRecord>>({
    bookingDate: new Date().toISOString().split("T")[0],
    customerName: "",
    project: "",
    building: "",
    unit: "",
    saleType: "",
    unitValue: 0,
    paymentMethod: "",
    salesEmployee: user?.username || "",
    constructionEndDate: "",
    finalReceiptDate: "",
    electricityTransferDate: "",
    waterTransferDate: "",
    deliveryDate: "",
    isEvaluated: false,
    evaluationScore: 0,
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

  const handleEditBooking = (booking: BookingRecord) => {
    setNewBooking(booking);
    setIsAddDialogOpen(true);
    setActiveTab(
      user?.role === "قسم المشاريع" ? "projects" :
      user?.role === "إدارة راحة العملاء" ? "customer" : "sales"
    );
  };

  const handleUpdateBooking = () => {
    const updatedBookings = bookings.map(booking => {
      if (booking.id === newBooking.id) {
        const updatedBooking = {
          ...booking,
          ...newBooking,
        };
        
        // Update department completion status
        if (user?.role === "قسم المبيعات") {
          updatedBooking.status_sales_filled = new Date().toISOString();
        } else if (user?.role === "قسم المشاريع") {
          updatedBooking.status_projects_filled = new Date().toISOString();
        } else if (user?.role === "إدارة راحة العملاء") {
          updatedBooking.status_customer_filled = new Date().toISOString();
        }

        // Update final status based on department completions
        if (updatedBooking.status_sales_filled && updatedBooking.status_projects_filled && updatedBooking.status_customer_filled) {
          updatedBooking.final_status = "مكتمل";
        } else {
          const pendingDepts = [];
          if (!updatedBooking.status_projects_filled) pendingDepts.push("المشاريع");
          if (!updatedBooking.status_customer_filled) pendingDepts.push("راحة العميل");
          
          if (pendingDepts.length > 0) {
            updatedBooking.final_status = `بانتظار ${pendingDepts.join(" و")}`;
          }
        }

        return updatedBooking;
      }
      return booking;
    });

    setBookings(updatedBookings);
    setIsAddDialogOpen(false);

    addNotification({
      title: "تم التحديث",
      message: `تم تحديث الحجز رقم ${newBooking.id} بنجاح`,
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
        return ["customerName", "project", "building", "unit", "paymentMethod", "saleType", "unitValue", "salesEmployee", "transferDate"];
      case "قسم المشاريع":
        return ["constructionEndDate", "finalReceiptDate", "electricityTransferDate", "waterTransferDate", "deliveryDate"];
      case "إدارة راحة العملاء":
        return ["isEvaluated", "evaluationScore"];
      default:
        return [];
    }
  };

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
                  أدخل بيانات الحجز حسب القسم
                </DialogDescription>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                  <TabsTrigger value="sales">قسم المبيعات</TabsTrigger>
                  <TabsTrigger value="projects">إدارة المشاريع</TabsTrigger>
                  <TabsTrigger value="customer">راحة العميل</TabsTrigger>
                </TabsList>

                <TabsContent value="sales">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <Label>قيمة الوحدة</Label>
                      <Input
                        type="number"
                        value={newBooking.unitValue}
                        onChange={(e) => handleNewBookingChange("unitValue", parseFloat(e.target.value))}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>تاريخ الافراغ</Label>
                      <Input
                        type="date"
                        value={newBooking.transferDate}
                        onChange={(e) => handleNewBookingChange("transferDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>اسم موظف المبيعات</Label>
                      <Input
                        value={newBooking.salesEmployee}
                        onChange={(e) => handleNewBookingChange("salesEmployee", e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="projects">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>تاريخ انتهاء اعمال البناء</Label>
                      <Input
                        type="date"
                        value={newBooking.constructionEndDate}
                        onChange={(e) => handleNewBookingChange("constructionEndDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>تاريخ الاستلام النهائي</Label>
                      <Input
                        type="date"
                        value={newBooking.finalReceiptDate}
                        onChange={(e) => handleNewBookingChange("finalReceiptDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>تاريخ نقل عداد الكهرباء</Label>
                      <Input
                        type="date"
                        value={newBooking.electricityTransferDate}
                        onChange={(e) => handleNewBookingChange("electricityTransferDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>تاريخ نقل عداد المياه</Label>
                      <Input
                        type="date"
                        value={newBooking.waterTransferDate}
                        onChange={(e) => handleNewBookingChange("waterTransferDate", e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>تاريخ التسليم للعميل</Label>
                      <Input
                        type="date"
                        value={newBooking.deliveryDate}
                        onChange={(e) => handleNewBookingChange("deliveryDate", e.target.value)}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="customer">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>هل تم تقييم عملية الاستلام</Label>
                      <Select
                        value={newBooking.isEvaluated ? "نعم" : "لا"}
                        onValueChange={(value) => handleNewBookingChange("isEvaluated", value === "نعم")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="نعم">نعم</SelectItem>
                          <SelectItem value="لا">لا</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>تقييم عملية الاستلام</Label>
                      <Input
                        type="number"
                        min="1"
                        max="10"
                        value={newBooking.evaluationScore}
                        onChange={(e) => handleNewBookingChange("evaluationScore", parseInt(e.target.value))}
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={newBooking.id ? handleUpdateBooking : handleAddBooking}>
                  {newBooking.id ? "تحديث" : activeTab === "sales" ? "التالي" : activeTab === "projects" ? "التالي" : "إضافة"}
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
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        لا توجد سجلات حجز
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((booking) => (
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
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditBooking(booking)}
                              disabled={user?.role === "قسم المبيعات" && booking.status_sales_filled}
                            >
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
