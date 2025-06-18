import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMetrics } from "@/context/MetricsContext";
import { 
  Wrench, 
  Clock, 
  ThumbsUp,
  MessageCircle,
  TrendingUp,
  TrendingDown
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
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function Maintenance() {
  const { currentPeriod, setCurrentPeriod } = useMetrics();

  // بيانات الصيانة الرئيسية
  const maintenanceMetrics = [
    {
      title: "الرضا عن خدمات الصيانة",
      value: currentPeriod === "weekly" ? "88%" : "92%",
      change: currentPeriod === "weekly" ? "+3.5%" : "+5.7%",
      isPositive: true,
      icon: <ThumbsUp className="h-5 w-5" />,
      color: "bg-green-100 text-green-800"
    },
    {
      title: "الرضا عن مدة إغلاق الطلبات",
      value: currentPeriod === "weekly" ? "85%" : "89%",
      change: currentPeriod === "weekly" ? "+2.8%" : "+4.2%",
      isPositive: true,
      icon: <Clock className="h-5 w-5" />,
      color: "bg-blue-100 text-blue-800"
    },
    {
      title: "نسبة الإغلاق من أول مرة",
      value: currentPeriod === "weekly" ? "92%" : "94%",
      change: currentPeriod === "weekly" ? "+4.2%" : "+6.1%",
      isPositive: true,
      icon: <Wrench className="h-5 w-5" />,
      color: "bg-purple-100 text-purple-800"
    }
  ];

  // بيانات رضا العملاء
  const satisfactionData = [
    { category: "راضون جداً", value: 45, color: "#22c55e" },
    { category: "راضون", value: 30, color: "#84cc16" },
    { category: "محايدون", value: 15, color: "#eab308" },
    { category: "غير راضين", value: 7, color: "#f97316" },
    { category: "غير راضين جداً", value: 3, color: "#ef4444" }
  ];

  // بيانات الملاحظات
  const comments = [
    {
      id: 1,
      comment: "خدمة ممتازة وسريعة في الاستجابة",
      date: "2024-01-15",
      employee: "أحمد محمد",
      satisfaction: "راضي جداً"
    },
    {
      id: 2,
      comment: "تم حل المشكلة بشكل احترافي",
      date: "2024-01-14",
      employee: "محمد علي",
      satisfaction: "راضي"
    },
    {
      id: 3,
      comment: "وقت الانتظار كان طويلاً نوعاً ما",
      date: "2024-01-13",
      employee: "سارة أحمد",
      satisfaction: "محايد"
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">رضا العملاء عن الصيانة</h1>
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
          {maintenanceMetrics.map((metric, index) => (
            <Card key={index} className={metric.color}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <div className="text-muted-foreground">{metric.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <p className="text-xs mt-1">
                  {metric.isPositive ? 
                    <TrendingUp className="inline h-3 w-3 mr-1" /> : 
                    <TrendingDown className="inline h-3 w-3 mr-1" />
                  }
                  <span className={metric.isPositive ? "text-green-700" : "text-red-700"}>
                    {metric.change}
                  </span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>توزيع مستوى الرضا</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                <BarChart data={satisfactionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="نسبة الرضا" fill="#4CAF50">
                    {satisfactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>آخر الملاحظات</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] w-full">
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <Card key={comment.id} className="bg-muted">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-2">
                          <MessageCircle className="h-5 w-5 mt-1" />
                          <div className="flex-1">
                            <p className="text-sm">{comment.comment}</p>
                            <div className="mt-2 text-xs text-muted-foreground">
                              <span>{comment.date}</span>
                              <span className="mx-2">•</span>
                              <span>{comment.employee}</span>
                              <span className="mx-2">•</span>
                              <span className="text-green-600">{comment.satisfaction}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}