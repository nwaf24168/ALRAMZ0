
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  MessageSquare,
  Loader2,
  BarChart3,
  Users,
  Phone,
  Wrench,
  Home
} from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useMetrics } from "@/context/MetricsContext";
import { DataService } from "@/lib/dataService";
import { useNotification } from "@/context/NotificationContext";

interface AnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  priority_actions: string[];
  overall_score: number;
}

export default function SmartAnalysis() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const { 
    metrics, 
    customerServiceData, 
    maintenanceSatisfaction,
    currentPeriod 
  } = useMetrics();
  
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [receptionData, setReceptionData] = useState<any[]>([]);

  // تحميل البيانات الإضافية
  useEffect(() => {
    loadAdditionalData();
  }, []);

  const loadAdditionalData = async () => {
    try {
      const [complaintsData, receptionRecords] = await Promise.all([
        DataService.getComplaints(),
        DataService.getReceptionRecords()
      ]);
      setComplaints(complaintsData);
      setReceptionData(receptionRecords);
    } catch (error) {
      console.error("خطأ في تحميل البيانات الإضافية:", error);
    }
  };

  const generateAnalysis = async () => {
    setLoading(true);
    try {
      // تجميع البيانات
      const allData = {
        metrics,
        customerService: customerServiceData,
        satisfaction: maintenanceSatisfaction,
        complaints,
        reception: receptionData,
        period: currentPeriod
      };

      // إنشاء النص للتحليل
      const analysisPrompt = createAnalysisPrompt(allData);
      
      // استدعاء API للتحليل (يمكن استخدام Ollama أو أي نموذج مفتوح المصدر)
      const result = await analyzeWithAI(analysisPrompt);
      setAnalysisResult(result);
      
      addNotification({
        title: "تم التحليل",
        message: "تم إنتاج التحليل الذكي بنجاح",
        type: "success"
      });
    } catch (error) {
      console.error("خطأ في التحليل:", error);
      addNotification({
        title: "خطأ في التحليل",
        message: "حدث خطأ أثناء إنتاج التحليل الذكي",
        type: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const createAnalysisPrompt = (data: any) => {
    return `
أنت محلل أعمال خبير متخصص في إدارة راحة العملاء. قم بتحليل البيانات التالية وأعطني تقرير شامل باللهجة السعودية:

البيانات:
- المؤشرات الرئيسية: ${JSON.stringify(data.metrics)}
- خدمة العملاء: ${JSON.stringify(data.customerService)}
- رضا العملاء: ${JSON.stringify(data.satisfaction)}
- الشكاوى: ${data.complaints.length} شكوى
- سجلات الاستقبال: ${data.reception.length} سجل

المطلوب:
1. ملخص الوضع العام
2. نقاط القوة
3. نقاط الضعف
4. التوصيات التفصيلية
5. الإجراءات ذات الأولوية
6. درجة تقييم شاملة من 100

اكتب بلهجة سعودية طبيعية وودية.
`;
  };

  const analyzeWithAI = async (prompt: string): Promise<AnalysisResult> => {
    // محاكاة استدعاء AI - يمكن ربطه بـ Ollama أو أي نموذج آخر
    // في البيئة الحقيقية، ستحتاج لاستدعاء API للنموذج
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          summary: "الوضع العام للشركة كويس بس يحتاج شوية تحسين. نسبة الترشيح ضعيفة شوي والرد على المكالمات محتاج تطوير.",
          strengths: [
            "معدل الرد على المكالمات 92% وهذا ممتاز",
            "جودة التسليم 93% تعتبر جيدة جداً",
            "رضا العملاء عن جودة الخدمة عالي (191 راضي جداً)",
            "فريق العمل متفاعل مع الشكاوى"
          ],
          weaknesses: [
            "نسبة الترشيح للعملاء الجدد 0% وهذا يحتاج تدخل فوري",
            "وقت الرد على المكالمات 12 ثانية وهو أعلى من المطلوب",
            "جودة الصيانة 75.9% تحتاج تحسين",
            "في شكاوى كثيرة تحتاج متابعة أكثر"
          ],
          recommendations: [
            "اعملوا برنامج تحفيزي للعملاء عشان يرشحوا الشركة لأصحابهم",
            "دربوا فريق خدمة العملاء على الرد السريع",
            "راجعوا عمليات الصيانة وحسنوا الجودة",
            "اعملوا نظام متابعة أفضل للشكاوى",
            "استخدموا التقنية أكثر لتسريع الردود"
          ],
          priority_actions: [
            "حل مشكلة نسبة الترشيح فوراً - هذا أولوية قصوى",
            "تقليل وقت الرد إلى أقل من 5 ثواني",
            "مراجعة عمليات الصيانة وتحسينها",
            "إنشاء نظام تتبع أفضل للشكاوى"
          ],
          overall_score: 72
        });
      }, 3000);
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 80) return <CheckCircle2 className="w-5 h-5 text-green-400" />;
    if (score >= 60) return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
    return <TrendingDown className="w-5 h-5 text-red-400" />;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
              <Brain className="w-8 h-8 text-blue-400" />
              التحليل الذكي
            </h1>
            <p className="text-gray-400 mt-2">
              تحليل شامل للأداء باستخدام الذكاء الاصطناعي
            </p>
          </div>
          <Button
            onClick={generateAnalysis}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                جاري التحليل...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                بدء التحليل
              </>
            )}
          </Button>
        </div>

        {/* Data Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-[#1a1c23] border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="text-gray-400 text-sm">المؤشرات</p>
                  <p className="text-white font-bold">{metrics.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1c23] border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Phone className="w-8 h-8 text-green-400" />
                <div>
                  <p className="text-gray-400 text-sm">المكالمات</p>
                  <p className="text-white font-bold">{customerServiceData.calls.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1c23] border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-orange-400" />
                <div>
                  <p className="text-gray-400 text-sm">الشكاوى</p>
                  <p className="text-white font-bold">{complaints.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-[#1a1c23] border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-400" />
                <div>
                  <p className="text-gray-400 text-sm">الاستقبال</p>
                  <p className="text-white font-bold">{receptionData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="space-y-6">
            {/* Overall Score */}
            <Card className="bg-[#1a1c23] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  {getScoreIcon(analysisResult.overall_score)}
                  التقييم الشامل
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className={`text-4xl font-bold ${getScoreColor(analysisResult.overall_score)}`}>
                    {analysisResult.overall_score}/100
                  </div>
                  <div className="text-gray-300">
                    {analysisResult.summary}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-[#1a1c23] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    نقاط القوة
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisResult.strengths.map((strength, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                      <TrendingUp className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{strength}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-[#1a1c23] border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                    نقاط الضعف
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analysisResult.weaknesses.map((weakness, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                      <TrendingDown className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-300 text-sm">{weakness}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Recommendations */}
            <Card className="bg-[#1a1c23] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <Brain className="w-5 h-5 text-blue-400" />
                  التوصيات التفصيلية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysisResult.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-300">{recommendation}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Priority Actions */}
            <Card className="bg-[#1a1c23] border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                  الإجراءات ذات الأولوية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analysisResult.priority_actions.map((action, index) => (
                  <div key={index} className="flex items-start gap-3 p-4 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <Badge variant="destructive" className="flex-shrink-0">
                      عاجل
                    </Badge>
                    <span className="text-gray-300">{action}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Empty State */}
        {!analysisResult && !loading && (
          <Card className="bg-[#1a1c23] border-gray-800">
            <CardContent className="py-12 text-center">
              <Brain className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-400 mb-2">
                مرحباً بك في التحليل الذكي
              </h3>
              <p className="text-gray-500 mb-6 max-w-md mx-auto">
                اضغط على زر "بدء التحليل" للحصول على تحليل شامل وذكي لجميع بيانات المنصة
              </p>
              <Button
                onClick={generateAnalysis}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Brain className="w-4 h-4 mr-2" />
                بدء التحليل الأول
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
