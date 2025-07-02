
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMetrics } from "@/context/MetricsContext";
import { Phone, Clock, MessageSquare, UserCheck, FileText, Wrench, HelpCircle, Upload, Download } from "lucide-react";
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
import { DataService } from "@/lib/dataService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { useState } from "react";
import * as XLSX from 'xlsx';

export default function CustomerService() {
  const { currentPeriod, setCurrentPeriod } = useMetrics();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [customerServiceData, setCustomerServiceData] = useState([]);

  // بيانات المكالمات مع أسماء مختصرة للموبايل
  const callsData = [
    { category: "شكاوى", shortCategory: "شكاوى", count: currentPeriod === "weekly" ? 28 : 340 },
    { category: "طلبات تواصل", shortCategory: "تواصل", count: currentPeriod === "weekly" ? 45 : 520 },
    { category: "طلبات صيانة", shortCategory: "صيانة", count: currentPeriod === "weekly" ? 65 : 790 },
    { category: "استفسارات", shortCategory: "استفسارات", count: currentPeriod === "weekly" ? 58 : 680 },
    { category: "مهتمين مكاتب", shortCategory: "مكاتب", count: currentPeriod === "weekly" ? 34 : 410 },
    { category: "مهتمين مشاريع", shortCategory: "مشاريع", count: currentPeriod === "weekly" ? 38 : 480 },
    { category: "عملاء مهتمين", shortCategory: "عملاء", count: currentPeriod === "weekly" ? 42 : 520 },
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

  // معالجة رفع ملف Excel
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // التحقق من نوع الملف
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يرجى اختيار ملف Excel صالح (.xlsx أو .xls)"
      });
      return;
    }

    if (!user?.username) {
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "يجب تسجيل الدخول أولاً"
      });
      return;
    }

    setIsLoading(true);

    try {
      // قراءة الملف
      const data = await file.arrayBuffer();
      const workbook = await import('xlsx').then(XLSX => XLSX.read(data, { type: 'array', cellDates: true }));

      // الحصول على أول ورقة عمل
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      // تحويل البيانات إلى JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (!jsonData || jsonData.length < 2) {
        toast({
          variant: "destructive",
          title: "خطأ",
          description: "الملف فارغ أو لا يحتوي على بيانات صالحة"
        });
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      // معالجة البيانات (تجاهل الصف الأول - العناوين)
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i] as any[];

        // تجاهل الصفوف الفارغة
        if (!row || row.length === 0 || !row.some(cell => cell)) {
          continue;
        }

        try {
          // ترتيب الأعمدة الصحيح لخدمة العملاء:
          // [التاريخ، اسم العميل، رقم الجوال، المشروع، الموظف المختص، طريقة التواصل، نوع الطلب، طلب العميل، الإجراء المتخذ، الحالة]
          
          let formattedDate = '';
          const dateValue = row[0];
          
          if (dateValue) {
            if (typeof dateValue === 'number') {
              // Excel date serial number
              const excelDate = new Date((dateValue - 25569) * 86400 * 1000);
              formattedDate = excelDate.toISOString().split('T')[0];
            } else if (typeof dateValue === 'string') {
              const parsedDate = new Date(dateValue);
              if (!isNaN(parsedDate.getTime())) {
                formattedDate = parsedDate.toISOString().split('T')[0];
              }
            } else if (dateValue instanceof Date) {
              formattedDate = dateValue.toISOString().split('T')[0];
            }
          }

          // التحقق من وجود البيانات الأساسية
          if (!formattedDate || !row[1] || !row[2]) {
            errorCount++;
            continue;
          }

          const recordData = {
            date: formattedDate,
            customerName: row[1] || '',
            phoneNumber: row[2] || '',
            project: row[3] || '',
            employee: row[4] || user.username,
            contactMethod: row[5] || 'اتصال هاتفي',
            type: row[6] || 'استفسار',
            customerRequest: row[7] || '',
            action: row[8] || '',
            status: row[9] || 'جديد',
            createdBy: user.username,
          };

          await DataService.saveReceptionRecord(recordData);
          successCount++;
        } catch (error) {
          console.error(`خطأ في معالجة السطر ${i + 1}:`, error);
          errorCount++;
        }
      }

      // إظهار نتيجة العملية
      toast({
        title: "تم الاستيراد",
        description: `تم استيراد ${successCount} سجل بنجاح${errorCount > 0 ? ` مع ${errorCount} خطأ` : ""}`
      });

    } catch (error) {
      console.error("خطأ في معالجة ملف Excel:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في معالجة ملف Excel"
      });
    } finally {
      setIsLoading(false);
      // مسح اختيار الملف
      event.target.value = '';
    }
  };

  // تصدير البيانات إلى Excel
  const exportToExcel = async () => {
    try {
      const XLSX = await import('xlsx');

      // تحضير نموذج البيانات للتصدير
      const exportData = [
        {
          'التاريخ': '2024-01-01',
          'اسم العميل': 'مثال العميل',
          'رقم الجوال': '0501234567',
          'المشروع': 'مشروع النخيل',
          'الموظف المختص': 'أحمد محمد',
          'طريقة التواصل': 'اتصال هاتفي',
          'نوع الطلب': 'استفسار',
          'طلب العميل': 'استفسار عن الوحدة',
          'الإجراء المتخذ': 'تم التوضيح',
          'الحالة': 'مكتمل'
        }
      ];

      // إنشاء ورقة العمل
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'نموذج خدمة العملاء');

      // تصدير الملف
      const fileName = `نموذج_خدمة_العملاء_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast({
        title: "تم التصدير",
        description: "تم تصدير نموذج Excel بنجاح"
      });
    } catch (error) {
      console.error("خطأ في تصدير Excel:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تصدير البيانات"
      });
    }
  };

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
      <div className="space-y-4 md:space-y-6 px-2 sm:px-4 lg:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <h1 className="text-xl sm:text-2xl font-bold">خدمة العملاء</h1>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex gap-2">
              <Button
                variant={currentPeriod === "weekly" ? "default" : "outline"}
                onClick={() => setCurrentPeriod("weekly")}
                className="flex-1 sm:flex-none text-sm sm:text-base"
              >
                أسبوعي
              </Button>
              <Button
                variant={currentPeriod === "yearly" ? "default" : "outline"}
                onClick={() => setCurrentPeriod("yearly")}
                className="flex-1 sm:flex-none text-sm sm:text-base"
              >
                سنوي
              </Button>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                onClick={exportToExcel}
                className="flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                تصدير نموذج
              </Button>
              <Button
                variant="outline"
                onClick={() => document.getElementById('customerServiceFileInput')?.click()}
                disabled={isLoading}
                className="flex-1 sm:flex-none text-xs sm:text-sm"
              >
                <Upload className="w-4 h-4 mr-1" />
                {isLoading ? 'جاري الاستيراد...' : 'استيراد Excel'}
              </Button>
              <input
                id="customerServiceFileInput"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {metricsCards.map((card, index) => (
            <Card key={index} className={`${card.color} min-h-[100px]`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
                <CardTitle className="text-xs sm:text-sm font-medium leading-tight">{card.title}</CardTitle>
                <div className="text-muted-foreground flex-shrink-0">{card.icon}</div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="text-lg sm:text-2xl font-bold">{card.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="calls" className="space-y-4">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-3 min-w-[300px]">
              <TabsTrigger value="calls" className="text-xs sm:text-sm">المكالمات</TabsTrigger>
              <TabsTrigger value="inquiries" className="text-xs sm:text-sm">الاستفسارات</TabsTrigger>
              <TabsTrigger value="maintenance" className="text-xs sm:text-sm">طلبات الصيانة</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="calls">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">توزيع المكالمات</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="h-[300px] sm:h-[400px] w-full overflow-hidden">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={callsData} 
                      margin={{ top: 20, right: 10, left: 10, bottom: 60 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="shortCategory" 
                        angle={-45}
                        textAnchor="end"
                        height={80}
                        interval={0}
                        fontSize={12}
                      />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        labelFormatter={(label) => {
                          const item = callsData.find(d => d.shortCategory === label);
                          return item ? item.category : label;
                        }}
                      />
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
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">تفاصيل الاستفسارات</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="relative overflow-x-auto -mx-4 sm:mx-0">
                  <div className="min-w-[300px]">
                    <table className="w-full text-sm text-right">
                      <thead className="text-xs bg-muted">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-right">نوع الاستفسار</th>
                          <th className="px-3 sm:px-6 py-3 text-center">العدد</th>
                          <th className="px-3 sm:px-6 py-3 text-center">النسبة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inquiriesData.map((item, index) => {
                          const total = inquiriesData.reduce((sum, curr) => sum + curr.count, 0);
                          const percentage = ((item.count / total) * 100).toFixed(1);
                          return (
                            <tr key={index} className="border-b">
                              <td className="px-3 sm:px-6 py-4 text-right">{item.category}</td>
                              <td className="px-3 sm:px-6 py-4 text-center font-medium">{item.count}</td>
                              <td className="px-3 sm:px-6 py-4 text-center font-medium">{percentage}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">تفاصيل طلبات الصيانة</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <div className="relative overflow-x-auto -mx-4 sm:mx-0">
                  <div className="min-w-[300px]">
                    <table className="w-full text-sm text-right">
                      <thead className="text-xs bg-muted">
                        <tr>
                          <th className="px-3 sm:px-6 py-3 text-right">الحالة</th>
                          <th className="px-3 sm:px-6 py-3 text-center">العدد</th>
                          <th className="px-3 sm:px-6 py-3 text-center">النسبة</th>
                        </tr>
                      </thead>
                      <tbody>
                        {maintenanceData.map((item, index) => {
                          const total = maintenanceData.reduce((sum, curr) => sum + curr.count, 0);
                          const percentage = ((item.count / total) * 100).toFixed(1);
                          return (
                            <tr key={index} className="border-b">
                              <td className="px-3 sm:px-6 py-4">
                                <div className="flex items-center">
                                  <span 
                                    className="w-3 h-3 rounded-full mr-2 flex-shrink-0" 
                                    style={{ backgroundColor: item.color }}
                                  ></span>
                                  <span className="text-right">{item.status}</span>
                                </div>
                              </td>
                              <td className="px-3 sm:px-6 py-4 text-center font-medium">{item.count}</td>
                              <td className="px-3 sm:px-6 py-4 text-center font-medium">{percentage}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
