
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  BarChart3,
  Users,
  MessageSquare,
  Package,
  Phone,
  Headphones,
  Activity,
  Lightbulb,
  MapPin
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/dataService";
import { useMetrics } from "@/context/MetricsContext";

interface AnalysisPoint {
  icon: React.ReactNode;
  title: string;
  description: string;
  status: "good" | "warning" | "critical";
  percentage?: number;
}

interface Recommendation {
  icon: React.ReactNode;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  timeline: string;
}

export default function SmartAnalysis() {
  const { user } = useAuth();
  const { metrics, customerServiceData } = useMetrics();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<{
    summary: string;
    keyPoints: AnalysisPoint[];
    recommendations: Recommendation[];
    roadmap: { phase: string; items: string[]; duration: string }[];
  } | null>(null);

  const [realData, setRealData] = useState({
    complaints: [],
    qualityCalls: [],
    receptionRecords: [],
    bookings: []
  });

  // جلب البيانات الحقيقية
  useEffect(() => {
    const fetchRealData = async () => {
      try {
        const [complaints, qualityCalls, receptionRecords, bookings] = await Promise.all([
          DataService.getComplaints(),
          DataService.getQualityCalls(),
          DataService.getReceptionRecords(),
          DataService.getBookings()
        ]);

        setRealData({
          complaints,
          qualityCalls,
          receptionRecords,
          bookings
        });
      } catch (error) {
        console.error('خطأ في جلب البيانات الحقيقية:', error);
      }
    };

    fetchRealData();
  }, []);

  // تحليل البيانات الحقيقية
  const analyzeRealData = () => {
    const analysis = {
      summary: "",
      keyPoints: [] as AnalysisPoint[],
      recommendations: [] as Recommendation[],
      roadmap: [] as { phase: string; items: string[]; duration: string }[]
    };

    // تحليل المؤشرات الحقيقية
    if (metrics && metrics.length > 0) {
      metrics.forEach((metric, index) => {
        let status: "good" | "warning" | "critical" = "good";
        let percentage = 0;

        // استخراج القيم الرقمية
        const currentValue = parseFloat(metric.value.replace('%', '')) || 0;
        const targetValue = parseFloat(metric.target.replace('%', '').replace(' ثواني', '')) || 100;

        if (metric.isLowerBetter) {
          percentage = targetValue > 0 ? Math.max(0, 100 - ((currentValue - targetValue) / targetValue * 100)) : 0;
          status = currentValue <= targetValue ? "good" : currentValue <= targetValue * 1.5 ? "warning" : "critical";
        } else {
          percentage = targetValue > 0 ? (currentValue / targetValue) * 100 : 0;
          status = percentage >= 90 ? "good" : percentage >= 60 ? "warning" : "critical";
        }

        let description = `القيمة الحالية ${metric.value} مقابل الهدف ${metric.target}`;
        
        if (status === "critical") {
          description += " - يتطلب تدخل عاجل";
        } else if (status === "warning") {
          description += " - يحتاج تحسين";
        } else {
          description += " - أداء جيد";
        }

        analysis.keyPoints.push({
          icon: status === "good" ? <CheckCircle className="h-5 w-5" /> : 
                status === "warning" ? <AlertTriangle className="h-5 w-5" /> : 
                <TrendingDown className="h-5 w-5" />,
          title: metric.title,
          description,
          status,
          percentage: Math.round(percentage)
        });
      });
    }

    // تحليل الشكاوى
    const totalComplaints = realData.complaints.length;
    const openComplaints = realData.complaints.filter(c => c.status !== 'مغلقة').length;
    const avgResolutionTime = realData.complaints.length > 0 
      ? realData.complaints.reduce((sum, c) => sum + (c.duration || 0), 0) / realData.complaints.length 
      : 0;

    if (totalComplaints > 0) {
      analysis.keyPoints.push({
        icon: openComplaints > totalComplaints * 0.3 ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle className="h-5 w-5" />,
        title: "إدارة الشكاوى",
        description: `إجمالي الشكاوى: ${totalComplaints}، المفتوحة: ${openComplaints}، متوسط وقت الحل: ${avgResolutionTime.toFixed(1)} يوم`,
        status: openComplaints > totalComplaints * 0.3 ? "warning" : "good"
      });
    }

    // تحليل مكالمات الجودة
    const totalQualityCalls = realData.qualityCalls.length;
    const qualifiedCalls = realData.qualityCalls.filter(c => c.qualification_status === 'مؤهل').length;
    const qualificationRate = totalQualityCalls > 0 ? (qualifiedCalls / totalQualityCalls) * 100 : 0;

    if (totalQualityCalls > 0) {
      analysis.keyPoints.push({
        icon: qualificationRate >= 70 ? <CheckCircle className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />,
        title: "جودة المكالمات",
        description: `إجمالي المكالمات: ${totalQualityCalls}، نسبة التأهيل: ${qualificationRate.toFixed(1)}%`,
        status: qualificationRate >= 70 ? "good" : "warning",
        percentage: Math.round(qualificationRate)
      });
    }

    // إنشاء الملخص
    const criticalIssues = analysis.keyPoints.filter(p => p.status === "critical").length;
    const warningIssues = analysis.keyPoints.filter(p => p.status === "warning").length;
    const goodMetrics = analysis.keyPoints.filter(p => p.status === "good").length;

    analysis.summary = `بناءً على تحليل البيانات الفعلية للمنصة، تبين وجود ${criticalIssues} نقاط تحتاج تدخل عاجل، و${warningIssues} نقاط تحتاج تحسين، بينما ${goodMetrics} مؤشر يظهر أداءً جيداً. إجمالي الشكاوى المسجلة ${totalComplaints} شكوى، ومكالمات الجودة ${totalQualityCalls} مكالمة. النظام يحتاج خطة تحسين شاملة للوصول للأهداف المطلوبة.`;

    // التوصيات بناءً على البيانات الحقيقية
    if (criticalIssues > 0) {
      analysis.recommendations.push({
        icon: <AlertTriangle className="h-5 w-5" />,
        title: "معالجة النقاط الحرجة فوراً",
        description: `هناك ${criticalIssues} مؤشر في الوضع الحرج يتطلب تدخل عاجل لتجنب تدهور الخدمة`,
        priority: "high",
        timeline: "أسبوع واحد"
      });
    }

    if (openComplaints > 5) {
      analysis.recommendations.push({
        icon: <MessageSquare className="h-5 w-5" />,
        title: "تسريع حل الشكاوى المفتوحة",
        description: `يوجد ${openComplaints} شكوى مفتوحة تحتاج متابعة وحل سريع`,
        priority: "high",
        timeline: "أسبوعين"
      });
    }

    if (qualificationRate < 70 && totalQualityCalls > 0) {
      analysis.recommendations.push({
        icon: <Phone className="h-5 w-5" />,
        title: "تحسين جودة المكالمات",
        description: `نسبة التأهيل الحالية ${qualificationRate.toFixed(1)}% تحتاج تحسين لتصل 80%`,
        priority: "medium",
        timeline: "شهر واحد"
      });
    }

    if (warningIssues > 0) {
      analysis.recommendations.push({
        icon: <BarChart3 className="h-5 w-5" />,
        title: "تطوير المؤشرات التحذيرية",
        description: `${warningIssues} مؤشر في المنطقة التحذيرية يحتاج خطة تحسين`,
        priority: "medium",
        timeline: "6 أسابيع"
      });
    }

    // خارطة الطريق
    analysis.roadmap = [
      {
        phase: "المرحلة الأولى - التدخل العاجل",
        items: [
          criticalIssues > 0 ? `معالجة ${criticalIssues} مؤشر حرج` : "مراجعة المؤشرات الحالية",
          openComplaints > 0 ? `حل ${openComplaints} شكوى مفتوحة` : "تطوير نظام الشكاوى",
          "تحسين أوقات الاستجابة"
        ],
        duration: "1-2 أسبوع"
      },
      {
        phase: "المرحلة الثانية - التحسين المستمر",
        items: [
          "رفع نسبة التأهيل في مكالمات الجودة",
          `تحسين ${warningIssues} مؤشر في المنطقة التحذيرية`,
          "تطوير خدمة العملاء"
        ],
        duration: "1-2 شهر"
      },
      {
        phase: "المرحلة الثالثة - التطوير الاستراتيجي",
        items: [
          "الوصول لجميع الأهداف المحددة",
          "تطبيق نظام مراقبة مستمر",
          "تطوير خدمات إضافية"
        ],
        duration: "2-4 أشهر"
      }
    ];

    return analysis;
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // محاكاة وقت التحليل
    setTimeout(() => {
      const analysis = analyzeRealData();
      setAnalysisData(analysis);
      setIsAnalyzing(false);
    }, 3000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "warning":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "critical":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">التحليل الذكي AI</h1>
            <p className="text-muted-foreground">
              تحليل شامل لأداء المنصة باستخدام البيانات الحقيقية
            </p>
          </div>
        </div>
        <Button 
          onClick={handleAnalyze}
          disabled={isAnalyzing}
          className="w-full md:w-auto"
          size="lg"
        >
          {isAnalyzing ? (
            <>
              <Activity className="mr-2 h-4 w-4 animate-spin" />
              جاري التحليل...
            </>
          ) : (
            <>
              <Brain className="mr-2 h-4 w-4" />
              بدء التحليل الشامل
            </>
          )}
        </Button>
      </div>

      {/* Data Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{realData.complaints.length}</div>
              <div className="text-sm text-muted-foreground">الشكاوى</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{realData.qualityCalls.length}</div>
              <div className="text-sm text-muted-foreground">مكالمات الجودة</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{realData.receptionRecords.length}</div>
              <div className="text-sm text-muted-foreground">سجلات الاستقبال</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{realData.bookings.length}</div>
              <div className="text-sm text-muted-foreground">الحجوزات</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Results */}
      {analysisData && (
        <div className="space-y-6">
          {/* Summary */}
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                ملخص التحليل العام
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {analysisData.summary}
              </p>
            </CardContent>
          </Card>

          {/* Key Points */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                النقاط الرئيسية والمؤشرات الفعلية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {analysisData.keyPoints.map((point, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-lg border ${getStatusColor(point.status)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {point.icon}
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className="font-medium">{point.title}</h3>
                        <p className="text-sm opacity-80">{point.description}</p>
                        {point.percentage !== undefined && (
                          <div className="text-xs font-medium">
                            النسبة: {point.percentage}%
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                التوصيات والإجراءات المطلوبة
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysisData.recommendations.map((rec, index) => (
                  <div key={index} className="p-4 rounded-lg bg-card border">
                    <div className="flex items-start gap-3">
                      <div className="mt-1 text-primary">
                        {rec.icon}
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{rec.title}</h3>
                          <Badge className={getPriorityColor(rec.priority)}>
                            {rec.priority === "high" ? "عاجل" : rec.priority === "medium" ? "متوسط" : "منخفض"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                        <div className="text-xs bg-muted px-2 py-1 rounded inline-block">
                          المدة المقترحة: {rec.timeline}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Roadmap */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                خارطة الطريق للتحسين
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {analysisData.roadmap.map((phase, index) => (
                  <div key={index} className="relative">
                    {index < analysisData.roadmap.length - 1 && (
                      <div className="absolute right-4 top-12 w-0.5 h-full bg-border" />
                    )}
                    <div className="flex gap-4">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                          <h3 className="font-medium">{phase.phase}</h3>
                          <Badge variant="outline">{phase.duration}</Badge>
                        </div>
                        <ul className="space-y-2">
                          {phase.items.map((item, itemIndex) => (
                            <li key={itemIndex} className="flex items-center gap-2 text-sm text-muted-foreground">
                              <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Initial State */}
      {!analysisData && !isAnalyzing && (
        <Card className="border-dashed border-2 border-muted">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Brain className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">مرحباً بك في التحليل الذكي</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              اضغط على "بدء التحليل الشامل" للحصول على تقرير مفصل حول أداء جميع أقسام المنصة
              باستخدام البيانات الحقيقية من قاعدة البيانات
            </p>
            <Button onClick={handleAnalyze} size="lg">
              <Brain className="mr-2 h-4 w-4" />
              بدء التحليل الآن
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mb-4" />
            <h3 className="text-lg font-medium mb-2">جاري تحليل البيانات الحقيقية</h3>
            <p className="text-muted-foreground text-center max-w-md">
              يتم الآن تحليل البيانات الفعلية من قاعدة البيانات: {realData.complaints.length} شكوى، 
              {realData.qualityCalls.length} مكالمة جودة، {realData.receptionRecords.length} سجل استقبال، 
              {realData.bookings.length} حجز...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
