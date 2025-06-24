The code is updated to connect the delivery analytics to the database and calculate statistics from real data, including changes to imports, state initialization, calculation logic, and useEffect for data fetching and updates.
```

```replit_final_file
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
        <Card>
          <CardHeader>
            <CardTitle>إجمالي الحجوزات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>الحجوزات المكتملة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completedBookings}</div>
            <Progress value={analytics.completionRate} />
            <p className="text-sm mt-2">
              {analytics.completionRate.toFixed(1)}% معدل الإنجاز
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>مراحل الحجوزات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>المبيعات</span>
              <Badge>{analytics.stageStatistics.sales.completed} / {analytics.stageStatistics.sales.total}</Badge>
            </div>
            <Progress value={analytics.stageStatistics.sales.percentage} />

            <div className="flex items-center justify-between">
              <span>إدارة المشاريع</span>
              <Badge>{analytics.stageStatistics.projects.completed} / {analytics.stageStatistics.projects.total}</Badge>
            </div>
            <Progress value={analytics.stageStatistics.projects.percentage} />

            <div className="flex items-center justify-between">
              <span>راحة العملاء</span>
              <Badge>{analytics.stageStatistics.customerService.completed} / {analytics.stageStatistics.customerService.total}</Badge>
            </div>
            <Progress value={analytics.stageStatistics.customerService.percentage} />
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}