
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMetrics } from "@/context/MetricsContext";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Users, 
  Wrench, 
  ThumbsUp, 
  FileText 
} from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { Button } from "@/components/ui/button";

export default function Reports() {
  const { currentPeriod, setCurrentPeriod, metrics, qualityData, npsData } = useMetrics();

  // بيانات تقارير الأداء
  const performanceOverTime = currentPeriod === "weekly" ? [
    { period: "الأسبوع 1", satisfaction: 70, quality: 85, maintenance: 82 },
    { period: "الأسبوع 2", satisfaction: 72, quality: 87, maintenance: 84 },
    { period: "الأسبوع 3", satisfaction: 74, quality: 89, maintenance: 86 },
    { period: "الأسبوع 4", satisfaction: 76, quality: 91, maintenance: 88 },
    { period: "الأسبوع 5", satisfaction: 78, quality: 93, maintenance: 90 },
    { period: "الأسبوع 6", satisfaction: 80, quality: 94, maintenance: 92 },
  ] : [
    { period: "يناير", satisfaction: 70, quality: 85, maintenance: 82 },
    { period: "فبراير", satisfaction: 71, quality: 86, maintenance: 83 },
    { period: "مارس", satisfaction: 72, quality: 87, maintenance: 84 },
    { period: "أبريل", satisfaction: 73, quality: 88, maintenance: 85 },
    { period: "مايو", satisfaction: 74, quality: 89, maintenance: 86 },
    { period: "يونيو", satisfaction: 75, quality: 90, maintenance: 87 },
    { period: "يوليو", satisfaction: 76, quality: 91, maintenance: 88 },
    { period: "أغسطس", satisfaction: 77, quality: 92, maintenance: 89 },
    { period: "سبتمبر", satisfaction: 78, quality: 93, maintenance: 90 },
    { period: "أكتوبر", satisfaction: 79, quality: 94, maintenance: 91 },
    { period: "نوفمبر", satisfaction: 80, quality: 95, maintenance: 92 },
    { period: "ديسمبر", satisfaction: 82, quality: 96, maintenance: 93 },
  ];

  // بيانات مقارنة المناطق
  const regionalComparison = [
    { name: "الرياض", satisfaction: 80, quality: 88 },
    { name: "جدة", satisfaction: 77, quality: 85 },
    { name: "الدمام", satisfaction: 82, quality: 90 },
    { name: "الخبر", satisfaction: 78, quality: 86 },
    { name: "مكة", satisfaction: 81, quality: 89 },
  ];

  // البطاقات الرئيسية
  const summaryCards = [
    {
      title: "متوسط رضا العملاء",
      value: currentPeriod === "weekly" ? "74%" : "78%",
      change: "+5.7%",
      isPositive: true,
      icon: <ThumbsUp className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "متوسط جودة الخدمات",
      value: currentPeriod === "weekly" ? "91%" : "94%",
      change: "+3.2%",
      isPositive: true,
      icon: <TrendingUp className="h-5 w-5" />,
      color: "bg-green-100 text-green-800"
    },
    {
      title: "عدد العملاء المرشحين",
      value: currentPeriod === "weekly" ? "584" : "672",
      change: "+15.1%",
      isPositive: true,
      icon: <Users className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-800"
    },
    {
      title: "نسبة التحسن في الصيانة",
      value: currentPeriod === "weekly" ? "5.7%" : "16.7%", 
      change: "+11%",
      isPositive: true,
      icon: <Wrench className="h-5 w-5" />,
      color: "bg-orange-100 text-orange-800"
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">تقارير الأداء</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card, index) => (
            <Card key={index} className={card.color}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className="text-muted-foreground">{card.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs mt-1">
                  {card.isPositive ? <TrendingUp className="inline h-3 w-3 mr-1" /> : <TrendingDown className="inline h-3 w-3 mr-1" />}
                  <span className={card.isPositive ? "text-green-700" : "text-red-700"}>
                    {card.change}
                  </span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تطور مؤشرات الأداء {currentPeriod === "weekly" ? "الأسبوعية" : "السنوية"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={performanceOverTime}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis domain={[65, 100]} />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="satisfaction" 
                    name="رضا العملاء" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="quality" 
                    name="جودة الخدمات" 
                    stroke="#82ca9d" 
                    fill="#82ca9d" 
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="maintenance" 
                    name="جودة الصيانة" 
                    stroke="#ffc658" 
                    fill="#ffc658" 
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>مقارنة المناطق</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={regionalComparison}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[60, 100]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="satisfaction" name="رضا العملاء" fill="#8884d8" />
                    <Bar dataKey="quality" name="جودة الخدمات" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>مؤشرات الترشيح {currentPeriod === "weekly" ? "الأسبوعية" : "السنوية"}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={npsData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis domain={[25, 75]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="newCustomers"
                      name="نسبة الترشيح للعملاء الجدد"
                      stroke="#3b82f6"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="afterFirstYear"
                      name="نسبة الترشيح بعد السنة"
                      stroke="#2563eb"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="longTerm"
                      name="نسبة الترشيح للعملاء القدامى"
                      stroke="#ef4444"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>تقرير تفصيلي عن مؤشرات الجودة</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={qualityData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis domain={[85, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="delivery"
                    name="جودة التسليم"
                    stroke="#10b981"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="maintenance"
                    name="جودة الصيانة"
                    stroke="#f97316"
                    activeDot={{ r: 8 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="facilityManagement"
                    name="جودة إدارة المرافق"
                    stroke="#3b82f6"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
