import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Home,
  Clock,
  DollarSign,
  ThumbsUp,
  Calendar,
  Zap,
  Activity,
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
    const totalSalesValue = currentPeriod === "monthly" 
      ? monthlyBookings.reduce((sum, b) => sum + b.unitValue, 0)
      : yearlyBookings.reduce((sum, b) => sum + b.unitValue, 0);

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

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">تحليل قسم التسليم</h1>
          <div className="flex flex-wrap items-center gap-2 sm:space-x-2 sm:space-x-reverse">
            <Button
              variant={currentPeriod === "monthly" ? "default" : "outline"}
              onClick={() => setCurrentPeriod("monthly")}
              className="mobile-button"
            >
              شهري
            </Button>
            <Button
              variant={currentPeriod === "yearly" ? "default" : "outline"}
              onClick={() => setCurrentPeriod("yearly")}
              className="mobile-button"
            >
              سنوي
            </Button>
          </div>
        </div>

        {/* مؤشرات الأداء */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* عدد الوحدات المباعة */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                الوحدات المباعة {currentPeriod === "monthly" ? "هذا الشهر" : "هذا العام"}
              </CardTitle>
              <Home className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {currentPeriod === "monthly" ? metrics.monthlyUnits : metrics.yearlyUnits}
              </div>
              <p className="text-xs text-muted-foreground">
                وحدة سكنية
              </p>
            </CardContent>
          </Card>

          {/* أيام نقل عدادات الكهرباء */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                أيام نقل عدادات الكهرباء
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(metrics.avgElectricityTransferDays)}
              </div>
              <p className="text-xs text-muted-foreground">
                يوم في المتوسط
              </p>
            </CardContent>
          </Card>

          {/* أيام نقل عدادات المياه */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                أيام نقل عدادات المياه
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(metrics.avgWaterTransferDays)}
              </div>
              <p className="text-xs text-muted-foreground">
                يوم في المتوسط
              </p>
            </CardContent>
          </Card>

          {/* نسبة رضا العميل */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                نسبة رضا العميل عن الاستلام
              </CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(metrics.customerSatisfactionRate)}%
              </div>
              <p className="text-xs text-muted-foreground">
                معدل الرضا العام
              </p>
            </CardContent>
          </Card>

          {/* أيام التسليم للعميل */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                أيام التسليم للعميل
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(metrics.avgDeliveryDays)}
              </div>
              <p className="text-xs text-muted-foreground">
                يوم من نقل الكهرباء للتسليم
              </p>
            </CardContent>
          </Card>

          {/* قيمة المبيعات */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                قيمة المبيعات بالريال
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.totalSalesValue / 1000000).toFixed(1)}م
              </div>
              <p className="text-xs text-muted-foreground">
                مليون ريال سعودي
              </p>
            </CardContent>
          </Card>

          {/* أيام الإفراغ للكاش */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                أيام الإفراغ (عملاء الكاش)
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(metrics.avgCashTransferDays)}
              </div>
              <p className="text-xs text-muted-foreground">
                يوم من الحجز للإفراغ
              </p>
            </CardContent>
          </Card>

          {/* أيام الإفراغ للتحويل */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                أيام الإفراغ (عملاء التحويل)
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(metrics.avgBankTransferDays)}
              </div>
              <p className="text-xs text-muted-foreground">
                يوم من الحجز للإفراغ
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}