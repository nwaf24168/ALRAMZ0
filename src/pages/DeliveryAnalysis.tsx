
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import * as XLSX from 'xlsx';
import { useState } from "react";

// استيراد نموذج البيانات من صفحة التسليم
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
  constructionEndDate?: string;
  finalReceiptDate?: string;
  electricityTransferDate?: string;
  waterTransferDate?: string;
  deliveryDate?: string;
  isEvaluated?: boolean;
  evaluationScore?: number;
  status: string;
}

export default function DeliveryAnalysis() {
  const [activeTab, setActiveTab] = useState("overview");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  // استخدام نفس البيانات من صفحة التسليم
  const [bookings] = useState<Booking[]>([
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
      isEvaluated: false,
      evaluationScore: null
    },
    // ... باقي البيانات
  ]);

  // تصفية البيانات حسب المرشحات
  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.bookingDate);
    const matchesMonth = monthFilter === "all" || (bookingDate.getMonth() + 1).toString() === monthFilter;
    const matchesYear = yearFilter === "all" || bookingDate.getFullYear().toString() === yearFilter;
    const matchesProject = projectFilter === "all" || booking.project === projectFilter;
    return matchesMonth && matchesYear && matchesProject;
  });

  // حساب الإحصائيات
  const totalBookings = filteredBookings.length;
  const completedDeliveries = filteredBookings.filter(b => b.deliveryDate).length;
  const totalValue = filteredBookings.reduce((sum, b) => sum + b.unitValue, 0);
  const avgDeliveryTime = filteredBookings
    .filter(b => b.deliveryDate)
    .reduce((sum, b) => {
      const start = new Date(b.bookingDate);
      const end = new Date(b.deliveryDate!);
      return sum + (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    }, 0) / (completedDeliveries || 1);

  // تجهيز بيانات الرسوم البيانية
  const projectStats = filteredBookings.reduce((acc, curr) => {
    acc[curr.project] = (acc[curr.project] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const projectChartData = Object.entries(projectStats).map(([name, value]) => ({
    name,
    value
  }));

  const monthlyDeliveries = filteredBookings.reduce((acc, curr) => {
    const month = new Date(curr.bookingDate).toLocaleString('ar-SA', { month: 'long' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyChartData = Object.entries(monthlyDeliveries).map(([month, count]) => ({
    month,
    count
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF99E6', '#AF19FF'];

  // تصدير البيانات إلى Excel
  const exportToExcel = () => {
    const exportData = filteredBookings.map(booking => ({
      'الرقم المتسلسل': booking.id,
      'تاريخ الحجز': booking.bookingDate,
      'اسم العميل': booking.customerName,
      'المشروع': booking.project,
      'العمارة': booking.building,
      'الوحدة': booking.unit,
      'قيمة الوحدة': booking.unitValue,
      'تاريخ التسليم': booking.deliveryDate || 'لم يتم التسليم',
      'تقييم العميل': booking.evaluationScore || 'لم يتم التقييم'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "تحليل التسليم");
    XLSX.writeFile(wb, "تحليل_التسليم.xlsx");
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">تحليل التسليم</h1>
          <div className="flex gap-4">
            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="الشهر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل الشهور</SelectItem>
                {Array.from({ length: 12 }, (_, i) => (
                  <SelectItem key={i + 1} value={(i + 1).toString()}>
                    {new Date(2024, i).toLocaleString('ar-SA', { month: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="السنة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل السنوات</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>

            <Select value={projectFilter} onValueChange={setProjectFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="المشروع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">كل المشاريع</SelectItem>
                {Array.from(new Set(bookings.map(b => b.project))).map(project => (
                  <SelectItem key={project} value={project}>
                    {project}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button onClick={exportToExcel}>
              تصدير إلى Excel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>إجمالي الحجوزات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{totalBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>التسليمات المكتملة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {completedDeliveries}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>القيمة الإجمالية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {totalValue.toLocaleString()} ريال
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>متوسط مدة التسليم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {Math.round(avgDeliveryTime)} يوم
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="projects">المشاريع</TabsTrigger>
            <TabsTrigger value="timeline">الجدول الزمني</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>توزيع الحجوزات حسب المشروع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {projectChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="projects">
            <Card>
              <CardHeader>
                <CardTitle>تحليل المشاريع</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={projectChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="عدد الحجوزات" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="timeline">
            <Card>
              <CardHeader>
                <CardTitle>التسليمات عبر الزمن</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="count"
                        name="عدد التسليمات"
                        stroke="#8884d8"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
