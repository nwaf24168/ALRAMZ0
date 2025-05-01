
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import * as XLSX from 'xlsx';

const deliveryData = [
  {
    id: "1",
    bookingDate: "17-Dec-24",
    customerName: "تركي السعيد",
    project: "المعالي",
    building: "26",
    unit: "26",
    paymentMethod: "بنك",
    saleType: "جاهز",
    unitValue: 3128750,
    transferDate: "09-Jan-25",
    salesEmployee: "دعاء شدادي",
    constructionEndDate: "28/9/2024",
    finalReceiptDate: "28/9/2024",
    electricityTransferDate: "",
    waterTransferDate: "",
    deliveryDate: "25/3/2025",
    isEvaluated: false,
    evaluationScore: null
  },
  {
    id: "4",
    bookingDate: "22-Dec-25",
    customerName: "تركي السماري",
    project: "المعالي",
    building: "42",
    unit: "42",
    paymentMethod: "بنك",
    saleType: "جاهز",
    unitValue: 2687500,
    transferDate: "",
    salesEmployee: "محمد شعيب",
    constructionEndDate: "",
    finalReceiptDate: "",
    electricityTransferDate: "",
    waterTransferDate: "",
    deliveryDate: "",
    isEvaluated: false,
    evaluationScore: null
  },
  {
    id: "5",
    bookingDate: "01-Dec-24",
    customerName: "علي بخاري",
    project: "رمز 45",
    building: "8",
    unit: "3",
    paymentMethod: "بنك",
    saleType: "جاهز",
    unitValue: 657945,
    transferDate: "01-Jan-25",
    salesEmployee: "دعاء شدادي",
    constructionEndDate: "6/10/2024",
    finalReceiptDate: "6/10/2024",
    electricityTransferDate: "",
    waterTransferDate: "",
    deliveryDate: "29/1/2025",
    isEvaluated: false,
    evaluationScore: null
  },
  {
    id: "6",
    bookingDate: "18-Dec-24",
    customerName: "ياسين العلي",
    project: "رمز 45",
    building: "4",
    unit: "14",
    paymentMethod: "بنك",
    saleType: "جاهز",
    unitValue: 627195,
    transferDate: "02-Jan-25",
    salesEmployee: "محمد شعيب",
    constructionEndDate: "30/1/2025",
    finalReceiptDate: "30/1/2025",
    electricityTransferDate: "",
    waterTransferDate: "",
    deliveryDate: "30/1/2025",
    isEvaluated: false,
    evaluationScore: null
  }
];

export default function DeliveryAnalysis() {
  const [activeTab, setActiveTab] = useState("overview");
  const [data] = useState(deliveryData);

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "تقرير التسليم");
    XLSX.writeFile(wb, "تقرير_التسليم.xlsx");
  };

  // الإحصائيات
  const totalUnits = data.length;
  const completedDeliveries = data.filter(item => item.deliveryDate).length;
  const pendingDeliveries = totalUnits - completedDeliveries;
  const totalValue = data.reduce((sum, item) => sum + item.unitValue, 0);
  
  const projectStats = data.reduce((acc, curr) => {
    acc[curr.project] = (acc[curr.project] || 0) + 1;
    return acc;
  }, {});

  const salesEmployeeStats = data.reduce((acc, curr) => {
    acc[curr.salesEmployee] = (acc[curr.salesEmployee] || 0) + 1;
    return acc;
  }, {});

  const projectChartData = Object.entries(projectStats).map(([name, value]) => ({
    name,
    value
  }));

  const salesChartData = Object.entries(salesEmployeeStats).map(([name, value]) => ({
    name,
    value
  }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">تحليل بيانات التسليم</h1>
          <Button onClick={exportToExcel}>
            تصدير إلى Excel
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="details">تفاصيل</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>إجمالي الوحدات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalUnits}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>الوحدات المسلمة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{completedDeliveries}</div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>القيمة الإجمالية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{totalValue.toLocaleString()} ريال</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>توزيع الوحدات حسب المشروع</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={projectChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                        >
                          {projectChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                  <CardTitle>توزيع المبيعات حسب الموظف</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="details">
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل التسليم</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">الرقم</TableHead>
                        <TableHead className="text-right">تاريخ الحجز</TableHead>
                        <TableHead className="text-right">اسم العميل</TableHead>
                        <TableHead className="text-right">المشروع</TableHead>
                        <TableHead className="text-right">العمارة</TableHead>
                        <TableHead className="text-right">الوحدة</TableHead>
                        <TableHead className="text-right">قيمة الوحدة</TableHead>
                        <TableHead className="text-right">تاريخ التسليم</TableHead>
                        <TableHead className="text-right">حالة التسليم</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.id}</TableCell>
                          <TableCell>{item.bookingDate}</TableCell>
                          <TableCell>{item.customerName}</TableCell>
                          <TableCell>{item.project}</TableCell>
                          <TableCell>{item.building}</TableCell>
                          <TableCell>{item.unit}</TableCell>
                          <TableCell>{item.unitValue.toLocaleString()}</TableCell>
                          <TableCell>{item.deliveryDate || "لم يتم التسليم"}</TableCell>
                          <TableCell>
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              item.deliveryDate ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {item.deliveryDate ? "تم التسليم" : "قيد التسليم"}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
