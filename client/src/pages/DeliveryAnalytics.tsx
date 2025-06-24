
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Building, Users, TrendingUp, Clock, CheckCircle, AlertCircle, ArrowLeft, Calendar, BarChart3 } from "lucide-react";
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

interface BookingStats {
  totalBookings: number;
  completedBookings: number;
  inProgressBookings: number;
  pendingBookings: number;
  averageCompletionTime: number;
  completionRate: number;
  stageStatistics: {
    sales: { completed: number; total: number; percentage: number };
    projects: { completed: number; total: number; percentage: number };
    customerService: { completed: number; total: number; percentage: number };
  };
  monthlyTrend: Array<{
    month: string;
    completed: number;
    inProgress: number;
    pending: number;
  }>;
  projectBreakdown: Array<{
    project: string;
    total: number;
    completed: number;
    percentage: number;
  }>;
}

export default function DeliveryAnalytics() {
  const [analytics, setAnalytics] = useState<BookingStats>({
    totalBookings: 0,
    completedBookings: 0,
    inProgressBookings: 0,
    pendingBookings: 0,
    averageCompletionTime: 0,
    completionRate: 0,
    stageStatistics: {
      sales: { completed: 0, total: 0, percentage: 0 },
      projects: { completed: 0, total: 0, percentage: 0 },
      customerService: { completed: 0, total: 0, percentage: 0 }
    },
    monthlyTrend: [],
    projectBreakdown: []
  });

  const [loading, setLoading] = useState(true);

  // تحديد الحالة بناءً على المراحل المكتملة
  const getBookingStatus = (booking: any): string => {
    if (booking.customer_service_completed) {
      return "مكتمل";
    } else if (booking.projects_completed) {
      return "في راحة العملاء";
    } else if (booking.sales_completed) {
      return "في إدارة المشاريع";
    } else {
      return "في المبيعات";
    }
  };

  const calculateAnalytics = async () => {
    try {
      setLoading(true);
      const bookings = await DataService.getDeliveryBookings();

      const totalBookings = bookings.length;
      const completedBookings = bookings.filter(b => 
        b.sales_completed && b.projects_completed && b.customer_service_completed
      ).length;
      const inProgressBookings = bookings.filter(b => 
        (b.sales_completed || b.projects_completed) && 
        !(b.sales_completed && b.projects_completed && b.customer_service_completed)
      ).length;
      const pendingBookings = bookings.filter(b => 
        !b.sales_completed && !b.projects_completed && !b.customer_service_completed
      ).length;

      const salesCompleted = bookings.filter(b => b.sales_completed).length;
      const projectsCompleted = bookings.filter(b => b.projects_completed).length;
      const customerServiceCompleted = bookings.filter(b => b.customer_service_completed).length;

      const completionRate = totalBookings > 0 ? (completedBookings / totalBookings) * 100 : 0;

      // حساب البيانات الشهرية
      const monthlyData = {};
      bookings.forEach(booking => {
        if (booking.booking_date) {
          const month = new Date(booking.booking_date).toLocaleDateString('ar-SA', { year: 'numeric', month: 'short' });
          if (!monthlyData[month]) {
            monthlyData[month] = { completed: 0, inProgress: 0, pending: 0 };
          }
          
          const status = getBookingStatus(booking);
          if (status === "مكتمل") {
            monthlyData[month].completed++;
          } else if (status === "في إدارة المشاريع" || status === "في راحة العملاء") {
            monthlyData[month].inProgress++;
          } else {
            monthlyData[month].pending++;
          }
        }
      });

      const monthlyTrend = Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
        month,
        completed: data.completed,
        inProgress: data.inProgress,
        pending: data.pending
      }));

      // حساب توزيع المشاريع
      const projectData = {};
      bookings.forEach(booking => {
        const project = booking.project || 'غير محدد';
        if (!projectData[project]) {
          projectData[project] = { total: 0, completed: 0 };
        }
        projectData[project].total++;
        if (getBookingStatus(booking) === "مكتمل") {
          projectData[project].completed++;
        }
      });

      const projectBreakdown = Object.entries(projectData).map(([project, data]: [string, any]) => ({
        project,
        total: data.total,
        completed: data.completed,
        percentage: data.total > 0 ? (data.completed / data.total) * 100 : 0
      })).sort((a, b) => b.total - a.total);

      setAnalytics({
        totalBookings,
        completedBookings,
        inProgressBookings,
        pendingBookings,
        averageCompletionTime: 18, // يمكن حسابها لاحقاً من التواريخ
        completionRate,
        stageStatistics: {
          sales: { 
            completed: salesCompleted, 
            total: totalBookings, 
            percentage: totalBookings > 0 ? (salesCompleted / totalBookings) * 100 : 0
          },
          projects: { 
            completed: projectsCompleted, 
            total: totalBookings, 
            percentage: totalBookings > 0 ? (projectsCompleted / totalBookings) * 100 : 0
          },
          customerService: { 
            completed: customerServiceCompleted, 
            total: totalBookings, 
            percentage: totalBookings > 0 ? (customerServiceCompleted / totalBookings) * 100 : 0
          }
        },
        monthlyTrend,
        projectBreakdown
      });
    } catch (error) {
      console.error('خطأ في حساب الإحصائيات:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    calculateAnalytics();

    // تحديث البيانات كل دقيقة
    const interval = setInterval(() => {
      calculateAnalytics();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const pieData = [
    { name: 'في المبيعات', value: analytics.pendingBookings, color: '#3b82f6' },
    { name: 'في إدارة المشاريع', value: analytics.inProgressBookings, color: '#f59e0b' },
    { name: 'مكتمل', value: analytics.completedBookings, color: '#10b981' }
  ].filter(item => item.value > 0);

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
            <h1 className="text-3xl font-bold">تحليلات التسليم</h1>
            <p className="text-muted-foreground mt-1">
              تحليل شامل لأداء مراحل التسليم الثلاث
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

        {/* الإحصائيات الرئيسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">إجمالي الحجوزات</CardTitle>
              <Building className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900">{analytics.totalBookings}</div>
              <p className="text-xs text-blue-600 mt-1">جميع الحجوزات المسجلة</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">الحجوزات المكتملة</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900">{analytics.completedBookings}</div>
              <Progress value={analytics.completionRate} className="mt-2" />
              <p className="text-xs text-green-600 mt-1">
                {analytics.completionRate.toFixed(1)}% معدل الإنجاز
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-700">قيد التنفيذ</CardTitle>
              <Clock className="h-5 w-5 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900">{analytics.inProgressBookings}</div>
              <p className="text-xs text-yellow-600 mt-1">حجوزات بدأت ولم تكتمل</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">في الانتظار</CardTitle>
              <AlertCircle className="h-5 w-5 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900">{analytics.pendingBookings}</div>
              <p className="text-xs text-red-600 mt-1">لم تبدأ بعد</p>
            </CardContent>
          </Card>
        </div>

        {/* الرسوم البيانية */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* توزيع الحالات */}
          <Card>
            <CardHeader>
              <CardTitle>توزيع حالات الحجوزات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* إحصائيات المراحل */}
          <Card>
            <CardHeader>
              <CardTitle>تقدم المراحل الثلاث</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">المبيعات</span>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                    {analytics.stageStatistics.sales.completed} / {analytics.stageStatistics.sales.total}
                  </Badge>
                </div>
                <Progress value={analytics.stageStatistics.sales.percentage} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.stageStatistics.sales.percentage.toFixed(1)}% مكتمل
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">إدارة المشاريع</span>
                  <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                    {analytics.stageStatistics.projects.completed} / {analytics.stageStatistics.projects.total}
                  </Badge>
                </div>
                <Progress value={analytics.stageStatistics.projects.percentage} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.stageStatistics.projects.percentage.toFixed(1)}% مكتمل
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">راحة العملاء</span>
                  <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                    {analytics.stageStatistics.customerService.completed} / {analytics.stageStatistics.customerService.total}
                  </Badge>
                </div>
                <Progress value={analytics.stageStatistics.customerService.percentage} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">
                  {analytics.stageStatistics.customerService.percentage.toFixed(1)}% مكتمل
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* الاتجاه الشهري */}
        {analytics.monthlyTrend.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>الاتجاه الشهري للحجوزات</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.monthlyTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="completed"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      name="مكتمل"
                    />
                    <Area
                      type="monotone"
                      dataKey="inProgress"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      name="قيد التنفيذ"
                    />
                    <Area
                      type="monotone"
                      dataKey="pending"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      name="في الانتظار"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* توزيع المشاريع */}
        {analytics.projectBreakdown.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>أداء المشاريع</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.projectBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="project" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total" fill="#3b82f6" name="إجمالي الحجوزات" />
                    <Bar dataKey="completed" fill="#10b981" name="الحجوزات المكتملة" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ملخص الأداء */}
        <Card>
          <CardHeader>
            <CardTitle>ملخص الأداء العام</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">
                  {analytics.completionRate.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">معدل الإنجاز الإجمالي</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {analytics.averageCompletionTime}
                </div>
                <p className="text-sm text-muted-foreground">متوسط أيام الإنجاز</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">
                  {analytics.totalBookings > 0 ? 
                    ((analytics.completedBookings + analytics.inProgressBookings) / analytics.totalBookings * 100).toFixed(1) 
                    : 0}%
                </div>
                <p className="text-sm text-muted-foreground">معدل التقدم</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-600">
                  {analytics.totalBookings > 0 ? 
                    (analytics.stageStatistics.customerService.percentage).toFixed(1) 
                    : 0}%
                </div>
                <p className="text-sm text-muted-foreground">نسبة الإنجاز النهائي</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
