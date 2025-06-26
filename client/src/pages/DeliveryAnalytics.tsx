
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Building, Users, TrendingUp, Clock, CheckCircle, AlertCircle, ArrowLeft, Calendar, BarChart3, DollarSign, Zap, Droplet, Home, Timer } from "lucide-react";
import { Link } from "react-router-dom";
import { DataService } from "@/lib/dataService";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DeliveryMetrics {
  totalUnits: number;
  monthlyUnits: number;
  yearlyUnits: number;
  averageElectricityDays: number;
  averageWaterDays: number;
  customerSatisfactionRate: number;
  averageDeliveryDays: number;
  totalSalesValue: number;
  cashHandoverDays: number;
  transferHandoverDays: number;
  monthlyTrend: Array<{
    month: string;
    units: number;
    sales: number;
  }>;
  projectBreakdown: Array<{
    project: string;
    units: number;
    value: number;
  }>;
}

export default function DeliveryAnalytics() {
  const [metrics, setMetrics] = useState<DeliveryMetrics>({
    totalUnits: 0,
    monthlyUnits: 0,
    yearlyUnits: 0,
    averageElectricityDays: 0,
    averageWaterDays: 0,
    customerSatisfactionRate: 0,
    averageDeliveryDays: 0,
    totalSalesValue: 0,
    cashHandoverDays: 0,
    transferHandoverDays: 0,
    monthlyTrend: [],
    projectBreakdown: []
  });

  const [loading, setLoading] = useState(true);

  // حساب الفرق بالأيام بين تاريخين
  const calculateDaysDifference = (startDate: string, endDate: string): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const difference = Math.abs(end.getTime() - start.getTime());
    return Math.ceil(difference / (1000 * 3600 * 24));
  };

  const calculateMetrics = async () => {
    try {
      setLoading(true);
      const bookings = await DataService.getDeliveryBookings();

      const currentDate = new Date();
      const currentMonth = currentDate.getMonth();
      const currentYear = currentDate.getFullYear();

      // حساب الوحدات المباعة
      const totalUnits = bookings.length;
      const monthlyUnits = bookings.filter(b => {
        if (!b.booking_date) return false;
        const bookingDate = new Date(b.booking_date);
        return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
      }).length;

      const yearlyUnits = bookings.filter(b => {
        if (!b.booking_date) return false;
        const bookingDate = new Date(b.booking_date);
        return bookingDate.getFullYear() === currentYear;
      }).length;

      // حساب متوسط أيام نقل عدادات الكهرباء
      const electricityTransfers = bookings.filter(b => 
        b.handover_date && b.electricity_meter_transfer_date
      );
      const totalElectricityDays = electricityTransfers.reduce((sum, booking) => {
        return sum + calculateDaysDifference(booking.handover_date!, booking.electricity_meter_transfer_date!);
      }, 0);
      const averageElectricityDays = electricityTransfers.length > 0 
        ? Math.round(totalElectricityDays / electricityTransfers.length) 
        : 0;

      // حساب متوسط أيام نقل عدادات الماء
      const waterTransfers = bookings.filter(b => 
        b.handover_date && b.water_meter_transfer_date
      );
      const totalWaterDays = waterTransfers.reduce((sum, booking) => {
        return sum + calculateDaysDifference(booking.handover_date!, booking.water_meter_transfer_date!);
      }, 0);
      const averageWaterDays = waterTransfers.length > 0 
        ? Math.round(totalWaterDays / waterTransfers.length) 
        : 0;

      // حساب نسبة رضا العميل
      const evaluatedBookings = bookings.filter(b => b.customer_evaluation_done && b.evaluation_percentage);
      const totalSatisfaction = evaluatedBookings.reduce((sum, booking) => sum + (booking.evaluation_percentage || 0), 0);
      const customerSatisfactionRate = evaluatedBookings.length > 0 
        ? Math.round(totalSatisfaction / evaluatedBookings.length) 
        : 0;

      // حساب متوسط أيام التسليم للعميل
      const deliveries = bookings.filter(b => 
        b.electricity_meter_transfer_date && b.customer_delivery_date
      );
      const totalDeliveryDays = deliveries.reduce((sum, booking) => {
        return sum + calculateDaysDifference(booking.electricity_meter_transfer_date!, booking.customer_delivery_date!);
      }, 0);
      const averageDeliveryDays = deliveries.length > 0 
        ? Math.round(totalDeliveryDays / deliveries.length) 
        : 0;

      // حساب قيمة المبيعات الإجمالية
      const totalSalesValue = bookings.reduce((sum, booking) => sum + (booking.unit_value || 0), 0);

      // حساب أيام الإفراغ للعملاء النقديين
      const cashCustomers = bookings.filter(b => 
        b.payment_method === 'نقد' && b.booking_date && b.handover_date
      );
      const totalCashDays = cashCustomers.reduce((sum, booking) => {
        return sum + calculateDaysDifference(booking.booking_date!, booking.handover_date!);
      }, 0);
      const cashHandoverDays = cashCustomers.length > 0 
        ? Math.round(totalCashDays / cashCustomers.length) 
        : 0;

      // حساب أيام الإفراغ للعملاء التحويل البنكي
      const transferCustomers = bookings.filter(b => 
        b.payment_method === 'بنك' && b.booking_date && b.handover_date
      );
      const totalTransferDays = transferCustomers.reduce((sum, booking) => {
        return sum + calculateDaysDifference(booking.booking_date!, booking.handover_date!);
      }, 0);
      const transferHandoverDays = transferCustomers.length > 0 
        ? Math.round(totalTransferDays / transferCustomers.length) 
        : 0;

      // حساب الاتجاه الشهري
      const monthlyData: { [key: string]: { units: number, sales: number } } = {};
      bookings.forEach(booking => {
        if (booking.booking_date) {
          const month = new Date(booking.booking_date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' });
          if (!monthlyData[month]) {
            monthlyData[month] = { units: 0, sales: 0 };
          }
          monthlyData[month].units++;
          monthlyData[month].sales += booking.unit_value || 0;
        }
      });

      const monthlyTrend = Object.entries(monthlyData).map(([month, data]) => ({
        month,
        units: data.units,
        sales: data.sales
      }));

      // حساب توزيع المشاريع
      const projectData: { [key: string]: { units: number, value: number } } = {};
      bookings.forEach(booking => {
        const project = booking.project || 'غير محدد';
        if (!projectData[project]) {
          projectData[project] = { units: 0, value: 0 };
        }
        projectData[project].units++;
        projectData[project].value += booking.unit_value || 0;
      });

      const projectBreakdown = Object.entries(projectData).map(([project, data]) => ({
        project,
        units: data.units,
        value: data.value
      })).sort((a, b) => b.units - a.units);

      setMetrics({
        totalUnits,
        monthlyUnits,
        yearlyUnits,
        averageElectricityDays,
        averageWaterDays,
        customerSatisfactionRate,
        averageDeliveryDays,
        totalSalesValue,
        cashHandoverDays,
        transferHandoverDays,
        monthlyTrend,
        projectBreakdown
      });
    } catch (error) {
      console.error('خطأ في حساب المؤشرات:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateMetrics();

    // تحديث البيانات كل دقيقة
    const interval = setInterval(() => {
      calculateMetrics();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">جاري تحميل البيانات...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">تحليلات قسم التسليم</h1>
            <p className="text-muted-foreground mt-1">
              مؤشرات الأداء الرئيسية لقسم التسليم
            </p>
          </div>
          <div className="flex gap-2">
            <Link to="/delivery">
              <Button variant="outline">
                <ArrowLeft className="ml-2 h-4 w-4" />
                العودة لإدارة التسليم
              </Button>
            </Link>
            <Badge variant="outline" className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              آخر تحديث: {new Date().toLocaleTimeString('ar-SA')}
            </Badge>
          </div>
        </div>

        {/* مؤشرات المبيعات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">الوحدات المباعة شهرياً</CardTitle>
              <Home className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{metrics.monthlyUnits}</div>
              <p className="text-xs text-blue-600 mt-1">وحدة في الشهر الحالي</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">الوحدات المباعة سنوياً</CardTitle>
              <Building className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{metrics.yearlyUnits}</div>
              <p className="text-xs text-green-600 mt-1">وحدة في السنة الحالية</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">قيمة المبيعات الإجمالية</CardTitle>
              <DollarSign className="h-5 w-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-900">
                {metrics.totalSalesValue.toLocaleString('ar-SA')}
              </div>
              <p className="text-xs text-purple-600 mt-1">ريال سعودي</p>
            </CardContent>
          </Card>
        </div>

        {/* مؤشرات الأوقات والعمليات */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">أيام نقل عداد الكهرباء</CardTitle>
              <Zap className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">{metrics.averageElectricityDays}</div>
              <p className="text-xs text-yellow-600 mt-1">يوم (متوسط من تاريخ الإفراغ)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-cyan-50 to-cyan-100 border-cyan-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-cyan-700">أيام نقل عداد الماء</CardTitle>
              <Droplet className="h-5 w-5 text-cyan-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-cyan-900">{metrics.averageWaterDays}</div>
              <p className="text-xs text-cyan-600 mt-1">يوم (متوسط من تاريخ الإفراغ)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">نسبة رضا العميل</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{metrics.customerSatisfactionRate}%</div>
              <Progress value={metrics.customerSatisfactionRate} className="mt-2" />
              <p className="text-xs text-green-600 mt-1">رضا عن عملية الاستلام</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">أيام التسليم للعميل</CardTitle>
              <Timer className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-900">{metrics.averageDeliveryDays}</div>
              <p className="text-xs text-orange-600 mt-1">يوم (من نقل عداد الكهرباء)</p>
            </CardContent>
          </Card>
        </div>

        {/* مؤشرات أيام الإفراغ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 border-indigo-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-indigo-700">أيام الإفراغ - عملاء الكاش</CardTitle>
              <Clock className="h-5 w-5 text-indigo-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-indigo-900">{metrics.cashHandoverDays}</div>
              <p className="text-xs text-indigo-600 mt-1">يوم (من تاريخ الحجز للإفراغ)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-teal-50 to-teal-100 border-teal-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-teal-700">أيام الإفراغ - عملاء التحويل</CardTitle>
              <TrendingUp className="h-5 w-5 text-teal-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-teal-900">{metrics.transferHandoverDays}</div>
              <p className="text-xs text-teal-600 mt-1">يوم (من تاريخ الحجز للإفراغ)</p>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* الاتجاه الشهري للوحدات */}
          {metrics.monthlyTrend.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>الاتجاه الشهري - عدد الوحدات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="units"
                        stroke="#3b82f6"
                        fill="#3b82f6"
                        fillOpacity={0.6}
                        name="عدد الوحدات"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* الاتجاه الشهري للمبيعات */}
          {metrics.monthlyTrend.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>الاتجاه الشهري - قيمة المبيعات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.monthlyTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number) => [value.toLocaleString('ar-SA'), 'ريال']}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="sales"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                        name="قيمة المبيعات (ريال)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* توزيع المشاريع */}
        {metrics.projectBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>أداء المشاريع - الوحدات والقيمة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={metrics.projectBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="project" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'قيمة المبيعات (ريال)') {
                          return [value.toLocaleString('ar-SA'), name];
                        }
                        return [value, name];
                      }}
                    />
                    <Legend />
                    <Bar dataKey="units" fill="#3b82f6" name="عدد الوحدات" />
                    <Bar dataKey="value" fill="#10b981" name="قيمة المبيعات (ريال)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ملخص المؤشرات الرئيسية */}
        <Card>
          <CardHeader>
            <CardTitle>ملخص المؤشرات الرئيسية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {metrics.totalUnits}
                </div>
                <p className="text-sm text-muted-foreground">إجمالي الوحدات</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">
                  {(metrics.totalSalesValue / 1000000).toFixed(1)}M
                </div>
                <p className="text-sm text-muted-foreground">قيمة المبيعات (مليون ريال)</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">
                  {Math.round((metrics.averageElectricityDays + metrics.averageWaterDays) / 2)}
                </div>
                <p className="text-sm text-muted-foreground">متوسط أيام نقل العدادات</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600">
                  {Math.round((metrics.cashHandoverDays + metrics.transferHandoverDays) / 2)}
                </div>
                <p className="text-sm text-muted-foreground">متوسط أيام الإفراغ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
