import React, { useEffect, useState } from "react";
import { useMetrics } from "@/context/MetricsContext";
import Layout from "@/components/layout/Layout";
import { DataService } from "@/lib/dataService";
import { RealtimeChannel } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Area,
  AreaChart,
  ComposedChart,
} from "recharts";

export default function Analytics() {
  const {
    metrics,
    qualityData,
    npsData,
    customerServiceData,
    maintenanceSatisfaction,
    currentPeriod,
    setCurrentPeriod,
  } = useMetrics();
  const [realtimeChannels, setRealtimeChannels] = useState<RealtimeChannel[]>(
    [],
  );

  // إعداد الاشتراكات للوقت الفعلي للتحليلات
  useEffect(() => {
    // إزالة الاشتراكات السابقة
    realtimeChannels.forEach((channel) => {
      DataService.removeRealtimeSubscription(channel);
    });

    const newChannels: RealtimeChannel[] = [];

    // اشتراك في تحديثات جميع الجداول للتحليلات
    const tablesForAnalytics = [
      "metrics",
      "customer_service",
      "satisfaction",
      "comments",
    ];

    tablesForAnalytics.forEach((table) => {
      const channel = DataService.setupRealtimeSubscription(
        table,
        (payload) => {
          console.log(`تحديث ${table} للتحليلات:`, payload);
          // يمكن إضافة منطق إضافي هنا لتحديث البيانات المحددة للتحليلات
        },
      );
      newChannels.push(channel);
    });

    setRealtimeChannels(newChannels);

    return () => {
      newChannels.forEach((channel) => {
        DataService.removeRealtimeSubscription(channel);
      });
    };
  }, [currentPeriod]);

  // حساب متوسط NPS والتغير
  const calculateNPSMetrics = () => {
    const currentData = currentPeriod === "weekly" ? npsData : npsData;
    const averages = {
      newCustomers: 0,
      afterFirstYear: 0,
      longTerm: 0,
    };

    currentData.forEach((data) => {
      averages.newCustomers += data.newCustomers;
      averages.afterFirstYear += data.afterFirstYear;
      averages.longTerm += data.longTerm;
    });

    const count = currentData.length;
    return {
      newCustomers: (averages.newCustomers / count).toFixed(1),
      afterFirstYear: (averages.afterFirstYear / count).toFixed(1),
      longTerm: (averages.longTerm / count).toFixed(1),
    };
  };

  // تحليلات NPS والجودة
  const npsChartData = npsData.map((data) => ({
    period: data.week,
    "عملاء جدد": data.newCustomers,
    "بعد السنة الأولى": data.afterFirstYear,
    "عملاء قدامى": data.longTerm,
    المتوسط: (data.newCustomers + data.afterFirstYear + data.longTerm) / 3,
  }));

  const qualityRadarData = qualityData.map((data) => ({
    metric: data.week,
    "إدارة المرافق": data.facilityManagement,
    الصيانة: data.maintenance,
    التسليم: data.delivery,
  }));

  // تحليلات خدمة العملاء
  const serviceCallsData = [
    { name: "شكاوى", value: customerServiceData.calls.complaints },
    { name: "طلبات تواصل", value: customerServiceData.calls.contactRequests },
    {
      name: "طلبات صيانة",
      value: customerServiceData.calls.maintenanceRequests,
    },
    { name: "استفسارات", value: customerServiceData.calls.inquiries },
    { name: "مهتمين مكاتب", value: customerServiceData.calls.officeInterested },
    {
      name: "مهتمين مشاريع",
      value: customerServiceData.calls.projectsInterested,
    },
  ];

  const totalCalls = serviceCallsData.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  const servicePerformanceData = [
    {
      name: "المكالمات",
      total: totalCalls,
      resolved: customerServiceData.maintenance.resolved,
      pending: customerServiceData.maintenance.inProgress,
      cancelled: customerServiceData.maintenance.cancelled,
    },
  ];

  // تحليلات رضا العملاء
  const satisfactionData = [
    {
      name: "راضي جداً",
      value: maintenanceSatisfaction.serviceQuality.veryHappy,
    },
    { name: "راضي", value: maintenanceSatisfaction.serviceQuality.happy },
    { name: "محايد", value: maintenanceSatisfaction.serviceQuality.neutral },
    { name: "غير راضي", value: maintenanceSatisfaction.serviceQuality.unhappy },
    {
      name: "غير راضي جداً",
      value: maintenanceSatisfaction.serviceQuality.veryUnhappy,
    },
  ];

  const satisfactionTrends = [
    { name: "جودة الخدمة", ...maintenanceSatisfaction.serviceQuality },
    { name: "وقت الإغلاق", ...maintenanceSatisfaction.closureTime },
    { name: "الحل من أول مرة", ...maintenanceSatisfaction.firstTimeResolution },
  ];

  const COLORS = {
    positive: ["#4CAF50", "#8BC34A", "#CDDC39"],
    neutral: ["#FFC107"],
    negative: ["#FF9800", "#F44336"],
  };

  const npsAverages = calculateNPSMetrics();

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">تحليلات الأداء والنتائج</h1>
          <div className="flex gap-2">
            <Button
              variant={currentPeriod === "weekly" ? "default" : "outline"}
              onClick={() => setCurrentPeriod("weekly")}
            >
              أسبوعي
            </Button>
            <Button
              variant={currentPeriod === "yearly" ? "default" : "outline"}
              onClick={() => setCurrentPeriod("yearly")}
            >
              سنوي
            </Button>
          </div>
        </div>

        <Tabs defaultValue="nps" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="nps">تحليلات NPS والجودة</TabsTrigger>
            <TabsTrigger value="service">تحليلات خدمة العملاء</TabsTrigger>
            <TabsTrigger value="satisfaction">تحليلات رضا العملاء</TabsTrigger>
          </TabsList>

          <TabsContent value="nps">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>متوسط NPS - عملاء جدد</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {npsAverages.newCustomers}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>متوسط NPS - بعد السنة</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-600">
                      {npsAverages.afterFirstYear}%
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>متوسط NPS - عملاء قدامى</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-purple-600">
                      {npsAverages.longTerm}%
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>
                    تطور مؤشر NPS -{" "}
                    {currentPeriod === "weekly" ? "أسبوعي" : "سنوي"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={npsChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="المتوسط"
                          fill="#8884d8"
                          stroke="#8884d8"
                        />
                        <Line
                          type="monotone"
                          dataKey="عملاء جدد"
                          stroke="#4CAF50"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="بعد السنة الأولى"
                          stroke="#2196F3"
                          strokeWidth={2}
                        />
                        <Line
                          type="monotone"
                          dataKey="عملاء قدامى"
                          stroke="#9C27B0"
                          strokeWidth={2}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    تحليل الجودة الشامل -{" "}
                    {currentPeriod === "weekly" ? "أسبوعي" : "سنوي"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={qualityRadarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis />
                        <Radar
                          name="إدارة المرافق"
                          dataKey="إدارة المرافق"
                          stroke="#8884d8"
                          fill="#8884d8"
                          fillOpacity={0.6}
                        />
                        <Radar
                          name="الصيانة"
                          dataKey="الصيانة"
                          stroke="#82ca9d"
                          fill="#82ca9d"
                          fillOpacity={0.6}
                        />
                        <Radar
                          name="التسليم"
                          dataKey="التسليم"
                          stroke="#ffc658"
                          fill="#ffc658"
                          fillOpacity={0.6}
                        />
                        <Legend />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="service">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>توزيع المكالمات حسب النوع</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={serviceCallsData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            {serviceCallsData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  COLORS.positive[
                                    index % COLORS.positive.length
                                  ]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>أداء خدمة العملاء</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={servicePerformanceData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar
                            dataKey="total"
                            stackId="a"
                            fill="#8884d8"
                            name="إجمالي المكالمات"
                          />
                          <Bar
                            dataKey="resolved"
                            stackId="b"
                            fill="#82ca9d"
                            name="تم الحل"
                          />
                          <Bar
                            dataKey="pending"
                            stackId="b"
                            fill="#ffc658"
                            name="قيد المعالجة"
                          />
                          <Bar
                            dataKey="cancelled"
                            stackId="b"
                            fill="#ff7300"
                            name="ملغية"
                          />
                          <Line
                            type="monotone"
                            dataKey="resolved"
                            stroke="#82ca9d"
                            name="معدل الحل"
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="satisfaction">
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>مستوى رضا العملاء</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={satisfactionData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={120}
                            paddingAngle={5}
                            dataKey="value"
                            label={({ name, percent }) =>
                              `${name} (${(percent * 100).toFixed(0)}%)`
                            }
                          >
                            {satisfactionData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={
                                  index < 2
                                    ? COLORS.positive[index]
                                    : index === 2
                                      ? COLORS.neutral[0]
                                      : COLORS.negative[index - 3]
                                }
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>تحليل اتجاهات الرضا</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={satisfactionTrends}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="name" />
                          <PolarRadiusAxis />
                          <Radar
                            name="راضي جداً"
                            dataKey="veryHappy"
                            stroke="#4CAF50"
                            fill="#4CAF50"
                            fillOpacity={0.6}
                          />
                          <Radar
                            name="راضي"
                            dataKey="happy"
                            stroke="#8BC34A"
                            fill="#8BC34A"
                            fillOpacity={0.6}
                          />
                          <Radar
                            name="محايد"
                            dataKey="neutral"
                            stroke="#FFC107"
                            fill="#FFC107"
                            fillOpacity={0.6}
                          />
                          <Legend />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>آخر التعليقات والملاحظات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {maintenanceSatisfaction.comments.map((comment, index) => (
                      <div
                        key={index}
                        className="p-4 border rounded-lg bg-card"
                      >
                        <p className="text-sm mb-2">{comment.text}</p>
                        <div className="text-xs text-muted-foreground">
                          {comment.username} - {comment.date} {comment.time}
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
