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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisData, setAnalysisData] = useState<{
    summary: string;
    keyPoints: AnalysisPoint[];
    recommendations: Recommendation[];
    roadmap: { phase: string; items: string[]; duration: string }[];
  } | null>(null);

  const mockAnalysis = {
    summary: "بناءً على تحليل البيانات الشامل لجميع أقسام المنصة، تبين وجود نقاط قوة واضحة في بعض المجالات مع ضرورة التركيز على تحسين عدة جوانب أساسية. النتائج العامة تشير إلى أداء متوسط يتطلب خطة تطوير استراتيجية.",
    keyPoints: [
      {
        icon: <TrendingDown className="h-5 w-5" />,
        title: "نسبة الترشيح للعملاء الجدد",
        description: "النسبة الحالية 0% مقارنة بالهدف 65% - يتطلب تحسين فوري في استراتيجية جذب العملاء الجدد",
        status: "critical" as const,
        percentage: 0
      },
      {
        icon: <TrendingDown className="h-5 w-5" />,
        title: "نسبة الترشيح بعد السنة",
        description: "0% مقابل الهدف المطلوب 65% - ضرورة تطوير برامج الولاء والمتابعة طويلة المدى",
        status: "critical" as const,
        percentage: 0
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        title: "نسبة الترشيح للعملاء الحاليين", 
        description: "13.66% من الهدف 30% - تحتاج تحسين في خدمة العملاء الحاليين",
        status: "warning" as const,
        percentage: 45.5
      },
      {
        icon: <CheckCircle className="h-5 w-5" />,
        title: "جودة التسليم",
        description: "93% من الهدف 100% - أداء جيد مع مجال للتحسين",
        status: "good" as const,
        percentage: 93
      },
      {
        icon: <TrendingUp className="h-5 w-5" />,
        title: "معدل الرد على المكالمات",
        description: "92% متجاوز للهدف 80% - أداء ممتاز في سرعة الاستجابة",
        status: "good" as const,
        percentage: 115
      },
      {
        icon: <AlertTriangle className="h-5 w-5" />,
        title: "وقت الاستجابة",
        description: "12 ثانية مقابل الهدف 3 ثواني - يحتاج تحسين عاجل",
        status: "warning" as const
      }
    ],
    recommendations: [
      {
        icon: <Users className="h-5 w-5" />,
        title: "تطوير استراتيجية جذب العملاء",
        description: "إطلاق حملات تسويقية مستهدفة وتحسين تجربة العميل الجديد",
        priority: "high" as const,
        timeline: "شهر واحد"
      },
      {
        icon: <MessageSquare className="h-5 w-5" />,
        title: "برنامج الولاء وخدمة ما بعد البيع",
        description: "إنشاء نظام متابعة دوري مع العملاء وتقديم خدمات حصرية",
        priority: "high" as const,
        timeline: "6 أسابيع"
      },
      {
        icon: <Phone className="h-5 w-5" />,
        title: "تحسين نظام الاستجابة",
        description: "تدريب الفريق وتحديث أنظمة الاتصال لتقليل وقت الانتظار",
        priority: "medium" as const,
        timeline: "3 أسابيع"
      },
      {
        icon: <BarChart3 className="h-5 w-5" />,
        title: "نظام متابعة شامل",
        description: "تطبيق مقاييس أداء واضحة ونظام تقارير دوري",
        priority: "medium" as const,
        timeline: "شهرين"
      },
      {
        icon: <Target className="h-5 w-5" />,
        title: "تحسين جودة التسليم",
        description: "مراجعة عمليات التسليم وتطبيق معايير جودة أعلى",
        priority: "low" as const,
        timeline: "6 أسابيع"
      }
    ],
    roadmap: [
      {
        phase: "المرحلة الأولى - التحسين العاجل",
        items: [
          "تطوير استراتيجية جذب العملاء الجدد",
          "تحسين أوقات الاستجابة على المكالمات",
          "تدريب الفريق على خدمة العملاء"
        ],
        duration: "1-2 شهر"
      },
      {
        phase: "المرحلة الثانية - بناء الولاء",
        items: [
          "إطلاق برنامج ولاء العملاء",
          "تطوير نظام المتابعة طويل المدى",
          "تحسين عمليات ما بعد البيع"
        ],
        duration: "2-4 أشهر"
      },
      {
        phase: "المرحلة الثالثة - التطوير المستمر",
        items: [
          "تطبيق نظام مقاييس الأداء الشامل",
          "تحسين جودة التسليم للوصول للهدف 100%",
          "تطوير خدمات إضافية للعملاء"
        ],
        duration: "4-6 أشهر"
      }
    ]
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    // محاكاة عملية التحليل
    setTimeout(() => {
      setAnalysisData(mockAnalysis);
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
    <div className="min-h-screen bg-background p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Brain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">التحليل الذكي AI</h1>
            <p className="text-muted-foreground">
              تحليل شامل لأداء المنصة باستخدام الذكاء الاصطناعي
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
                النقاط الرئيسية والمؤشرات
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
              مع توصيات محددة لتحسين الخدمات
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
            <h3 className="text-lg font-medium mb-2">جاري تحليل البيانات</h3>
            <p className="text-muted-foreground text-center max-w-md">
              يتم الآن تحليل جميع البيانات من أقسام المنصة المختلفة لتقديم تقرير شامل ومفصل...
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}