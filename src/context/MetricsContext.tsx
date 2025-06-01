
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from "@/components/ui/use-toast";
import { DataService } from '@/lib/dataService';

// تعريف أنواع البيانات
export interface MetricData {
  _period?: "weekly" | "yearly";
  title: string;
  value: string;
  target: string;
  icon: React.ReactNode;
  change: number;
  isPositive: boolean;
  reachedTarget: boolean;
  isLowerBetter: boolean;
}

export interface QualityData {
  week: string;
  facilityManagement: number;
  maintenance: number;
  delivery: number;
}

export interface NPSData {
  week: string;
  newCustomers: number;
  afterFirstYear: number;
  longTerm: number;
}

export interface CallsData {
  category: string;
  count: number;
}

export interface CustomerServiceData {
  _period?: "weekly" | "yearly";
  calls: {
    complaints: number;
    contactRequests: number;
    maintenanceRequests: number;
    inquiries: number;
    officeInterested: number;
    projectsInterested: number;
    customersInterested: number;
    total: number;
  };
  inquiries: {
    general: number;
    documentRequests: number;
    deedInquiries: number;
    apartmentRentals: number;
    soldProjects: number;
  };
  maintenance: {
    cancelled: number;
    resolved: number;
    inProgress: number;
  };
}

export interface MaintenanceSatisfactionData {
  _period?: "weekly" | "yearly";
  comments: Array<{
    text: string;
    date: string;
    time: string;
    username: string;
  }>;
  serviceQuality: {
    veryHappy: number;
    happy: number;
    neutral: number;
    unhappy: number;
    veryUnhappy: number;
  };
  closureTime: {
    veryHappy: number;
    happy: number;
    neutral: number;
    unhappy: number;
    veryUnhappy: number;
  };
  firstTimeResolution: {
    veryHappy: number;
    happy: number;
    neutral: number;
    unhappy: number;
    veryUnhappy: number;
  };
}

export interface PeriodData {
  weekly: {
    metrics: MetricData[];
    qualityData: QualityData[];
    npsData: NPSData[];
    callsData: CallsData[];
  };
  yearly: {
    metrics: MetricData[];
    qualityData: QualityData[];
    npsData: NPSData[];
    callsData: CallsData[];
  };
}

export interface MetricsContextType {
  metrics: MetricData[];
  qualityData: QualityData[];
  npsData: NPSData[];
  currentPeriod: "weekly" | "yearly";
  setCurrentPeriod: (period: "weekly" | "yearly") => void;
  workingNPS: {
    promoters: number;
    passives: number;
    detractors: number;
    score: number;
  };
  updateMetric: (index: number, data: Partial<MetricData>) => void;
  updateQualityData: (index: number, data: Partial<QualityData>) => void;
  updateNPSData: (index: number, data: Partial<NPSData>) => void;
  updateMetricsList: (newMetrics: MetricData[]) => void;
  updateQualityDataList: (newData: QualityData[]) => void;
  updateNPSDataList: (newData: NPSData[]) => void;
  customerServiceData: CustomerServiceData;
  maintenanceSatisfaction: MaintenanceSatisfactionData;
  updateCustomerServiceData: (data: CustomerServiceData) => Promise<void>;
  updateMaintenanceSatisfactionData: (data: MaintenanceSatisfactionData) => void;
  loadData: () => Promise<void>;
}

