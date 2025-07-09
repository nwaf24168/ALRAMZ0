import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";
import { toast } from "@/components/ui/use-toast";
import { DataService } from "@/lib/dataService";
import { RealtimeChannel } from "@supabase/supabase-js";

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
  updateMaintenanceSatisfactionData: (
    data: MaintenanceSatisfactionData,
  ) => void;
}



const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export function MetricsProvider({ children }: { children: ReactNode }) {
  const [currentPeriod, setCurrentPeriod] = useState<"weekly" | "yearly">(
    "weekly",
  );
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [qualityData, setQualityData] = useState<QualityData[]>([]);
  const [npsData, setNPSData] = useState<NPSData[]>([]);
  const [callsData, setCallsData] = useState<CallsData[]>([]);
  const [realtimeChannels, setRealtimeChannels] = useState<RealtimeChannel[]>(
    [],
  );
  const [customerServiceData, setCustomerServiceData] =
    useState<CustomerServiceData>({
      _period: "weekly",
      calls: {
        complaints: 0,
        contactRequests: 0,
        maintenanceRequests: 0,
        inquiries: 0,
        officeInterested: 0,
        projectsInterested: 0,
        customersInterested: 0,
        total: 0,
      },
      inquiries: {
        general: 0,
        documentRequests: 0,
        deedInquiries: 0,
        apartmentRentals: 0,
        soldProjects: 0,
      },
      maintenance: {
        cancelled: 0,
        resolved: 0,
        inProgress: 0,
      },
    });
  const [maintenanceSatisfaction, setMaintenanceSatisfaction] =
    useState<MaintenanceSatisfactionData>({
      comments: [],
      serviceQuality: {
        veryHappy: 0,
        happy: 0,
        neutral: 0,
        unhappy: 0,
        veryUnhappy: 0,
      },
      closureTime: {
        veryHappy: 0,
        happy: 0,
        neutral: 0,
        unhappy: 0,
        veryUnhappy: 0,
      },
      firstTimeResolution: {
        veryHappy: 0,
        happy: 0,
        neutral: 0,
        unhappy: 0,
        veryUnhappy: 0,
      },
    });

  // تهيئة البيانات من Supabase عند تحميل المكون
  useEffect(() => {
    const loadDataFromSupabase = async () => {
      try {
        console.log(`تحميل البيانات للفترة: ${currentPeriod}`);

        // تحميل المؤشرات
        const metricsFromDB = await DataService.getMetrics(currentPeriod);
        console.log("المؤشرات المحملة من قاعدة البيانات:", metricsFromDB);

        const formattedMetrics = metricsFromDB.map((record) => ({
          title: record.title,
          value: record.value,
          target: record.target,
          icon: null,
          change: record.change,
          isPositive: record.is_positive,
          reachedTarget: record.reached_target,
          isLowerBetter: record.is_lower_better,
        }));
        setMetrics(formattedMetrics);
        console.log("تم تحديث المؤشرات:", formattedMetrics);

        // تحميل بيانات خدمة العملاء
        const customerServiceFromDB =
          await DataService.getCustomerService(currentPeriod);
        setCustomerServiceData(customerServiceFromDB);
        console.log("بيانات خدمة العملاء:", customerServiceFromDB);

        // إعادة حساب المجموع للتأكد من دقته
        await DataService.recalculateCallsTotal(currentPeriod);

        // تحميل بيانات الرضا والتعليقات
        const satisfactionFromDB =
          await DataService.getSatisfaction(currentPeriod);
        const commentsFromDB = await DataService.getComments(currentPeriod);
        console.log("بيانات الرضا:", satisfactionFromDB);
        console.log("التعليقات:", commentsFromDB);

        setMaintenanceSatisfaction({
          ...satisfactionFromDB,
          comments: commentsFromDB,
        });
      } catch (error) {
        console.error("خطأ في تحميل البيانات من Supabase:", error);
        // تعيين مصفوفات فارغة في حالة الخطأ
        setMetrics([]);
        setQualityData([]);
        setNPSData([]);
        setCallsData([]);
      }
    };

    loadDataFromSupabase();
  }, [currentPeriod]);

  // إعداد الاشتراكات للوقت الفعلي
  useEffect(() => {
    console.log("إعداد الاشتراكات للوقت الفعلي للفترة:", currentPeriod);

    // إزالة الاشتراكات السابقة
    realtimeChannels.forEach((channel) => {
      DataService.removeRealtimeSubscription(channel);
    });

    const newChannels: RealtimeChannel[] = [];

    // اشتراك في تحديثات المؤشرات
    const metricsChannel = DataService.setupRealtimeSubscription(
      "metrics",
      async (payload) => {
        console.log("تحديث المؤشرات في الوقت الفعلي:", payload);
        try {
          // إعادة تحميل البيانات فوراً عند التحديث
          const metricsFromDB = await DataService.getMetrics(currentPeriod);
          if (metricsFromDB.length > 0) {
            const formattedMetrics = metricsFromDB.map((record) => ({
              title: record.title,
              value: record.value,
              target: record.target,
              icon: null,
              change: record.change,
              isPositive: record.is_positive,
              reachedTarget: record.reached_target,
              isLowerBetter: record.is_lower_better,
            }));
            setMetrics(formattedMetrics);
            console.log("تم تحديث المؤشرات في الوقت الفعلي");
          }
        } catch (error) {
          console.error("خطأ في تحديث المؤشرات:", error);
        }
      },
    );
    newChannels.push(metricsChannel);

    // اشتراك في تحديثات خدمة العملاء
    const customerServiceChannel = DataService.setupRealtimeSubscription(
      "customer_service",
      async (payload) => {
        console.log("تحديث خدمة العملاء في الوقت الفعلي:", payload);
        try {
          const customerServiceFromDB =
            await DataService.getCustomerService(currentPeriod);
          setCustomerServiceData(customerServiceFromDB);
          console.log("تم تحديث بيانات خدمة العملاء في الوقت الفعلي");
        } catch (error) {
          console.error("خطأ في تحديث خدمة العملاء:", error);
        }
      },
    );
    newChannels.push(customerServiceChannel);

    // اشتراك في تحديثات الرضا
    const satisfactionChannel = DataService.setupRealtimeSubscription(
      "satisfaction",
      async (payload) => {
        console.log("تحديث الرضا في الوقت الفعلي:", payload);
        try {
          const satisfactionFromDB =
            await DataService.getSatisfaction(currentPeriod);
          const commentsFromDB = await DataService.getComments(currentPeriod);
          setMaintenanceSatisfaction({
            ...satisfactionFromDB,
            comments: commentsFromDB,
          });
          console.log("تم تحديث بيانات الرضا في الوقت الفعلي");
        } catch (error) {
          console.error("خطأ في تحديث الرضا:", error);
        }
      },
    );
    newChannels.push(satisfactionChannel);

    // اشتراك في تحديثات التعليقات
    const commentsChannel = DataService.setupRealtimeSubscription(
      "comments",
      async (payload) => {
        console.log("تحديث التعليقات في الوقت الفعلي:", payload);
        try {
          const commentsFromDB = await DataService.getComments(currentPeriod);
          setMaintenanceSatisfaction((prev) => ({
            ...prev,
            comments: commentsFromDB,
          }));
          console.log("تم تحديث التعليقات في الوقت الفعلي");
        } catch (error) {
          console.error("خطأ في تحديث التعليقات:", error);
        }
      },
    );
    newChannels.push(commentsChannel);

    setRealtimeChannels(newChannels);
    console.log("تم إعداد", newChannels.length, "اشتراكات للوقت الفعلي");

    // تنظيف الاشتراكات عند إلغاء تحميل المكون
    return () => {
      console.log("تنظيف الاشتراكات للوقت الفعلي");
      newChannels.forEach((channel) => {
        DataService.removeRealtimeSubscription(channel);
      });
    };
  }, [currentPeriod]);

  const updateMetric = async (index: number, data: Partial<MetricData>) => {
    try {
      const updatedMetrics = [...metrics];
      updatedMetrics[index] = { ...updatedMetrics[index], ...data };

      // تحديث الحالة المحلية فوراً
      setMetrics(updatedMetrics);

      // حفظ في Supabase
      await DataService.saveMetric(updatedMetrics[index], index, currentPeriod);

      toast({
        title: "تم بنجاح",
        description: "تم حفظ البيانات بنجاح في قاعدة البيانات",
        variant: "default",
      });
    } catch (error) {
      console.error("خطأ في حفظ البيانات:", error);
      toast({
        title: "خطأ",
        description:
          error instanceof Error ? error.message : "حدث خطأ أثناء حفظ البيانات",
        variant: "destructive",
      });
    }
  };

  const updateQualityData = (index: number, data: Partial<QualityData>) => {
    setQualityData((prev) => {
      const newData = [...prev];
      newData[index] = { ...newData[index], ...data };
      return newData;
    });
  };

  const updateNPSData = (index: number, data: Partial<NPSData>) => {
    setNPSData((prev) => {
      const newData = [...prev];
      newData[index] = { ...newData[index], ...data };
      return newData;
    });
  };

  const updateCallsData = (index: number, data: Partial<CallsData>) => {
    setCallsData((prev) => {
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

      // تحديث بيانات المكالمات
      const newCallsData = [
        { category: "شكاوى", count: data.calls.complaints },
        { category: "طلبات تواصل", count: data.calls.contactRequests },
        { category: "طلبات صيانة", count: data.calls.maintenanceRequests },
        { category: "استفسارات", count: data.calls.inquiries },
        { category: "مهتمين مكاتب", count: data.calls.officeInterested },
        { category: "مهتمين مشاريع", count: data.calls.projectsInterested },
        { category: "عملاء مهتمين", count: data.calls.customersInterested },
      ];
      setCallsData(newCallsData);
    } catch (error) {
      console.error("خطأ في حفظ بيانات خدمة العملاء:", error);
      throw error;
    }
  };

  const updateMaintenanceSatisfactionData = async (
    data: MaintenanceSatisfactionData,
  ) => {
    try {
      console.log("تحديث بيانات الرضا:", data);
      setMaintenanceSatisfaction(data);

      // حفظ في Supabase
      await DataService.saveSatisfaction(data, currentPeriod);
      console.log("تم حفظ بيانات الرضا في Supabase");

      toast({
        title: "تم بنجاح",
        description: "تم حفظ بيانات الرضا بنجاح",
        variant: "default",
      });
    } catch (error) {
      console.error("خطأ في حفظ بيانات الرضا:", error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ بيانات الرضا",
        variant: "destructive",
      });
      throw error;
    }
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
          score: 0,
        },
        updateMetric,
        updateQualityData,
        updateNPSData,
        updateMetricsList: (newMetrics: MetricData[]) => setMetrics(newMetrics),
        updateQualityDataList: (newData: QualityData[]) =>
          setQualityData(newData),
        updateNPSDataList: (newData: NPSData[]) => setNPSData(newData),
        customerServiceData,
        maintenanceSatisfaction,
        updateCustomerServiceData,
        updateMaintenanceSatisfactionData,
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