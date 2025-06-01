
import { supabase, MetricRecord, CustomerServiceRecord, SatisfactionRecord, CommentRecord } from './supabase'
import { MetricData, CustomerServiceData, MaintenanceSatisfactionData } from '@/context/MetricsContext'

// نوع البيانات للاشتراكات
type RealtimeCallback = () => void

export class DataService {
  private static realtimeCallbacks: RealtimeCallback[] = []

  // إضافة callback للاستماع للتحديثات
  static addRealtimeCallback(callback: RealtimeCallback) {
    this.realtimeCallbacks.push(callback)
  }

  // إزالة callback
  static removeRealtimeCallback(callback: RealtimeCallback) {
    this.realtimeCallbacks = this.realtimeCallbacks.filter(cb => cb !== callback)
  }

  // تشغيل جميع callbacks عند التحديث
  private static triggerCallbacks() {
    this.realtimeCallbacks.forEach(callback => {
      try {
        callback()
      } catch (error) {
        console.error('خطأ في تشغيل callback:', error)
      }
    })
  }

  // إعداد الاشتراكات الفورية
  static setupRealtimeSubscriptions() {
    // الاشتراك في تحديثات المؤشرات
    supabase
      .channel('metrics_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'metrics'
      }, () => {
        console.log('تم تحديث المؤشرات في الوقت الفعلي')
        this.triggerCallbacks()
      })
      .subscribe()

