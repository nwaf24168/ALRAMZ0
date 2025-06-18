import React, { useState, useEffect } from "react";
import { useMetrics } from "@/context/MetricsContext";
import { useNotification } from "@/context/NotificationContext";
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { MaintenanceSatisfactionData } from "@/context/MetricsContext";
import { DataService } from "@/lib/dataService";

interface MetricData {
  displayValue: string;
  title: string;
  value: string;
  target: string;
  icon: React.ReactNode;
  change: number;
  isPositive: boolean;
  reachedTarget: boolean;
  isLowerBetter: boolean;
}

interface CustomerServiceData {
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

interface SatisfactionCategory {
  veryHappy: number;
  happy: number;
  neutral: number;
  unhappy: number;
  veryUnhappy: number;
}

type SatisfactionKey = "serviceQuality" | "closureTime" | "firstTimeResolution";

interface FormDataState {
  metrics: Array<MetricData & { displayValue: string }>;
  customerService: CustomerServiceData;
  maintenanceSatisfaction: MaintenanceSatisfactionData;
}

interface FormData {
  metrics: Array<{
    displayValue: string;
    title: string;
    value: string;
    target: string;
    icon: React.ReactNode;
    change: number;
    isPositive: boolean;
    reachedTarget: boolean;
    isLowerBetter: boolean;
  }>;
  customerService: {
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
  };
  maintenanceSatisfaction: MaintenanceSatisfactionData;
}

export default function DataEntry() {
  const { user } = useAuth();
  const {
    metrics,
    updateMetric,
    customerServiceData,
    updateCustomerServiceData,
    maintenanceSatisfaction,
    updateMaintenanceSatisfactionData,
    currentPeriod,
    setCurrentPeriod,
  } = useMetrics();

  const { addNotification } = useNotification();
  const [newComment, setNewComment] = useState("");
  const [formData, setFormData] = useState<FormDataState>({
    metrics: metrics.map((metric) => ({
      ...metric,
      displayValue: metric.value ? metric.value.replace(/[^0-9.-]/g, "") : "0",
    })),
    customerService: customerServiceData,
    maintenanceSatisfaction: maintenanceSatisfaction,
  });

  // تحديث البيانات المحلية عند تغيير الفترة
  useEffect(() => {
    setFormData({
      metrics: metrics.map((metric) => ({
        ...metric,
        displayValue: metric.value
          ? metric.value.replace(/[^0-9.-]/g, "")
          : "0",
      })),
      customerService: customerServiceData,
      maintenanceSatisfaction: maintenanceSatisfaction,
    });
  }, [metrics, customerServiceData, maintenanceSatisfaction, currentPeriod]);

  // تحميل البيانات من Supabase عند تغيير الفترة
  useEffect(() => {
    const loadDataFromSupabase = async () => {
      try {
        // تحميل بيانات خدمة العملاء
        const customerServiceFromDB =
          await DataService.getCustomerService(currentPeriod);

        // تحميل بيانات الرضا والتعليقات
        const satisfactionFromDB =
          await DataService.getSatisfaction(currentPeriod);
        const commentsFromDB = await DataService.getComments(currentPeriod);

        const fullSatisfactionData = {
          ...satisfactionFromDB,
          comments: commentsFromDB,
        };

        // تحديث السياق بالبيانات المحملة
        await updateCustomerServiceData({
          ...customerServiceFromDB,
          _period: currentPeriod,
        });

        await updateMaintenanceSatisfactionData({
          ...fullSatisfactionData,
          _period: currentPeriod,
        });
      } catch (error) {
        console.error("خطأ في تحميل البيانات من Supabase:", error);
        addNotification({
          title: "خطأ",
          message:
            error instanceof Error
              ? error.message
              : "حدث خطأ أثناء تحميل البيانات",
          type: "error",
        });
      }
    };

    loadDataFromSupabase();
  }, [currentPeriod]);

  const handleMetricChange = (index: number, value: string) => {
    const cleanValue = value.replace(/[^0-9.-]/g, "");
    
    // تحديث الحالة المحلية فقط
    setFormData((prev) => {
      const newMetrics = [...prev.metrics];
      newMetrics[index] = {
        ...newMetrics[index],
        displayValue: cleanValue,
      };
      return { ...prev, metrics: newMetrics };
    });
  };

  const saveMetrics = async () => {
    try {
      for (let index = 0; index < formData.metrics.length; index++) {
        const metric = formData.metrics[index];
        const cleanValue = metric.displayValue;
        const numValue = parseFloat(cleanValue);

        if (isNaN(numValue) && cleanValue !== "" && cleanValue !== "-") continue;

        const originalMetric = metrics[index];
        const targetValue = parseFloat(
          originalMetric.target.replace(/[^0-9.-]/g, "") || "0",
        );

        const updatedMetric = {
          ...originalMetric,
          value: cleanValue + "%",
          change:
            targetValue !== 0 ? ((numValue - targetValue) / targetValue) * 100 : 0,
          isPositive: !originalMetric.isLowerBetter
            ? numValue >= targetValue
            : numValue <= targetValue,
          reachedTarget: !originalMetric.isLowerBetter
            ? numValue >= targetValue
            : numValue <= targetValue,
          _period: currentPeriod,
        };

        // حفظ في Supabase
        await DataService.saveMetric(updatedMetric, index, currentPeriod);

        // تحديث السياق
        await updateMetric(index, updatedMetric);
      }

      addNotification({
        title: "تم الحفظ",
        message: "تم حفظ جميع المؤشرات بنجاح في قاعدة البيانات",
        type: "success",
      });
    } catch (error) {
      console.error("خطأ في حفظ المؤشرات:", error);
      addNotification({
        title: "خطأ",
        message:
          error instanceof Error ? error.message : "حدث خطأ أثناء حفظ المؤشرات",
        type: "error",
      });
    }
  };

  const handleServiceChange = (
    section: string,
    field: string,
    value: string,
  ) => {
    const cleanValue = value.replace(/[^0-9]/g, "");
    const numValue = cleanValue === "" ? 0 : parseInt(cleanValue, 10);

    const updatedCustomerService = { ...formData.customerService };

    if (section === "calls") {
      updatedCustomerService.calls = {
        ...updatedCustomerService.calls,
        [field]: numValue,
      };

      const total = Object.entries(updatedCustomerService.calls)
        .filter(([key]) => key !== "total")
        .reduce(
          (sum, [_, val]) => sum + (typeof val === "number" ? val : 0),
          0,
        );

      updatedCustomerService.calls.total = total;
    } else if (section === "inquiries") {
      updatedCustomerService.inquiries = {
        ...updatedCustomerService.inquiries,
        [field]: numValue,
      };
    } else if (section === "maintenance") {
      updatedCustomerService.maintenance = {
        ...updatedCustomerService.maintenance,
        [field]: numValue,
      };
    }

    // تحديث الحالة المحلية فقط
    setFormData((prev) => ({
      ...prev,
      customerService: updatedCustomerService,
    }));
  };

  const saveCustomerService = async () => {
    try {
      // حفظ في Supabase
      await DataService.saveCustomerService(
        formData.customerService,
        currentPeriod,
      );

      // تحديث السياق
      await updateCustomerServiceData({
        ...formData.customerService,
        _period: currentPeriod,
      });

      addNotification({
        title: "تم الحفظ",
        message: "تم حفظ بيانات خدمة العملاء بنجاح في قاعدة البيانات",
        type: "success",
      });
    } catch (error) {
      console.error("خطأ في حفظ البيانات:", error);
      addNotification({
        title: "خطأ",
        message:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء حفظ البيانات",
        type: "error",
      });
    }
  };

  const handleSatisfactionChange = (
    category: SatisfactionKey,
    field: keyof SatisfactionCategory,
    value: string,
  ) => {
    const cleanValue = value.replace(/[^0-9.-]/g, "");
    const numValue = parseFloat(cleanValue);

    if (isNaN(numValue) && value !== "" && value !== "-") return;

    const currentCategory = formData.maintenanceSatisfaction[
      category
    ] as SatisfactionCategory;

    const updatedSatisfaction = {
      ...formData.maintenanceSatisfaction,
      [category]: {
        ...currentCategory,
        [field]: value === "" ? 0 : numValue,
      },
    };

    // تحديث الحالة المحلية فقط
    setFormData((prev) => ({
      ...prev,
      maintenanceSatisfaction: updatedSatisfaction,
    }));
  };

  const saveSatisfactionData = async () => {
    try {
      // حفظ في Supabase
      await DataService.saveSatisfaction(formData.maintenanceSatisfaction, currentPeriod);

      // تحديث السياق
      await updateMaintenanceSatisfactionData({
        ...formData.maintenanceSatisfaction,
        _period: currentPeriod,
      });

      addNotification({
        title: "تم الحفظ",
        message: "تم حفظ بيانات الرضا بنجاح في قاعدة البيانات",
        type: "success",
      });
    } catch (error) {
      console.error("خطأ في حفظ بيانات الرضا:", error);
      addNotification({
        title: "خطأ",
        message:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء حفظ بيانات الرضا",
        type: "error",
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    try {
      // حفظ التعليق في Supabase
      await DataService.saveComment(
        newComment.trim(),
        user?.username || "مجهول",
        currentPeriod,
      );

      // تحديث قائمة التعليقات المحلية
      const updatedComments = await DataService.getComments(currentPeriod);
      const updatedSatisfaction = {
        ...formData.maintenanceSatisfaction,
        comments: updatedComments,
      };

      setFormData((prev) => ({
        ...prev,
        maintenanceSatisfaction: updatedSatisfaction,
      }));

      await updateMaintenanceSatisfactionData({
        ...updatedSatisfaction,
        _period: currentPeriod,
      });

      setNewComment("");

      addNotification({
        title: "تم الإضافة",
        message: "تم إضافة التعليق بنجاح في قاعدة البيانات",
        type: "success",
      });
    } catch (error) {
      console.error("خطأ في إضافة التعليق:", error);
      addNotification({
        title: "خطأ",
        message:
          error instanceof Error
            ? error.message
            : "حدث خطأ أثناء إضافة التعليق",
        type: "error",
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-3 md:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-4">
          <div className="w-full sm:w-auto">
            <h1 className="text-xl md:text-2xl font-bold mb-2">
              إدخال البيانات
            </h1>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                className="flex-1 sm:flex-none"
                variant={currentPeriod === "weekly" ? "default" : "outline"}
                onClick={() => setCurrentPeriod("weekly")}
              >
                أسبوعي
              </Button>
              <Button
                className="flex-1 sm:flex-none"
                variant={currentPeriod === "yearly" ? "default" : "outline"}
                onClick={() => setCurrentPeriod("yearly")}
              >
                سنوي
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="metrics" className="space-y-4">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3 h-auto sm:h-10">
            <TabsTrigger value="metrics" className="text-sm">
              مؤشرات الأداء
            </TabsTrigger>
            <TabsTrigger value="service" className="text-sm">
              خدمة العملاء
            </TabsTrigger>
            <TabsTrigger value="satisfaction" className="text-sm">
              رضا العملاء
            </TabsTrigger>
          </TabsList>

          <TabsContent value="metrics">
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>
                    مؤشرات الأداء الرئيسية -{" "}
                    {currentPeriod === "weekly" ? "أسبوعي" : "سنوي"}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                    {formData.metrics.map((metric, index) => (
                      <div
                        key={index}
                        className="space-y-2 p-3 md:p-4 border rounded-lg"
                      >
                        <Label className="text-sm font-medium">
                          {metric.title}
                        </Label>
                        <Input
                          type="text"
                          inputMode="decimal"
                          value={metric.displayValue}
                          onChange={(e) =>
                            handleMetricChange(index, e.target.value)
                          }
                          className="text-left ltr"
                          dir="ltr"
                        />
                        <div className="flex flex-col sm:flex-row justify-between text-xs sm:text-sm text-gray-500 gap-1">
                          <span>الهدف: {metric.target}</span>
                          <span>التغيير: {metric.change.toFixed(1)}%</span>
                        </div>
                        <div
                          className={`text-xs sm:text-sm ${metric.isPositive ? "text-green-500" : "text-red-500"}`}
                        >
                          {metric.isPositive
                            ? "تم تحقيق الهدف"
                            : "لم يتم تحقيق الهدف"}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-end">
                    <Button onClick={saveMetrics} className="bg-blue-600 hover:bg-blue-700">
                      حفظ المؤشرات
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="service">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>المكالمات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(formData.customerService.calls)
                      .filter(([key]) => key !== "total")
                      .map(([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label>{getServiceLabel(key)}</Label>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) =>
                              handleServiceChange("calls", key, e.target.value)
                            }
                            className="text-left ltr"
                            dir="ltr"
                          />
                        </div>
                      ))}
                    <div className="pt-4 border-t mt-4">
                      <div className="flex justify-between items-center">
                        <Label>المجموع</Label>
                        <span className="text-xl font-bold">
                          {formData.customerService.calls.total}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>الاستفسارات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(formData.customerService.inquiries).map(
                      ([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label>{getServiceLabel(key)}</Label>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) =>
                              handleServiceChange(
                                "inquiries",
                                key,
                                e.target.value,
                              )
                            }
                            className="text-left ltr"
                            dir="ltr"
                          />
                        </div>
                      ),
                    )}
                    <div className="pt-4 border-t mt-4">
                      <div className="flex justify-between items-center">
                        <Label>المجموع</Label>
                        <span className="text-xl font-bold">
                          {Object.values(
                            formData.customerService.inquiries,
                          ).reduce((a, b) => a + b, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>طلبات الصيانة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(formData.customerService.maintenance).map(
                      ([key, value]) => (
                        <div key={key} className="space-y-2">
                          <Label>{getServiceLabel(key)}</Label>
                          <Input
                            type="text"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) =>
                              handleServiceChange(
                                "maintenance",
                                key,
                                e.target.value,
                              )
                            }
                            className="text-left ltr"
                            dir="ltr"
                          />
                        </div>
                      ),
                    )}
                    <div className="pt-4 border-t mt-4">
                      <div className="flex justify-between items-center">
                        <Label>المجموع</Label>
                        <span className="text-xl font-bold">
                          {Object.values(
                            formData.customerService.maintenance,
                          ).reduce((a, b) => a + b, 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="mt-6 flex justify-end">
              <Button onClick={saveCustomerService} className="bg-blue-600 hover:bg-blue-700">
                حفظ بيانات خدمة العملاء
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="satisfaction">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {["serviceQuality", "closureTime", "firstTimeResolution"].map(
                (category) => (
                  <Card key={category}>
                    <CardHeader>
                      <CardTitle>{getSatisfactionTitle(category)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {Object.entries(
                          formData.maintenanceSatisfaction[
                            category as SatisfactionKey
                          ] as SatisfactionCategory,
                        ).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <Label>{getSatisfactionLabel(key)}</Label>
                            <Input
                              type="text"
                              inputMode="decimal"
                              value={value}
                              onChange={(e) =>
                                handleSatisfactionChange(
                                  category as SatisfactionKey,
                                  key as keyof SatisfactionCategory,
                                  e.target.value,
                                )
                              }
                              className="text-left ltr"
                              dir="ltr"
                            />
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ),
              )}
            </div>

            <Card className="mt-4 bg-gray-900">
              <CardHeader>
                <CardTitle className="text-white">ملاحظات</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Textarea
                    placeholder="أضف تعليقاتك هنا"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="bg-gray-800 text-white border-gray-700 placeholder:text-gray-400"
                  />
                  <Button onClick={handleAddComment} className="self-start">
                    تسجيل
                  </Button>
                </div>
                <div className="mt-4 space-y-2">
                  {formData.maintenanceSatisfaction.comments.map(
                    (comment, index) => (
                      <div
                        key={index}
                        className="p-3 bg-gray-800 rounded-lg border border-gray-700"
                      >
                        <div className="text-sm text-gray-200">
                          {comment.text}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {comment.username} - {comment.date} {comment.time}
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </CardContent>
            </Card>
            <div className="mt-6 flex justify-end">
              <Button onClick={saveSatisfactionData} className="bg-blue-600 hover:bg-blue-700">
                حفظ بيانات الرضا
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

function getServiceLabel(key: string): string {
  const labels: Record<string, string> = {
    complaints: "شكاوى",
    contactRequests: "طلبات تواصل",
    maintenanceRequests: "طلبات صيانة",
    inquiries: "استفسارات",
    officeInterested: "مهتمين مكاتب",
    projectsInterested: "مهتمين مشاريع",
    customersInterested: "عملاء مهتمين",
    general: "استفسارات عامة",
    documentRequests: "طلب وثائق",
    deedInquiries: "استفسارات صكوك",
    apartmentRentals: "تأجير شقق",
    soldProjects: "مشاريع مباعة",
    cancelled: "ملغية",
    resolved: "منجزة",
    inProgress: "قيد التنفيذ",
  };
  return labels[key] || key;
}

function getSatisfactionLabel(key: string): string {
  const labels: Record<string, string> = {
    veryHappy: "راضي جداً",
    happy: "راضي",
    neutral: "محايد",
    unhappy: "غير راضي",
    veryUnhappy: "غير راضي جداً",
  };
  return labels[key] || key;
}

function getSatisfactionTitle(category: string): string {
  const titles: Record<string, string> = {
    serviceQuality: "جودة الخدمة",
    closureTime: "وقت الإغلاق",
    firstTimeResolution: "الحل من أول مرة",
  };
  return titles[category] || category;
}
