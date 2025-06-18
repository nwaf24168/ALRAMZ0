import {
  supabase,
  MetricRecord,
  CustomerServiceRecord,
  SatisfactionRecord,
  CommentRecord,
  ComplaintRecord,
  ComplaintUpdateRecord,
  BookingRecord,
  UserRecord,
} from "./supabase";
import {
  MetricData,
  CustomerServiceData,
  MaintenanceSatisfactionData,
} from "@/context/MetricsContext";
import { RealtimeChannel } from "@supabase/supabase-js";

export class DataService {
  // حفظ وتحديث المؤشرات
  static async saveMetric(
    metricData: MetricData,
    index: number,
    period: "weekly" | "yearly",
  ): Promise<void> {
    const record: MetricRecord = {
      period,
      metric_index: index,
      title: metricData.title,
      value: metricData.value,
      target: metricData.target,
      change: metricData.change,
      is_positive: metricData.isPositive,
      reached_target: metricData.reachedTarget,
      is_lower_better: metricData.isLowerBetter,
    };

    const { error } = await supabase
      .from("metrics")
      .upsert(record, { onConflict: "period,metric_index" });

    if (error) {
      console.error("خطأ Supabase في حفظ المؤشر:", error);
      throw new Error(
        `خطأ في حفظ المؤشر: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }
  }

  // جلب المؤشرات
  static async getMetrics(
    period: "weekly" | "yearly",
  ): Promise<MetricRecord[]> {
    const { data, error } = await supabase
      .from("metrics")
      .select("*")
      .eq("period", period)
      .order("metric_index");

    if (error) {
      console.error("خطأ Supabase في جلب المؤشرات:", error);
      throw new Error(
        `خطأ في جلب المؤشرات: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }

    return data || [];
  }

  // حفظ وتحديث بيانات خدمة العملاء
  static async saveCustomerService(
    data: CustomerServiceData,
    period: "weekly" | "yearly",
  ): Promise<void> {
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
      in_progress_maintenance: data.maintenance.inProgress,
    };

    const { error } = await supabase
      .from("customer_service")
      .upsert(record, { onConflict: "period" });

    if (error) {
      console.error("خطأ Supabase في حفظ خدمة العملاء:", error);
      throw new Error(
        `خطأ في حفظ بيانات خدمة العملاء: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }
  }

  // جلب بيانات خدمة العملاء
  static async getCustomerService(
    period: "weekly" | "yearly",
  ): Promise<CustomerServiceData> {
    const { data, error } = await supabase
      .from("customer_service")
      .select("*")
      .eq("period", period)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("خطأ Supabase في جلب خدمة العملاء:", error);
      throw new Error(
        `خطأ في جلب بيانات خدمة العملاء: ${error.message || error.details || "خطأ غير معروف"}`,
      );
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
      };
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
        total: data.total,
      },
      inquiries: {
        general: data.general_inquiries,
        documentRequests: data.document_requests,
        deedInquiries: data.deed_inquiries,
        apartmentRentals: data.apartment_rentals,
        soldProjects: data.sold_projects,
      },
      maintenance: {
        cancelled: data.cancelled_maintenance,
        resolved: data.resolved_maintenance,
        inProgress: data.in_progress_maintenance,
      },
    };
  }

  // حفظ وتحديث بيانات رضا العملاء
  static async saveSatisfaction(
    data: MaintenanceSatisfactionData,
    period: "weekly" | "yearly",
  ): Promise<void> {
    const categories = [
      "serviceQuality",
      "closureTime",
      "firstTimeResolution",
    ] as const;

    for (const category of categories) {
      const categoryData = data[category];
      const record: SatisfactionRecord = {
        period,
        category,
        very_happy: categoryData.veryHappy,
        happy: categoryData.happy,
        neutral: categoryData.neutral,
        unhappy: categoryData.unhappy,
        very_unhappy: categoryData.veryUnhappy,
      };

      const { error } = await supabase
        .from("satisfaction")
        .upsert(record, { onConflict: "period,category" });

      if (error) {
        console.error(`خطأ Supabase في حفظ الرضا للفئة ${category}:`, error);
        throw new Error(
          `خطأ في حفظ بيانات الرضا للفئة ${category}: ${error.message || error.details || "خطأ غير معروف"}`,
        );
      }
    }
  }

  // جلب بيانات رضا العملاء
  static async getSatisfaction(
    period: "weekly" | "yearly",
  ): Promise<MaintenanceSatisfactionData> {
    const { data, error } = await supabase
      .from("satisfaction")
      .select("*")
      .eq("period", period);

    if (error) {
      console.error("خطأ Supabase في جلب بيانات الرضا:", error);
      throw new Error(
        `خطأ في جلب بيانات الرضا: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }

    const defaultCategoryData = {
      veryHappy: 0,
      happy: 0,
      neutral: 0,
      unhappy: 0,
      veryUnhappy: 0,
    };

    const result: MaintenanceSatisfactionData = {
      comments: [],
      serviceQuality: { ...defaultCategoryData },
      closureTime: { ...defaultCategoryData },
      firstTimeResolution: { ...defaultCategoryData },
    };

    if (data) {
      data.forEach((record) => {
        result[record.category as keyof MaintenanceSatisfactionData] = {
          veryHappy: record.very_happy,
          happy: record.happy,
          neutral: record.neutral,
          unhappy: record.unhappy,
          veryUnhappy: record.very_unhappy,
        };
      });
    }

    return result;
  }

  // حفظ تعليق جديد
  static async saveComment(
    text: string,
    username: string,
    period: "weekly" | "yearly",
  ): Promise<void> {
    const record: CommentRecord = {
      period,
      text,
      username,
    };

    const { error } = await supabase.from("comments").insert(record);

    if (error) {
      console.error("خطأ Supabase في حفظ التعليق:", error);
      throw new Error(
        `خطأ في حفظ التعليق: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }
  }

  // جلب التعليقات
  static async getComments(period: "weekly" | "yearly"): Promise<
    Array<{
      text: string;
      date: string;
      time: string;
      username: string;
    }>
  > {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("period", period)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("خطأ Supabase في جلب التعليقات:", error);
      throw new Error(
        `خطأ في جلب التعليقات: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }

    return (data || []).map((comment) => ({
      text: comment.text,
      date: new Date(comment.created_at!).toLocaleDateString("ar-EG"),
      time: new Date(comment.created_at!).toLocaleTimeString("ar-EG"),
      username: comment.username,
    }));
  }

  // حذف تعليق
  static async deleteComment(commentId: number): Promise<void> {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("خطأ Supabase في حذف التعليق:", error);
      throw new Error(
        `خطأ في حذف التعليق: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }
  }

  // حذف تعليق بالنص والمستخدم (للتوافق مع الواجهة الحالية)
  static async deleteCommentByContent(
    text: string,
    username: string,
    period: "weekly" | "yearly",
  ): Promise<void> {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("text", text)
      .eq("username", username)
      .eq("period", period);

    if (error) {
      console.error("خطأ Supabase في حذف التعليق:", error);
      throw new Error(
        `خطأ في حذف التعليق: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }
  }

  // إدارة الشكاوى
  static async saveComplaint(complaint: any): Promise<void> {
    const record: ComplaintRecord = {
      complaint_id: complaint.id,
      date: complaint.date,
      customer_name: complaint.customerName,
      project: complaint.project,
      unit_number: complaint.unitNumber,
      source: complaint.source,
      status: complaint.status,
      description: complaint.description,
      action: complaint.action,
      duration: complaint.duration || 0,
      created_by: complaint.createdBy,
      updated_by: complaint.updatedBy,
    };

    // التحقق إذا كانت الشكوى موجودة مسبقاً
    const { data: existingComplaint } = await supabase
      .from("complaints")
      .select("id")
      .eq("complaint_id", complaint.id)
      .single();

    if (existingComplaint) {
      // تحديث الشكوى الموجودة
      const { error } = await supabase
        .from("complaints")
        .update(record)
        .eq("complaint_id", complaint.id);

      if (error) {
        console.error("خطأ Supabase في تحديث الشكوى:", error);
        throw new Error(
          `خطأ في تحديث الشكوى: ${error.message || error.details || "خطأ غير معروف"}`,
        );
      }
    } else {
      // إضافة شكوى جديدة
      const { error } = await supabase
        .from("complaints")
        .insert(record);

      if (error) {
        console.error("خطأ Supabase في إضافة الشكوى:", error);
        throw new Error(
          `خطأ في إضافة الشكوى: ${error.message || error.details || "خطأ غير معروف"}`,
        );
      }
    }
  }

  static async getComplaints(): Promise<any[]> {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("خطأ Supabase في جلب الشكاوى:", error);
      throw new Error(
        `خطأ في جلب الشكاوى: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }

    return (data || []).map((record) => ({
      id: record.complaint_id,
      date: record.date,
      customerName: record.customer_name,
      project: record.project,
      unitNumber: record.unit_number || "",
      source: record.source,
      status: record.status,
      description: record.description,
      action: record.action || "",
      duration: record.duration || 0,
      createdBy: record.created_by,
      updatedBy: record.updated_by,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
      updates: [],
    }));
  }

  static async deleteComplaint(complaintId: string): Promise<void> {
    const { error } = await supabase
      .from("complaints")
      .delete()
      .eq("complaint_id", complaintId);

    if (error) {
      console.error("خطأ Supabase في حذف الشكوى:", error);
      throw new Error(
        `خطأ في حذف الشكوى: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }
  }

  // إدارة الحجوزات والتسليم
  static async saveBooking(booking: any): Promise<void> {
    const record: BookingRecord = {
      booking_id: booking.id,
      booking_date: booking.bookingDate,
      customer_name: booking.customerName,
      project: booking.project,
      building: booking.building,
      unit: booking.unit,
      payment_method: booking.paymentMethod,
      sale_type: booking.saleType,
      unit_value: booking.unitValue,
      transfer_date: booking.transferDate,
      sales_employee: booking.salesEmployee,
      construction_end_date: booking.constructionEndDate,
      final_receipt_date: booking.finalReceiptDate,
      electricity_transfer_date: booking.electricityTransferDate,
      water_transfer_date: booking.waterTransferDate,
      delivery_date: booking.deliveryDate,
      status: booking.status,
      status_sales_filled: booking.status_sales_filled,
      status_projects_filled: booking.status_projects_filled,
      status_customer_filled: booking.status_customer_filled,
      is_evaluated: booking.isEvaluated || false,
      evaluation_score: booking.evaluationScore,
    };

    // التحقق إذا كان الحجز موجود مسبقاً
    const { data: existingBooking } = await supabase
      .from("bookings")
      .select("id")
      .eq("booking_id", booking.id)
      .single();

    if (existingBooking) {
      // تحديث الحجز الموجود
      const { error } = await supabase
        .from("bookings")
        .update(record)
        .eq("booking_id", booking.id);

      if (error) {
        console.error("خطأ Supabase في تحديث الحجز:", error);
        throw new Error(
          `خطأ في تحديث الحجز: ${error.message || error.details || "خطأ غير معروف"}`,
        );
      }
    } else {
      // إضافة حجز جديد
      const { error } = await supabase
        .from("bookings")
        .insert(record);

      if (error) {
        console.error("خطأ Supabase في إضافة الحجز:", error);
        throw new Error(
          `خطأ في إضافة الحجز: ${error.message || error.details || "خطأ غير معروف"}`,
        );
      }
    }
  }

  static async getBookings(): Promise<any[]> {
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("خطأ Supabase في جلب الحجوزات:", error);
      throw new Error(
        `خطأ في جلب الحجوزات: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }

    return (data || []).map((record) => ({
      id: record.booking_id,
      bookingDate: record.booking_date,
      customerName: record.customer_name,
      project: record.project,
      building: record.building || "",
      unit: record.unit,
      paymentMethod: record.payment_method,
      saleType: record.sale_type,
      unitValue: record.unit_value,
      transferDate: record.transfer_date || "",
      salesEmployee: record.sales_employee,
      constructionEndDate: record.construction_end_date || "",
      finalReceiptDate: record.final_receipt_date || "",
      electricityTransferDate: record.electricity_transfer_date || "",
      waterTransferDate: record.water_transfer_date || "",
      deliveryDate: record.delivery_date || "",
      status: record.status,
      status_sales_filled: record.status_sales_filled,
      status_projects_filled: record.status_projects_filled,
      status_customer_filled: record.status_customer_filled,
      isEvaluated: record.is_evaluated,
      evaluationScore: record.evaluation_score,
    }));
  }

  static async deleteBooking(bookingId: string): Promise<void> {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("booking_id", bookingId);

    if (error) {
      console.error("خطأ Supabase في حذف الحجز:", error);
      throw new Error(
        `خطأ في حذف الحجز: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }
  }

  // إدارة المستخدمين
  static async saveUser(user: any): Promise<void> {
    const record: UserRecord = {
      username: user.username,
      password: user.password,
      role: user.role,
    };

    // التحقق إذا كان المستخدم موجود مسبقاً
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("username", user.username)
      .single();

    if (existingUser) {
      // تحديث المستخدم الموجود
      const { error } = await supabase
        .from("users")
        .update(record)
        .eq("username", user.username);

      if (error) {
        console.error("خطأ Supabase في تحديث المستخدم:", error);
        throw new Error(
          `خطأ في تحديث المستخدم: ${error.message || error.details || "خطأ غير معروف"}`,
        );
      }
    } else {
      // إضافة مستخدم جديد
      const { error } = await supabase
        .from("users")
        .insert(record);

      if (error) {
        console.error("خطأ Supabase في إضافة المستخدم:", error);
        throw new Error(
          `خطأ في إضافة المستخدم: ${error.message || error.details || "خطأ غير معروف"}`,
        );
      }
    }
  }

  static async getUsers(): Promise<any[]> {
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("خطأ Supabase في جلب المستخدمين:", error);
      throw new Error(
        `خطأ في جلب المستخدمين: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }

    return (data || []).map((record) => ({
      id: record.user_id,
      username: record.username,
      password: record.password_hash,
      role: record.role,
    }));
  }

  static async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase
      .from("users")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("خطأ Supabase في حذف المستخدم:", error);
      throw new Error(
        `خطأ في حذف المستخدم: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }
  }

  // إعداد الاشتراكات للوقت الفعلي
  static setupRealtimeSubscription(
    table: string,
    callback: (payload: any) => void,
  ): RealtimeChannel {
    const channel = supabase
      .channel(`public:${table}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: table,
        },
        callback,
      )
      .subscribe();

    return channel;
  }

  static removeRealtimeSubscription(channel: RealtimeChannel): void {
    supabase.removeChannel(channel);
  }
}
