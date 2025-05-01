
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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

interface Booking {
  id: string;
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
  status: string;
  status_sales_filled: boolean;
  status_projects_filled: boolean;
  status_customer_filled: boolean;
  // Project Management Fields
  constructionEndDate?: string;
  finalReceiptDate?: string;
  electricityTransferDate?: string;
  waterTransferDate?: string;
  deliveryDate?: string;
  // Customer Satisfaction Fields
  isEvaluated?: boolean;
  evaluationScore?: number;
}

const saleTypes = ["بيع على الخارطة", "جاهز"];
const paymentMethods = ["نقدي", "تحويل بنكي", "تمويل عقاري"];
const statusFilters = [
  "الكل",
  "بانتظار إدارة المشاريع وراحة العملاء",
  "بانتظار إدارة راحة العملاء",
  "مكتمل من كل الإدارات"
];

export default function Delivery() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [bookings, setBookings] = useState<Booking[]>([
  {
    id: "1",
    bookingDate: "17-Dec-24",
    customerName: "تركي السعيد",
    project: "المعالي",
    building: "26",
    unit: "26",
    paymentMethod: "بنك",
    saleType: "جاهز",
    unitValue: 3128750,
    transferDate: "09-Jan-25",
    salesEmployee: "دعاء شدادي",
    constructionEndDate: "28/9/2024",
    finalReceiptDate: "28/9/2024",
    electricityTransferDate: "",
    waterTransferDate: "",
    deliveryDate: "25/3/2025",
    status: "بانتظار إدارة راحة العملاء",
    status_sales_filled: true,
    status_projects_filled: true,
    status_customer_filled: false,
    isEvaluated: false,
    evaluationScore: null
  },
  {
    id: "4",
    bookingDate: "22-Dec-25",
    customerName: "تركي السماري",
    project: "المعالي",
    building: "42",
    unit: "42",
    paymentMethod: "بنك",
    saleType: "جاهز",
    unitValue: 2687500,
    transferDate: "",
    salesEmployee: "محمد شعيب",
    constructionEndDate: "",
    finalReceiptDate: "",
    electricityTransferDate: "",
    waterTransferDate: "",
    deliveryDate: "",
    status: "بانتظار إدارة المشاريع وراحة العملاء",
    status_sales_filled: true,
    status_projects_filled: false,
    status_customer_filled: false,
    isEvaluated: false,
    evaluationScore: null
  },
  {
    id: "5",
    bookingDate: "01-Dec-24",
    customerName: "علي بخاري",
    project: "رمز 45",
    building: "8",
    unit: "3",
    paymentMethod: "بنك",
    saleType: "جاهز",
    unitValue: 657945,
    transferDate: "01-Jan-25",
    salesEmployee: "دعاء شدادي",
    constructionEndDate: "6/10/2024",
    finalReceiptDate: "6/10/2024",
    electricityTransferDate: "",
    waterTransferDate: "",
    deliveryDate: "29/1/2025",
    status: "بانتظار إدارة راحة العملاء",
    status_sales_filled: true,
    status_projects_filled: true,
    status_customer_filled: false,
    isEvaluated: false,
    evaluationScore: null
  },
  {
    id: "6",
    bookingDate: "18-Dec-24",
    customerName: "ياسين العلي",
    project: "رمز 45",
    building: "4",
    unit: "14",
    paymentMethod: "بنك",
    saleType: "جاهز",
    unitValue: 627195,
    transferDate: "02-Jan-25",
    salesEmployee: "محمد شعيب",
    constructionEndDate: "30/1/2025",
    finalReceiptDate: "30/1/2025",
    electricityTransferDate: "",
    waterTransferDate: "",
    deliveryDate: "30/1/2025",
    status: "بانتظار إدارة راحة العملاء",
    status_sales_filled: true,
    status_projects_filled: true,
    status_customer_filled: false,
    isEvaluated: false,
    evaluationScore: null
  }
]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const [newBooking, setNewBooking] = useState<Partial<Booking>>({
    bookingDate: new Date().toISOString().split("T")[0],
    customerName: "",
    project: "",
    building: "",
    unit: "",
    paymentMethod: "",
    saleType: "",
    unitValue: 0,
    transferDate: "",
    salesEmployee: "",
    status: "بانتظار إدارة المشاريع وراحة العملاء",
    status_sales_filled: true,
    status_projects_filled: false,
    status_customer_filled: false
  });

  const handleNewBookingChange = (field: string, value: any) => {
    setNewBooking((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddBooking = () => {
    const newId = (bookings.length + 1).toString();
    const booking = {
      id: newId,
      ...newBooking as Booking
    };

    setBookings([booking, ...bookings]);
    setIsAddDialogOpen(false);
    setNewBooking({
      bookingDate: new Date().toISOString().split("T")[0],
      customerName: "",
      project: "",
      building: "",
      unit: "",
      paymentMethod: "",
      saleType: "",
      unitValue: 0,
      transferDate: "",
      salesEmployee: "",
      status: "بانتظار إدارة المشاريع وراحة العملاء",
      status_sales_filled: true,
      status_projects_filled: false,
      status_customer_filled: false
    });

    addNotification({
      title: "تمت الإضافة",
      message: `تم إضافة حجز جديد برقم ${newId} بنجاح`,
      type: "success"
    });
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const updateBookingStatus = (booking: Booking) => {
    // التحقق من اكتمال بيانات إدارة راحة العملاء
    const isCustomerServiceComplete = booking.isEvaluated && booking.evaluationScore > 0;
    
    const allFieldsFilled = booking.status_sales_filled && 
                          booking.status_projects_filled && 
                          isCustomerServiceComplete;
    
    if (allFieldsFilled) {
      return "مكتمل من كل الإدارات";
    } else if (booking.status_sales_filled && booking.status_projects_filled) {
      return "بانتظار إدارة راحة العملاء";
    } else if (booking.status_sales_filled) {
      return "بانتظار إدارة المشاريع وراحة العملاء";
    } else {
      return "بانتظار اكتمال البيانات";
    }
  };

  const handleUpdateBooking = (updatedBooking: Booking) => {
    const newStatus = updateBookingStatus(updatedBooking);
    const updated = { ...updatedBooking, status: newStatus };
    
    setBookings(bookings.map(b => b.id === updated.id ? updated : b));
    setSelectedBooking(null);
    
    addNotification({
      title: "تم التحديث",
      message: `تم تحديث الحجز رقم ${updated.id} بنجاح`,
      type: "success"
    });
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch = 
      booking.customerName.includes(searchTerm) ||
      booking.project.includes(searchTerm) ||
      booking.id.includes(searchTerm);
    
    const matchesStatus = statusFilter === "الكل" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">قسم الحجز</h1>
          {(user?.role === "قسم المبيعات" || user?.role === "مدير النظام") && (
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
                  <DialogDescription>أدخل بيانات الحجز الجديد</DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
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
                    <Label>تاريخ الإفراغ</Label>
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
          )}
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
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="فلتر حسب الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {statusFilters.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
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
                            booking.status === "مكتمل من كل الإدارات"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {booking.status}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>تفاصيل الحجز</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  <div>
                                    <h3 className="font-bold mb-2">قسم المبيعات</h3>
                                    <div className="space-y-2">
                                      <p>تاريخ الحجز: {booking.bookingDate}</p>
                                      <p>اسم العميل: {booking.customerName}</p>
                                      <p>المشروع: {booking.project}</p>
                                      <p>العمارة: {booking.building}</p>
                                      <p>الوحدة: {booking.unit}</p>
                                      <p>طريقة الدفع: {booking.paymentMethod}</p>
                                      <p>نوع البيع: {booking.saleType}</p>
                                      <p>قيمة الوحدة: {booking.unitValue}</p>
                                      <p>تاريخ الإفراغ: {booking.transferDate}</p>
                                      <p>موظف المبيعات: {booking.salesEmployee}</p>
                                    </div>
                                  </div>
                                  {booking.status_projects_filled && (
                                    <div>
                                      <h3 className="font-bold mb-2">قسم المشاريع</h3>
                                      <div className="space-y-2">
                                        <p>تاريخ انتهاء البناء: {booking.constructionEndDate}</p>
                                        <p>تاريخ الاستلام النهائي: {booking.finalReceiptDate}</p>
                                        <p>تاريخ نقل عداد الكهرباء: {booking.electricityTransferDate}</p>
                                        <p>تاريخ نقل عداد المياه: {booking.waterTransferDate}</p>
                                        <p>تاريخ التسليم للعميل: {booking.deliveryDate}</p>
                                      </div>
                                    </div>
                                  )}
                                  {booking.status_customer_filled && (
                                    <div>
                                      <h3 className="font-bold mb-2">قسم راحة العميل</h3>
                                      <div className="space-y-2">
                                        <p>تم التقييم: {booking.isEvaluated ? 'نعم' : 'لا'}</p>
                                        <p>درجة التقييم: {booking.evaluationScore}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={
                                    (user?.role === "قسم المبيعات" && booking.status_sales_filled) ||
                                    (user?.role === "قسم المشاريع" && booking.status_projects_filled) ||
                                    (user?.role === "إدارة راحة العملاء" && booking.status_customer_filled)
                                  }
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl">
                                <DialogHeader>
                                  <DialogTitle>تعديل الحجز</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-6">
                                  {/* قسم المبيعات - عرض فقط */}
                                  <div>
                                    <h3 className="text-lg font-semibold mb-4">بيانات المبيعات</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>تاريخ الحجز</Label>
                                        <Input value={booking.bookingDate} disabled />
                                      </div>
                                      <div>
                                        <Label>اسم العميل</Label>
                                        <Input value={booking.customerName} disabled />
                                      </div>
                                      <div>
                                        <Label>المشروع</Label>
                                        <Input value={booking.project} disabled />
                                      </div>
                                      <div>
                                        <Label>الوحدة</Label>
                                        <Input value={booking.unit} disabled />
                                      </div>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* قسم المشاريع */}
                                  {(user?.role === "قسم المشاريع" || user?.role === "مدير النظام") && (
                                    <div>
                                      <h3 className="text-lg font-semibold mb-4">بيانات المشاريع</h3>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>تاريخ انتهاء البناء</Label>
                                          <Input
                                            type="date"
                                            value={booking.constructionEndDate}
                                            onChange={(e) => {
                                              const updatedBooking = {
                                                ...booking,
                                                constructionEndDate: e.target.value,
                                                status_projects_filled: true
                                              };
                                              handleUpdateBooking(updatedBooking);
                                            }}
                                          />
                                        </div>
                                        <div>
                                          <Label>تاريخ الاستلام النهائي</Label>
                                          <Input
                                            type="date"
                                            value={booking.finalReceiptDate}
                                            onChange={(e) => {
                                              const updatedBooking = {
                                                ...booking,
                                                finalReceiptDate: e.target.value,
                                                status_projects_filled: true
                                              };
                                              handleUpdateBooking(updatedBooking);
                                            }}
                                          />
                                        </div>
                                        <div>
                                          <Label>تاريخ نقل عداد الكهرباء</Label>
                                          <Input
                                            type="date"
                                            value={booking.electricityTransferDate}
                                            onChange={(e) => {
                                              const updatedBooking = {
                                                ...booking,
                                                electricityTransferDate: e.target.value,
                                                status_projects_filled: true
                                              };
                                              handleUpdateBooking(updatedBooking);
                                            }}
                                          />
                                        </div>
                                        <div>
                                          <Label>تاريخ نقل عداد المياه</Label>
                                          <Input
                                            type="date"
                                            value={booking.waterTransferDate}
                                            onChange={(e) => {
                                              const updatedBooking = {
                                                ...booking,
                                                waterTransferDate: e.target.value,
                                                status_projects_filled: true
                                              };
                                              handleUpdateBooking(updatedBooking);
                                            }}
                                          />
                                        </div>
                                        <div>
                                          <Label>تاريخ التسليم للعميل</Label>
                                          <Input
                                            type="date"
                                            value={booking.deliveryDate}
                                            onChange={(e) => {
                                              const updatedBooking = {
                                                ...booking,
                                                deliveryDate: e.target.value,
                                                status_projects_filled: true
                                              };
                                              handleUpdateBooking(updatedBooking);
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <Separator />

                                  {/* قسم راحة العملاء */}
                                  {(user?.role === "إدارة راحة العملاء" || user?.role === "مدير النظام") && (
                                    <div>
                                      <h3 className="text-lg font-semibold mb-4">تقييم راحة العملاء</h3>
                                      <div className="space-y-4">
                                        <div>
                                          <Label>هل تم تقييم الاستلام؟</Label>
                                          <Select
                                            value={booking.isEvaluated ? "نعم" : "لا"}
                                            onValueChange={(value) => {
                                              const updatedBooking = {
                                                ...booking,
                                                isEvaluated: value === "نعم",
                                                status_customer_filled: true
                                              };
                                              handleUpdateBooking(updatedBooking);
                                            }}
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
                                        <div>
                                          <Label>تقييم عملية الاستلام (1-10)</Label>
                                          <Input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={booking.evaluationScore}
                                            onChange={(e) => {
                                              const updatedBooking = {
                                                ...booking,
                                                evaluationScore: parseInt(e.target.value),
                                                status_customer_filled: true
                                              };
                                              handleUpdateBooking(updatedBooking);
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => {
                                const confirmed = window.confirm("هل أنت متأكد من حذف هذا الحجز؟");
                                if (confirmed) {
                                  setBookings(bookings.filter(b => b.id !== booking.id));
                                  addNotification({
                                    title: "تم الحذف",
                                    message: `تم حذف الحجز رقم ${booking.id} بنجاح`,
                                    type: "success"
                                  });
                                }
                              }}
                            >
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
