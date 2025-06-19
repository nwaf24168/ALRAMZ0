
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Home,
  Clock,
  DollarSign,
  ThumbsUp,
  Calendar,
  Zap,
  Target,
  BarChart3,
  Activity,
  Users,
  Package,
} from "lucide-react";
import { DataService } from "@/lib/dataService";

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
}

interface DeliveryMetrics {
  totalUnits: number;
  monthlyUnits: number;
  yearlyUnits: number;
  avgElectricityTransferDays: number;
  avgWaterTransferDays: number;
  customerSatisfactionRate: number;
  avgDeliveryDays: number;
  totalSalesValue: number;
  avgCashTransferDays: number;
  avgBankTransferDays: number;
}

export default function DeliveryAnalytics() {
  const [currentPeriod, setCurrentPeriod] = useState<"monthly" | "yearly">("monthly");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [metrics, setMetrics] = useState<DeliveryMetrics>({
    totalUnits: 0,
    monthlyUnits: 0,
    yearlyUnits: 0,
    avgElectricityTransferDays: 0,
    avgWaterTransferDays: 0,
    customerSatisfactionRate: 0,
    avgDeliveryDays: 0,
    totalSalesValue: 0,
    avgCashTransferDays: 0,
    avgBankTransferDays: 0,
  });

  // تحميل البيانات
  useEffect(() => {
    const loadBookings = async () => {
      try {
        const bookingsFromDB = await DataService.getBookings();
        setBookings(bookingsFromDB);
        calculateMetrics(bookingsFromDB);
      } catch (error) {
        console.error("خطأ في تحميل الحجوزات:", error);
      }
    };

    loadBookings();
  }, []);

  // حساب المؤشرات
  const calculateMetrics = (bookings: Booking[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // فلترة البيانات حسب الفترة
    const monthlyBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });

    const yearlyBookings = bookings.filter(booking => {
      const bookingDate = new Date(booking.bookingDate);
      return bookingDate.getFullYear() === currentYear;
    });

    // حساب المؤشرات
    const totalUnits = bookings.length;
    const monthlyUnits = monthlyBookings.length;
    const yearlyUnits = yearlyBookings.length;

    // حساب متوسط أيام نقل الكهرباء
    const electricityTransferDays = bookings
      .filter(b => b.electricityTransferDate && b.transferDate)
      .map(b => {
        const transferDate = new Date(b.transferDate);
        const electricityDate = new Date(b.electricityTransferDate!);
        return Math.abs((electricityDate.getTime() - transferDate.getTime()) / (1000 * 60 * 60 * 24));
      });

    // حساب متوسط أيام نقل المياه
    const waterTransferDays = bookings
      .filter(b => b.waterTransferDate && b.transferDate)
      .map(b => {
        const transferDate = new Date(b.transferDate);
        const waterDate = new Date(b.waterTransferDate!);
        return Math.abs((waterDate.getTime() - transferDate.getTime()) / (1000 * 60 * 60 * 24));
      });

    // حساب رضا العملاء
    const evaluatedBookings = bookings.filter(b => b.isEvaluated && b.evaluationScore);
    const satisfactionRate = evaluatedBookings.length > 0 
      ? (evaluatedBookings.reduce((sum, b) => sum + (b.evaluationScore || 0), 0) / evaluatedBookings.length) * 10
      : 0;

    // حساب متوسط أيام التسليم
    const deliveryDays = bookings
      .filter(b => b.deliveryDate && b.electricityTransferDate)
      .map(b => {
        const electricityDate = new Date(b.electricityTransferDate!);
        const deliveryDate = new Date(b.deliveryDate!);
        return Math.abs((deliveryDate.getTime() - electricityDate.getTime()) / (1000 * 60 * 60 * 24));
      });

    // حساب قيمة المبيعات
    const totalSalesValue = bookings.reduce((sum, b) => sum + b.unitValue, 0);

    // حساب أيام الإفراغ للكاش
    const cashTransferDays = bookings
      .filter(b => b.paymentMethod === "نقدي" && b.transferDate)
      .map(b => {
        const bookingDate = new Date(b.bookingDate);
        const transferDate = new Date(b.transferDate);
        return Math.abs((transferDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      });

    // حساب أيام الإفراغ للتحويل البنكي
    const bankTransferDays = bookings
      .filter(b => b.paymentMethod === "تحويل بنكي" && b.transferDate)
      .map(b => {
        const bookingDate = new Date(b.bookingDate);
        const transferDate = new Date(b.transferDate);
        return Math.abs((transferDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      });

    setMetrics({
      totalUnits,
      monthlyUnits,
      yearlyUnits,
      avgElectricityTransferDays: electricityTransferDays.length > 0 
        ? electricityTransferDays.reduce((sum, days) => sum + days, 0) / electricityTransferDays.length 
        : 0,
      avgWaterTransferDays: waterTransferDays.length > 0 
        ? waterTransferDays.reduce((sum, days) => sum + days, 0) / waterTransferDays.length 
        : 0,
      customerSatisfactionRate: satisfactionRate,
      avgDeliveryDays: deliveryDays.length > 0 
        ? deliveryDays.reduce((sum, days) => sum + days, 0) / deliveryDays.length 
        : 0,
      totalSalesValue,
      avgCashTransferDays: cashTransferDays.length > 0 
        ? cashTransferDays.reduce((sum, days) => sum + days, 0) / cashTransferDays.length 
        : 0,
      avgBankTransferDays: bankTransferDays.length > 0 
        ? bankTransferDays.reduce((sum, days) => sum + days, 0) / bankTransferDays.length 
        : 0,
    });
  };

  // إعداد البيانات للرسوم البيانية
  const salesData = [
    { name: "يناير", وحدات: 45, مبيعات: 2250000 },
    { name: "فبراير", وحدات: 52, مبيعات: 2600000 },
    { name: "مارس", وحدات: 38, مبيعات: 1900000 },
    { name: "أبريل", وحدات: 61, مبيعات: 3050000 },
    { name: "مايو", وحدات: 55, مبيعات: 2750000 },
    { name: "يونيو", وحدات: metrics.monthlyUnits, مبيعات: metrics.totalSalesValue },
  ];

  const transferTimeData = [
    { name: "نقل الكهرباء", متوسط_الأيام: Math.round(metrics.avgElectricityTransferDays), color: "#3b82f6" },
    { name: "نقل المياه", متوسط_الأيام: Math.round(metrics.avgWaterTransferDays), color: "#10b981" },
    { name: "التسليم للعميل", متوسط_الأيام: Math.round(metrics.avgDeliveryDays), color: "#f59e0b" },
  ];

  const paymentMethodData = [
    { name: "نقدي", أيام_الإفراغ: Math.round(metrics.avgCashTransferDays), color: "#ef4444" },
    { name: "تحويل بنكي", أيام_الإفراغ: Math.round(metrics.avgBankTransferDays), color: "#8b5cf6" },
  ];

  // مؤشرات سريعة
  const quickStats = [
    {
      title: currentPeriod === "monthly" ? "الوحدات المباعة هذا الشهر" : "الوحدات المباعة هذا العام",
      value: currentPeriod === "monthly" ? metrics.monthlyUnits.toLocaleString() : metrics.yearlyUnits.toLocaleString(),
      icon: <Home className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-800",
      change: currentPeriod === "monthly" ? "+12%" : "+8%",
      isPositive: true
    },
    {
      title: "قيمة المبيعات (ريال)",
      value: metrics.totalSalesValue.toLocaleString(),
      icon: <DollarSign className="h-5 w-5" />,
      color: "bg-green-100 text-green-800",
      change: "+15%",
      isPositive: true
    },
    {
      title: "معدل رضا العملاء",
      value: `${Math.round(metrics.customerSatisfactionRate)}%`,
      icon: <ThumbsUp className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-800",
      change: "+5%",
      isPositive: true
    },
    {
      title: "متوسط أيام التسليم",
      value: `${Math.round(metrics.avgDeliveryDays)} يوم`,
      icon: <Clock className="h-5 w-5" />,
      color: "bg-orange-100 text-orange-800",
      change: "-3 أيام",
      isPositive: true
    },
  ];

  // مؤشرات الأداء الرئيسية
  const kpiData = [
    {
      title: "كفاءة نقل الكهرباء",
      value: Math.round(metrics.avgElectricityTransferDays),
      target: 7,
      unit: "يوم",
      percentage: Math.min((7 / Math.max(metrics.avgElectricityTransferDays, 1)) * 100, 100),
      color: "bg-blue-500",
      icon: <Zap className="h-4 w-4" />,
    },
    {
      title: "كفاءة نقل المياه",
      value: Math.round(metrics.avgWaterTransferDays),
      target: 7,
      unit: "يوم",
      percentage: Math.min((7 / Math.max(metrics.avgWaterTransferDays, 1)) * 100, 100),
      color: "bg-cyan-500",
      icon: <Activity className="h-4 w-4" />,
    },
    {
      title: "سرعة الإفراغ",
      value: Math.round((metrics.avgCashTransferDays + metrics.avgBankTransferDays) / 2),
      target: 3,
      unit: "يوم",
      percentage: Math.min((3 / Math.max((metrics.avgCashTransferDays + metrics.avgBankTransferDays) / 2, 1)) * 100, 100),
      color: "bg-green-500",
      icon: <Target className="h-4 w-4" />,
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="h-6 w-6" />
              تحليل قسم التسليم
            </h1>
            <p className="text-muted-foreground">
              تحليل شامل لأداء عمليات التسليم والمبيعات
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={currentPeriod === "monthly" ? "default" : "outline"}
              onClick={() => setCurrentPeriod("monthly")}
            >
              <Calendar className="h-4 w-4 mr-2" />
              شهري
            </Button>
            <Button
              variant={currentPeriod === "yearly" ? "default" : "outline"}
              onClick={() => setCurrentPeriod("yearly")}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              سنوي
            </Button>
          </div>
        </div>

        {/* مؤشرات الأداء الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {kpiData.map((kpi, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{kpi.title}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold">
                        {kpi.value}
                      </span>
                      <span className="text-sm text-muted-foreground">{kpi.unit}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={kpi.percentage} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground">
                        الهدف: {kpi.target} {kpi.unit}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${kpi.color} text-white`}>
                    {kpi.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* احصائيات سريعة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold">
                      {stat.value}
                    </p>
                    <div className="flex items-center gap-2">
                      {stat.isPositive ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      )}
                      <span className={`text-xs ${stat.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color}`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* التبويبات */}
        <Tabs defaultValue="sales" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="sales" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              المبيعات
            </TabsTrigger>
            <TabsTrigger value="timing" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              الأوقات والمدد
            </TabsTrigger>
            <TabsTrigger value="satisfaction" className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" />
              رضا العملاء
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              تحليل متقدم
            </TabsTrigger>
          </TabsList>

          {/* تبويب المبيعات */}
          <TabsContent value="sales" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    الوحدات المباعة والقيمة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={salesData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Bar yAxisId="left" dataKey="وحدات" fill="#3b82f6" name="عدد الوحدات" />
                        <Line 
                          yAxisId="right" 
                          type="monotone" 
                          dataKey="مبيعات" 
                          stroke="#ef4444" 
                          strokeWidth={3}
                          name="قيمة المبيعات (ريال)" 
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    ملخص المبيعات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-800">إجمالي الوحدات</h4>
                        <Badge className="bg-blue-600">{metrics.totalUnits}</Badge>
                      </div>
                      <Progress value={(metrics.totalUnits / 500) * 100} className="h-2" />
                      <p className="text-xs text-blue-600 mt-1">الهدف السنوي: 500 وحدة</p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-green-800">قيمة المبيعات</h4>
                        <Badge className="bg-green-600">{(metrics.totalSalesValue / 1000000).toFixed(1)}م ريال</Badge>
                      </div>
                      <Progress value={(metrics.totalSalesValue / 50000000) * 100} className="h-2" />
                      <p className="text-xs text-green-600 mt-1">الهدف السنوي: 50 مليون ريال</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{metrics.monthlyUnits}</div>
                        <p className="text-sm text-muted-foreground">وحدات هذا الشهر</p>
                      </div>
                      <div className="text-center p-3 bg-muted rounded-lg">
                        <div className="text-2xl font-bold">{metrics.yearlyUnits}</div>
                        <p className="text-sm text-muted-foreground">وحدات هذا العام</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب الأوقات والمدد */}
          <TabsContent value="timing" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    متوسط أيام العمليات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={transferTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="متوسط_الأيام" name="متوسط الأيام">
                          {transferTimeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    أيام الإفراغ حسب طريقة الدفع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={paymentMethodData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="أيام_الإفراغ" name="أيام الإفراغ">
                          {paymentMethodData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* تفاصيل الأوقات */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    تفاصيل الأوقات والأهداف
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-800">نقل الكهرباء</h4>
                        <Zap className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {Math.round(metrics.avgElectricityTransferDays)} يوم
                      </div>
                      <p className="text-xs text-blue-600">الهدف: 7 أيام</p>
                      <Progress 
                        value={Math.min((7 / Math.max(metrics.avgElectricityTransferDays, 1)) * 100, 100)} 
                        className="mt-2 h-2" 
                      />
                    </div>

                    <div className="p-4 bg-cyan-50 rounded-lg border border-cyan-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-cyan-800">نقل المياه</h4>
                        <Activity className="h-5 w-5 text-cyan-600" />
                      </div>
                      <div className="text-2xl font-bold text-cyan-600 mb-1">
                        {Math.round(metrics.avgWaterTransferDays)} يوم
                      </div>
                      <p className="text-xs text-cyan-600">الهدف: 7 أيام</p>
                      <Progress 
                        value={Math.min((7 / Math.max(metrics.avgWaterTransferDays, 1)) * 100, 100)} 
                        className="mt-2 h-2" 
                      />
                    </div>

                    <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-orange-800">التسليم للعميل</h4>
                        <Home className="h-5 w-5 text-orange-600" />
                      </div>
                      <div className="text-2xl font-bold text-orange-600 mb-1">
                        {Math.round(metrics.avgDeliveryDays)} يوم
                      </div>
                      <p className="text-xs text-orange-600">الهدف: 3 أيام</p>
                      <Progress 
                        value={Math.min((3 / Math.max(metrics.avgDeliveryDays, 1)) * 100, 100)} 
                        className="mt-2 h-2" 
                      />
                    </div>

                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-purple-800">الإفراغ (متوسط)</h4>
                        <Calendar className="h-5 w-5 text-purple-600" />
                      </div>
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {Math.round((metrics.avgCashTransferDays + metrics.avgBankTransferDays) / 2)} يوم
                      </div>
                      <p className="text-xs text-purple-600">الهدف: 3 أيام</p>
                      <Progress 
                        value={Math.min((3 / Math.max((metrics.avgCashTransferDays + metrics.avgBankTransferDays) / 2, 1)) * 100, 100)} 
                        className="mt-2 h-2" 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب رضا العملاء */}
          <TabsContent value="satisfaction" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5" />
                    معدل رضا العملاء عن الاستلام
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center space-y-4">
                    <div className="relative w-32 h-32 mx-auto">
                      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#e5e7eb"
                          strokeWidth="2"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#10b981"
                          strokeWidth="2"
                          strokeDasharray={`${metrics.customerSatisfactionRate}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-2xl font-bold text-green-600">
                          {Math.round(metrics.customerSatisfactionRate)}%
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">معدل الرضا العام</h4>
                      <p className="text-muted-foreground text-sm">
                        بناءً على {bookings.filter(b => b.isEvaluated).length} تقييم
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    توزيع التقييمات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { rating: 10, count: 85, label: "ممتاز" },
                      { rating: 9, count: 45, label: "جيد جداً" },
                      { rating: 8, count: 32, label: "جيد" },
                      { rating: 7, count: 18, label: "مقبول" },
                      { rating: 6, count: 8, label: "ضعيف" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="w-16 text-sm font-medium">{item.label}</div>
                        <div className="flex-1">
                          <Progress value={(item.count / 188) * 100} className="h-2" />
                        </div>
                        <div className="w-12 text-sm text-muted-foreground">{item.count}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب التحليل المتقدم */}
          <TabsContent value="analysis" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    مؤشرات الأداء الرئيسية
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-green-800">نقاط القوة</span>
                        <Badge className="bg-green-600">3</Badge>
                      </div>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• معدل رضا عملاء مرتفع ({Math.round(metrics.customerSatisfactionRate)}%)</li>
                        <li>• قيمة مبيعات متنامية</li>
                        <li>• كفاءة في عمليات التسليم</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-amber-800">نقاط التحسين</span>
                        <Badge className="bg-amber-600">2</Badge>
                      </div>
                      <ul className="text-sm text-amber-700 space-y-1">
                        <li>• تسريع عمليات نقل العدادات</li>
                        <li>• تقليل فترة الإفراغ للعملاء</li>
                      </ul>
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-blue-800">التوصيات</span>
                        <Badge className="bg-blue-600">3</Badge>
                      </div>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• أتمتة عمليات نقل العدادات</li>
                        <li>• تطوير نظام متابعة مبكر</li>
                        <li>• تحسين التواصل مع العملاء</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    الأهداف والإنجازات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { 
                        title: "الوحدات المباعة", 
                        current: metrics.yearlyUnits, 
                        target: 500, 
                        unit: "وحدة"
                      },
                      { 
                        title: "قيمة المبيعات", 
                        current: metrics.totalSalesValue / 1000000, 
                        target: 50, 
                        unit: "مليون ريال"
                      },
                      { 
                        title: "رضا العملاء", 
                        current: metrics.customerSatisfactionRate, 
                        target: 90, 
                        unit: "%"
                      },
                      { 
                        title: "سرعة التسليم", 
                        current: Math.max(1, 4 - metrics.avgDeliveryDays), 
                        target: 4, 
                        unit: "نقاط"
                      },
                    ].map((goal, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{goal.title}</span>
                          <span className="text-sm text-muted-foreground">
                            {goal.current.toFixed(goal.unit === "مليون ريال" ? 1 : 0)} / {goal.target} {goal.unit}
                          </span>
                        </div>
                        <Progress 
                          value={Math.min((goal.current / goal.target) * 100, 100)} 
                          className="h-2" 
                        />
                        <div className="text-xs text-muted-foreground">
                          {((goal.current / goal.target) * 100).toFixed(1)}% من الهدف
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
