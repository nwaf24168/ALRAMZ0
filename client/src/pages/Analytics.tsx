import React from "react";
import { useMetrics } from "@/context/MetricsContext";
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
  Users,
  Phone,
  Wrench,
  ThumbsUp,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  BarChart3,
  Target,
  Award,
  Zap,
} from "lucide-react";

export default function Analytics() {
  const {
    metrics,
    customerServiceData,
    maintenanceSatisfaction,
    currentPeriod,
    setCurrentPeriod,
  } = useMetrics();

  // تحضير البيانات للرسوم البيانية من البيانات الفعلية
  const performanceData = metrics.slice(0, 8).map((metric, index) => ({
    name: metric.title.length > 15 ? metric.title.substring(0, 15) + "..." : metric.title,
    fullName: metric.title,
    قيمة_حالية: parseFloat(metric.value.replace(/[^0-9.-]/g, "")) || 0,
    الهدف: parseFloat(metric.target.replace(/[^0-9.-]/g, "")) || 100,
    نسبة_الإنجاز: Math.min(
      Math.max(
        (parseFloat(metric.value.replace(/[^0-9.-]/g, "")) / 
         parseFloat(metric.target.replace(/[^0-9.-]/g, ""))) * 100, 0
      ), 150
    ) || 0,
    reachedTarget: metric.reachedTarget,
    change: metric.change,
  }));

  // بيانات التوزيع من البيانات الفعلية
  const serviceCallsDistribution = [
    { name: "شكاوى", value: customerServiceData.calls.complaints, color: "#ef4444" },
    { name: "طلبات تواصل", value: customerServiceData.calls.contactRequests, color: "#3b82f6" },
    { name: "طلبات صيانة", value: customerServiceData.calls.maintenanceRequests, color: "#f59e0b" },
    { name: "استفسارات", value: customerServiceData.calls.inquiries, color: "#10b981" },
    { name: "مهتمين مكاتب", value: customerServiceData.calls.officeInterested, color: "#8b5cf6" },
    { name: "مهتمين مشاريع", value: customerServiceData.calls.projectsInterested, color: "#ec4899" },
  ];

  const maintenanceStatusData = [
    { name: "تم الحل", value: customerServiceData.maintenance.resolved, color: "#10b981", percentage: 0 },
    { name: "قيد المعالجة", value: customerServiceData.maintenance.inProgress, color: "#f59e0b", percentage: 0 },
    { name: "تم الإلغاء", value: customerServiceData.maintenance.cancelled, color: "#ef4444", percentage: 0 },
  ];

  // حساب النسب المئوية للصيانة
  const maintenanceTotal = maintenanceStatusData.reduce((sum, item) => sum + item.value, 0);
  maintenanceStatusData.forEach(item => {
    item.percentage = maintenanceTotal > 0 ? (item.value / maintenanceTotal) * 100 : 0;
  });

  // بيانات الرضا من البيانات الفعلية
  const satisfactionData = [
    { name: "راضي جداً", value: maintenanceSatisfaction.serviceQuality.veryHappy, color: "#059669" },
    { name: "راضي", value: maintenanceSatisfaction.serviceQuality.happy, color: "#10b981" },
    { name: "محايد", value: maintenanceSatisfaction.serviceQuality.neutral, color: "#f59e0b" },
    { name: "غير راضي", value: maintenanceSatisfaction.serviceQuality.unhappy, color: "#f97316" },
    { name: "غير راضي جداً", value: maintenanceSatisfaction.serviceQuality.veryUnhappy, color: "#dc2626" },
  ];

  // حساب نسب الرضا من البيانات الفعلية
  const calculateSatisfactionPercentage = (data: Record<string, number>) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    if (total === 0) return 0;
    const weightedSum =
      data.veryHappy * 100 +
      data.happy * 75 +
      data.neutral * 50 +
      data.unhappy * 25 +
      data.veryUnhappy * 0;
    return Math.round((weightedSum / (total * 100)) * 100);
  };

  const serviceQualityScore = calculateSatisfactionPercentage(maintenanceSatisfaction.serviceQuality);
  const closureTimeScore = calculateSatisfactionPercentage(maintenanceSatisfaction.closureTime);
  const firstTimeResolutionScore = calculateSatisfactionPercentage(maintenanceSatisfaction.firstTimeResolution);

  // إحصائيات سريعة من البيانات الفعلية
  const quickStats = [
    {
      title: "إجمالي المكالمات",
      value: customerServiceData.calls.total.toLocaleString(),
      icon: <Phone className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "طلبات الصيانة النشطة",
      value: customerServiceData.maintenance.inProgress.toLocaleString(),
      icon: <Wrench className="h-5 w-5" />,
      color: "bg-orange-100 text-orange-800"
    },
    {
      title: "معدل رضا العملاء",
      value: `${serviceQualityScore}%`,
      icon: <ThumbsUp className="h-5 w-5" />,
      color: "bg-green-100 text-green-800"
    },
    {
      title: "عدد التعليقات",
      value: maintenanceSatisfaction.comments.length.toLocaleString(),
      icon: <FileText className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-800"
    },
  ];

  // مؤشرات الأداء الرئيسية من البيانات الفعلية
  const kpiData = [
    {
      title: "الأهداف المحققة",
      value: metrics.filter(m => m.reachedTarget).length,
      total: metrics.length,
      percentage: Math.round((metrics.filter(m => m.reachedTarget).length / metrics.length) * 100),
      color: "bg-green-500",
      icon: <Target className="h-4 w-4" />,
    },
    {
      title: "معدل تحسن الأداء",
      value: metrics.filter(m => m.change > 0).length,
      total: metrics.length,
      percentage: Math.round((metrics.filter(m => m.change > 0).length / metrics.length) * 100),
      color: "bg-blue-500",
      icon: <TrendingUp className="h-4 w-4" />,
    },
    {
      title: "مستوى الخدمة",
      value: Math.round((serviceQualityScore + closureTimeScore + firstTimeResolutionScore) / 3),
      total: 100,
      percentage: Math.round((serviceQualityScore + closureTimeScore + firstTimeResolutionScore) / 3),
      color: "bg-purple-500",
      icon: <Award className="h-4 w-4" />,
    },
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6" />
              تحليلات الأداء المتقدمة
            </h1>
            <p className="text-muted-foreground">
              نظرة شاملة على أداء النظام ورضا العملاء
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              variant={currentPeriod === "weekly" ? "default" : "outline"}
              onClick={() => setCurrentPeriod("weekly")}
            >
              <Clock className="h-4 w-4 mr-2" />
              أسبوعي
            </Button>
            <Button
              variant={currentPeriod === "yearly" ? "default" : "outline"}
              onClick={() => setCurrentPeriod("yearly")}
            >
              <Activity className="h-4 w-4 mr-2" />
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
                      <span className="text-sm text-muted-foreground">/ {kpi.total}</span>
                    </div>
                    <Progress value={kpi.percentage} className="h-2" />
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
        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="performance" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              أداء المؤشرات
            </TabsTrigger>
            <TabsTrigger value="service" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              خدمة العملاء
            </TabsTrigger>
            <TabsTrigger value="satisfaction" className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4" />
              رضا العملاء
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              تحليلات متقدمة
            </TabsTrigger>
          </TabsList>

          {/* تبويب أداء المؤشرات */}
          <TabsContent value="performance" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    أداء المؤشرات مقابل الأهداف
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          fontSize={11}
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
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    تفاصيل المؤشرات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {metrics.slice(0, 8).map((metric, index) => (
                      <div key={index} className={`flex items-center justify-between p-3 rounded-lg border ${
                        metric.reachedTarget 
                          ? 'bg-green-50 border-green-200' 
                          : 'bg-red-50 border-red-200'
                      }`}>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{metric.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={metric.reachedTarget ? "default" : "destructive"}>
                              {metric.value}
                            </Badge>
                            <span className="text-xs text-muted-foreground">الهدف: {metric.target}</span>
                          </div>
                          <Progress 
                            value={Math.min((parseFloat(metric.value.replace(/[^0-9.-]/g, "")) / parseFloat(metric.target.replace(/[^0-9.-]/g, ""))) * 100, 100)} 
                            className="mt-2 h-2"
                          />
                        </div>
                        <div className={`flex items-center gap-2 ml-3 ${
                          metric.reachedTarget ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metric.reachedTarget ? 
                            <CheckCircle className="h-4 w-4" /> : 
                            <XCircle className="h-4 w-4" />
                          }
                          <span className="text-sm font-bold">
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
          <TabsContent value="service" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="h-5 w-5" />
                    توزيع المكالمات حسب النوع
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={serviceCallsDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
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
                  <div className="space-y-4">
                    {maintenanceStatusData.map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{item.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-bold">{item.value}</span>
                            <Badge variant="outline">{item.percentage.toFixed(1)}%</Badge>
                          </div>
                        </div>
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                    ))}
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">ملخص الأداء</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">معدل الحل:</span>
                          <span className="font-bold ml-2">
                            {maintenanceTotal > 0 ? ((customerServiceData.maintenance.resolved / maintenanceTotal) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">إجمالي الطلبات:</span>
                          <span className="font-bold ml-2">{maintenanceTotal}</span>
                        </div>
                      </div>
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
                    مستوى رضا العملاء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={satisfactionData}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
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
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    مقاييس الرضا المفصلة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-blue-800">جودة الخدمة</h4>
                        <Badge className="bg-blue-600">{serviceQualityScore}%</Badge>
                      </div>
                      <Progress value={serviceQualityScore} className="h-2" />
                    </div>

                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-green-800">سرعة الإغلاق</h4>
                        <Badge className="bg-green-600">{closureTimeScore}%</Badge>
                      </div>
                      <Progress value={closureTimeScore} className="h-2" />
                    </div>

                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-purple-800">الحل من أول مرة</h4>
                        <Badge className="bg-purple-600">{firstTimeResolutionScore}%</Badge>
                      </div>
                      <Progress value={firstTimeResolutionScore} className="h-2" />
                    </div>

                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium mb-2">الرضا العام</h4>
                      <div className="text-center">
                        <div className="text-3xl font-bold mb-1">
                          {Math.round((serviceQualityScore + closureTimeScore + firstTimeResolutionScore) / 3)}%
                        </div>
                        <p className="text-muted-foreground">متوسط درجة الرضا</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* التعليقات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  تعليقات وملاحظات العملاء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
                  {maintenanceSatisfaction.comments.map((comment, index) => (
                    <div key={index} className="p-3 bg-muted rounded-lg border">
                      <p className="text-sm mb-2">{comment.text}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="font-medium">{comment.username}</span>
                        <span>{comment.date} - {comment.time}</span>
                      </div>
                    </div>
                  ))}
                  {maintenanceSatisfaction.comments.length === 0 && (
                    <div className="col-span-full text-center py-8">
                      <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">لا توجد تعليقات متاحة حالياً</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* تبويب التحليلات المتقدمة */}
          <TabsContent value="insights" className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
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
                      .slice(0, 6)
                      .map((metric, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{metric.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              الحالي: {metric.value} | الهدف: {metric.target}
                            </p>
                            <Progress value={Math.abs(metric.change)} className="mt-2 h-2" />
                          </div>
                          <div className="text-red-600 font-bold text-sm ml-3">
                            {Math.abs(metric.change).toFixed(1)}% نقص
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
                      .slice(0, 6)
                      .map((metric, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{metric.title}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              الحالي: {metric.value} | الهدف: {metric.target}
                            </p>
                            <Progress value={100} className="mt-2 h-2" />
                          </div>
                          <div className="text-green-600 font-bold text-sm ml-3">
                            {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* ملخص التحليلات */}
              <Card className="xl:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    ملخص التحليلات والتوصيات
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        الإحصائيات العامة
                      </h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center p-2 bg-muted rounded">
                          <span>عدد المؤشرات المحققة:</span>
                          <Badge variant="default">
                            {metrics.filter(m => m.reachedTarget).length} / {metrics.length}
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted rounded">
                          <span>معدل رضا العملاء العام:</span>
                          <Badge variant="default">
                            {((serviceQualityScore + closureTimeScore + firstTimeResolutionScore) / 3).toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-muted rounded">
                          <span>إجمالي المكالمات المعالجة:</span>
                          <Badge variant="default">
                            {customerServiceData.calls.total.toLocaleString()}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        التوصيات المقترحة
                      </h4>
                      <div className="space-y-2">
                        {serviceQualityScore < 70 && (
                          <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-800">
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              <span className="text-sm">تحسين جودة الخدمة المقدمة للعملاء</span>
                            </div>
                          </div>
                        )}
                        {customerServiceData.maintenance.inProgress > customerServiceData.maintenance.resolved && (
                          <div className="p-2 bg-amber-50 rounded border border-amber-200 text-amber-800">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">تسريع معالجة طلبات الصيانة المعلقة</span>
                            </div>
                          </div>
                        )}
                        {metrics.filter(m => !m.reachedTarget).length > metrics.length / 2 && (
                          <div className="p-2 bg-red-50 rounded border border-red-200 text-red-800">
                            <div className="flex items-center gap-2">
                              <Target className="h-4 w-4" />
                              <span className="text-sm">مراجعة استراتيجية تحقيق الأهداف</span>
                            </div>
                          </div>
                        )}
                        {serviceQualityScore >= 80 && (
                          <div className="p-2 bg-green-50 rounded border border-green-200 text-green-800">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              <span className="text-sm">الحفاظ على مستوى الخدمة الممتاز</span>
                            </div>
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