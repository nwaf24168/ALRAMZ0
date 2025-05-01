
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import * as XLSX from 'xlsx';

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

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#FF99E6'];

export default function DeliveryAnalysis() {
  const [activeTab, setActiveTab] = useState("overview");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [projectFilter, setProjectFilter] = useState("all");

  // استخدام نفس البيانات من صفحة التسليم
  const [bookings] = useState<Booking[]>([
    // ... نفس البيانات من صفحة التسليم
  ]);

  // تصفية البيانات حسب المرشحات
  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.bookingDate);
    const matchesMonth = monthFilter === "all" || (bookingDate.getMonth() + 1).toString() === monthFilter;
    const matchesYear = yearFilter === "all" || bookingDate.getFullYear().toString() === yearFilter;
    const matchesProject = projectFilter === "all" || booking.project === projectFilter;
    return matchesMonth && matchesYear && matchesProject;
  });

  // حساب المؤشرات
  const calculateMetrics = () => {
    const totalUnits = filteredBookings.length;
    const totalValue = filteredBookings.reduce((sum, b) => sum + b.unitValue, 0);
    
    // حساب متوسط أيام نقل العدادات
    const electricityTransferDays = filteredBookings
      .filter(b => b.electricityTransferDate && b.transferDate)
      .map(b => {
        const transfer = new Date(b.transferDate);
        const electricity = new Date(b.electricityTransferDate!);
        return Math.floor((electricity.getTime() - transfer.getTime()) / (1000 * 60 * 60 * 24));
      });

    const waterTransferDays = filteredBookings
      .filter(b => b.waterTransferDate && b.transferDate)
      .map(b => {
        const transfer = new Date(b.transferDate);
        const water = new Date(b.waterTransferDate!);
        return Math.floor((water.getTime() - transfer.getTime()) / (1000 * 60 * 60 * 24));
      });

    // حساب متوسط أيام التسليم
    const deliveryDays = filteredBookings
      .filter(b => b.deliveryDate && b.electricityTransferDate)
      .map(b => {
        const electricity = new Date(b.electricityTransferDate!);
        const delivery = new Date(b.deliveryDate!);
        return Math.floor((delivery.getTime() - electricity.getTime()) / (1000 * 60 * 60 * 24));
      });

    // حساب متوسط أيام الإفراغ
    const cashTransferDays = filteredBookings
      .filter(b => b.transferDate && b.paymentMethod === "نقدي")
      .map(b => {
        const booking = new Date(b.bookingDate);
        const transfer = new Date(b.transferDate);
        return Math.floor((transfer.getTime() - booking.getTime()) / (1000 * 60 * 60 * 24));
      });

    const bankTransferDays = filteredBookings
      .filter(b => b.transferDate && b.paymentMethod === "تحويل بنكي")
      .map(b => {
        const booking = new Date(b.bookingDate);
        const transfer = new Date(b.transferDate);
        return Math.floor((transfer.getTime() - booking.getTime()) / (1000 * 60 * 60 * 24));
      });

    // حساب متوسط رضا العملاء
    const averageSatisfaction = filteredBookings
      .filter(b => b.evaluationScore)
      .reduce((sum, b) => sum + (b.evaluationScore || 0), 0) / 
      filteredBookings.filter(b => b.evaluationScore).length;

    return {
      totalUnits,
      totalValue,
      avgElectricityDays: Math.round(electricityTransferDays.reduce((a, b) => a + b, 0) / electricityTransferDays.length || 0),
      avgWaterDays: Math.round(waterTransferDays.reduce((a, b) => a + b, 0) / waterTransferDays.length || 0),
      avgDeliveryDays: Math.round(deliveryDays.reduce((a, b) => a + b, 0) / deliveryDays.length || 0),
      avgCashTransferDays: Math.round(cashTransferDays.reduce((a, b) => a + b, 0) / cashTransferDays.length || 0),
      avgBankTransferDays: Math.round(bankTransferDays.reduce((a, b) => a + b, 0) / bankTransferDays.length || 0),
      customerSatisfaction: Math.round(averageSatisfaction * 10) / 10
    };
  };

  const metrics = calculateMetrics();

  // تجهيز بيانات الرسوم البيانية
  const monthlyData = filteredBookings.reduce((acc, curr) => {
    const month = new Date(curr.bookingDate).toLocaleString('ar-SA', { month: 'long' });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const monthlyChartData = Object.entries(monthlyData).map(([month, count]) => ({
    month,
    count,
    value: filteredBookings
      .filter(b => new Date(b.bookingDate).toLocaleString('ar-SA', { month: 'long' }) === month)
      .reduce((sum, b) => sum + b.unitValue, 0)
  }));

  // تصدير البيانات إلى Excel
  const exportToExcel = () => {
    const exportData = filteredBookings.map(booking => ({
      'الرقم المتسلسل': booking.id,
      'تاريخ الحجز': booking.bookingDate,
      'اسم العميل': booking.customerName,
      'المشروع': booking.project,
      'قيمة الوحدة': booking.unitValue,
      'طريقة الدفع': booking.paymentMethod,
      'تاريخ الإفراغ': booking.transferDate || '',
      'تاريخ نقل عداد الكهرباء': booking.electricityTransferDate || '',
      'تاريخ نقل عداد المياه': booking.waterTransferDate || '',
      'تاريخ التسليم': booking.deliveryDate || '',
      'تقييم العميل': booking.evaluationScore || ''
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

            <Button onClick={exportToExcel}>
              تصدير إلى Excel
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>عدد الوحدات المباعة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metrics.totalUnits}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>قيمة المبيعات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {metrics.totalValue.toLocaleString()} ريال
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>متوسط رضا العملاء</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {metrics.customerSatisfaction}/10
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>متوسط أيام التسليم</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {metrics.avgDeliveryDays} يوم
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>متوسط أيام نقل العدادات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>الكهرباء:</span>
                  <span className="font-bold">{metrics.avgElectricityDays} يوم</span>
                </div>
                <div className="flex justify-between">
                  <span>المياه:</span>
                  <span className="font-bold">{metrics.avgWaterDays} يوم</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>متوسط أيام الإفراغ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>عملاء الكاش:</span>
                  <span className="font-bold">{metrics.avgCashTransferDays} يوم</span>
                </div>
                <div className="flex justify-between">
                  <span>عملاء التحويل:</span>
                  <span className="font-bold">{metrics.avgBankTransferDays} يوم</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="sales">المبيعات</TabsTrigger>
            <TabsTrigger value="delivery">التسليم</TabsTrigger>
            <TabsTrigger value="satisfaction">رضا العملاء</TabsTrigger>
          </TabsList>

          <TabsContent value="sales">
            <Card>
              <CardHeader>
                <CardTitle>المبيعات الشهرية</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="count" name="عدد الوحدات" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="value" name="قيمة المبيعات" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery">
            <Card>
              <CardHeader>
                <CardTitle>متوسط فترات التسليم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { name: 'نقل عداد الكهرباء', days: metrics.avgElectricityDays },
                      { name: 'نقل عداد المياه', days: metrics.avgWaterDays },
                      { name: 'التسليم للعميل', days: metrics.avgDeliveryDays },
                      { name: 'إفراغ الكاش', days: metrics.avgCashTransferDays },
                      { name: 'إفراغ التحويل', days: metrics.avgBankTransferDays }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="days" name="عدد الأيام" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="satisfaction">
            <Card>
              <CardHeader>
                <CardTitle>تقييمات العملاء</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'ممتاز (9-10)', value: filteredBookings.filter(b => b.evaluationScore && b.evaluationScore >= 9).length },
                          { name: 'جيد جداً (7-8)', value: filteredBookings.filter(b => b.evaluationScore && b.evaluationScore >= 7 && b.evaluationScore < 9).length },
                          { name: 'جيد (5-6)', value: filteredBookings.filter(b => b.evaluationScore && b.evaluationScore >= 5 && b.evaluationScore < 7).length },
                          { name: 'ضعيف (أقل من 5)', value: filteredBookings.filter(b => b.evaluationScore && b.evaluationScore < 5).length }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                      >
                        {filteredBookings.map((_, index) => (
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
        </Tabs>
      </div>
    </Layout>
  );
}
