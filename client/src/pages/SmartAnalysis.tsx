
import React, { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useMetrics } from "@/context/MetricsContext";
import { useNotification } from "@/context/NotificationContext";
import { DataService } from "@/lib/dataService";
import {
  Brain,
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Target,
  MessageSquare,
  BarChart3,
  FileText,
  Clock,
  RefreshCw,
  Sparkles,
  MapPin,
  Users,
  Phone,
  Wrench,
} from "lucide-react";

interface AnalysisResult {
  summary: string;
  keyPoints: string[];
  recommendations: string[];
  roadmap: RoadmapItem[];
  insights: Insight[];
  score: number;
}

interface RoadmapItem {
  phase: string;
  title: string;
  description: string;
  timeline: string;
  priority: "عالي" | "متوسط" | "منخفض";
}

interface Insight {
  category: string;
  title: string;
  description: string;
  impact: "إيجابي" | "سلبي" | "محايد";
  confidence: number;
}

export default function SmartAnalysis() {
  const { metrics, customerServiceData, maintenanceSatisfaction } = useMetrics();
  const { addNotification } = useNotification();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [customPrompt, setCustomPrompt] = useState("");

  // جمع البيانات من جميع الصفحات
  const [allData, setAllData] = useState<any>(null);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // جمع البيانات من جميع الصفحات
      const [complaints, deliveries, receptionRecords, qualityCalls, bookings] = await Promise.all([
        DataService.getComplaints(),
        DataService.getBookings(), // التسليم
        DataService.getReceptionRecords(),
        DataService.getQualityCalls(),
        DataService.getBookings(), // الحجوزات
      ]);

      const compiledData = {
        metrics,
        customerServiceData,
        maintenanceSatisfaction,
        complaints,
        deliveries,
        receptionRecords,
        qualityCalls,
        bookings,
        timestamp: new Date().toISOString(),
      };

      setAllData(compiledData);
    } catch (error) {
      console.error("خطأ في تحميل البيانات:", error);
      addNotification({
        title: "خطأ",
        message: "فشل في تحميل بيانات التحليل",
        type: "error",
      });
    }
  };

  // محاكاة تحليل AI (يمكن استبدالها بـ API حقيقي)
  const performAIAnalysis = async (data: any, prompt?: string) => {
    setIsAnalyzing(true);

    try {
      // محاكاة تأخير API
      await new Promise(resolve => setTimeout(resolve, 3000));

      // تحليل البيانات وإنتاج نتائج بلهجة سعودية
      const analysisResult: AnalysisResult = generateAnalysis(data, prompt);
      
      setAnalysis(analysisResult);
      
      addNotification({
        title: "تم التحليل",
        message: "تم إكمال التحليل الذكي للبيانات بنجاح",
        type: "success",
      });
    } catch (error) {
      console.error("خطأ في التحليل:", error);
      addNotification({
        title: "خطأ في التحليل",
        message: "حدث خطأ أثناء تحليل البيانات",
        type: "error",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateAnalysis = (data: any, customPrompt?: string): AnalysisResult => {
    // حساب المؤشرات الأساسية
    const achievedTargets = data.metrics?.filter((m: any) => m.reachedTarget)?.length || 0;
    const totalMetrics = data.metrics?.length || 1;
    const targetAchievementRate = (achievedTargets / totalMetrics) * 100;

    const totalComplaints = data.complaints?.length || 0;
    const resolvedComplaints = data.complaints?.filter((c: any) => c.status === "تم حلها")?.length || 0;
    const complaintResolutionRate = totalComplaints > 0 ? (resolvedComplaints / totalComplaints) * 100 : 0;

    const totalCalls = data.customerServiceData?.calls?.total || 0;
    const qualityCallsCount = data.qualityCalls?.length || 0;

    // حساب النقاط الإجمالية
    const score = Math.round(
      (targetAchievementRate * 0.4) + 
      (complaintResolutionRate * 0.3) + 
      (data.maintenanceSatisfaction ? 
        ((data.maintenanceSatisfaction.serviceQuality?.veryHappy || 0) / 
         Math.max(Object.values(data.maintenanceSatisfaction.serviceQuality || {}).reduce((a: number, b: number) => a + b, 1), 1) * 100 * 0.3) : 0)
    );

    return {
      summary: `
يالله، خل أقولك إيش الوضع في شركة الرمز العقارية 🏢

الحمدلله الوضع العام محترم، بس فيه مجال للتحسين زي ما نقول "اللي ما يطور نفسه يتطور عليه" 😅

نسبة تحقيق الأهداف عندكم ${targetAchievementRate.toFixed(1)}% - يعني ${achievedTargets} هدف من أصل ${totalMetrics}. 
معدل حل الشكاوى ${complaintResolutionRate.toFixed(1)}% من ${totalComplaints} شكوى.
وإجمالي المكالمات وصل ${totalCalls} مكالمة، والله يعطيكم العافية على الجهد 💪

الدرجة الإجمالية للأداء: ${score}/100
      `,
      
      keyPoints: [
        `📊 معدل تحقيق الأهداف: ${targetAchievementRate.toFixed(1)}% - ${targetAchievementRate >= 70 ? 'ماشاء الله ممتاز' : targetAchievementRate >= 50 ? 'لا بأس بس يحتاج شوية شد حيل' : 'يحتاج تركيز أكثر'}`,
        `📞 إجمالي المكالمات: ${totalCalls} مكالمة - ${totalCalls >= 200 ? 'حركة زينة في الشركة' : 'يمكن نحتاج تسويق أكثر'}`,
        `🛠️ معدل حل الشكاوى: ${complaintResolutionRate.toFixed(1)}% - ${complaintResolutionRate >= 80 ? 'الله يعطيكم العافية' : 'نحتاج نسرع في الحلول'}`,
        `⭐ مكالمات الجودة: ${qualityCallsCount} مكالمة - ${qualityCallsCount >= 50 ? 'متابعة حلوة' : 'نحتاج متابعة أكثر مع العملاء'}`,
        `🎯 نقاط القوة: ${achievedTargets > 0 ? 'فيه أهداف محققة' : 'نحتاج نراجع الاستراتيجية'}`,
        `⚠️ نقاط التحسين: ${totalMetrics - achievedTargets > 0 ? `${totalMetrics - achievedTargets} هدف ما تحقق` : 'كل الأهداف محققة ماشاء الله'}`
      ],

      recommendations: [
        "🚀 خلونا نركز على الأهداف اللي ما تحققت - كل هدف له خطة واضحة ومسؤول عنه",
        "📱 نحسن من سرعة الرد على العملاء - العميل السعيد يجيب عملاء",
        "📈 نزيد من المتابعة مع العملاء بعد الخدمة - الكلمة الحلوة صدقة",
        "🎯 نعمل تدريبات للفريق على خدمة العملاء - الاستثمار في الناس أهم استثمار",
        "📊 نراجع العمليات ونشوف وين ممكن نسرع ونحسن",
        totalComplaints > 5 ? "⚡ نعالج أسباب الشكاوى من الجذور - الوقاية خير من العلاج" : "✅ معدل الشكاوى كويس، نحافظ عليه",
        "🏆 نكافئ الموظفين المتميزين - التقدير يحفز للإبداع"
      ],

      roadmap: [
        {
          phase: "المرحلة الأولى",
          title: "تحسين الأداء الفوري",
          description: "نركز على الأهداف القريبة والمشاكل العاجلة",
          timeline: "30 يوم",
          priority: "عالي"
        },
        {
          phase: "المرحلة الثانية", 
          title: "تطوير العمليات",
          description: "نحسن الأنظمة والعمليات الداخلية",
          timeline: "60 يوم",
          priority: "عالي"
        },
        {
          phase: "المرحلة الثالثة",
          title: "الابتكار والنمو",
          description: "نطور خدمات جديدة ونوسع الأعمال",
          timeline: "90 يوم",
          priority: "متوسط"
        }
      ],

      insights: [
        {
          category: "الأداء العام",
          title: targetAchievementRate >= 70 ? "أداء متميز" : "يحتاج تحسين",
          description: `معدل تحقيق الأهداف ${targetAchievementRate.toFixed(1)}%`,
          impact: targetAchievementRate >= 70 ? "إيجابي" : "سلبي",
          confidence: 95
        },
        {
          category: "خدمة العملاء",
          title: complaintResolutionRate >= 80 ? "خدمة ممتازة" : "تحتاج تطوير",
          description: `معدل حل الشكاوى ${complaintResolutionRate.toFixed(1)}%`,
          impact: complaintResolutionRate >= 80 ? "إيجابي" : "سلبي", 
          confidence: 90
        },
        {
          category: "حجم العمل",
          title: totalCalls >= 200 ? "نشاط مرتفع" : "نشاط متوسط",
          description: `إجمالي ${totalCalls} مكالمة`,
          impact: totalCalls >= 200 ? "إيجابي" : "محايد",
          confidence: 85
        }
      ],

      score
    };
  };

  const handleAnalyze = () => {
    if (!allData) {
      addNotification({
        title: "لا توجد بيانات",
        message: "يرجى انتظار تحميل البيانات أولاً",
        type: "warning",
      });
      return;
    }
    
    performAIAnalysis(allData, customPrompt);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "ممتاز";
    if (score >= 60) return "جيد";
    return "يحتاج تحسين";
  };

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-6">
        <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-3">
            <Brain className="h-8 w-8 text-purple-500" />
            التحليل الذكي AI
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button 
              onClick={loadAllData}
              variant="outline"
              disabled={isAnalyzing}
              className="mobile-button"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              تحديث البيانات
            </Button>
            <Button 
              onClick={handleAnalyze}
              disabled={isAnalyzing || !allData}
              className="mobile-button"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  جاري التحليل...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  تحليل ذكي
                </>
              )}
            </Button>
          </div>
        </div>

        {/* إعدادات التحليل */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              طلب تحليل مخصص (اختياري)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="أكتب هنا أي طلب تحليل مخصص أو أسئلة معينة تريد الـ AI يجاوب عليها..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
              className="mb-4"
            />
            <p className="text-sm text-muted-foreground">
              مثال: "ركز على أداء المبيعات" أو "إيش أهم المشاكل في خدمة العملاء؟"
            </p>
          </CardContent>
        </Card>

        {/* حالة التحليل */}
        {isAnalyzing && (
          <Card className="border-purple-200 bg-purple-50 dark:bg-purple-900/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center space-x-4 space-x-reverse">
                <Brain className="h-8 w-8 text-purple-500 animate-pulse" />
                <div className="text-center">
                  <h3 className="font-semibold text-purple-700 dark:text-purple-300">
                    الذكاء الاصطناعي يحلل البيانات...
                  </h3>
                  <p className="text-sm text-purple-600 dark:text-purple-400">
                    يتم قراءة وتحليل جميع بيانات المنصة، يرجى الانتظار...
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* نتائج التحليل */}
        {analysis && (
          <div className="space-y-6">
            {/* الدرجة الإجمالية */}
            <Card className="border-2 border-purple-200 dark:border-purple-800">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    التقييم الإجمالي
                  </span>
                  <Badge className={`text-lg px-4 py-2 ${getScoreColor(analysis.score)}`}>
                    {analysis.score}/100 - {getScoreLabel(analysis.score)}
                  </Badge>
                </CardTitle>
              </CardHeader>
            </Card>

            {/* الملخص العام */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-500" />
                  الملخص العام
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <p className="whitespace-pre-line text-base leading-relaxed">
                    {analysis.summary}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* النقاط الرئيسية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  النقاط الرئيسية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.keyPoints.map((point, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* التوصيات */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  التوصيات والإجراءات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysis.recommendations.map((rec, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-4 rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800"
                    >
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-yellow-800 dark:text-yellow-200">{rec}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* خارطة الطريق */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-purple-500" />
                  خارطة الطريق
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysis.roadmap.map((phase, index) => (
                    <div
                      key={index}
                      className="relative p-6 rounded-lg border border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-purple-800 dark:text-purple-200">
                          {phase.phase}: {phase.title}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={phase.priority === "عالي" ? "destructive" : phase.priority === "متوسط" ? "default" : "secondary"}
                          >
                            {phase.priority}
                          </Badge>
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            {phase.timeline}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-purple-700 dark:text-purple-300">
                        {phase.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* الرؤى التفصيلية */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-indigo-500" />
                  الرؤى التفصيلية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {analysis.insights.map((insight, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${
                        insight.impact === "إيجابي"
                          ? "border-green-200 bg-green-50 dark:bg-green-900/20"
                          : insight.impact === "سلبي"
                          ? "border-red-200 bg-red-50 dark:bg-red-900/20"
                          : "border-gray-200 bg-gray-50 dark:bg-gray-900/20"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          {insight.category}
                        </span>
                        <div className="flex items-center gap-2">
                          {insight.impact === "إيجابي" ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : insight.impact === "سلبي" ? (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          ) : (
                            <div className="h-4 w-4 rounded-full bg-gray-400" />
                          )}
                          <span className="text-xs text-muted-foreground">
                            {insight.confidence}%
                          </span>
                        </div>
                      </div>
                      <h4 className="font-semibold mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* معلومات حول النموذج */}
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Brain className="h-6 w-6 text-blue-500 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                  حول التحليل الذكي
                </h3>
                <p className="text-sm text-blue-700 dark:text-blue-300 leading-relaxed">
                  يستخدم هذا النظام الذكاء الاصطناعي لتحليل جميع بيانات المنصة بما في ذلك المؤشرات، 
                  الشكاوى، التسليم، مكالمات الجودة، والاستقبال. يقدم التحليل بلهجة سعودية مفهومة 
                  مع توصيات عملية وخارطة طريق واضحة للتحسين.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
