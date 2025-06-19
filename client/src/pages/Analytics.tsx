
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
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Phone,
  Wrench,
  ThumbsUp,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function Analytics() {
  const {
    metrics,
    customerServiceData,
    maintenanceSatisfaction,
    currentPeriod,
    setCurrentPeriod,
  } = useMetrics();

  const [realtimeChannels, setRealtimeChannels] = useState<RealtimeChannel[]>([]);

  // إعداد الاشتراكات للوقت الفعلي
  useEffect(() => {
    // إزالة الاشتراكات السابقة
    realtimeChannels.forEach((channel) => {
      DataService.removeRealtimeSubscription(channel);
    });

    const newChannels: RealtimeChannel[] = [];

    // اشتراك واحد فقط لتجنب التكرار
    const channel = DataService.setupRealtimeSubscription(
      "metrics",
      (payload) => {
        console.log("تحديث بيانات التحليلات:", payload);
      },
    );
    newChannels.push(channel);

    setRealtimeChannels(newChannels);

    return () => {
      newChannels.forEach((channel) => {
        DataService.removeRealtimeSubscription(channel);
      });
    };
  }, [currentPeriod]);

  // تحضير البيانات للرسوم البيانية
  const performanceData = metrics.map((metric, index) => ({
    name: metric.title.substring(0, 20) + "...",
    قيمة_حالية: parseFloat(metric.value.replace(/[^0-9.-]/g, "")),
    الهدف: parseFloat(metric.target.replace(/[^0-9.-]/g, "")),
    نسبة_الإنجاز: Math.min(
      (parseFloat(metric.value.replace(/[^0-9.-]/g, "")) / 
       parseFloat(metric.target.replace(/[^0-9.-]/g, ""))) * 100,
      100
    ),
  }));

  // بيانات خدمة العملاء
  const serviceCallsDistribution = [
    { name: "شكاوى", value: customerServiceData.calls.complaints, color: "#ef4444" },
    { name: "طلبات تواصل", value: customerServiceData.calls.contactRequests, color: "#3b82f6" },
    { name: "طلبات صيانة", value: customerServiceData.calls.maintenanceRequests, color: "#f59e0b" },
    { name: "استفسارات", value: customerServiceData.calls.inquiries, color: "#10b981" },
    { name: "مهتمين مكاتب", value: customerServiceData.calls.officeInterested, color: "#8b5cf6" },
    { name: "مهتمين مشاريع", value: customerServiceData.calls.projectsInterested, color: "#ec4899" },
  ];

  const maintenanceStatusData = [
    { name: "تم الحل", value: customerServiceData.maintenance.resolved, color: "#10b981" },
    { name: "قيد المعالجة", value: customerServiceData.maintenance.inProgress, color: "#f59e0b" },
    { name: "تم الإلغاء", value: customerServiceData.maintenance.cancelled, color: "#ef4444" },
  ];

  // بيانات الرضا
  const satisfactionData = [
    { name: "راضي جداً", value: maintenanceSatisfaction.serviceQuality.veryHappy, color: "#059669" },
    { name: "راضي", value: maintenanceSatisfaction.serviceQuality.happy, color: "#10b981" },
    { name: "محايد", value: maintenanceSatisfaction.serviceQuality.neutral, color: "#f59e0b" },
    { name: "غير راضي", value: maintenanceSatisfaction.serviceQuality.unhappy, color: "#f97316" },
    { name: "غير راضي جداً", value: maintenanceSatisfaction.serviceQuality.veryUnhappy, color: "#dc2626" },
  ];

  // حساب نسب الرضا
  const calculateSatisfactionPercentage = (data: Record<string, number>) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    if (total === 0) return 0;
    const weightedSum =
      data.veryHappy * 100 +
      data.happy * 75 +
      data.neutral * 50 +
      data.unhappy * 25 +
      data.veryUnhappy * 0;
    return (weightedSum / (total * 100)) * 100;
  };

  const serviceQualityScore = calculateSatisfactionPercentage(maintenanceSatisfaction.serviceQuality);
  const closureTimeScore = calculateSatisfactionPercentage(maintenanceSatisfaction.closureTime);
  const firstTimeResolutionScore = calculateSatisfactionPercentage(maintenanceSatisfaction.firstTimeResolution);

  // احصائيات سريعة
  const quickStats = [
    {
      title: "إجمالي المكالمات",
      value: customerServiceData.calls.total,
      icon: <Phone className="h-6 w-6" />,
      color: "bg-blue-500",
      change: "+12%",
      positive: true,
    },
    {
      title: "طلبات الصيانة النشطة",
      value: customerServiceData.maintenance.inProgress,
      icon: <Wrench className="h-6 w-6" />,
      color: "bg-orange-500",
      change: "-8%",
      positive: false,
    },
    {
      title: "معدل رضا العملاء",
      value: `${serviceQualityScore.toFixed(1)}%`,
      icon: <ThumbsUp className="h-6 w-6" />,
      color: "bg-green-500",
      change: "+5%",
      positive: true,
    },
    {
      title: "عدد التعليقات",
      value: maintenanceSatisfaction.comments.length,
      icon: <FileText className="h-6 w-6" />,
      color: "bg-purple-500",
      change: "+3",
      positive: true,
    },
  ];

  return (
    <Layout>
      <div className="container mx-auto p-3 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              تحليلات الأداء المتقدمة
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              نظرة شاملة على أداء النظام ورضا العملاء
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              className="flex-1 sm:flex-none"
              variant={currentPeriod === "weekly" ? "default" : "outline"}
              onClick={() => setCurrentPeriod("weekly")}
            >
              أسبوعي
            </Button>
            <Button
              className="flex-1 sm:flex-none"
              variant={currentPeriod === "yearly" ? "default" : "outline"}
              onClick={() => setCurrentPeriod("yearly")}
            >
              سنوي
            </Button>
          </div>
        </div>

        {/* احصائيات سريعة */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <span className={`flex items-center text-sm ${
                        stat.positive ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {stat.positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                        {stat.change}
                      </span>
                    </div>
                  </div>
                  <div className={`p-3 rounded-full ${stat.color} text-white`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* التبويبات الرئيسية */}
        <Tabs defaultValue="performance" className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-4 h-auto sm:h-10">
            <TabsTrigger value="performance" className="text-xs sm:text-sm">
              أداء المؤشرات
            </TabsTrigger>
            <TabsTrigger value="service" className="text-xs sm:text-sm">
              خدمة العملاء
            </TabsTrigger>
            <TabsTrigger value="satisfaction" className="text-xs sm:text-sm">
              رضا العملاء
            </TabsTrigger>
            <TabsTrigger value="insights" className="text-xs sm:text-sm">
              التحليلات المتقدمة
            </TabsTrigger>
          </TabsList>

          {/* تبويب أداء المؤشرات */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    أداء المؤشرات مقابل الأهداف
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={performanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={10}
                        />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="قيمة_حالية" fill="#3b82f6" name="القيمة الحالية" />
                        <Bar dataKey="الهدف" fill="#10b981" name="الهدف" />
                        <Line 
                          type="monotone" 
                          dataKey="نسبة_الإنجاز" 
                          stroke="#ef4444" 
                          strokeWidth={2}
                          name="نسبة الإنجاز %" 
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>تفاصيل المؤشرات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-[400px] overflow-y-auto">
                    {metrics.map((metric, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm">{metric.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-lg font-bold">{metric.value}</span>
                            <span className="text-sm text-gray-500">/ {metric.target}</span>
                          </div>
                        </div>
                        <div className={`flex items-center gap-1 ${
                          metric.reachedTarget ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.reachedTarget ? 
                            <CheckCircle className="h-4 w-4" /> : 
                            <XCircle className="h-4 w-4" />
                          }
                          <span className="text-sm font-medium">
                            {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب خدمة العملاء */}
          <TabsContent value="service">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    توزيع المكالمات حسب النوع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={serviceCallsDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {serviceCallsDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="h-5 w-5" />
                    حالة طلبات الصيانة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={maintenanceStatusData}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                        >
                          {maintenanceStatusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>ملخص أداء خدمة العملاء</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 dark:text-green-400">طلبات محلولة</h4>
                      <p className="text-2xl font-bold text-green-600">{customerServiceData.maintenance.resolved}</p>
                    </div>
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-orange-800 dark:text-orange-400">قيد المعالجة</h4>
                      <p className="text-2xl font-bold text-orange-600">{customerServiceData.maintenance.inProgress}</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-800 dark:text-red-400">طلبات ملغية</h4>
                      <p className="text-2xl font-bold text-red-600">{customerServiceData.maintenance.cancelled}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب رضا العملاء */}
          <TabsContent value="satisfaction">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ThumbsUp className="h-5 w-5" />
                    مستوى رضا العملاء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={satisfactionData}
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          dataKey="value"
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        >
                          {satisfactionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>نقاط رضا العملاء</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-400 mb-2">جودة الخدمة</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${serviceQualityScore}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-blue-600">{serviceQualityScore.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-800 dark:text-green-400 mb-2">سرعة الإغلاق</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${closureTimeScore}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-green-600">{closureTimeScore.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-800 dark:text-purple-400 mb-2">الحل من أول مرة</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div 
                            className="bg-purple-600 h-2 rounded-full" 
                            style={{ width: `${firstTimeResolutionScore}%` }}
                          ></div>
                        </div>
                        <span className="text-lg font-bold text-purple-600">{firstTimeResolutionScore.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    تعليقات وملاحظات العملاء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {maintenanceSatisfaction.comments.map((comment, index) => (
                      <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm mb-2">{comment.text}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{comment.username}</span>
                          <span>{comment.date} - {comment.time}</span>
                        </div>
                      </div>
                    ))}
                    {maintenanceSatisfaction.comments.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        لا توجد تعليقات متاحة حالياً
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* تبويب التحليلات المتقدمة */}
          <TabsContent value="insights">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    نقاط تحتاج تحسين
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics
                      .filter(metric => !metric.reachedTarget)
                      .slice(0, 5)
                      .map((metric, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{metric.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              الحالي: {metric.value} | الهدف: {metric.target}
                            </p>
                          </div>
                          <div className="text-red-600 font-bold text-sm">
                            {Math.abs(metric.change).toFixed(1)}% أقل
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    نقاط قوة النظام
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {metrics
                      .filter(metric => metric.reachedTarget)
                      .slice(0, 5)
                      .map((metric, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div>
                            <p className="font-medium text-sm">{metric.title}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              الحالي: {metric.value} | الهدف: {metric.target}
                            </p>
                          </div>
                          <div className="text-green-600 font-bold text-sm">
                            {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>ملخص التحليلات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">الإحصائيات العامة</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>عدد المؤشرات المحققة:</span>
                          <span className="font-bold text-green-600">
                            {metrics.filter(m => m.reachedTarget).length} / {metrics.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>معدل رضا العملاء العام:</span>
                          <span className="font-bold text-blue-600">
                            {((serviceQualityScore + closureTimeScore + firstTimeResolutionScore) / 3).toFixed(1)}%
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>إجمالي المكالمات المعالجة:</span>
                          <span className="font-bold">{customerServiceData.calls.total}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">التوصيات</h4>
                      <div className="space-y-2 text-sm">
                        {serviceQualityScore < 70 && (
                          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-orange-800 dark:text-orange-400">
                            • تحسين جودة الخدمة المقدمة للعملاء
                          </div>
                        )}
                        {customerServiceData.maintenance.inProgress > customerServiceData.maintenance.resolved && (
                          <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-orange-800 dark:text-orange-400">
                            • تسريع معالجة طلبات الصيانة المعلقة
                          </div>
                        )}
                        {metrics.filter(m => !m.reachedTarget).length > metrics.length / 2 && (
                          <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded text-red-800 dark:text-red-400">
                            • مراجعة استراتيجية تحقيق الأهداف
                          </div>
                        )}
                      </div>
                    </div>
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
