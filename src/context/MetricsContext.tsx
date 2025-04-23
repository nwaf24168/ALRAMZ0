import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

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
}

// البيانات الافتراضية
const defaultMetrics = [
  {
    title: "نسبة الترشيح للعملاء الجدد",
    value: "65%",
    target: "65%",
    icon: null,
    change: 2.4,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "نسبة الترشيح بعد السنة",
    value: "67%",
    target: "65%",
    icon: null,
    change: 3.1,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "نسبة الترشيح للعملاء القدامى",
    value: "30%",
    target: "30%",
    icon: null,
    change: 1.8,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "جودة التسليم",
    value: "98%",
    target: "100%",
    icon: null,
    change: 1.5,
    isPositive: true,
    reachedTarget: false,
    isLowerBetter: false,
  },
  {
    title: "جودة الصيانة",
    value: "96%",
    target: "100%",
    icon: null,
    change: 2.8,
    isPositive: true,
    reachedTarget: false,
    isLowerBetter: false,
  },
  {
    title: "عدد الثواني للرد",
    value: "2.8 ثانية",
    target: "3 ثواني",
    icon: null,
    change: 5.7,
    isPositive: false,
    reachedTarget: true,
    isLowerBetter: true,
  },
  {
    title: "معدل الرد على المكالمات",
    value: "18%",
    target: "80%",
    icon: null,
    change: 4.3,
    isPositive: false,
    reachedTarget: false,
    isLowerBetter: true,
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
    change: 8.2,
    isPositive: false,
    reachedTarget: true,
    isLowerBetter: true,
  },
  {
    title: "عدد إعادة فتح طلب",
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
    change: 1.8,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "معدل التحول",
    value: "2%",
    target: "2%",
    icon: null,
    change: 1.5,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "نسبة الرضا عن التسليم",
    value: "80%",
    target: "80%",
    icon: null,
    change: 2.3,
    isPositive: true,
    reachedTarget: true,
    isLowerBetter: false,
  },
  {
    title: "عدد العملاء المرشحين",
    value: "584",
    target: "7008",
    icon: null,
    change: -91.7,
    isPositive: false,
    reachedTarget: false,
    isLowerBetter: false,
  },
  {
    title: "المساهمة في المبيعات",
    value: "5%",
    target: "5%",
    icon: null,
    change: 2.1,
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
    change: 2.5,
    isPositive: true,
    reachedTarget: false,
    isLowerBetter: false,
  },
  {
    title: "جودة الصيانة",
    value: "98%",
    target: "100%",
    icon: null,
    change: 3.8,
    isPositive: true,
    reachedTarget: false,
    isLowerBetter: false,
  },
  {
    title: "عدد الثواني للرد",
    value: "2.5 ثانية",
    target: "3 ثواني",
    icon: null,
    change: 16.7,
    isPositive: false,
    reachedTarget: true,
    isLowerBetter: true,
  },
  {
    title: "معدل الرد على المكالمات",
    value: "16%",
    target: "80%",
    icon: null,
    change: 20.0,
    isPositive: false,
    reachedTarget: false,
    isLowerBetter: true,
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
    change: 26.7,
    isPositive: false,
    reachedTarget: true,
    isLowerBetter: true,
  },
  {
    title: "عدد إعادة فتح طلب",
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
    value: "583",
    target: "7008",
    icon: null,
    change: -91.7,
    isPositive: false,
    reachedTarget: false,
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

const defaultCallsData = [
  { category: "مهتمين", count: 42 },
  { category: "مهتمين مشاريع", count: 38 },
  { category: "طلبات صيانة", count: 65 },
  { category: "استفسارات", count: 58 },
  { category: "مهتمين مكاتب", count: 34 },
  { category: "شكاوى", count: 28 },
];

const defaultYearlyCallsData = [
  { category: "مهتمين", count: 520 },
  { category: "مهتمين مشاريع", count: 480 },
  { category: "طلبات صيانة", count: 790 },
  { category: "استفسارات", count: 680 },
  { category: "مهتمين مكاتب", count: 410 },
  { category: "شكاوى", count: 340 },
];

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export function MetricsProvider({ children }: { children: ReactNode }) {
  const [currentPeriod, setCurrentPeriod] = useState<"weekly" | "yearly">("weekly");
  const [metrics, setMetrics] = useState<MetricData[]>(defaultMetrics);
  const [qualityData, setQualityData] = useState<QualityData[]>(defaultQualityData);
  const [npsData, setNPSData] = useState<NPSData[]>(defaultNpsData);
  const [callsData, setCallsData] = useState<CallsData[]>(defaultCallsData);
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

  // تهيئة البيانات عند تحميل المكون
  useEffect(() => {
    const savedData = localStorage.getItem('metrics_data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        const periodData = data[currentPeriod];

        if (periodData?.metrics?.length > 0) {
          setMetrics(periodData.metrics);
        }

        if (periodData?.customerServiceData) {
          setCustomerServiceData(periodData.customerServiceData);
        }

        if (periodData?.maintenanceSatisfaction) {
          setMaintenanceSatisfaction(periodData.maintenanceSatisfaction);
        }

        if (periodData?.qualityData?.length > 0) {
          setQualityData(periodData.qualityData);
        }

        if (periodData?.npsData?.length > 0) {
          setNPSData(periodData.npsData);
        }

        if (periodData?.callsData?.length > 0) {
          setCallsData(periodData.callsData);
        }
      } catch (error) {
        console.error('خطأ في قراءة البيانات المحفوظة:', error);
      }
    }
  }, [currentPeriod]);

  // تحديث البيانات عند تغيير الفترة
  useEffect(() => {
    const savedData = localStorage.getItem('metrics_data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        const periodData = data[currentPeriod] || {};

        // تعيين البيانات المحفوظة فقط إذا كانت موجودة
        if (periodData.metrics && periodData.metrics.length > 0) {
          setMetrics(periodData.metrics);
        }

        if (periodData.customerServiceData) {
          setCustomerServiceData(periodData.customerServiceData);
        }

        if (periodData.maintenanceSatisfaction) {
          setMaintenanceSatisfaction(periodData.maintenanceSatisfaction);
        }

        // تعيين البيانات الافتراضية فقط إذا لم تكن هناك بيانات محفوظة
        if (!periodData.metrics) {
          setMetrics(currentPeriod === "weekly" ? defaultMetrics : defaultYearlyMetrics);
          setQualityData(currentPeriod === "weekly" ? defaultQualityData : defaultYearlyQualityData);
          setNPSData(currentPeriod === "weekly" ? defaultNpsData : defaultYearlyNpsData);
          setCallsData(currentPeriod === "weekly" ? defaultCallsData : defaultYearlyCallsData);
        }
      } catch (error) {
        console.error('خطأ في قراءة البيانات المحفوظة:', error);
        // تعيين البيانات الافتراضية فقط في حالة الخطأ
        setMetrics(currentPeriod === "weekly" ? defaultMetrics : defaultYearlyMetrics);
        setQualityData(currentPeriod === "weekly" ? defaultQualityData : defaultYearlyQualityData);
        setNPSData(currentPeriod === "weekly" ? defaultNpsData : defaultYearlyNpsData);
        setCallsData(currentPeriod === "weekly" ? defaultCallsData : defaultYearlyCallsData);
      }
    } else {
      // تعيين البيانات الافتراضية فقط إذا لم تكن هناك بيانات محفوظة
      setMetrics(currentPeriod === "weekly" ? defaultMetrics : defaultYearlyMetrics);
      setQualityData(currentPeriod === "weekly" ? defaultQualityData : defaultYearlyQualityData);
      setNPSData(currentPeriod === "weekly" ? defaultNpsData : defaultYearlyNpsData);
      setCallsData(currentPeriod === "weekly" ? defaultCallsData : defaultYearlyCallsData);
    }
  }, [currentPeriod]);

  const updateMetric = async (index: number, data: Partial<MetricData>) => {
    try {
      const updatedMetrics = [...metrics];
      updatedMetrics[index] = { ...updatedMetrics[index], ...data };

      // تحديث الحالة المحلية فوراً
      setMetrics(updatedMetrics);

      // حفظ في localStorage
      const savedData = localStorage.getItem('metrics_data') || '{}';
      const currentData = JSON.parse(savedData);

      const updatedData = {
        ...currentData,
        [currentPeriod]: {
          ...currentData[currentPeriod],
          metrics: updatedMetrics,
          qualityData,
          npsData,
          callsData,
          customerServiceData,
          maintenanceSatisfaction
        }
      };

      localStorage.setItem('metrics_data', JSON.stringify(updatedData));

      toast({
        title: "تم بنجاح",
        description: "تم حفظ البيانات بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error('خطأ في حفظ البيانات:', error);
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

  const updateCallsData = (index: number, data: Partial<CallsData>) => {
    setCallsData(prev => {
      const newData = [...prev];
      newData[index] = { ...newData[index], ...data };
      return newData;
    });
  };

  const updateCustomerServiceData = async (data: CustomerServiceData) => {
    setCustomerServiceData(data);

    // حفظ في localStorage مع مراعاة الفترة
    const savedData = localStorage.getItem('metrics_data') || '{}';
    const currentData = JSON.parse(savedData);

    localStorage.setItem('metrics_data', JSON.stringify({
      ...currentData,
      [currentPeriod]: {
        ...currentData[currentPeriod],
        customerServiceData: data
      }
    }));

    // تحديث بيانات المكالمات
    const newCallsData = [
      { category: "شكاوى", count: data.calls.complaints },
      { category: "طلبات تواصل", count: data.calls.contactRequests },
      { category: "طلبات صيانة", count: data.calls.maintenanceRequests },
      { category: "استفسارات", count: data.calls.inquiries },
      { category: "مهتمين مكاتب", count: data.calls.officeInterested },
      { category: "مهتمين مشاريع", count: data.calls.projectsInterested },
      { category: "عملاء مهتمين", count: data.calls.customersInterested }
    ];
    setCallsData(newCallsData);
  };

  const updateMaintenanceSatisfactionData = async (data: MaintenanceSatisfactionData) => {
    setMaintenanceSatisfaction(data);

    // حفظ في localStorage مع مراعاة الفترة
    const savedData = localStorage.getItem('metrics_data') || '{}';
    const currentData = JSON.parse(savedData);

    localStorage.setItem('metrics_data', JSON.stringify({
      ...currentData,
      [currentPeriod]: {
        ...currentData[currentPeriod],
        maintenanceSatisfaction: data
      }
    }));
  };

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
        updateMaintenanceSatisfactionData
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