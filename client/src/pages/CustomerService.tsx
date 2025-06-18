
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMetrics } from "@/context/MetricsContext";
import { Phone, Clock, MessageSquare, UserCheck, FileText, Wrench, HelpCircle } from "lucide-react";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function CustomerService() {
  const { currentPeriod, setCurrentPeriod } = useMetrics();

  // بيانات المكالمات
  const callsData = [
    { category: "شكاوى", count: currentPeriod === "weekly" ? 28 : 340 },
    { category: "طلبات تواصل", count: currentPeriod === "weekly" ? 45 : 520 },
    { category: "طلبات صيانة", count: currentPeriod === "weekly" ? 65 : 790 },
    { category: "استفسارات", count: currentPeriod === "weekly" ? 58 : 680 },
    { category: "مهتمين مكاتب", count: currentPeriod === "weekly" ? 34 : 410 },
    { category: "مهتمين مشاريع", count: currentPeriod === "weekly" ? 38 : 480 },
    { category: "عملاء مهتمين", count: currentPeriod === "weekly" ? 42 : 520 },
  ];

  // بيانات الاستفسارات
  const inquiriesData = [
    { category: "استفسارات عامة", count: currentPeriod === "weekly" ? 25 : 300 },
    { category: "طلب أوراق للأهمية", count: currentPeriod === "weekly" ? 15 : 180 },
    { category: "استفسارات الصكوك", count: currentPeriod === "weekly" ? 20 : 240 },
    { category: "إيجارات شقق", count: currentPeriod === "weekly" ? 18 : 220 },
    { category: "مشاريع مباعة", count: currentPeriod === "weekly" ? 12 : 150 },
  ];

  // بيانات طلبات الصيانة
  const maintenanceData = [
    { status: "تم الإلغاء", count: currentPeriod === "weekly" ? 5 : 60, color: "#ef4444" },
    { status: "تم الحل", count: currentPeriod === "weekly" ? 45 : 540, color: "#22c55e" },
    { status: "قيد المعالجة", count: currentPeriod === "weekly" ? 15 : 180, color: "#f59e0b" },
  ];

  // معلومات الكروت الرئيسية
  const metricsCards = [
    {
      title: "إجمالي المكالمات",
      value: currentPeriod === "weekly" ? "310" : "3,740",
      icon: <Phone className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "الاستفسارات",
      value: currentPeriod === "weekly" ? "90" : "1,090",
      icon: <HelpCircle className="h-5 w-5" />,
      color: "bg-green-100 text-green-800"
    },
    {
      title: "طلبات الصيانة",
      value: currentPeriod === "weekly" ? "65" : "780",
      icon: <Wrench className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-800"
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">خدمة العملاء</h1>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {metricsCards.map((card, index) => (
            <Card key={index} className={card.color}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className="text-muted-foreground">{card.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="calls" className="space-y-4">
          <TabsList>
            <TabsTrigger value="calls">المكالمات</TabsTrigger>
            <TabsTrigger value="inquiries">الاستفسارات</TabsTrigger>
            <TabsTrigger value="maintenance">طلبات الصيانة</TabsTrigger>
          </TabsList>

          <TabsContent value="calls">
            <Card>
              <CardHeader>
                <CardTitle>توزيع المكالمات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={callsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="count" name="عدد المكالمات" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inquiries">
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل الاستفسارات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead className="text-xs bg-muted">
                      <tr>
                        <th className="px-6 py-3">نوع الاستفسار</th>
                        <th className="px-6 py-3">العدد</th>
                        <th className="px-6 py-3">النسبة المئوية</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inquiriesData.map((item, index) => {
                        const total = inquiriesData.reduce((sum, curr) => sum + curr.count, 0);
                        const percentage = ((item.count / total) * 100).toFixed(1);
                        return (
                          <tr key={index} className="border-b">
                            <td className="px-6 py-4">{item.category}</td>
                            <td className="px-6 py-4">{item.count}</td>
                            <td className="px-6 py-4">{percentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل طلبات الصيانة</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-right">
                    <thead className="text-xs bg-muted">
                      <tr>
                        <th className="px-6 py-3">الحالة</th>
                        <th className="px-6 py-3">العدد</th>
                        <th className="px-6 py-3">النسبة المئوية</th>
                      </tr>
                    </thead>
                    <tbody>
                      {maintenanceData.map((item, index) => {
                        const total = maintenanceData.reduce((sum, curr) => sum + curr.count, 0);
                        const percentage = ((item.count / total) * 100).toFixed(1);
                        return (
                          <tr key={index} className="border-b">
                            <td className="px-6 py-4 flex items-center">
                              <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></span>
                              {item.status}
                            </td>
                            <td className="px-6 py-4">{item.count}</td>
                            <td className="px-6 py-4">{percentage}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
