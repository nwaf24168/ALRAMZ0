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

export interface User {
  id: string;
  username: string;
  password?: string;
  role: string;
  permissions: {
    level: string;
    scope: string;
    pages: string[];
  };
}

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

      // حفظ التحديثات إذا كانت موجودة
      if (complaint.updates && complaint.updates.length > 0) {
        for (const update of complaint.updates) {
          const updateRecord = {
            complaint_id: complaint.id,
            field_name: update.field,
            old_value: update.oldValue || '',
            new_value: update.newValue || '',
            updated_by: update.updatedBy,
            updated_at: update.updatedAt || new Date().toISOString()
          };

          console.log('حفظ تحديث الشكوى:', updateRecord);

          const { data, error: updateError } = await supabase
            .from("complaint_updates")
            .insert(updateRecord)
            .select();

          if (updateError) {
            console.error("خطأ في حفظ تحديث الشكوى:", updateError);
            throw new Error(
              `خطأ في حفظ تحديث الشكوى: ${updateError.message || updateError.details || "خطأ غير معروف"}`,
            );
          } else {
            console.log('تم حفظ التحديث بنجاح:', data);
          }
        }
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

    const complaints = await Promise.all((data || []).map(async (record) => {
      // جلب التحديثات لكل شكوى
      const { data: updatesData, error: updatesError } = await supabase
        .from("complaint_updates")
        .select("*")
        .eq("complaint_id", record.complaint_id)
        .order("updated_at", { ascending: false });

      let updates = [];
      if (updatesError) {
        console.error("خطأ في جلب تحديثات الشكوى:", updatesError);
        // في حالة وجود خطأ، نعيد مصفوفة فارغة بدلاً من التوقف
        updates = [];
      } else {
        updates = (updatesData || []).map(update => ({
          field: update.field_name,
          oldValue: update.old_value || '',
          newValue: update.new_value || '',
          updatedBy: update.updated_by,
          updatedAt: update.updated_at || new Date().toISOString(),
        }));
      }

      console.log(`تحديثات الشكوى ${record.complaint_id}:`, updates);

      return {
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
        updates: updates,
      };
    }));

    return complaints;
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

  // إدارة الحجوزات
  static async getBookings(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("خطأ Supabase في جلب الحجوزات:", error);
        throw new Error(
          `خطأ في جلب الحجوزات: ${error.message || error.details || "خطأ غير معروف"}`
        );
      }

      return (data || []).map((record) => ({
        id: record.booking_id,
        bookingDate: record.booking_date,
        customerName: record.customer_name,
        project: record.project,
        building: record.building,
        unit: record.unit,
        paymentMethod: record.payment_method,
        saleType: record.sale_type,
        unitValue: record.unit_value,
        transferDate: record.transfer_date,
        salesEmployee: record.sales_employee,
        constructionEndDate: record.construction_end_date,
        finalReceiptDate: record.final_receipt_date,
        electricityTransferDate: record.electricity_transfer_date,
        waterTransferDate: record.water_transfer_date,
        deliveryDate: record.delivery_date,
        status: record.status,
        status_sales_filled: record.status_sales_filled,
        status_projects_filled: record.status_projects_filled,
        status_customer_filled: record.status_customer_filled,
        isEvaluated: record.is_evaluated,
        evaluationScore: record.evaluation_score,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        createdBy: record.created_by,
        updatedBy: record.updated_by,
      }));
    } catch (error) {
      console.error('خطأ في جلب الحجوزات:', error);
      return [];
    }
  }

  static async saveBooking(booking: any): Promise<void> {
    try {
      const record: BookingRecord = {
        booking_id: booking.id,
        booking_date: booking.bookingDate,
        customer_name: booking.customerName,
        project: booking.project,
        building: booking.building || "1",
        unit: booking.unit,
        payment_method: booking.paymentMethod,
        sale_type: booking.saleType,
        unit_value: booking.unitValue || 0,
        transfer_date: booking.transferDate,
        sales_employee: booking.salesEmployee,
        construction_end_date: booking.constructionEndDate,
        final_receipt_date: booking.finalReceiptDate,
        electricity_transfer_date: booking.electricityTransferDate,
        water_transfer_date: booking.waterTransferDate,
        delivery_date: booking.deliveryDate,
        status: booking.status || "مجدول",
        status_sales_filled: booking.status_sales_filled || false,
        status_projects_filled: booking.status_projects_filled || false,
        status_customer_filled: booking.status_customer_filled || false,
        is_evaluated: booking.isEvaluated || false,
        evaluation_score: booking.evaluationScore,
        created_by: booking.createdBy,
      };

      const { error } = await supabase
        .from("bookings")
        .insert(record);

      if (error) {
        console.error("خطأ Supabase في حفظ الحجز:", error);
        throw new Error(
          `خطأ في حفظ الحجز: ${error.message || error.details || "خطأ غير معروف"}`
        );
      }
    } catch (error) {
      console.error('خطأ في حفظ الحجز:', error);
      throw error;
    }
  }

    static async updateBooking(id: string, booking: any): Promise<void> {
    try {
      const record: Partial<BookingRecord> = {
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
        is_evaluated: booking.isEvaluated,
        evaluation_score: booking.evaluationScore,
        updated_by: booking.updatedBy,
      };

      const { error } = await supabase
        .from("bookings")
        .update(record)
        .eq("booking_id", id);

      if (error) {
        console.error("خطأ Supabase في تحديث الحجز:", error);
        throw new Error(
          `خطأ في تحديث الحجز: ${error.message || error.details || "خطأ غير معروف"}`
        );
      }
    } catch (error) {
      console.error('خطأ في تحديث الحجز:', error);
      throw error;
    }
  }

  static async deleteBooking(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("bookings")
        .delete()
        .eq("booking_id", id);

      if (error) {
        console.error("خطأ Supabase في حذف الحجز:", error);
        throw new Error(
          `خطأ في حذف الحجز: ${error.message || error.details || "خطأ غير معروف"}`
        );
      }
    } catch (error) {
      console.error('خطأ في حذف الحجز:', error);
      throw error;
    }
  }

  // إدارة المستخدمين
  static async saveUser(user: any): Promise<any> {
    try {
      // إعداد البيانات للإدراج/التحديث
      const record: Partial<UserRecord> = {
        username: user.username,
        password: user.password,
        role: user.role,
        permissions: JSON.stringify(user.permissions || {
          level: "read",
          scope: "full",
          pages: []
        })
      };

      // إذا كان المستخدم له id صالح ولا يبدأ بـ temp، نحدثه
      if (user.id && user.id !== "" && !user.id.toString().startsWith("temp") && !user.id.toString().startsWith("175")) {
        console.log("تحديث مستخدم موجود بـ id:", user.id);

        // التحقق من وجود المستخدم أولاً
        const { data: existingUserCheck, error: checkError } = await supabase
          .from("users")
          .select("id")
          .eq("id", user.id)
          .maybeSingle();

        if (checkError && checkError.code !== "PGRST116") {
          console.error("خطأ في التحقق من وجود المستخدم:", checkError);
          throw new Error(`خطأ في التحقق من المستخدم: ${checkError.message}`);
        }

        if (!existingUserCheck) {
          console.log("المستخدم غير موجود، سيتم إنشاؤه كمستخدم جديد");
          // إذا لم يوجد المستخدم، ننشئه كمستخدم جديد
          const insertRecord = { ...record };
          delete insertRecord.id;

          const { data, error } = await supabase
            .from("users")
            .insert(insertRecord)
            .select()
            .single();

          if (error) {
            console.error("خطأ Supabase في إنشاء المستخدم:", error);
            throw new Error(
              `خطأ في إنشاء المستخدم: ${error.message || error.details || "خطأ غير معروف"}`,
            );
          }
          return data;
        } else {
          // تحديث المستخدم الموجود
          const { data, error } = await supabase
            .from("users")
            .update(record)
            .eq("id", user.id)
            .select()
            .single();

          if (error) {
            console.error("خطأ Supabase في تحديث المستخدم:", error);
            throw new Error(
              `خطأ في تحديث المستخدم: ${error.message || error.details || "خطأ غير معروف"}`,
            );
          }
          return data;
        }
      } else {
        // التحقق إذا كان المستخدم موجود مسبقاً بنفس اسم المستخدم
        console.log("البحث عن مستخدم بنفس الاسم:", user.username);
        const { data: existingUser, error: searchError } = await supabase
          .from("users")
          .select("id")
          .eq("username", user.username)
          .maybeSingle();

        if (searchError && searchError.code !== "PGRST116") {
          console.error("خطأ في البحث عن المستخدم:", searchError);
          throw new Error(`خطأ في البحث عن المستخدم: ${searchError.message}`);
        }

        if (existingUser) {
          // تحديث المستخدم الموجود
          console.log("تحديث مستخدم موجود:", existingUser.id);
          const { data, error } = await supabase
            .from("users")
            .update(record)
            .eq("id", existingUser.id)
            .select()
            .single();

          if (error) {
            console.error("خطأ Supabase في تحديث المستخدم الموجود:", error);
            throw new Error(
              `خطأ في تحديث المستخدم: ${error.message || error.details || "خطأ غير معروف"}`,
            );
          }
          return data;
        } else {
          // إضافة مستخدم جديد تماماً (Supabase سيولد id تلقائياً)
          console.log("إضافة مستخدم جديد:", record);

          // التأكد من عدم إرسال id في البيانات
          const insertRecord = { ...record };
          delete insertRecord.id;

          const { data, error } = await supabase
            .from("users")
            .insert(insertRecord)
            .select()
            .single();

          if (error) {
            console.error("خطأ Supabase في إضافة المستخدم الجديد:", error);

            // إذا كان الخطأ متعلق بالـ id، نحاول مرة أخرى مع تحديد id يدوياً
            if (error.code === "23502" && error.message.includes("id")) {
              console.log("محاولة إضافة مستخدم بـ id تسلسلي...");

              // الحصول على أعلى id موجود
              const { data: maxIdData } = await supabase
                .from("users")
                .select("id")
                .order("id", { ascending: false })
                .limit(1)
                .single();

              const nextId = maxIdData ? maxIdData.id + 1 : 1;

              const recordWithId = { ...insertRecord, id: nextId };
              const { data: retryData, error: retryError } = await supabase
                .from("users")
                .insert(recordWithId)
                .select()
                .single();

              if (retryError) {
                console.error("خطأ في المحاولة الثانية:", retryError);
                throw new Error(
                  `خطأ في إضافة المستخدم: ${retryError.message || retryError.details || "خطأ غير معروف"}`,
                );
              }
              return retryData;
            }

            throw new Error(
              `خطأ في إضافة المستخدم: ${error.message || error.details || "خطأ غير معروف"}`,
            );
          }
          return data;
        }
      }
    } catch (error) {
      console.error("خطأ عام في saveUser:", error);
      throw error;
    }
  }

  // إدارة سجلات الاستقبال
  static async saveReceptionRecord(record: any): Promise<void> {
    const { error } = await supabase
      .from("reception_records")
      .insert({
        date: record.date,
        customer_name: record.customerName,
        phone_number: record.phoneNumber,
        project: record.project,
        employee: record.employee,
        contact_method: record.contactMethod,
        type: record.type,
        customer_request: record.customerRequest,
        action: record.action,
        status: record.status || 'جديد',
        created_by: record.createdBy,
      });

    if (error) {
      console.error("خطأ Supabase في حفظ سجل الاستقبال:", error);
      throw new Error(
        `خطأ في حفظ سجل الاستقبال: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }
  }

  static async getReceptionRecords(): Promise<any[]> {
    const { data, error } = await supabase
      .from("reception_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("خطأ Supabase في جلب سجلات الاستقبال:", error);
      throw new Error(
        `خطأ في جلب سجلات الاستقبال: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }

    return data || [];
  }

  static async updateReceptionRecord(id: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from("reception_records")
      .update({
        ...updates,
        updated_by: updates.updatedBy,
      })
      .eq("id", id);

    if (error) {
      console.error("خطأ Supabase في تحديث سجل الاستقبال:", error);
      throw new Error(
        `خطأ في تحديث سجل الاستقبال: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }
  }

  static async deleteReceptionRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from("reception_records")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("خطأ Supabase في حذف سجل الاستقبال:", error);
      throw new Error(
        `خطأ في حذف سجل الاستقبال: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }
  }

  // إدارة مكالمات الجودة
  static async saveQualityCall(record: any): Promise<void> {
    const { error } = await supabase
      .from("quality_calls")
      .insert({
        call_id: record.callId,
        call_date: record.callDate,
        customer_name: record.customerName,
        phone_number: record.phoneNumber,
        project: record.project || 'مشروع افتراضي',
        unit_number: record.unitNumber,
        call_type: record.callType || 'مكالمة جودة',
        call_duration: record.callDuration,
        evaluation_score: record.evaluationScore,
        qualification_status: record.qualificationStatus || 'غير مؤهل',
        qualification_reason: record.qualificationReason,
        notes: record.notes,
        created_by: record.createdBy || 'مجهول'
      });

    if (error) {
      console.error("خطأ Supabase في حفظ مكالمة الجودة:", error);
      throw new Error(
        `خطأ في حفظ مكالمة الجودة: ${error.message || error.details || "خطأ غير معروف"}`
      );
    }
  }

  static async getQualityCalls(): Promise<any[]> {
    const { data, error } = await supabase
      .from("quality_calls")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("خطأ Supabase في جلب مكالمات الجودة:", error);
      throw new Error(
        `خطأ في جلب مكالمات الجودة: ${error.message || error.details || "خطأ غير معروف"}`
      );
    }

    return data || [];
  }

  static async updateQualityCall(id: string, updates: any): Promise<void> {
    const { error } = await supabase
      .from("quality_calls")
      .update({
        ...updates,
        updated_by: updates.updatedBy,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);

    if (error) {
      console.error("خطأ Supabase في تحديث مكالمة الجودة:", error);
      throw new Error(
        `خطأ في تحديث مكالمة الجودة: ${error.message || error.details || "خطأ غير معروف"}`
      );
    }
  }

  static async deleteQualityCall(id: string): Promise<void> {
    const { error } = await supabase
      .from("quality_calls")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("خطأ Supabase في حذف مكالمة الجودة:", error);
      throw new Error(
        `خطأ في حذف مكالمة الجودة: ${error.message || error.details || "خطأ غير معروف"}`
      );
    }
  }

  static async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('خطأ في جلب المستخدمين:', error);
      throw new Error(`فشل في جلب المستخدمين: ${error.message}`);
    }

    return data?.map(user => ({
      id: user.id.toString(),
      username: user.username,
      password: user.password,
      role: user.role,
      permissions: typeof user.permissions === 'string' 
        ? JSON.parse(user.permissions) 
        : user.permissions || { level: 'read', scope: 'full', pages: [] }
    })) || [];
  }

  static async createUser(userData: Omit<User, 'id'>): Promise<User> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{
          username: userData.username,
          password: userData.password,
          role: userData.role,
          permissions: JSON.stringify(userData.permissions)
        }])
        .select()
        .single();

      if (error) {
        console.error('خطأ في إنشاء المستخدم:', error);
        throw new Error(`فشل في إنشاء المستخدم: ${error.message}`);
      }

      return {
        id: data.id.toString(),
        username: data.username,
        password: data.password,
        role: data.role,
        permissions: typeof data.permissions === 'string' 
          ? JSON.parse(data.permissions) 
          : data.permissions || { level: 'read', scope: 'full', pages: [] }
      };
    } catch (error) {
      console.error('خطأ عام في إنشاء المستخدم:', error);
      throw error;
    }
  }

  static async updateUser(id: string, userData: Partial<Omit<User, 'id'>>): Promise<User> {
    const updateData: any = {};

    if (userData.username) updateData.username = userData.username;
    if (userData.password) updateData.password = userData.password;
    if (userData.role) updateData.role = userData.role;
    if (userData.permissions) updateData.permissions = JSON.stringify(userData.permissions);

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', parseInt(id))
      .select()
      .single();

    if (error) {
      console.error('خطأ في تحديث المستخدم:', error);
      throw new Error(`فشل في تحديث المستخدم: ${error.message}`);
    }

    return {
      id: data.id.toString(),
      username: data.username,
      password: data.password,
      role: data.role,
      permissions: typeof data.permissions === 'string' 
        ? JSON.parse(data.permissions) 
        : data.permissions || { level: 'read', scope: 'full', pages: [] }
    };
  }

  static async deleteUser(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', parseInt(id));

    if (error) {
      console.error('خطأ في حذف المستخدم:', error);
      throw new Error(`فشل في حذف المستخدم: ${error.message}`);
    }
  }

  static async resetUserPassword(id: string, newPassword: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ 
        password: newPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(id));

    if (error) {
      console.error('خطأ في إعادة تعيين كلمة المرور:', error);
      throw new Error(`فشل في إعادة تعيين كلمة المرور: ${error.message}`);
    }
  }

  static async updateUserPermissions(id: string, permissions: User['permissions']): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ 
        permissions: JSON.stringify(permissions),
        updated_at: new Date().toISOString()
      })
      .eq('id', parseInt(id));

    if (error) {
      console.error('خطأ في تحديث صلاحيات المستخدم:', error);
      throw new Error(`فشل في تحديث صلاحيات المستخدم: ${error.message}`);
    }
  }

  static async authenticateUser(username: string, password: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('username', username)
      .eq('password', password)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // لا يوجد مستخدم بهذه البيانات
        return null;
      }
      console.error('خطأ في المصادقة:', error);
      throw new Error(`فشل في المصادقة: ${error.message}`);
    }

    return {
      id: data.id.toString(),
      username: data.username,
      password: data.password,
      role: data.role,
      permissions: typeof data.permissions === 'string' 
        ? JSON.parse(data.permissions) 
        : data.permissions || { level: 'read', scope: 'full', pages: [] }
    };
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