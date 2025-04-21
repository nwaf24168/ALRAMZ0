import React from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Activity, 
  Users, 
  Timer, 
  Phone, 
  Percent, 
  FileText, 
  Wrench, 
  Clock, 
  UserCheck, 
  Briefcase,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { useMetrics } from "@/context/MetricsContext";

const MetricCard = ({ title, value, target, icon, change, isPositive, reachedTarget, isLowerBetter }) => {
  const getStatusColor = (value: string, target: string, isLowerBetter: boolean, title: string): string => {
    // Special handling for call response rate
    if (title === "معدل الرد على المكالمات") {
      const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
      if (numValue > 80) {
        return 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 text-emerald-500 border-emerald-500/20';
      }
      return 'bg-gradient-to-br from-red-500/20 to-red-500/10 text-red-500 border-red-500/20';
    }
    
    // Default handling for other metrics
    const numValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
    const numTarget = parseFloat(target.replace(/[^0-9.-]/g, ''));
    
    if (isLowerBetter) {
      if (numValue <= numTarget) return 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 text-emerald-500 border-emerald-500/20';
      if (numValue <= numTarget * 1.1) return 'bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 text-yellow-500 border-yellow-500/20';
      return 'bg-gradient-to-br from-red-500/20 to-red-500/10 text-red-500 border-red-500/20';
    } else {
      if (numValue >= numTarget) return 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 text-emerald-500 border-emerald-500/20';
      if (numValue >= numTarget * 0.9) return 'bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 text-yellow-500 border-yellow-500/20';
      return 'bg-gradient-to-br from-red-500/20 to-red-500/10 text-red-500 border-red-500/20';
    }
  };

  const statusColor = getStatusColor(value, target, isLowerBetter, title);
  const changeValue = parseFloat(change.toFixed(1));

  return (
    <div className={`p-4 sm:p-6 rounded-xl transition-all duration-300 border ${statusColor}`}>
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="text-xl sm:text-2xl opacity-80">{icon}</div>
        <div className="flex items-center gap-1">
          {changeValue !== 0 && (
            <>
              {changeValue > 0 ? (
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
              ) : (
                <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
              )}
              <span className="text-xs sm:text-sm font-medium">
                {Math.abs(changeValue)}%
              </span>
            </>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <h3 className="text-sm sm:text-base font-medium opacity-90 line-clamp-2">{title}</h3>
        <div className="text-xl sm:text-2xl font-bold">{value}</div>
        <div className="text-xs sm:text-sm opacity-60">
          الهدف: {target}
        </div>
      </div>
    </div>
  );
};

export default function Dashboard() {
  const {
    metrics,
    currentPeriod,
    setCurrentPeriod,
    customerServiceData,
    maintenanceSatisfaction
  } = useMetrics();

  const getIconForMetric = (index: number) => {
    const icons = [
      <Users key="users1" />,
      <Users key="users2" />,
      <Users key="users3" />,
      <Activity key="activity" />,
      <Wrench key="wrench" />,
      <Timer key="timer" />,
      <Phone key="phone" />,
      <UserCheck key="usercheck1" />,
      <Clock key="clock" />,
      <FileText key="filetext" />,
      <Briefcase key="briefcase" />,
      <Percent key="percent1" />,
      <UserCheck key="usercheck2" />,
      <Users key="users4" />,
      <Percent key="percent2" />
    ];
    return icons[index] || <Activity />;
  };

  const metricsWithIcons = metrics.map((metric, index) => ({
    ...metric,
    icon: getIconForMetric(index)
  }));

  return (
    <Layout>
      <div className="container mx-auto p-2 sm:p-4 md:p-6">
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-xl sm:text-2xl font-bold">لوحة التحكم الرئيسية</h1>
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

          <h2 className="text-lg sm:text-xl font-semibold">مؤشرات الأداء الرئيسية {currentPeriod === "weekly" ? "الأسبوعية" : "السنوية"}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 md:gap-4">
            {metricsWithIcons.map((metric, index) => (
              <MetricCard
                key={index}
                title={metric.title}
                value={metric.value}
                target={metric.target}
                icon={metric.icon}
                change={metric.change}
                isPositive={metric.isPositive}
                reachedTarget={metric.reachedTarget}
                isLowerBetter={metric.isLowerBetter}
              />
            ))}
          </div>

          <CustomerServiceStats />
        </div>
      </div>
    </Layout>
  );
}

const CustomerServiceStats = () => {
  const { customerServiceData, maintenanceSatisfaction, currentPeriod, updateMaintenanceSatisfactionData } = useMetrics();

  const calculateSatisfactionPercentage = (data: Record<string, number>) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    if (total === 0) return 0;
    
    const weightedSum = (
      data.veryHappy * 100 +
      data.happy * 75 +
      data.neutral * 50 +
      data.unhappy * 25 +
      data.veryUnhappy * 0
    );
    return (weightedSum / (total * 100)) * 100;
  };

  const getColorByPercentage = (percentage: number): string => {
    if (percentage >= 75) return 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 text-emerald-500';
    if (percentage >= 50) return 'bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 text-yellow-500';
    return 'bg-gradient-to-br from-red-500/20 to-red-500/10 text-red-500';
  };

  const getSatisfactionEmoji = (percentage: number): string => {
    if (percentage >= 75) return '😊';
    if (percentage >= 50) return '😐';
    return '😟';
  };

  const handleDeleteComment = (indexToDelete: number) => {
    const updatedComments = Array.isArray(maintenanceSatisfaction.comments) 
      ? maintenanceSatisfaction.comments.filter((_, index) => index !== indexToDelete)
      : [];
    
    updateMaintenanceSatisfactionData({
      ...maintenanceSatisfaction,
      comments: updatedComments
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-lg sm:text-2xl font-bold">خدمة العملاء {currentPeriod === "weekly" ? "الأسبوعية" : "السنوية"}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4">
        {/* كرت المكالمات */}
        <Card className="border-0 bg-[#1a1c23] text-white">
          <CardHeader className="pb-2 border-b border-gray-800">
            <CardTitle className="text-base sm:text-lg font-bold text-white">المكالمات</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {Object.entries(customerServiceData.calls)
                .filter(([key]) => key !== 'total')
                .map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                    <span className="text-xs sm:text-sm text-gray-400">
                      {key === 'complaints' ? 'شكاوى' :
                       key === 'contactRequests' ? 'طلبات تواصل' :
                       key === 'maintenanceRequests' ? 'طلبات صيانة' :
                       key === 'inquiries' ? 'استفسارات' :
                       key === 'officeInterested' ? 'مهتمين مكاتب' :
                       key === 'projectsInterested' ? 'مهتمين مشاريع' :
                       'عملاء مهتمين'}
                    </span>
                    <span className="text-sm sm:text-base font-semibold text-white">{value}</span>
                  </div>
                ))}
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-800">
                <span className="text-sm sm:text-base font-bold text-white">إجمالي المكالمات</span>
                <span className="text-base sm:text-lg font-bold text-white">{customerServiceData.calls.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* كرت الاستفسارات */}
        <Card className="border-0 bg-[#1a1c23] text-white">
          <CardHeader className="pb-2 border-b border-gray-800">
            <CardTitle className="text-base sm:text-lg font-bold text-white">الاستفسارات</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {Object.entries(customerServiceData.inquiries).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                  <span className="text-xs sm:text-sm text-gray-400">
                    {key === 'general' ? 'استفسارات عامة' :
                     key === 'documentRequests' ? 'طلب أوراق' :
                     key === 'deedInquiries' ? 'استفسارات الصكوك' :
                     key === 'apartmentRentals' ? 'إيجارات شقق' :
                     'مشاريع مباعة'}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-white">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-800">
                <span className="text-sm sm:text-base font-bold text-white">إجمالي الاستفسارات</span>
                <span className="text-base sm:text-lg font-bold text-white">
                  {Object.values(customerServiceData.inquiries).reduce((sum, val) => sum + val, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* كرت حالة طلبات الصيانة */}
        <Card className="border-0 bg-[#1a1c23] text-white">
          <CardHeader className="pb-2 border-b border-gray-800">
            <CardTitle className="text-base sm:text-lg font-bold text-white">حالة طلبات الصيانة</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {Object.entries(customerServiceData.maintenance).map(([key, value]) => (
                <div key={key} className="flex justify-between items-center py-2 border-b border-gray-800 last:border-0">
                  <span className="text-xs sm:text-sm text-gray-400">
                    {key === 'cancelled' ? 'تم الإلغاء' :
                     key === 'resolved' ? 'تم الحل' :
                     'قيد المعالجة'}
                  </span>
                  <span className="text-sm sm:text-base font-semibold text-white">{value}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 mt-2 border-t border-gray-800">
                <span className="text-sm sm:text-base font-bold text-white">إجمالي طلبات الصيانة</span>
                <span className="text-base sm:text-lg font-bold text-white">
                  {Object.values(customerServiceData.maintenance).reduce((sum, val) => sum + val, 0)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* كرت رضا العملاء */}
        <Card className="md:col-span-2 border-0 bg-[#1a1c23] text-white">
          <CardHeader className="pb-2 border-b border-gray-800">
            <CardTitle className="text-base sm:text-lg font-bold text-white">رضا العملاء عن الخدمات</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              {[
                {
                  title: 'رضا العملاء عن الخدمات',
                  value: calculateSatisfactionPercentage(maintenanceSatisfaction.serviceQuality)
                },
                {
                  title: 'رضا العملاء عن مدة الإغلاق',
                  value: calculateSatisfactionPercentage(maintenanceSatisfaction.closureTime)
                },
                {
                  title: 'نسبة الحل من أول مرة',
                  value: calculateSatisfactionPercentage(maintenanceSatisfaction.firstTimeResolution)
                }
              ].map((item, index) => (
                <div 
                  key={index} 
                  className={`text-center p-4 sm:p-6 rounded-xl transition-all duration-300 ${getColorByPercentage(item.value)}`}
                >
                  <div className="text-3xl sm:text-4xl mb-2">{getSatisfactionEmoji(item.value)}</div>
                  <div className="text-2xl sm:text-3xl font-bold mb-2">
                    {item.value.toFixed(1)}%
                  </div>
                  <div className="text-xs sm:text-sm opacity-90">{item.title}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* كرت ملاحظات العملاء */}
        <Card className="md:col-span-3 border-0 bg-[#1a1c23] text-white">
          <CardHeader className="pb-2 border-b border-gray-800">
            <CardTitle className="text-base sm:text-lg font-bold text-white">ملاحظات العملاء</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              {Array.isArray(maintenanceSatisfaction.comments) ? 
                maintenanceSatisfaction.comments.map((comment, index) => (
                  <div key={index} className="group p-3 bg-[#252832] rounded-lg flex justify-between items-start">
                    <div className="flex-1">
                      <div className="text-sm sm:text-base">{comment.text}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {comment.date} - {comment.time}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteComment(index)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 hover:bg-red-500/20 rounded-full"
                      title="حذف الملاحظة"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )) : 
                <div className="p-3 bg-[#252832] rounded-lg text-sm sm:text-base">
                  {maintenanceSatisfaction.comments}
                </div>
              }
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};