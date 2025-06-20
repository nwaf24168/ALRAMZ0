import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { DataService } from "@/lib/dataService";
import { RealtimeChannel } from "@supabase/supabase-js";
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
import * as XLSX from "xlsx"; // Import the xlsx library

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
  "مكتمل من كل الإدارات",
];

export default function Delivery() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [realtimeChannel, setRealtimeChannel] =
    useState<RealtimeChannel | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("الكل");
  const [monthFilter, setMonthFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
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
    status_customer_filled: false,
  });

  // تحميل البيانات من Supabase عند تحميل المكون
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const bookingsFromDB = await DataService.getBookings();
        setBookings(bookingsFromDB);
      } catch (error) {
        console.error("خطأ في تحميل الحجوزات:", error);
        addNotification({
          title: "خطأ",
          message: "حدث خطأ أثناء تحميل الحجوزات",
          type: "error",
        });
      }
    };

    loadBookings();
  }, []);

  // إعداد الاشتراك للوقت الفعلي
  useEffect(() => {
    const channel = DataService.setupRealtimeSubscription(
      "bookings",
      async (payload) => {
        console.log("تحديث الحجوزات:", payload);
        try {
          const bookingsFromDB = await DataService.getBookings();
          setBookings(bookingsFromDB);
        } catch (error) {
          console.error("خطأ في تحديث الحجوزات:", error);
        }
      },
    );

    setRealtimeChannel(channel);

    return () => {
      if (channel) {
        DataService.removeRealtimeSubscription(channel);
      }
    };
  }, []);

  const handleNewBookingChange = (field: string, value: any) => {
    setNewBooking((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddBooking = async () => {
    const newId = (bookings.length + 1).toString();
    const booking = {
      id: newId,
      ...(newBooking as Booking),
    };

    try {
      // حفظ في Supabase
      await DataService.saveBooking(booking);

      // تحديث الحالة المحلية
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
        status_customer_filled: false,
      });

      addNotification({
        title: "تمت الإضافة",
        message: `تم إضافة حجز جديد برقم ${newId} بنجاح في قاعدة البيانات`,
        type: "success",
      });
    } catch (error) {
      console.error("خطأ في إضافة الحجز:", error);
      addNotification({
        title: "خطأ",
        message:
          error instanceof Error ? error.message : "حدث خطأ أثناء إضافة الحجز",
        type: "error",
      });
    }
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
  };

  const updateBookingStatus = (booking: Booking) => {
    // التحقق من اكتمال بيانات إدارة راحة العملاء
    const isCustomerServiceComplete =
      booking.isEvaluated && booking.evaluationScore > 0;

    const allFieldsFilled =
      booking.status_sales_filled &&
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

  const handleUpdateBooking = async (updatedBooking: Booking) => {
    const newStatus = updateBookingStatus(updatedBooking);
    const updated = { ...updatedBooking, status: newStatus };

    try {
      // حفظ في Supabase
      await DataService.saveBooking(updated);

      // تحديث الحالة المحلية
      setBookings(bookings.map((b) => (b.id === updated.id ? updated : b)));
      setSelectedBooking(null);

      addNotification({
        title: "تم التحديث",
        message: `تم تحديث الحجز رقم ${updated.id} بنجاح في قاعدة البيانات`,
        type: "success",
      });
    } catch (error) {
      console.error("خطأ في تحديث الحجز:", error);
      addNotification({
        title: "خطأ",
        message:
          error instanceof Error ? error.message : "حدث خطأ أثناء تحديث الحجز",
        type: "error",
      });
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customerName.includes(searchTerm) ||
      booking.project.includes(searchTerm) ||
      booking.id.includes(searchTerm);

    const matchesStatus =
      statusFilter === "الكل" || booking.status === statusFilter;

    const bookingDate = new Date(booking.bookingDate);
    const matchesMonth =
      monthFilter === "all" ||
      !monthFilter ||
      (bookingDate.getMonth() + 1).toString() === monthFilter;
    const matchesYear =
      yearFilter === "all" ||
      !yearFilter ||
      bookingDate.getFullYear().toString() === yearFilter;

    return matchesSearch && matchesStatus && matchesMonth && matchesYear;
  });

  return (
    <Layout>
      <div className="space-y-4 md:space-y-6 p-3 md:p-0">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            <h1 className="text-xl md:text-2xl font-bold">قسم الحجز</h1>
            <input
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
              id="excelFileInput"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = async (event) => {
                    const data = event.target?.result;
                    const workbook = XLSX.read(data, { type: "binary" });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);

                    // تحويل البيانات إلى تنسيق الحجوزات
                    const importedBookings = jsonData.map(
                      (row: any, index) => ({
                        id: (bookings.length + index + 1).toString(),
                        bookingDate: row["تاريخ الحجز"] || "",
                        customerName: row["اسم العميل"] || "",
                        project: row["المشروع"] || "",
                        building: row["العمارة"] || "",
                        unit: row["الوحدة"] || "",
                        paymentMethod: row["طريقة الدفع"] || "",
                        saleType: row["نوع البيع"] || "",
                        unitValue: row["قيمة الوحدة"] || 0,
                        transferDate: row["تاريخ الإفراغ"] || "",
                        salesEmployee: row["موظف المبيعات"] || "",
                        constructionEndDate: row["تاريخ انتهاء البناء"] || "",
                        finalReceiptDate: row["تاريخ الاستلام النهائي"] || "",
                        electricityTransferDate:
                          row["تاريخ نقل عداد الكهرباء"] || "",
                        waterTransferDate: row["تاريخ نقل عداد المياه"] || "",
                        deliveryDate: row["تاريخ التسليم للعميل"] || "",
                        status: "بانتظار إدارة المشاريع وراحة العملاء",
                        status_sales_filled: true,
                        status_projects_filled: false,
                        status_customer_filled: false,
                        isEvaluated: false,
                        evaluationScore: null,
                      }),
                    );

                    setBookings([...importedBookings, ...bookings]);
                    addNotification({
                      title: "تم الاستيراد",
                      message: `تم استيراد ${importedBookings.length} حجز بنجاح`,
                      type: "success",
                    });
                  };
                  reader.readAsBinaryString(file);
                }
              }}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  document.getElementById("excelFileInput")?.click()
                }
              >
                استيراد من إكسل
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // تحضير البيانات للتصدير مع مراعاة الفلترة
                  const exportData = filteredBookings.map((booking) => ({
                    "الرقم المتسلسل": booking.id,
                    "تاريخ الحجز": booking.bookingDate,
                    "اسم العميل": booking.customerName,
                    المشروع: booking.project,
                    العمارة: booking.building,
                    الوحدة: booking.unit,
                    "طريقة الدفع": booking.paymentMethod,
                    "نوع البيع": booking.saleType,
                    "قيمة الوحدة": booking.unitValue,
                    "تاريخ الإفراغ": booking.transferDate,
                    "موظف المبيعات": booking.salesEmployee,
                    "تاريخ انتهاء البناء": booking.constructionEndDate || "",
                    "تاريخ الاستلام النهائي": booking.finalReceiptDate || "",
                    "تاريخ نقل عداد الكهرباء":
                      booking.electricityTransferDate || "",
                    "تاريخ نقل عداد المياه": booking.waterTransferDate || "",
                    "تاريخ التسليم للعميل": booking.deliveryDate || "",
                    "تم التقييم": booking.isEvaluated ? "نعم" : "لا",
                    "درجة التقييم": booking.evaluationScore || "",
                  }));

                  // إنشاء ورقة عمل Excel
                  const ws = XLSX.utils.json_to_sheet(exportData, {
                    header: Object.keys(exportData[0]),
                  });

                  // تنسيق عرض الأعمدة
                  const colWidths = Object.keys(exportData[0]).map(() => ({
                    wch: 20,
                  }));
                  ws["!cols"] = colWidths;

                  // إنشاء مصنف عمل جديد وإضافة ورقة العمل
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "الحجوزات");

                  // تحميل الملف
                  XLSX.writeFile(wb, "تقرير_الحجوزات.xlsx");
                }}
              >
                تحميل كملف إكسل
              </Button>
            </div>
          </div>
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
                  <DialogDescription>
                    أدخل بيانات الحجز الجديد
                  </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                  <div className="space-y-2">
                    <Label>تاريخ الحجز</Label>
                    <Input
                      type="date"
                      value={newBooking.bookingDate}
                      onChange={(e) =>
                        handleNewBookingChange("bookingDate", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>اسم العميل</Label>
                    <Input
                      value={newBooking.customerName}
                      onChange={(e) =>
                        handleNewBookingChange("customerName", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>المشروع</Label>
                    <Input
                      value={newBooking.project}
                      onChange={(e) =>
                        handleNewBookingChange("project", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>العمارة</Label>
                    <Input
                      value={newBooking.building}
                      onChange={(e) =>
                        handleNewBookingChange("building", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>الوحدة</Label>
                    <Input
                      value={newBooking.unit}
                      onChange={(e) =>
                        handleNewBookingChange("unit", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>طريقة الدفع</Label>
                    <Select
                      value={newBooking.paymentMethod}
                      onValueChange={(value) =>
                        handleNewBookingChange("paymentMethod", value)
                      }
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
                      onValueChange={(value) =>
                        handleNewBookingChange("saleType", value)
                      }
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
                      onChange={(e) =>
                        handleNewBookingChange(
                          "unitValue",
                          parseFloat(e.target.value),
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>تاريخ الإفراغ</Label>
                    <Input
                      type="date"
                      value={newBooking.transferDate}
                      onChange={(e) =>
                        handleNewBookingChange("transferDate", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>اسم موظف المبيعات</Label>
                    <Input
                      value={newBooking.salesEmployee}
                      onChange={(e) =>
                        handleNewBookingChange("salesEmployee", e.target.value)
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button onClick={handleAddBooking}>إضافة</Button>
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
            <div className="flex flex-col gap-4 mb-6">
              <div className="relative">
                <Filter className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
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

                <Select value={monthFilter} onValueChange={setMonthFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="الشهر" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل الشهور</SelectItem>
                    {Array.from({ length: 12 }, (_, i) => (
                      <SelectItem key={i + 1} value={(i + 1).toString()}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={yearFilter} onValueChange={setYearFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="السنة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">كل السنوات</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
                        <TableCell className="font-medium">
                          {booking.id}
                        </TableCell>
                        <TableCell>{booking.bookingDate}</TableCell>
                        <TableCell>{booking.customerName}</TableCell>
                        <TableCell>{booking.project}</TableCell>
                        <TableCell>{booking.unit}</TableCell>
                        <TableCell>
                          <div
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === "مكتمل من كل الإدارات"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
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
                                    <h3 className="font-bold mb-2">
                                      قسم المبيعات
                                    </h3>
                                    <div className="space-y-2">
                                      <p>تاريخ الحجز: {booking.bookingDate}</p>
                                      <p>اسم العميل: {booking.customerName}</p>
                                      <p>المشروع: {booking.project}</p>
                                      <p>العمارة: {booking.building}</p>
                                      <p>الوحدة: {booking.unit}</p>
                                      <p>
                                        طريقة الدفع: {booking.paymentMethod}
                                      </p>
                                      <p>نوع البيع: {booking.saleType}</p>
                                      <p>قيمة الوحدة: {booking.unitValue}</p>
                                      <p>
                                        تاريخ الإفراغ: {booking.transferDate}
                                      </p>
                                      <p>
                                        موظف المبيعات: {booking.salesEmployee}
                                      </p>
                                    </div>
                                  </div>
                                  {booking.status_projects_filled && (
                                    <div>
                                      <h3 className="font-bold mb-2">
                                        قسم المشاريع
                                      </h3>
                                      <div className="space-y-2">
                                        <p>
                                          تاريخ انتهاء البناء:{" "}
                                          {booking.constructionEndDate}
                                        </p>
                                        <p>
                                          تاريخ الاستلام النهائي:{" "}
                                          {booking.finalReceiptDate}
                                        </p>
                                        <p>
                                          تاريخ نقل عداد الكهرباء:{" "}
                                          {booking.electricityTransferDate}
                                        </p>
                                        <p>
                                          تاريخ نقل عداد المياه:{" "}
                                          {booking.waterTransferDate}
                                        </p>
                                        <p>
                                          تاريخ التسليم للعميل:{" "}
                                          {booking.deliveryDate}
                                        </p>
                                      </div>
                                    </div>
                                  )}
                                  {booking.status_customer_filled && (
                                    <div>
                                      <h3 className="font-bold mb-2">
                                        قسم راحة العميل
                                      </h3>
                                      <div className="space-y-2">
                                        <p>
                                          تم التقييم:{" "}
                                          {booking.isEvaluated ? "نعم" : "لا"}
                                        </p>
                                        <p>
                                          درجة التقييم:{" "}
                                          {booking.evaluationScore}
                                        </p>
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
                                    (user?.role === "قسم المبيعات" &&
                                      booking.status_sales_filled) ||
                                    (user?.role === "قسم المشاريع" &&
                                      booking.status_projects_filled) ||
                                    (user?.role === "إدارة راحة العملاء" &&
                                      booking.status_customer_filled)
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
                                    <h3 className="text-lg font-semibold mb-4">
                                      بيانات المبيعات
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label>تاريخ الحجز</Label>
                                        <Input
                                          value={booking.bookingDate || ""}
                                          onChange={(e) => {
                                            const updatedBooking = {
                                              ...booking,
                                              bookingDate: e.target.value,
                                              status_sales_filled: true,
                                            };
                                            handleUpdateBooking(updatedBooking);
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <Label>اسم العميل</Label>
                                        <Input
                                          value={booking.customerName || ""}
                                          onChange={(e) => {
                                            const updatedBooking = {
                                              ...booking,
                                              customerName: e.target.value,
                                              status_sales_filled: true,
                                            };
                                            handleUpdateBooking(updatedBooking);
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <Label>المشروع</Label>
                                        <Input
                                          value={booking.project || ""}
                                          onChange={(e) => {
                                            const updatedBooking = {
                                              ...booking,
                                              project: e.target.value,
                                              status_sales_filled: true,
                                            };
                                            handleUpdateBooking(updatedBooking);
                                          }}
                                        />
                                      </div>
                                      <div>
                                        <Label>الوحدة</Label>
                                        <Input
                                          value={booking.unit || ""}
                                          onChange={(e) => {
                                            const updatedBooking = {
                                              ...booking,
                                              unit: e.target.value,
                                              status_sales_filled: true,
                                            };
                                            handleUpdateBooking(updatedBooking);
                                          }}
                                        />
                                      </div>
                                    </div>
                                  </div>

                                  <Separator />

                                  {/* قسم المشاريع */}
                                  {(user?.role === "قسم المشاريع" ||
                                    user?.role === "مدير النظام") && (
                                    <div>
                                      <h3 className="text-lg font-semibold mb-4">
                                        بيانات المشاريع
                                      </h3>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label>تاريخ انتهاء البناء</Label>
                                          <Input
                                            type="date"
                                            value={booking.constructionEndDate}
                                            onChange={(e) => {
                                              const updatedBooking = {
                                                ...booking,
                                                constructionEndDate:
                                                  e.target.value,
                                                status_projects_filled: true,
                                              };
                                              handleUpdateBooking(
                                                updatedBooking,
                                              );
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
                                                finalReceiptDate:
                                                  e.target.value,
                                                status_projects_filled: true,
                                              };
                                              handleUpdateBooking(
                                                updatedBooking,
                                              );
                                            }}
                                          />
                                        </div>
                                        <div>
                                          <Label>تاريخ نقل عداد الكهرباء</Label>
                                          <Input
                                            type="date"
                                            value={
                                              booking.electricityTransferDate
                                            }
                                            onChange={(e) => {
                                              const updatedBooking = {
                                                ...booking,
                                                electricityTransferDate:
                                                  e.target.value,
                                                status_projects_filled: true,
                                              };
                                              handleUpdateBooking(
                                                updatedBooking,
                                              );
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
                                                waterTransferDate:
                                                  e.target.value,
                                                status_projects_filled: true,
                                              };
                                              handleUpdateBooking(
                                                updatedBooking,
                                              );
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
                                                status_projects_filled: true,
                                              };
                                              handleUpdateBooking(
                                                updatedBooking,
                                              );
                                            }}
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <Separator />

                                  {/* قسم راحة العملاء */}
                                  {(user?.role === "إدارة راحة العملاء" ||
                                    user?.role === "مدير النظام") && (
                                    <div>
                                      <h3 className="text-lg font-semibold mb-4">
                                        تقييم راحة العملاء
                                      </h3>
                                      <div className="space-y-4">
                                        <div>
                                          <Label>هل تم تقييم الاستلام؟</Label>
                                          <Select
                                            value={
                                              booking.isEvaluated ? "نعم" : "لا"
                                            }
                                            onValueChange={(value) => {
                                              const updatedBooking = {
                                                ...booking,
                                                isEvaluated: value === "نعم",
                                                status_customer_filled: true,
                                              };
                                              handleUpdateBooking(
                                                updatedBooking,
                                              );
                                            }}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="اختر" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="نعم">
                                                نعم
                                              </SelectItem>
                                              <SelectItem value="لا">
                                                لا
                                              </SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        <div>
                                          <Label>
                                            تقييم عملية الاستلام (1-10)
                                          </Label>
                                          <Input
                                            type="number"
                                            min="1"
                                            max="10"
                                            value={booking.evaluationScore}
                                            onChange={(e) => {
                                              const updatedBooking = {
                                                ...booking,
                                                evaluationScore: parseInt(
                                                  e.target.value,
                                                ),
                                                status_customer_filled: true,
                                              };
                                              handleUpdateBooking(
                                                updatedBooking,
                                              );
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
                              onClick={async () => {
                                const confirmed = window.confirm(
                                  "هل أنت متأكد من حذف هذا الحجز؟",
                                );
                                if (confirmed) {
                                  try {
                                    // حذف من Supabase
                                    await DataService.deleteBooking(booking.id);

                                    // تحديث الحالة المحلية
                                    setBookings(
                                      bookings.filter(
                                        (b) => b.id !== booking.id,
                                      ),
                                    );
                                    addNotification({
                                      title: "تم الحذف",
                                      message: `تم حذف الحجز رقم ${booking.id} بنجاح من قاعدة البيانات`,
                                      type: "success",
                                    });
                                  } catch (error) {
                                    console.error("خطأ في حذف الحجز:", error);
                                    addNotification({
                                      title: "خطأ",
                                      message:
                                        error instanceof Error
                                          ? error.message
                                          : "حدث خطأ أثناء حذف الحجز",
                                      type: "error",
                                    });
                                  }
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
