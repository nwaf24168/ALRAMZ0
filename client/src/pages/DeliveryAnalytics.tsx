
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
  Users,
} from "lucide-react";
import { DataService } from "@/lib/dataService";

interface DeliveryBooking {
  id?: number;
  booking_date?: string;
  customer_name: string;
  project?: string;
  building?: string;
  unit?: string;
  payment_method?: string;
  sale_type?: string;
  unit_value?: number;
  handover_date?: string;
  sales_employee?: string;
  construction_completion_date?: string;
  final_handover_date?: string;
  electricity_meter_transfer_date?: string;
  water_meter_transfer_date?: string;
  customer_delivery_date?: string;
  status?: string;
  customer_evaluation_done?: boolean;
  evaluation_percentage?: number;
  sales_completed?: boolean;
  projects_completed?: boolean;
  customer_service_completed?: boolean;
  created_at?: string;
}

interface DeliveryMetrics {
  totalBookings: number;
  salesStage: number;
  projectsStage: number;
  customerServiceStage: number;
  completed: number;
  monthlyBookings: number;
  yearlyBookings: number;
  avgElectricityTransferDays: number;
  avgWaterTransferDays: number;
  customerSatisfactionRate: number;
  avgDeliveryDays: number;
  totalSalesValue: number;
  avgCashHandoverDays: number;
  avgBankHandoverDays: number;
  avgConstructionDays: number;
  salesCompletionRate: number;
}

