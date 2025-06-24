
import { useEffect, useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Building, Users, TrendingUp, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { DataService } from "@/lib/dataService";

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
    }
  });

  const calculateAnalytics = async () => {
    try {
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
        }
      });
    } catch (error) {
      console.error('خطأ في حساب الإحصائيات:', error);
    }
  };

  useEffect(() => {
    calculateAnalytics();

    // تحديث البيانات كل 30 ثانية
    const interval = setInterval(() => {
      calculateAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Layout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">تحليل التسليم</h1>
          <Badge variant="outline">مُحدث في الوقت الفعلي</Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.totalBookings}</div>
              <p className="text-xs text-muted-foreground">جميع الحجوزات المسجلة</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الحجوزات المكتملة</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.completedBookings}</div>
              <Progress value={analytics.completionRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.completionRate.toFixed(1)}% معدل الإنجاز
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">قيد التنفيذ</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.inProgressBookings}</div>
              <p className="text-xs text-muted-foreground">حجوزات بدأت ولم تكتمل</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">في الانتظار</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.pendingBookings}</div>
              <p className="text-xs text-muted-foreground">لم تبدأ بعد</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>إحصائيات المراحل</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">المبيعات</span>
                <Badge variant="secondary">
                  {analytics.stageStatistics.sales.completed} / {analytics.stageStatistics.sales.total}
                </Badge>
              </div>
              <Progress value={analytics.stageStatistics.sales.percentage} />
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.stageStatistics.sales.percentage.toFixed(1)}% مكتمل
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">إدارة المشاريع</span>
                <Badge variant="secondary">
                  {analytics.stageStatistics.projects.completed} / {analytics.stageStatistics.projects.total}
                </Badge>
              </div>
              <Progress value={analytics.stageStatistics.projects.percentage} />
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.stageStatistics.projects.percentage.toFixed(1)}% مكتمل
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">راحة العملاء</span>
                <Badge variant="secondary">
                  {analytics.stageStatistics.customerService.completed} / {analytics.stageStatistics.customerService.total}
                </Badge>
              </div>
              <Progress value={analytics.stageStatistics.customerService.percentage} />
              <p className="text-xs text-muted-foreground mt-1">
                {analytics.stageStatistics.customerService.percentage.toFixed(1)}% مكتمل
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ملخص الأداء</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">
                  {analytics.completionRate.toFixed(1)}%
                </div>
                <p className="text-sm text-muted-foreground">معدل الإنجاز الإجمالي</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">
                  {analytics.averageCompletionTime}
                </div>
                <p className="text-sm text-muted-foreground">متوسط أيام الإنجاز</p>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600">
                  {analytics.totalBookings > 0 ? 
                    ((analytics.completedBookings + analytics.inProgressBookings) / analytics.totalBookings * 100).toFixed(1) 
                    : 0}%
                </div>
                <p className="text-sm text-muted-foreground">معدل التقدم</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
