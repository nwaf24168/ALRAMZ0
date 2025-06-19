
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
  RadialBarChart,
  RadialBar,
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
  PieChart as PieChartIcon,
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

  // تم إزالة كود الاشتراكات من هنا لأن MetricsContext يتولى هذا الأمر

  // تحضير البيانات للرسوم البيانية المحسنة
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

  // بيانات التوزيع المحسنة
  const serviceCallsDistribution = [
    { name: "شكاوى", value: customerServiceData.calls.complaints, color: "#ef4444", icon: "❌" },
    { name: "طلبات تواصل", value: customerServiceData.calls.contactRequests, color: "#3b82f6", icon: "📞" },
    { name: "طلبات صيانة", value: customerServiceData.calls.maintenanceRequests, color: "#f59e0b", icon: "🔧" },
    { name: "استفسارات", value: customerServiceData.calls.inquiries, color: "#10b981", icon: "❓" },
    { name: "مهتمين مكاتب", value: customerServiceData.calls.officeInterested, color: "#8b5cf6", icon: "🏢" },
    { name: "مهتمين مشاريع", value: customerServiceData.calls.projectsInterested, color: "#ec4899", icon: "🏗️" },
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

  // بيانات الرضا المحسنة
  const satisfactionData = [
    { name: "راضي جداً", value: maintenanceSatisfaction.serviceQuality.veryHappy, color: "#059669", emoji: "😍" },
    { name: "راضي", value: maintenanceSatisfaction.serviceQuality.happy, color: "#10b981", emoji: "😊" },
    { name: "محايد", value: maintenanceSatisfaction.serviceQuality.neutral, color: "#f59e0b", emoji: "😐" },
    { name: "غير راضي", value: maintenanceSatisfaction.serviceQuality.unhappy, color: "#f97316", emoji: "😞" },
    { name: "غير راضي جداً", value: maintenanceSatisfaction.serviceQuality.veryUnhappy, color: "#dc2626", emoji: "😡" },
  ];

  // حساب نسب الرضا المحسنة
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

  // بيانات الرادار للمقاييس المتقدمة
  const radarData = [
    { metric: "جودة الخدمة", value: serviceQualityScore, fullMark: 100 },
    { metric: "سرعة الإغلاق", value: closureTimeScore, fullMark: 100 },
    { metric: "الحل الأول", value: firstTimeResolutionScore, fullMark: 100 },
    { metric: "رضا العملاء", value: Math.round((serviceQualityScore + closureTimeScore + firstTimeResolutionScore) / 3), fullMark: 100 },
  ];

  // إحصائيات سريعة محسنة
  const quickStats = [
    {
      title: "إجمالي المكالمات",
      value: customerServiceData.calls.total.toLocaleString(),
      icon: <Phone className="h-6 w-6" />,
      color: "from-blue-500 to-blue-600",
      textColor: "text-blue-700",
      bgColor: "bg-blue-50",
      change: "+12%",
      positive: true,
    },
    {
      title: "طلبات الصيانة النشطة",
      value: customerServiceData.maintenance.inProgress.toLocaleString(),
      icon: <Wrench className="h-6 w-6" />,
      color: "from-orange-500 to-orange-600",
      textColor: "text-orange-700",
      bgColor: "bg-orange-50",
      change: "-8%",
      positive: false,
    },
    {
      title: "معدل رضا العملاء",
      value: `${serviceQualityScore}%`,
      icon: <ThumbsUp className="h-6 w-6" />,
      color: "from-green-500 to-green-600",
      textColor: "text-green-700",
      bgColor: "bg-green-50",
      change: "+5%",
      positive: true,
    },
    {
      title: "عدد التعليقات",
      value: maintenanceSatisfaction.comments.length.toLocaleString(),
      icon: <FileText className="h-6 w-6" />,
      color: "from-purple-500 to-purple-600",
      textColor: "text-purple-700",
      bgColor: "bg-purple-50",
      change: "+3",
      positive: true,
    },
  ];

  // مؤشرات الأداء الرئيسية
  const kpiData = [
    {
      title: "الأهداف المحققة",
      value: metrics.filter(m => m.reachedTarget).length,
      total: metrics.length,
      percentage: Math.round((metrics.filter(m => m.reachedTarget).length / metrics.length) * 100),
      color: "bg-gradient-to-r from-green-500 to-emerald-500",
      icon: <Target className="h-5 w-5" />,
    },
    {
      title: "معدل تحسن الأداء",
      value: metrics.filter(m => m.change > 0).length,
      total: metrics.length,
      percentage: Math.round((metrics.filter(m => m.change > 0).length / metrics.length) * 100),
      color: "bg-gradient-to-r from-blue-500 to-cyan-500",
      icon: <TrendingUp className="h-5 w-5" />,
    },
    {
      title: "مستوى الخدمة",
      value: Math.round((serviceQualityScore + closureTimeScore + firstTimeResolutionScore) / 3),
      total: 100,
      percentage: Math.round((serviceQualityScore + closureTimeScore + firstTimeResolutionScore) / 3),
      color: "bg-gradient-to-r from-purple-500 to-pink-500",
      icon: <Award className="h-5 w-5" />,
    },
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto p-3 md:p-6 space-y-8">
          {/* Header المحسن */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                    <BarChart3 className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      تحليلات الأداء المتقدمة
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                      نظرة شاملة على أداء النظام ورضا العملاء
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  variant={currentPeriod === "weekly" ? "default" : "outline"}
                  onClick={() => setCurrentPeriod("weekly")}
                  className="px-6 py-3"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  أسبوعي
                </Button>
                <Button
                  variant={currentPeriod === "yearly" ? "default" : "outline"}
                  onClick={() => setCurrentPeriod("yearly")}
                  className="px-6 py-3"
                >
                  <Activity className="h-4 w-4 mr-2" />
                  سنوي
                </Button>
              </div>
            </div>

            {/* مؤشرات الأداء الرئيسية */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              {kpiData.map((kpi, index) => (
                <div key={index} className="relative overflow-hidden rounded-xl bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{kpi.title}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          {kpi.value}
                        </span>
                        <span className="text-sm text-gray-500">/ {kpi.total}</span>
                      </div>
                      <Progress value={kpi.percentage} className="h-2" />
                    </div>
                    <div className={`p-3 rounded-full ${kpi.color} text-white`}>
                      {kpi.icon}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* احصائيات سريعة محسنة */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => (
              <Card key={index} className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3">
                      <p className={`text-sm font-medium ${stat.textColor}`}>
                        {stat.title}
                      </p>
                      <div className="flex items-center gap-3">
                        <p className="text-3xl font-bold text-gray-900 dark:text-white">
                          {stat.value}
                        </p>
                        <Badge variant={stat.positive ? "default" : "destructive"} className="flex items-center gap-1">
                          {stat.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {stat.change}
                        </Badge>
                      </div>
                    </div>
                    <div className={`p-4 rounded-full ${stat.bgColor}`}>
                      <div className={`${stat.textColor}`}>
                        {stat.icon}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* التبويبات المحسنة */}
          <Tabs defaultValue="performance" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 h-auto bg-white dark:bg-gray-800 rounded-xl p-2 shadow-md">
              <TabsTrigger value="performance" className="flex items-center gap-2 py-3">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">أداء المؤشرات</span>
              </TabsTrigger>
              <TabsTrigger value="service" className="flex items-center gap-2 py-3">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">خدمة العملاء</span>
              </TabsTrigger>
              <TabsTrigger value="satisfaction" className="flex items-center gap-2 py-3">
                <ThumbsUp className="h-4 w-4" />
                <span className="hidden sm:inline">رضا العملاء</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2 py-3">
                <Zap className="h-4 w-4" />
                <span className="hidden sm:inline">تحليلات متقدمة</span>
              </TabsTrigger>
            </TabsList>

            {/* تبويب أداء المؤشرات المحسن */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-white" />
                      </div>
                      أداء المؤشرات مقابل الأهداف
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[450px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={performanceData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                          <XAxis 
                            dataKey="name" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={11}
                            tick={{ fill: '#6b7280' }}
                          />
                          <YAxis tick={{ fill: '#6b7280' }} />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: '1px solid #e5e7eb', 
                              borderRadius: '8px',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                          <Legend />
                          <Bar dataKey="قيمة_حالية" fill="url(#blueGradient)" name="القيمة الحالية" radius={[4, 4, 0, 0]} />
                          <Bar dataKey="الهدف" fill="url(#greenGradient)" name="الهدف" radius={[4, 4, 0, 0]} />
                          <Line 
                            type="monotone" 
                            dataKey="نسبة_الإنجاز" 
                            stroke="#ef4444" 
                            strokeWidth={3}
                            name="نسبة الإنجاز %" 
                            dot={{ r: 6, fill: '#ef4444' }}
                          />
                          <defs>
                            <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            </linearGradient>
                            <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0.3}/>
                            </linearGradient>
                          </defs>
                        </ComposedChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                        <Target className="h-5 w-5 text-white" />
                      </div>
                      تفاصيل المؤشرات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-h-[450px] overflow-y-auto">
                      {metrics.slice(0, 8).map((metric, index) => (
                        <div key={index} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300 hover:shadow-md ${
                          metric.reachedTarget 
                            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        }`}>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{metric.title}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <Badge variant={metric.reachedTarget ? "default" : "destructive"}>
                                {metric.value}
                              </Badge>
                              <span className="text-xs text-gray-500">الهدف: {metric.target}</span>
                            </div>
                            <Progress 
                              value={Math.min((parseFloat(metric.value.replace(/[^0-9.-]/g, "")) / parseFloat(metric.target.replace(/[^0-9.-]/g, ""))) * 100, 100)} 
                              className="mt-2 h-2"
                            />
                          </div>
                          <div className={`flex items-center gap-2 ml-4 ${
                            metric.reachedTarget ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {metric.reachedTarget ? 
                              <CheckCircle className="h-5 w-5" /> : 
                              <XCircle className="h-5 w-5" />
                            }
                            <div className="text-right">
                              <span className="text-sm font-bold">
                                {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* تبويب خدمة العملاء المحسن */}
            <TabsContent value="service" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
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
                            label={({ name, percent, icon }) => `${icon} ${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {serviceCallsDistribution.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: 'none', 
                              borderRadius: '8px',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-r from-orange-500 to-red-600 rounded-lg">
                        <Wrench className="h-5 w-5 text-white" />
                      </div>
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
                              <span className="font-bold text-lg">{item.value}</span>
                              <Badge variant="outline">{item.percentage.toFixed(1)}%</Badge>
                            </div>
                          </div>
                          <Progress value={item.percentage} className="h-3" />
                        </div>
                      ))}
                    </div>
                    <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg">
                      <h4 className="font-semibold mb-2">ملخص الأداء</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">معدل الحل:</span>
                          <span className="font-bold ml-2">
                            {maintenanceTotal > 0 ? ((customerServiceData.maintenance.resolved / maintenanceTotal) * 100).toFixed(1) : 0}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">إجمالي الطلبات:</span>
                          <span className="font-bold ml-2">{maintenanceTotal}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* تبويب رضا العملاء المحسن */}
            <TabsContent value="satisfaction" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                        <ThumbsUp className="h-5 w-5 text-white" />
                      </div>
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
                            label={({ name, percent, emoji }) => `${emoji} ${name}: ${(percent * 100).toFixed(0)}%`}
                            labelLine={false}
                          >
                            {satisfactionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#fff', 
                              border: 'none', 
                              borderRadius: '8px',
                              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                        <Award className="h-5 w-5 text-white" />
                      </div>
                      مقاييس الرضا المفصلة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-blue-800 dark:text-blue-400">جودة الخدمة</h4>
                            <Badge className="bg-blue-600">{serviceQualityScore}%</Badge>
                          </div>
                          <Progress value={serviceQualityScore} className="h-3" />
                        </div>

                        <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-green-800 dark:text-green-400">سرعة الإغلاق</h4>
                            <Badge className="bg-green-600">{closureTimeScore}%</Badge>
                          </div>
                          <Progress value={closureTimeScore} className="h-3" />
                        </div>

                        <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-purple-800 dark:text-purple-400">الحل من أول مرة</h4>
                            <Badge className="bg-purple-600">{firstTimeResolutionScore}%</Badge>
                          </div>
                          <Progress value={firstTimeResolutionScore} className="h-3" />
                        </div>
                      </div>

                      <div className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800 dark:to-slate-800 rounded-xl">
                        <h4 className="font-semibold mb-3">الرضا العام</h4>
                        <div className="text-center">
                          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                            {Math.round((serviceQualityScore + closureTimeScore + firstTimeResolutionScore) / 3)}%
                          </div>
                          <p className="text-gray-600 dark:text-gray-400">متوسط درجة الرضا</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* التعليقات المحسنة */}
              <Card className="shadow-lg border-0">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg">
                      <FileText className="h-5 w-5 text-white" />
                    </div>
                    تعليقات وملاحظات العملاء
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
                    {maintenanceSatisfaction.comments.map((comment, index) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 hover:shadow-md transition-shadow">
                        <p className="text-sm mb-3 leading-relaxed">{comment.text}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span className="font-medium">{comment.username}</span>
                          <span>{comment.date} - {comment.time}</span>
                        </div>
                      </div>
                    ))}
                    {maintenanceSatisfaction.comments.length === 0 && (
                      <div className="col-span-full text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 text-lg">لا توجد تعليقات متاحة حالياً</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* تبويب التحليلات المتقدمة المحسن */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-white" />
                      </div>
                      نقاط تحتاج تحسين
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {metrics
                        .filter(metric => !metric.reachedTarget)
                        .slice(0, 6)
                        .map((metric, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-xl border border-red-200 dark:border-red-800">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{metric.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                الحالي: {metric.value} | الهدف: {metric.target}
                              </p>
                              <Progress value={Math.abs(metric.change)} className="mt-2 h-2" />
                            </div>
                            <div className="text-red-600 font-bold text-sm ml-4">
                              {Math.abs(metric.change).toFixed(1)}% نقص
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </div>
                      نقاط قوة النظام
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {metrics
                        .filter(metric => metric.reachedTarget)
                        .slice(0, 6)
                        .map((metric, index) => (
                          <div key={index} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border border-green-200 dark:border-green-800">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{metric.title}</p>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                الحالي: {metric.value} | الهدف: {metric.target}
                              </p>
                              <Progress value={100} className="mt-2 h-2" />
                            </div>
                            <div className="text-green-600 font-bold text-sm ml-4">
                              {metric.change > 0 ? '+' : ''}{metric.change.toFixed(1)}%
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>

                {/* ملخص التحليلات المحسن */}
                <Card className="xl:col-span-2 shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-3 text-xl">
                      <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      ملخص التحليلات والتوصيات
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <BarChart3 className="h-5 w-5" />
                          الإحصائيات العامة
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span>عدد المؤشرات المحققة:</span>
                            <Badge variant="default" className="text-lg px-3 py-1">
                              {metrics.filter(m => m.reachedTarget).length} / {metrics.length}
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span>معدل رضا العملاء العام:</span>
                            <Badge variant="default" className="text-lg px-3 py-1">
                              {((serviceQualityScore + closureTimeScore + firstTimeResolutionScore) / 3).toFixed(1)}%
                            </Badge>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <span>إجمالي المكالمات المعالجة:</span>
                            <Badge variant="default" className="text-lg px-3 py-1">
                              {customerServiceData.calls.total.toLocaleString()}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h4 className="font-semibold text-lg flex items-center gap-2">
                          <Zap className="h-5 w-5" />
                          التوصيات المقترحة
                        </h4>
                        <div className="space-y-3">
                          {serviceQualityScore < 70 && (
                            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                <span className="font-medium">تحسين جودة الخدمة المقدمة للعملاء</span>
                              </div>
                            </div>
                          )}
                          {customerServiceData.maintenance.inProgress > customerServiceData.maintenance.resolved && (
                            <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                <span className="font-medium">تسريع معالجة طلبات الصيانة المعلقة</span>
                              </div>
                            </div>
                          )}
                          {metrics.filter(m => !m.reachedTarget).length > metrics.length / 2 && (
                            <div className="p-3 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 rounded-lg border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400">
                              <div className="flex items-center gap-2">
                                <Target className="h-4 w-4" />
                                <span className="font-medium">مراجعة استراتيجية تحقيق الأهداف</span>
                              </div>
                            </div>
                          )}
                          {serviceQualityScore >= 80 && (
                            <div className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800 text-green-800 dark:text-green-400">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4" />
                                <span className="font-medium">الحفاظ على مستوى الخدمة الممتاز</span>
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
      </div>
    </Layout>
  );
}