export default function DeliveryAnalytics() {
  const [currentPeriod, setCurrentPeriod] = useState<"monthly" | "yearly">("monthly");
  const [bookings, setBookings] = useState<DeliveryBooking[]>([]);
  const [loading, setLoading] = useState(false);
  const [metrics, setMetrics] = useState<DeliveryMetrics>({
    totalBookings: 0,
    salesStage: 0,
    projectsStage: 0,
    customerServiceStage: 0,
    completed: 0,
    monthlyBookings: 0,
    yearlyBookings: 0,
    avgElectricityTransferDays: 0,
    avgWaterTransferDays: 0,
    customerSatisfactionRate: 0,
    avgDeliveryDays: 0,
    totalSalesValue: 0,
    avgCashHandoverDays: 0,
    avgBankHandoverDays: 0,
    avgConstructionDays: 0,
    salesCompletionRate: 0,
  });

  // تحميل البيانات من نفس مصدر قسم التسليم
  const loadBookings = async () => {
    try {
      setLoading(true);
      const bookingsFromDB = await DataService.getDeliveryBookings();
      console.log("تم تحميل حجوزات التسليم للتحليل:", bookingsFromDB);
      setBookings(bookingsFromDB);
      calculateMetrics(bookingsFromDB);
    } catch (error) {
      console.error("خطأ في تحميل حجوزات التسليم:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookings();
    
    // إعداد Supabase Realtime للتحديث الفوري
    const deliveryChannel = DataService.setupRealtimeSubscription(
      'delivery_bookings',
      (payload) => {
        console.log('تحديث فوري لحجوزات التسليم في التحليل:', payload);
        loadBookings();
      }
    );
    
    // إعداد التحديث التلقائي كل دقيقة كخطة احتياطية
    const interval = setInterval(() => {
      loadBookings();
    }, 60000);

    return () => {
      DataService.removeRealtimeSubscription(deliveryChannel);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    calculateMetrics(bookings);
  }, [currentPeriod, bookings]);

  // حساب المؤشرات بناءً على البيانات المحدثة
  const calculateMetrics = (bookings: DeliveryBooking[]) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // فلترة البيانات حسب الفترة
    const monthlyBookings = bookings.filter(booking => {
      if (!booking.booking_date) return false;
      const bookingDate = new Date(booking.booking_date);
      return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
    });

    const yearlyBookings = bookings.filter(booking => {
      if (!booking.booking_date) return false;
      const bookingDate = new Date(booking.booking_date);
      return bookingDate.getFullYear() === currentYear;
    });

    const relevantBookings = currentPeriod === "monthly" ? monthlyBookings : yearlyBookings;

    // حساب المؤشرات الأساسية
    const totalBookings = bookings.length;
    const salesStage = bookings.filter(b => b.status === "في المبيعات").length;
    const projectsStage = bookings.filter(b => b.status === "في إدارة المشاريع").length;
    const customerServiceStage = bookings.filter(b => b.status === "في راحة العملاء").length;
    const completed = bookings.filter(b => b.status === "مكتمل").length;

    // حساب متوسط أيام نقل الكهرباء
    const electricityTransferDays = bookings
      .filter(b => b.electricity_meter_transfer_date && b.handover_date)
      .map(b => {
        const handoverDate = new Date(b.handover_date!);
        const electricityDate = new Date(b.electricity_meter_transfer_date!);
        return Math.abs((electricityDate.getTime() - handoverDate.getTime()) / (1000 * 60 * 60 * 24));
      });

    // حساب متوسط أيام نقل المياه
    const waterTransferDays = bookings
      .filter(b => b.water_meter_transfer_date && b.handover_date)
      .map(b => {
        const handoverDate = new Date(b.handover_date!);
        const waterDate = new Date(b.water_meter_transfer_date!);
        return Math.abs((waterDate.getTime() - handoverDate.getTime()) / (1000 * 60 * 60 * 24));
      });

    // حساب رضا العملاء
    const evaluatedBookings = bookings.filter(b => b.customer_evaluation_done && b.evaluation_percentage);
    const satisfactionRate = evaluatedBookings.length > 0 
      ? evaluatedBookings.reduce((sum, b) => sum + (b.evaluation_percentage || 0), 0) / evaluatedBookings.length
      : 0;

    // حساب متوسط أيام التسليم
    const deliveryDays = bookings
      .filter(b => b.customer_delivery_date && b.electricity_meter_transfer_date)
      .map(b => {
        const electricityDate = new Date(b.electricity_meter_transfer_date!);
        const deliveryDate = new Date(b.customer_delivery_date!);
        return Math.abs((deliveryDate.getTime() - electricityDate.getTime()) / (1000 * 60 * 60 * 24));
      });

    // حساب قيمة المبيعات
    const totalSalesValue = relevantBookings.reduce((sum, b) => sum + (b.unit_value || 0), 0);

    // حساب أيام الإفراغ للكاش
    const cashHandoverDays = bookings
      .filter(b => b.payment_method === "نقدي" && b.handover_date && b.booking_date)
      .map(b => {
        const bookingDate = new Date(b.booking_date!);
        const handoverDate = new Date(b.handover_date!);
        return Math.abs((handoverDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      });

    // حساب أيام الإفراغ للتحويل البنكي
    const bankHandoverDays = bookings
      .filter(b => b.payment_method === "تحويل بنكي" && b.handover_date && b.booking_date)
      .map(b => {
        const bookingDate = new Date(b.booking_date!);
        const handoverDate = new Date(b.handover_date!);
        return Math.abs((handoverDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      });

    // حساب متوسط أيام البناء
    const constructionDays = bookings
      .filter(b => b.construction_completion_date && b.booking_date)
      .map(b => {
        const bookingDate = new Date(b.booking_date!);
        const constructionDate = new Date(b.construction_completion_date!);
        return Math.abs((constructionDate.getTime() - bookingDate.getTime()) / (1000 * 60 * 60 * 24));
      });

    // حساب معدل إتمام المبيعات
    const salesCompletionRate = totalBookings > 0 ? ((totalBookings - salesStage) / totalBookings) * 100 : 0;

    setMetrics({
      totalBookings,
      salesStage,
      projectsStage,
      customerServiceStage,
      completed,
      monthlyBookings: monthlyBookings.length,
      yearlyBookings: yearlyBookings.length,
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
      avgCashHandoverDays: cashHandoverDays.length > 0 
        ? cashHandoverDays.reduce((sum, days) => sum + days, 0) / cashHandoverDays.length 
        : 0,
      avgBankHandoverDays: bankHandoverDays.length > 0 
        ? bankHandoverDays.reduce((sum, days) => sum + days, 0) / bankHandoverDays.length 
        : 0,
      avgConstructionDays: constructionDays.length > 0 
        ? constructionDays.reduce((sum, days) => sum + days, 0) / constructionDays.length 
        : 0,
      salesCompletionRate,
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
            <Button
              variant="outline"
              onClick={loadBookings}
              disabled={loading}
              className="mobile-button"
            >
              {loading ? "جاري التحديث..." : "تحديث البيانات"}
            </Button>
          </div>
        </div>

        {/* إحصائيات المراحل */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalBookings}</div>
              <p className="text-xs text-muted-foreground">حجز إجمالي</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">في المبيعات</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.salesStage}</div>
              <p className="text-xs text-muted-foreground">حجز</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">في إدارة المشاريع</CardTitle>
              <Calendar className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{metrics.projectsStage}</div>
              <p className="text-xs text-muted-foreground">حجز</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">في راحة العملاء</CardTitle>
              <ThumbsUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.customerServiceStage}</div>
              <p className="text-xs text-muted-foreground">حجز</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">مكتمل</CardTitle>
              <Home className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{metrics.completed}</div>
              <p className="text-xs text-muted-foreground">حجز</p>
            </CardContent>
          </Card>
        </div>

        {/* مؤشرات الأداء التفصيلية */}
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
                {currentPeriod === "monthly" ? metrics.monthlyBookings : metrics.yearlyBookings}
              </div>
              <p className="text-xs text-muted-foreground">وحدة سكنية</p>
            </CardContent>
          </Card>

          {/* معدل إتمام المبيعات */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل إتمام المبيعات</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(metrics.salesCompletionRate)}%</div>
              <p className="text-xs text-muted-foreground">من إجمالي الحجوزات</p>
            </CardContent>
          </Card>

          {/* أيام نقل عدادات الكهرباء */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">أيام نقل عدادات الكهرباء</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(metrics.avgElectricityTransferDays)}</div>
              <p className="text-xs text-muted-foreground">يوم في المتوسط</p>
            </CardContent>
          </Card>

          {/* أيام نقل عدادات المياه */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">أيام نقل عدادات المياه</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(metrics.avgWaterTransferDays)}</div>
              <p className="text-xs text-muted-foreground">يوم في المتوسط</p>
            </CardContent>
          </Card>

          {/* نسبة رضا العميل */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">نسبة رضا العميل عن الاستلام</CardTitle>
              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(metrics.customerSatisfactionRate)}%</div>
              <p className="text-xs text-muted-foreground">معدل الرضا العام</p>
            </CardContent>
          </Card>

          {/* أيام التسليم للعميل */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">أيام التسليم للعميل</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(metrics.avgDeliveryDays)}</div>
              <p className="text-xs text-muted-foreground">يوم من نقل الكهرباء للتسليم</p>
            </CardContent>
          </Card>

          {/* قيمة المبيعات */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيمة المبيعات بالريال</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(metrics.totalSalesValue / 1000000).toFixed(1)}م
              </div>
              <p className="text-xs text-muted-foreground">مليون ريال سعودي</p>
            </CardContent>
          </Card>

          {/* أيام الإفراغ للكاش */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">أيام الإفراغ (عملاء الكاش)</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(metrics.avgCashHandoverDays)}</div>
              <p className="text-xs text-muted-foreground">يوم من الحجز للإفراغ</p>
            </CardContent>
          </Card>

          {/* أيام الإفراغ للتحويل */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">أيام الإفراغ (عملاء التحويل)</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(metrics.avgBankHandoverDays)}</div>
              <p className="text-xs text-muted-foreground">يوم من الحجز للإفراغ</p>
            </CardContent>
          </Card>

          {/* متوسط أيام البناء */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط أيام البناء</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(metrics.avgConstructionDays)}</div>
              <p className="text-xs text-muted-foreground">يوم من الحجز لإنهاء البناء</p>
            </CardContent>
          </Card>
        </div>

        {/* معلومات التحديث */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>آخر تحديث: {new Date().toLocaleString('ar-SA')}</span>
              <span>إجمالي الحجوزات في النظام: {metrics.totalBookings}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
