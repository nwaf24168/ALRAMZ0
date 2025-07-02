
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/dataService";
import * as XLSX from 'xlsx';
import { 
  Upload, 
  Download, 
  Phone, 
  Clock, 
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  BarChart3,
  Target,
  Trash2
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

interface CallRecord {
  id: string;
  callTime: string;
  callId: string;
  from: string;
  to: string;
  direction: 'Inbound' | 'Outbound';
  status: 'Answered' | 'Unanswered';
  ringingDuration: number; // في ثواني
  talkingDuration: number; // في ثواني
  agentName: string;
  isBusinessHours: boolean;
  responseTime: number; // وقت الرد في ثواني
}

interface EmployeePerformance {
  agentName: string;
  totalCalls: number;
  answeredCalls: number;
  averageResponseTime: number;
  answerRate: number;
  totalTalkTime: number;
}

interface CallAnalytics {
  totalCalls: number;
  answeredCalls: number;
  unansweredCalls: number;
  answerRate: number;
  averageResponseTime: number;
  totalTalkTime: number;
  businessHoursCalls: number;
  outsideHoursCalls: number;
}

export default function ThreeCX() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [callRecords, setCallRecords] = useState<CallRecord[]>([]);
  const [yearlyData, setYearlyData] = useState<CallRecord[]>([]);
  const [weeklyData, setWeeklyData] = useState<CallRecord[]>([]);
  const [analytics, setAnalytics] = useState<CallAnalytics | null>(null);
  const [employeePerformance, setEmployeePerformance] = useState<EmployeePerformance[]>([]);
  const [activeTab, setActiveTab] = useState<"weekly" | "yearly">("weekly");

  // دوال مساعدة للتحقق من أوقات الدوام
  const isBusinessHours = (dateTime: string): boolean => {
    const date = new Date(dateTime);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    const hour = date.getHours();

    // الأحد إلى الخميس: 09:00 - 22:00
    if (dayOfWeek >= 0 && dayOfWeek <= 4) {
      return hour >= 9 && hour < 22;
    }
    // الجمعة والسبت: 14:00 - 22:00
    else if (dayOfWeek === 5 || dayOfWeek === 6) {
      return hour >= 14 && hour < 22;
    }
    return false;
  };

  // تحويل وقت من صيغة HH:MM:SS إلى ثواني
  const timeToSeconds = (timeStr: string): number => {
    if (!timeStr || timeStr === '00:00:00') return 0;
    const parts = timeStr.split(':');
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  };

  // معالجة ملف Excel
  const processExcelData = (data: any[], isYearly: boolean = false) => {
    console.log("معالجة بيانات Excel:", data.length, "سجل");

    const processedRecords: CallRecord[] = data.map((row, index) => {
      const callTime = row['Call Time'] || row['وقت المكالمة'] || '';
      const from = row['From'] || row['من'] || '';
      const to = row['To'] || row['إلى'] || '';
      const direction = row['Direction'] || row['الاتجاه'] || '';
      const status = row['Status'] || row['الحالة'] || '';
      const ringing = row['Ringing'] || row['الرنين'] || '00:00:00';
      const talking = row['Talking'] || row['المحادثة'] || '00:00:00';

      // استخراج اسم الموظف من عمود To أو From
      let agentName = '';
      const callDetails = row['Call Activity Details'] || row['تفاصيل النشاط'] || '';
      
      if (direction === 'Inbound' && to) {
        // للمكالمات الواردة، استخراج اسم الموظف من to
        agentName = to.includes('(') ? to.split('(')[0].trim() : to;
      } else if (direction === 'Outbound' && from) {
        // للمكالمات الصادرة، استخراج اسم الموظف من from
        agentName = from.includes('(') ? from.split('(')[0].trim() : from;
      }

      // إذا لم نجد اسم الموظف، نحاول من تفاصيل المكالمة
      if (!agentName && callDetails) {
        const matches = callDetails.match(/replaced by ([^(]+)/);
        if (matches) {
          agentName = matches[1].trim();
        }
      }

      // إذا لم نجد اسم الموظف، نستخدم قيمة افتراضية
      if (!agentName || agentName === 'Call Center (800)' || agentName === 'Welcom (802)') {
        agentName = 'غير محدد';
      }

      const ringingSeconds = timeToSeconds(ringing);
      const talkingSeconds = timeToSeconds(talking);
      const isInBusinessHours = isBusinessHours(callTime);

      return {
        id: `${index}-${Date.now()}`,
        callTime,
        callId: row['Call ID'] || row['معرف المكالمة'] || '',
        from,
        to,
        direction: direction as 'Inbound' | 'Outbound',
        status: status as 'Answered' | 'Unanswered',
        ringingDuration: ringingSeconds,
        talkingDuration: talkingSeconds,
        agentName,
        isBusinessHours: isInBusinessHours,
        responseTime: status === 'Answered' ? ringingSeconds : 0
      };
    });

    // تصفية السجلات لتشمل فقط المكالمات في أوقات الدوام
    const businessHoursRecords = processedRecords.filter(record => record.isBusinessHours);

    if (isYearly) {
      setYearlyData(businessHoursRecords);
    } else {
      setWeeklyData(businessHoursRecords);
    }

    // دمج البيانات وحساب التحليلات
    const allRecords = isYearly ? businessHoursRecords : [...yearlyData, ...businessHoursRecords];
    setCallRecords(allRecords);
    calculateAnalytics(allRecords);
    calculateEmployeePerformance(allRecords);

    toast({
      title: "تم رفع البيانات بنجاح",
      description: `تم معالجة ${businessHoursRecords.length} مكالمة في أوقات الدوام من أصل ${processedRecords.length} مكالمة`,
    });
  };

  // حساب التحليلات العامة
  const calculateAnalytics = (records: CallRecord[]) => {
    const totalCalls = records.length;
    const answeredCalls = records.filter(r => r.status === 'Answered').length;
    const unansweredCalls = totalCalls - answeredCalls;
    const answerRate = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;
    
    const answeredRecords = records.filter(r => r.status === 'Answered' && r.responseTime > 0);
    const averageResponseTime = answeredRecords.length > 0 
      ? answeredRecords.reduce((sum, r) => sum + r.responseTime, 0) / answeredRecords.length 
      : 0;
    
    const totalTalkTime = records.reduce((sum, r) => sum + r.talkingDuration, 0);
    const businessHoursCalls = records.filter(r => r.isBusinessHours).length;
    const outsideHoursCalls = totalCalls - businessHoursCalls;

    setAnalytics({
      totalCalls,
      answeredCalls,
      unansweredCalls,
      answerRate,
      averageResponseTime,
      totalTalkTime,
      businessHoursCalls,
      outsideHoursCalls
    });
  };

  // حساب أداء الموظفين
  const calculateEmployeePerformance = (records: CallRecord[]) => {
    const employeeMap = new Map<string, EmployeePerformance>();

    records.forEach(record => {
      if (record.agentName === 'غير محدد') return;

      if (!employeeMap.has(record.agentName)) {
        employeeMap.set(record.agentName, {
          agentName: record.agentName,
          totalCalls: 0,
          answeredCalls: 0,
          averageResponseTime: 0,
          answerRate: 0,
          totalTalkTime: 0
        });
      }

      const employee = employeeMap.get(record.agentName)!;
      employee.totalCalls++;
      
      if (record.status === 'Answered') {
        employee.answeredCalls++;
        employee.totalTalkTime += record.talkingDuration;
      }
    });

    // حساب المعدلات النهائية
    const performance = Array.from(employeeMap.values()).map(emp => {
      const answeredRecords = records.filter(r => 
        r.agentName === emp.agentName && 
        r.status === 'Answered' && 
        r.responseTime > 0
      );
      
      const averageResponseTime = answeredRecords.length > 0
        ? answeredRecords.reduce((sum, r) => sum + r.responseTime, 0) / answeredRecords.length
        : 0;

      return {
        ...emp,
        answerRate: emp.totalCalls > 0 ? (emp.answeredCalls / emp.totalCalls) * 100 : 0,
        averageResponseTime
      };
    });

    performance.sort((a, b) => b.totalCalls - a.totalCalls);
    setEmployeePerformance(performance);
  };

  // رفع ملف Excel
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, isYearly: boolean = false) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls') && !fileName.endsWith('.csv')) {
      toast({
        title: "نوع ملف غير مدعوم",
        description: "يرجى رفع ملف Excel (.xlsx, .xls) أو CSV",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        if (jsonData.length === 0) {
          toast({
            title: "ملف فارغ",
            description: "الملف لا يحتوي على بيانات",
            variant: "destructive",
          });
          return;
        }

        processExcelData(jsonData, isYearly);
      } catch (error) {
        console.error('خطأ في قراءة الملف:', error);
        toast({
          title: "خطأ في قراءة الملف",
          description: "تأكد من صحة تنسيق الملف",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        // إعادة تعيين input
        event.target.value = '';
      }
    };

    reader.readAsArrayBuffer(file);
  };

  // تصدير البيانات
  const exportData = () => {
    const exportData = callRecords.map((record, index) => ({
      'ت': index + 1,
      'وقت المكالمة': record.callTime,
      'من': record.from,
      'إلى': record.to,
      'الاتجاه': record.direction === 'Inbound' ? 'واردة' : 'صادرة',
      'الحالة': record.status === 'Answered' ? 'تم الرد' : 'لم يتم الرد',
      'وقت الرنين (ثانية)': record.ringingDuration,
      'وقت المحادثة (ثانية)': record.talkingDuration,
      'اسم الموظف': record.agentName,
      'في وقت الدوام': record.isBusinessHours ? 'نعم' : 'لا'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'بيانات المكالمات');
    XLSX.writeFile(wb, `3CX-call-data-${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // حذف البيانات الأسبوعية
  const clearWeeklyData = () => {
    if (window.confirm('هل أنت متأكد من حذف جميع البيانات الأسبوعية؟ هذا الإجراء لا يمكن التراجع عنه.')) {
      setWeeklyData([]);
      
      // إعادة حساب البيانات مع السنوية فقط
      const allRecords = yearlyData;
      setCallRecords(allRecords);
      calculateAnalytics(allRecords);
      calculateEmployeePerformance(allRecords);

      toast({
        title: "تم حذف البيانات الأسبوعية",
        description: "تم حذف جميع البيانات الأسبوعية بنجاح",
      });
    }
  };

  // تنسيق الوقت
  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}س ${minutes}د ${secs}ث`;
    } else if (minutes > 0) {
      return `${minutes}د ${secs}ث`;
    } else {
      return `${secs}ث`;
    }
  };

  // بيانات المخططات
  const chartColors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  const answerRateData = employeePerformance.map(emp => ({
    name: emp.agentName.length > 10 ? emp.agentName.substring(0, 10) + '...' : emp.agentName,
    fullName: emp.agentName,
    answerRate: Math.round(emp.answerRate),
    totalCalls: emp.totalCalls
  }));

  const responseTimeData = employeePerformance
    .filter(emp => emp.averageResponseTime > 0)
    .map(emp => ({
      name: emp.agentName.length > 10 ? emp.agentName.substring(0, 10) + '...' : emp.agentName,
      fullName: emp.agentName,
      responseTime: Math.round(emp.averageResponseTime)
    }));

  return (
    <Layout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">تحليل بيانات مكالمات 3CX</h1>
            <p className="text-muted-foreground">
              تحليل شامل لأداء المكالمات ومعدلات الرد
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={exportData} disabled={callRecords.length === 0}>
              <Download className="w-4 h-4 ml-2" />
              تصدير البيانات
            </Button>
            <Button 
              onClick={clearWeeklyData} 
              disabled={weeklyData.length === 0}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف البيانات الأسبوعية
            </Button>
          </div>
        </div>

        {/* رفع الملفات */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                رفع البيانات السنوية
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                رفع ملف Excel واحد يحتوي على البيانات السنوية (يتم رفعه مرة واحدة)
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="yearly-file">اختر ملف Excel السنوي</Label>
                <Input
                  id="yearly-file"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => handleFileUpload(e, true)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {yearlyData.length > 0 && `تم تحميل ${yearlyData.length} مكالمة سنوية`}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                رفع البيانات الأسبوعية
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                رفع ملف Excel أسبوعي جديد (يدمج تلقائياً مع البيانات السنوية)
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="weekly-file">اختر ملف Excel الأسبوعي</Label>
                <Input
                  id="weekly-file"
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => handleFileUpload(e, false)}
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  {weeklyData.length > 0 && `تم تحميل ${weeklyData.length} مكالمة أسبوعية`}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* إحصائيات عامة */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">إجمالي المكالمات</p>
                    <p className="text-2xl font-bold">{analytics.totalCalls}</p>
                  </div>
                  <Phone className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">معدل الرد</p>
                    <p className="text-2xl font-bold">{analytics.answerRate.toFixed(1)}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">متوسط وقت الرد</p>
                    <p className="text-2xl font-bold">{Math.round(analytics.averageResponseTime)}ث</p>
                  </div>
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">إجمالي وقت المحادثة</p>
                    <p className="text-2xl font-bold">{formatDuration(analytics.totalTalkTime)}</p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="performance" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="performance">أداء الموظفين</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
            <TabsTrigger value="data">البيانات</TabsTrigger>
          </TabsList>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              {/* مخطط معدل الرد */}
              <Card>
                <CardHeader>
                  <CardTitle>معدل الرد لكل موظف</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={answerRateData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          name === 'answerRate' ? `${value}%` : value,
                          name === 'answerRate' ? 'معدل الرد' : 'إجمالي المكالمات'
                        ]}
                        labelFormatter={(label) => {
                          const item = answerRateData.find(d => d.name === label);
                          return item ? item.fullName : label;
                        }}
                      />
                      <Bar dataKey="answerRate" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* مخطط وقت الرد */}
              <Card>
                <CardHeader>
                  <CardTitle>متوسط وقت الرد (بالثواني)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={responseTimeData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} ثانية`, 'وقت الرد']}
                        labelFormatter={(label) => {
                          const item = responseTimeData.find(d => d.name === label);
                          return item ? item.fullName : label;
                        }}
                      />
                      <Bar dataKey="responseTime" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* جدول أداء الموظفين */}
            <Card>
              <CardHeader>
                <CardTitle>تفاصيل أداء الموظفين</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>اسم الموظف</TableHead>
                      <TableHead>إجمالي المكالمات</TableHead>
                      <TableHead>المكالمات المجابة</TableHead>
                      <TableHead>معدل الرد</TableHead>
                      <TableHead>متوسط وقت الرد</TableHead>
                      <TableHead>إجمالي وقت المحادثة</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {employeePerformance.map((emp) => (
                      <TableRow key={emp.agentName}>
                        <TableCell className="font-medium">{emp.agentName}</TableCell>
                        <TableCell>{emp.totalCalls}</TableCell>
                        <TableCell>{emp.answeredCalls}</TableCell>
                        <TableCell>
                          <Badge variant={emp.answerRate >= 80 ? "default" : "secondary"}>
                            {emp.answerRate.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={emp.averageResponseTime <= 10 ? "default" : "secondary"}>
                            {Math.round(emp.averageResponseTime)}ث
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDuration(emp.totalTalkTime)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            {analytics && (
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>توزيع حالة المكالمات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'تم الرد', value: analytics.answeredCalls },
                            { name: 'لم يتم الرد', value: analytics.unansweredCalls }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill="#8884d8" />
                          <Cell fill="#82ca9d" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>المؤشرات الرئيسية</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>الهدف: معدل رد 80%</span>
                      <Badge variant={analytics.answerRate >= 80 ? "default" : "destructive"}>
                        {analytics.answerRate >= 80 ? "تم تحقيقه" : "لم يتحقق"}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>الهدف: وقت رد أقل من 3 ثواني</span>
                      <Badge variant={analytics.averageResponseTime <= 3 ? "default" : "destructive"}>
                        {analytics.averageResponseTime <= 3 ? "تم تحقيقه" : "لم يتحقق"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p>مكالمات وقت الدوام: {analytics.businessHoursCalls}</p>
                      <p>مكالمات خارج الدوام: {analytics.outsideHoursCalls}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>سجلات المكالمات</CardTitle>
                <p className="text-sm text-muted-foreground">
                  عرض المكالمات في أوقات الدوام الرسمي فقط
                </p>
              </CardHeader>
              <CardContent>
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>وقت المكالمة</TableHead>
                        <TableHead>من</TableHead>
                        <TableHead>إلى</TableHead>
                        <TableHead>الاتجاه</TableHead>
                        <TableHead>الحالة</TableHead>
                        <TableHead>وقت الرد</TableHead>
                        <TableHead>وقت المحادثة</TableHead>
                        <TableHead>الموظف</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {callRecords.slice(0, 100).map((record) => (
                        <TableRow key={record.id}>
                          <TableCell className="text-xs">
                            {new Date(record.callTime).toLocaleString('ar-SA')}
                          </TableCell>
                          <TableCell className="text-xs">{record.from}</TableCell>
                          <TableCell className="text-xs">{record.to}</TableCell>
                          <TableCell>
                            <Badge variant={record.direction === 'Inbound' ? "default" : "secondary"}>
                              {record.direction === 'Inbound' ? 'واردة' : 'صادرة'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={record.status === 'Answered' ? "default" : "destructive"}>
                              {record.status === 'Answered' ? 'تم الرد' : 'لم يتم الرد'}
                            </Badge>
                          </TableCell>
                          <TableCell>{record.responseTime}ث</TableCell>
                          <TableCell>{formatDuration(record.talkingDuration)}</TableCell>
                          <TableCell className="text-xs">{record.agentName}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {callRecords.length > 100 && (
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      عرض أول 100 سجل من أصل {callRecords.length} سجل
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