    // الاشتراك في تحديثات خدمة العملاء
    supabase
      .channel('customer_service_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'customer_service'
      }, () => {
        console.log('تم تحديث بيانات خدمة العملاء في الوقت الفعلي')
        this.triggerCallbacks()
      })
      .subscribe()

    // الاشتراك في تحديثات الرضا
    supabase
      .channel('satisfaction_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'satisfaction'
      }, () => {
        console.log('تم تحديث بيانات الرضا في الوقت الفعلي')
        this.triggerCallbacks()
      })
      .subscribe()

    // الاشتراك في تحديثات التعليقات
    supabase
      .channel('comments_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'comments'
      }, () => {
        console.log('تم تحديث التعليقات في الوقت الفعلي')
        this.triggerCallbacks()
      })
      .subscribe()

    console.log('تم إعداد الاشتراكات الفورية بنجاح')
  }
  // حفظ وتحديث المؤشرات
  static async saveMetric(metricData: MetricData, index: number, period: 'weekly' | 'yearly'): Promise<void> {
    const record: MetricRecord = {
      period,
      metric_index: index,
      title: metricData.title,
      value: metricData.value,
      target: metricData.target,
      change: metricData.change,
      is_positive: metricData.isPositive,
      reached_target: metricData.reachedTarget,
      is_lower_better: metricData.isLowerBetter
    }

    const { error } = await supabase
      .from('metrics')
      .upsert(record, { onConflict: 'period,metric_index' })

    if (error) {
      console.error('خطأ Supabase في حفظ المؤشر:', error)
      throw new Error(`خطأ في حفظ المؤشر: ${error.message || error.details || 'خطأ غير معروف'}`)
    }
  }

  // جلب المؤشرات
  static async getMetrics(period: 'weekly' | 'yearly'): Promise<MetricRecord[]> {
    const { data, error } = await supabase
      .from('metrics')
      .select('*')
      .eq('period', period)
      .order('metric_index')

    if (error) {
      console.error('خطأ Supabase في جلب المؤشرات:', error)
      throw new Error(`خطأ في جلب المؤشرات: ${error.message || error.details || 'خطأ غير معروف'}`)
    }

    return data || []
  }

  // حفظ وتحديث بيانات خدمة العملاء
  static async saveCustomerService(data: CustomerServiceData, period: 'weekly' | 'yearly'): Promise<void> {
    const record: CustomerServiceRecord = {
      period,
      complaints: data.calls.complaints,
      contact_requests: data.calls.contactRequests,
      maintenance_requests: data.calls.maintenanceRequests,
      inquiries: data.calls.inquiries,
      office_interested: data.calls.officeInterested,
      projects_interested: data.calls.projectsInterested,
      customers_interested: data.calls.customersInterested,
      total: data.calls.total,
      general_inquiries: data.inquiries.general,
      document_requests: data.inquiries.documentRequests,
      deed_inquiries: data.inquiries.deedInquiries,
      apartment_rentals: data.inquiries.apartmentRentals,
      sold_projects: data.inquiries.soldProjects,
      cancelled_maintenance: data.maintenance.cancelled,
      resolved_maintenance: data.maintenance.resolved,
      in_progress_maintenance: data.maintenance.inProgress
    }

    const { error } = await supabase
      .from('customer_service')
      .upsert(record, { onConflict: 'period' })

    if (error) {
      console.error('خطأ Supabase في حفظ خدمة العملاء:', error)
      throw new Error(`خطأ في حفظ بيانات خدمة العملاء: ${error.message || error.details || 'خطأ غير معروف'}`)
    }
  }

  // جلب بيانات خدمة العملاء
  static async getCustomerService(period: 'weekly' | 'yearly'): Promise<CustomerServiceData> {
    const { data, error } = await supabase
      .from('customer_service')
      .select('*')
      .eq('period', period)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('خطأ Supabase في جلب خدمة العملاء:', error)
      throw new Error(`خطأ في جلب بيانات خدمة العملاء: ${error.message || error.details || 'خطأ غير معروف'}`)
    }

    if (!data) {
      // إرجاع البيانات الافتراضية إذا لم توجد بيانات
      return {
        calls: {
          complaints: 0,
          contactRequests: 0,
          maintenanceRequests: 0,
          inquiries: 0,
          officeInterested: 0,
          projectsInterested: 0,
          customersInterested: 0,
          total: 0
        },
        inquiries: {
          general: 0,
          documentRequests: 0,
          deedInquiries: 0,
          apartmentRentals: 0,
          soldProjects: 0
        },
        maintenance: {
          cancelled: 0,
          resolved: 0,
          inProgress: 0
        }
      }
    }

    return {
      calls: {
        complaints: data.complaints,
        contactRequests: data.contact_requests,
        maintenanceRequests: data.maintenance_requests,
        inquiries: data.inquiries,
        officeInterested: data.office_interested,
        projectsInterested: data.projects_interested,
        customersInterested: data.customers_interested,
        total: data.total
      },
      inquiries: {
        general: data.general_inquiries,
        documentRequests: data.document_requests,
        deedInquiries: data.deed_inquiries,
        apartmentRentals: data.apartment_rentals,
        soldProjects: data.sold_projects
      },
      maintenance: {
        cancelled: data.cancelled_maintenance,
        resolved: data.resolved_maintenance,
        inProgress: data.in_progress_maintenance
      }
    }
  }

  // حفظ وتحديث بيانات رضا العملاء
  static async saveSatisfaction(data: MaintenanceSatisfactionData, period: 'weekly' | 'yearly'): Promise<void> {
    const categories = ['serviceQuality', 'closureTime', 'firstTimeResolution'] as const

    for (const category of categories) {
      const categoryData = data[category]
      const record: SatisfactionRecord = {
        period,
        category,
        very_happy: categoryData.veryHappy,
        happy: categoryData.happy,
        neutral: categoryData.neutral,
        unhappy: categoryData.unhappy,
        very_unhappy: categoryData.veryUnhappy
      }

      const { error } = await supabase
        .from('satisfaction')
        .upsert(record, { onConflict: 'period,category' })

      if (error) {
        console.error(`خطأ Supabase في حفظ الرضا للفئة ${category}:`, error)
        throw new Error(`خطأ في حفظ بيانات الرضا للفئة ${category}: ${error.message || error.details || 'خطأ غير معروف'}`)
      }
    }
  }

  // جلب بيانات رضا العملاء
  static async getSatisfaction(period: 'weekly' | 'yearly'): Promise<MaintenanceSatisfactionData> {
    const { data, error } = await supabase
      .from('satisfaction')
      .select('*')
      .eq('period', period)

    if (error) {
      console.error('خطأ Supabase في جلب بيانات الرضا:', error)
      throw new Error(`خطأ في جلب بيانات الرضا: ${error.message || error.details || 'خطأ غير معروف'}`)
    }

    const defaultCategoryData = {
      veryHappy: 0,
      happy: 0,
      neutral: 0,
      unhappy: 0,
      veryUnhappy: 0
    }

    const result: MaintenanceSatisfactionData = {
      comments: [],
      serviceQuality: { ...defaultCategoryData },
      closureTime: { ...defaultCategoryData },
      firstTimeResolution: { ...defaultCategoryData }
    }

    if (data) {
      data.forEach(record => {
        result[record.category as keyof MaintenanceSatisfactionData] = {
          veryHappy: record.very_happy,
          happy: record.happy,
          neutral: record.neutral,
          unhappy: record.unhappy,
          veryUnhappy: record.very_unhappy
        }
      })
    }

    return result
  }

  // حفظ تعليق جديد
  static async saveComment(text: string, username: string, period: 'weekly' | 'yearly'): Promise<void> {
    const record: CommentRecord = {
      period,
      text,
      username
    }

    const { error } = await supabase
      .from('comments')
      .insert(record)

    if (error) {
      console.error('خطأ Supabase في حفظ التعليق:', error)
      throw new Error(`خطأ في حفظ التعليق: ${error.message || error.details || 'خطأ غير معروف'}`)
    }
  }

  // جلب التعليقات
  static async getComments(period: 'weekly' | 'yearly'): Promise<Array<{
    text: string;
    date: string;
    time: string;
    username: string;
  }>> {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('period', period)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('خطأ Supabase في جلب التعليقات:', error)
      throw new Error(`خطأ في جلب التعليقات: ${error.message || error.details || 'خطأ غير معروف'}`)
    }

    return (data || []).map(comment => ({
      text: comment.text,
      date: new Date(comment.created_at!).toLocaleDateString('ar-EG'),
      time: new Date(comment.created_at!).toLocaleTimeString('ar-EG'),
      username: comment.username
    }))
  }

  // حذف تعليق
  static async deleteComment(commentId: number): Promise<void> {
    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('خطأ Supabase في حذف التعليق:', error)
      throw new Error(`خطأ في حذف التعليق: ${error.message || error.details || 'خطأ غير معروف'}`)
    }
  }
}