// البيانات الافتراضية مع الأسماء والأهداف المحدثة
const defaultMetrics = [
  {
    title: "نسبة الترشيح للعملاء الجدد",
    value: "65%",
    target: "65%",
    icon: null,
    change: 0,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "نسبة الترشيح بعد السنة",
    value: "65%",
    target: "65%",
    icon: null,
    change: 0,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "نسبة الترشيح للعملاء القدامى",
    value: "30%",
    target: "30%",
    icon: null,
    change: 0,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "جودة التسليم",
    value: "98%",
    target: "100%",
    icon: null,
    change: -2,
    isPositive: false,
    reachedTarget: false,
    isLowerBetter: false,
  },
  {
    title: "جودة الصيانة",
    value: "96%",
    target: "100%",
    icon: null,
    change: -4,
    isPositive: false,
    reachedTarget: false,
    isLowerBetter: false,
  },
  {
    title: "عدد الثواني للرد",
    value: "2.8 ثانية",
    target: "3 ثواني",
    icon: null,
    change: -6.7,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: true,
  },
  {
    title: "معدل الرد على المكالمات",
    value: "75%",
    target: "80%",
    icon: null,
    change: -6.25,
    isPositive: false,
    reachedTarget: false,
    isLowerBetter: false,
  },
  {
    title: "راحة العميل (CSAT)",
    value: "74%",
    target: "70%",
    icon: null,
    change: 5.7,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "سرعة إغلاق طلبات الصيانة",
    value: "2.5 يوم",
    target: "3 أيام",
    icon: null,
    change: -16.7,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: true,
  },
  {
    title: "عدد إعادة فتح الطلب",
    value: "0",
    target: "0",
    icon: null,
    change: 0,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: true,
  },
  {
    title: "جودة إدارة المرافق",
    value: "80%",
    target: "80%",
    icon: null,
    change: 0,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "معدل التحول",
    value: "2%",
    target: "2%",
    icon: null,
    change: 0,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "نسبة الرضا عن التسليم",
    value: "80%",
    target: "80%",
    icon: null,
    change: 0,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "عدد العملاء المرشحين",
    value: "584",
    target: "584",
    icon: null,
    change: 0,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "المساهمة في المبيعات",
    value: "5%",
    target: "5%",
    icon: null,
    change: 0,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
];

const defaultYearlyMetrics = [
  {
    title: "نسبة الترشيح للعملاء الجدد",
    value: "68%",
    target: "65%",
    icon: null,
    change: 4.6,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "نسبة الترشيح بعد السنة",
    value: "70%",
    target: "65%",
    icon: null,
    change: 7.7,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "نسبة الترشيح للعملاء القدامى",
    value: "35%",
    target: "30%",
    icon: null,
    change: 16.7,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "جودة التسليم",
    value: "99%",
    target: "100%",
    icon: null,
    change: -1,
    isPositive: false,
    reachedTarget: false,
    isLowerBetter: false,
  },
  {
    title: "جودة الصيانة",
    value: "98%",
    target: "100%",
    icon: null,
    change: -2,
    isPositive: false,
    reachedTarget: false,
    isLowerBetter: false,
  },
  {
    title: "عدد الثواني للرد",
    value: "2.5 ثانية",
    target: "3 ثواني",
    icon: null,
    change: -16.7,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: true,
  },
  {
    title: "معدل الرد على المكالمات",
    value: "78%",
    target: "80%",
    icon: null,
    change: -2.5,
    isPositive: false,
    reachedTarget: false,
    isLowerBetter: false,
  },
  {
    title: "راحة العميل (CSAT)",
    value: "78%",
    target: "70%",
    icon: null,
    change: 11.4,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "سرعة إغلاق طلبات الصيانة",
    value: "2.2 يوم",
    target: "3 أيام",
    icon: null,
    change: -26.7,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: true,
  },
  {
    title: "عدد إعادة فتح الطلب",
    value: "2",
    target: "0",
    icon: null,
    change: 200,
    isPositive: false,
    reachedTarget: false,
    isLowerBetter: true,
  },
  {
    title: "جودة إدارة المرافق",
    value: "85%",
    target: "80%",
    icon: null,
    change: 6.25,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "معدل التحول",
    value: "2.5%",
    target: "2%",
    icon: null,
    change: 25.0,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "نسبة الرضا عن التسليم",
    value: "85%",
    target: "80%",
    icon: null,
    change: 6.25,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "عدد العملاء المرشحين",
    value: "7004",
    target: "7004",
    icon: null,
    change: 0,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "المساهمة في المبيعات",
    value: "7%",
    target: "5%",
    icon: null,
    change: 40.0,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
];

const defaultQualityData = [
  { week: "الأسبوع 1", facilityManagement: 89, maintenance: 90, delivery: 95 },
  { week: "الأسبوع 2", facilityManagement: 92, maintenance: 95, delivery: 97 },
  { week: "الأسبوع 3", facilityManagement: 93, maintenance: 94, delivery: 96 },
  { week: "الأسبوع 4", facilityManagement: 96, maintenance: 97, delivery: 98 },
];

const defaultYearlyQualityData = [
  { week: "الربع الأول", facilityManagement: 90, maintenance: 92, delivery: 96 },
  { week: "الربع الثاني", facilityManagement: 93, maintenance: 95, delivery: 97 },
  { week: "الربع الثالث", facilityManagement: 94, maintenance: 96, delivery: 98 },
  { week: "الربع الرابع", facilityManagement: 97, maintenance: 98, delivery: 99 },
];

const defaultNpsData = [
  { week: "الأسبوع 1", newCustomers: 60, afterFirstYear: 61, longTerm: 30 },
  { week: "الأسبوع 2", newCustomers: 63, afterFirstYear: 64, longTerm: 32 },
  { week: "الأسبوع 3", newCustomers: 65, afterFirstYear: 66, longTerm: 36 },
  { week: "الأسبوع 4", newCustomers: 67, afterFirstYear: 68, longTerm: 37 },
];

const defaultYearlyNpsData = [
  { week: "الربع الأول", newCustomers: 61, afterFirstYear: 63, longTerm: 31 },
  { week: "الربع الثاني", newCustomers: 64, afterFirstYear: 65, longTerm: 34 },
  { week: "الربع الثالث", newCustomers: 66, afterFirstYear: 67, longTerm: 37 },
  { week: "الربع الرابع", newCustomers: 68, afterFirstYear: 69, longTerm: 39 },
];

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export function MetricsProvider({ children }: { children: ReactNode }) {
  const [currentPeriod, setCurrentPeriod] = useState<"weekly" | "yearly">("weekly");
  const [metrics, setMetrics] = useState<MetricData[]>(defaultMetrics);
  const [qualityData, setQualityData] = useState<QualityData[]>(defaultQualityData);
  const [npsData, setNPSData] = useState<NPSData[]>(defaultNpsData);
  const [isLoading, setIsLoading] = useState(false);
  const [customerServiceData, setCustomerServiceData] = useState<CustomerServiceData>({
    _period: "weekly",
    calls: {
      complaints: 28,
      contactRequests: 42,
      maintenanceRequests: 65,
      inquiries: 58,
      officeInterested: 34,
      projectsInterested: 38,
      customersInterested: 42,
      total: 307
    },
    inquiries: {
      general: 20,
      documentRequests: 10,
      deedInquiries: 8,
      apartmentRentals: 12,
      soldProjects: 8
    },
    maintenance: {
      cancelled: 5,
      resolved: 45,
      inProgress: 15
    }
  });
  const [maintenanceSatisfaction, setMaintenanceSatisfaction] = useState<MaintenanceSatisfactionData>({
    comments: [],
    serviceQuality: {
      veryHappy: 30,
      happy: 40,
      neutral: 20,
      unhappy: 8,
      veryUnhappy: 2
    },
    closureTime: {
      veryHappy: 25,
      happy: 45,
      neutral: 20,
      unhappy: 7,
      veryUnhappy: 3
    },
    firstTimeResolution: {
      veryHappy: 35,
      happy: 38,
      neutral: 18,
      unhappy: 6,
      veryUnhappy: 3
    }
  });

  // تحميل البيانات من Supabase
  const loadData = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      console.log(`تحميل البيانات من Supabase للفترة: ${currentPeriod}`);
      
      // تحميل المؤشرات
      const loadedMetrics = await DataService.getMetrics(currentPeriod);
      if (loadedMetrics && loadedMetrics.length > 0) {
        const convertedMetrics = loadedMetrics.map(record => ({
          title: record.title,
          value: record.value,
          target: record.target,
          icon: null,
          change: record.change,
          isPositive: record.is_positive,
          reachedTarget: record.reached_target,
          isLowerBetter: record.is_lower_better
        }));
        setMetrics(convertedMetrics);
        console.log(`تم تحميل ${loadedMetrics.length} مؤشر من Supabase`);
      }

      // تحميل بيانات خدمة العملاء
      const loadedCustomerService = await DataService.getCustomerService(currentPeriod);
      if (loadedCustomerService) {
        setCustomerServiceData(loadedCustomerService);
        console.log('تم تحميل بيانات خدمة العملاء من Supabase');
      }

      // تحميل بيانات رضا العملاء
      const loadedSatisfaction = await DataService.getSatisfaction(currentPeriod);
      if (loadedSatisfaction) {
        setMaintenanceSatisfaction(loadedSatisfaction);
        console.log('تم تحميل بيانات رضا العملاء من Supabase');
      }

      // تحميل التعليقات
      const loadedComments = await DataService.getComments(currentPeriod);
      if (loadedComments && loadedComments.length > 0) {
        setMaintenanceSatisfaction(prev => ({
          ...prev,
          comments: loadedComments
        }));
        console.log(`تم تحميل ${loadedComments.length} تعليق من Supabase`);
      }

    } catch (error) {
      console.error('خطأ في تحميل البيانات من Supabase:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحميل البيانات من قاعدة البيانات",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // تحميل البيانات عند بدء تشغيل التطبيق وعند تغيير الفترة
  useEffect(() => {
    loadData();
  }, [currentPeriod]);

  // إعداد real-time subscriptions
  useEffect(() => {
    DataService.setupRealtimeSubscriptions();
    
    const handleDataUpdate = () => {
      console.log('تم تحديث البيانات، إعادة التحميل...');
      loadData();
    };

    DataService.addRealtimeCallback(handleDataUpdate);

    // إعادة تحميل دوري كل 30 ثانية
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    return () => {
      clearInterval(interval);
      DataService.removeRealtimeCallback(handleDataUpdate);
    };
  }, [currentPeriod]);

  const updateMetric = async (index: number, data: Partial<MetricData>) => {
    try {
      const updatedMetrics = [...metrics];
      const updatedMetric = { ...updatedMetrics[index], ...data };
      updatedMetrics[index] = updatedMetric;

      // تحديث الحالة المحلية فوراً
      setMetrics(updatedMetrics);

      // حفظ في Supabase
      await DataService.saveMetric(updatedMetric, index, currentPeriod);

      console.log(`تم حفظ المؤشر ${index} بنجاح في Supabase`);
      
      toast({
        title: "تم بنجاح",
        description: "تم حفظ البيانات بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error('خطأ في تحديث المؤشر:', error);
      
      // إعادة تحميل البيانات في حالة الخطأ
      await loadData();
      
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    }
  };

  const updateQualityData = (index: number, data: Partial<QualityData>) => {
    setQualityData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], ...data };
      return newData;
    });
  };

  const updateNPSData = (index: number, data: Partial<NPSData>) => {
    setNPSData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], ...data };
      return newData;
    });
  };

  const updateCustomerServiceData = async (data: CustomerServiceData) => {
    try {
      setCustomerServiceData(data);

      // حفظ في Supabase
      await DataService.saveCustomerService(data, currentPeriod);

      console.log('تم حفظ بيانات خدمة العملاء بنجاح في Supabase');
      
      toast({
        title: "تم بنجاح",
        description: "تم حفظ بيانات خدمة العملاء بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error('خطأ في حفظ بيانات خدمة العملاء:', error);
      
      // إعادة تحميل البيانات في حالة الخطأ
      await loadData();
      
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ بيانات خدمة العملاء",
        variant: "destructive",
      });
    }
  };

  const updateMaintenanceSatisfactionData = async (data: MaintenanceSatisfactionData) => {
    try {
      setMaintenanceSatisfaction(data);

      // حفظ بيانات الرضا في Supabase
      await DataService.saveSatisfaction(data, currentPeriod);

      console.log('تم حفظ بيانات رضا العملاء بنجاح في Supabase');
      
      toast({
        title: "تم بنجاح",
        description: "تم حفظ بيانات رضا العملاء بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error('خطأ في حفظ بيانات رضا العملاء:', error);
      
      // إعادة تحميل البيانات في حالة الخطأ
      await loadData();
      
      toast({
        title: "خطأ",
        description: error instanceof Error ? error.message : "حدث خطأ أثناء حفظ بيانات رضا العملاء",
        variant: "destructive",
      });
    }
  };

  // تحديث البيانات عند تغيير الفترة
  useEffect(() => {
    if (currentPeriod === "yearly") {
      setMetrics(defaultYearlyMetrics);
      setQualityData(defaultYearlyQualityData);
      setNPSData(defaultYearlyNpsData);
    } else {
      setMetrics(defaultMetrics);
      setQualityData(defaultQualityData);
      setNPSData(defaultNpsData);
    }
  }, [currentPeriod]);

  return (
    <MetricsContext.Provider 
      value={{ 
        metrics,
        qualityData,
        npsData,
        currentPeriod,
        setCurrentPeriod,
        workingNPS: {
          promoters: 0,
          passives: 0,
          detractors: 0,
          score: 0
        },
        updateMetric,
        updateQualityData,
        updateNPSData,
        updateMetricsList: (newMetrics: MetricData[]) => setMetrics(newMetrics),
        updateQualityDataList: (newData: QualityData[]) => setQualityData(newData),
        updateNPSDataList: (newData: NPSData[]) => setNPSData(newData),
        customerServiceData,
        maintenanceSatisfaction,
        updateCustomerServiceData,
        updateMaintenanceSatisfactionData,
        loadData
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
}

export function useMetrics() {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error("useMetrics must be used within a MetricsProvider");
  }
  return context;
}
