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
    // حساب المجموع تلقائياً وبدقة
    const calculatedTotal = (data.calls.complaints || 0) + 
                           (data.calls.contactRequests || 0) + 
                           (data.calls.maintenanceRequests || 0) + 
                           (data.calls.inquiries || 0) + 
                           (data.calls.officeInterested || 0) + 
                           (data.calls.projectsInterested || 0) + 
                           (data.calls.customersInterested || 0);

    console.log('حساب إجمالي المكالمات:', {
      complaints: data.calls.complaints,
      contactRequests: data.calls.contactRequests,
      maintenanceRequests: data.calls.maintenanceRequests,
      inquiries: data.calls.inquiries,
      officeInterested: data.calls.officeInterested,
      projectsInterested: data.calls.projectsInterested,
      customersInterested: data.calls.customersInterested,
      calculatedTotal: calculatedTotal
    });

    const record: CustomerServiceRecord = {
      period,
      complaints: data.calls.complaints || 0,
      contact_requests: data.calls.contactRequests || 0,
      maintenance_requests: data.calls.maintenanceRequests || 0,
      inquiries: data.calls.inquiries || 0,
      office_interested: data.calls.officeInterested || 0,
      projects_interested: data.calls.projectsInterested || 0,
      customers_interested: data.calls.customersInterested || 0,
      total: calculatedTotal,
      general_inquiries: data.inquiries.general || 0,
      document_requests: data.inquiries.documentRequests || 0,
      deed_inquiries: data.inquiries.deedInquiries || 0,
      apartment_rentals: data.inquiries.apartmentRentals || 0,
      sold_projects: data.inquiries.soldProjects || 0,
      cancelled_maintenance: data.maintenance.cancelled || 0,
      resolved_maintenance: data.maintenance.resolved || 0,
      in_progress_maintenance: data.maintenance.inProgress || 0,
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
      const defaultCalls = {
        complaints: 0,
        contactRequests: 0,
        maintenanceRequests: 0,
        inquiries: 0,
        officeInterested: 0,
        projectsInterested: 0,
        customersInterested: 0,
        total: 0,
      };

      return {
        calls: defaultCalls,
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

    const callsData = {
      complaints: data.complaints || 0,
      contactRequests: data.contact_requests || 0,
      maintenanceRequests: data.maintenance_requests || 0,
      inquiries: data.inquiries || 0,
      officeInterested: data.office_interested || 0,
      projectsInterested: data.projects_interested || 0,
      customersInterested: data.customers_interested || 0,
      total: data.total || 0,
    };

    // إعادة حساب المجموع للتأكد من دقته
    const recalculatedTotal = callsData.complaints + callsData.contactRequests + 
                            callsData.maintenanceRequests + callsData.inquiries + 
                            callsData.officeInterested + callsData.projectsInterested + 
                            callsData.customersInterested;

    // استخدام المجموع المحسوب إذا كان مختلفاً عن المحفوظ
    if (callsData.total !== recalculatedTotal) {
      console.log('تصحيح المجموع من', callsData.total, 'إلى', recalculatedTotal);
      callsData.total = recalculatedTotal;
    }

    return {
      calls: callsData,
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
      date: new Date(comment.created_at!).toLocaleDateString("en-CA"), // YYYY-MM-DD format
      time: new Date(comment.created_at!).toLocaleTimeString("en-US", { hour12: false }),
      username: comment.username,
    }));
  }

  // حذف تعليق حسب الـ ID
  static async deleteComment(id: number): Promise<void> {
    const { error } = await supabase.from("comments").delete().eq("id", id);

    if (error) {
      console.error("خطأ Supabase في حذف التعليق:", error);
      throw new Error(
        `خطأ في حذف التعليق: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }
  }

  // حذف تعليق حسب المحتوى والمستخدم والفترة
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
    const record = {
      complaint_id: complaint.id,
      priority: complaint.priority || 'متوسطة',
      date: complaint.date,
      customer_name: complaint.customerName,
      project: complaint.project,
      unit_number: complaint.unitNumber || null,
      source: complaint.source,
      status: complaint.status,
      request_number: complaint.requestNumber || null,
      description: complaint.description,
      maintenance_delivery_action: complaint.maintenanceDeliveryAction || null,
      action: complaint.action || null,
      duration: complaint.duration || 0,
      expected_closure_time: complaint.expectedClosureTime || null,
      created_at: complaint.createdAt || new Date().toISOString(),
      updated_at: complaint.updatedAt || new Date().toISOString(),
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
    try {
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
        priority: record.priority,
        date: record.date,
        customerName: record.customer_name,
        project: record.project,
        unitNumber: record.unit_number || "",
        source: record.source,
        status: record.status,
        requestNumber: record.request_number || null,
        description: record.description,
        maintenanceDeliveryAction: record.maintenance_delivery_action || null,
        action: record.action || "",
        duration: record.duration || 0,
        expectedClosureTime: record.expected_closure_time || null,
        createdBy: record.created_by,
        updatedBy: record.updated_by,
        createdAt: record.created_at,
        updatedAt: record.updated_at,
        updates: updates,
      };
    }));

    return complaints;
    } catch (error) {
      console.error('خطأ في getComplaints:', error);
      throw error;
    }
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
      const record = {
        booking_id: booking.bookingId || booking.id,
        booking_date: booking.bookingDate,
        customer_name: booking.customerName,
        customer_phone: booking.customerPhone,
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
        project_notes: booking.projectNotes,
        status: booking.status || "مجدول",
        status_sales_filled: booking.statusSalesFilled || false,
        status_projects_filled: booking.statusProjectsFilled || false,
        status_customer_filled: booking.statusCustomerFilled || false,
        is_evaluated: booking.isEvaluated || false,
        evaluation_score: booking.evaluationScore,
        created_by: booking.createdBy,
        updated_by: booking.updatedBy,
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
  static async saveReceptionRecord(record: any): Promise<any> {
    const recordData = {
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
      creator_name: record.creatorName,
    };

    const { data, error } = await supabase
      .from("reception_records")
      .insert(recordData)
      .select()
      .single();

    if (error) {
      console.error("خطأ Supabase في حفظ سجل الاستقبال:", error);
      throw new Error(
        `خطأ في حفظ سجل الاستقبال: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }

    return data;
  }

  // دالة لحفظ عدة سجلات استقبال دفعة واحدة (تحسين الأداء)
  static async saveReceptionRecordsBatch(records: any[]): Promise<any[]> {
    // إذا كان عدد السجلات كبير جداً، نقسمها إلى دفعات أصغر
    const MAX_BATCH_SIZE = 50; // حد أقصى للدفعة الواحدة

    if (records.length <= MAX_BATCH_SIZE) {
      // إذا كان العدد صغير، نحفظ مرة واحدة
      const recordsData = records.map(record => ({
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
        creator_name: record.creatorName,
      }));

      const { data, error } = await supabase
        .from("reception_records")
        .insert(recordsData)
        .select();

      if (error) {
        console.error("خطأ Supabase في حفظ سجلات الاستقبال بالدفعة:", error);
        throw new Error(
          `خطأ في حفظ سجلات الاستقبال: ${error.message || error.details || "خطأ غير معروف"}`,
        );
      }

      return data || [];
    } else {
      // إذا كان العدد كبير، نقسم إلى دفعات أصغر
      const allSavedData = [];

      for (let i = 0; i < records.length; i += MAX_BATCH_SIZE) {
        const batch = records.slice(i, i + MAX_BATCH_SIZE);
        console.log(`حفظ الدفعة الفرعية: ${i + 1} إلى ${Math.min(i + MAX_BATCH_SIZE, records.length)}`);

        const recordsData = batch.map(record => ({
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
          creator_name: record.creatorName,
        }));

        const { data, error } = await supabase
          .from("reception_records")
          .insert(recordsData)
          .select();

        if (error) {
          console.error(`خطأ Supabase في حفظ الدفعة الفرعية ${i + 1}:`, error);
          throw new Error(
            `خطأ في حفظ الدفعة الفرعية: ${error.message || error.details || "خطأ غير معروف"}`,
          );
        }

        if (data) {
          allSavedData.push(...data);
        }

        // تأخير قصير بين الدفعات
        if (i + MAX_BATCH_SIZE < records.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      return allSavedData;
    }
  }

  static async getReceptionRecords(): Promise<any[]> {
    // جلب جميع السجلات مع تحديد عدد أكبر لتجنب الحد الافتراضي
    const { data, error, count } = await supabase
      .from("reception_records")
      .select("*", { count: 'exact' })
      .order("created_at", { ascending: false })
      .limit(10000); // زيادة الحد الأقصى لجلب المزيد من السجلات

    if (error) {
      console.error("خطأ Supabase في جلب سجلات الاستقبال:", error);
      throw new Error(
        `خطأ في جلب سجلات الاستقبال: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }

    console.log(`تم جلب ${data?.length || 0} سجل من أصل ${count} سجل في قاعدة البيانات`);
    return data || [];
  }

  static async updateReceptionRecord(id: string, recordData: any): Promise<void> {
    const { error } = await supabase
      .from("reception_records")
      .update({
        date: recordData.date,
        customer_name: recordData.customerName,
        phone_number: recordData.phoneNumber,
        project: recordData.project,
        employee: recordData.employee,
        contact_method: recordData.contactMethod,
        type: recordData.type,
        customer_request: recordData.customerRequest,
        action: recordData.action,
        status: recordData.status,
        updated_by: recordData.updatedBy,
        creator_name: recordData.creatorName,
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
  static async saveQualityCall(call: any): Promise<void> {
    const { error } = await supabase
      .from("quality_calls")
      .insert({
        call_id: call.callId,
        call_date: call.callDate,
        customer_name: call.customerName,
        phone_number: call.phoneNumber,
        project: call.project || 'مشروع افتراضي',
        unit_number: call.unitNumber,
        call_type: call.callType || 'مكالمة جودة',
        call_duration: call.callDuration,
        evaluation_score: call.evaluationScore,
        qualification_status: call.qualificationStatus || 'غير مؤهل',
        qualification_reason: call.qualificationReason,
        notes: call.notes,
        created_by: call.createdBy || 'مجهول'
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

  static async updateQualityCall(id: string, updates: any): Promise<void>{
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
      // التحقق أولاً إذا كان المستخدم موجود مسبقاً
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id, username')
        .eq('username', userData.username)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') {
        console.error('خطأ في التحقق من وجود المستخدم:', checkError);
        throw new Error(`خطأ في التحقق من المستخدم: ${checkError.message}`);
      }

      if (existingUser) {
        throw new Error(`اسم المستخدم "${userData.username}" موجود مسبقاً. يرجى اختيار اسم مختلف.`);
      }

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

        // معالجة خاصة لخطأ اسم المستخدم المكرر
        if (error.code === '23505' && error.message.includes('users_username_key')) {
          throw new Error(`اسم المستخدم "${userData.username}" موجود مسبقاً. يرجى اختيار اسم مختلف.`);
        }

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

  // إدارة سجلات الزوار
  static async saveVisitorRecord(record: any): Promise<void> {
    const { error } = await supabase
      .from("visitor_records")
      .insert({
        name: record.name,
        phone_number: record.phoneNumber,
        visit_reason: record.visitReason,
        requested_employee: record.requestedEmployee,
        date: record.date,
        time: record.time,
        created_by: record.createdBy,
        branch: record.branch,
      });

    if (error) {
      console.error("خطأ Supabase في حفظ سجل الزائر:", error);
      throw new Error(
        `خطأ في حفظ سجل الزائر: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }
  }

  static async getVisitorRecords(): Promise<any[]> {
    const { data, error } = await supabase
      .from("visitor_records")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("خطأ Supabase في جلب سجلات الزوار:", error);
      throw new Error(
        `خطأ في جلب سجلات الزوار: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }

    return (data || []).map((record) => ({
      id: record.id,
      name: record.name,
      phoneNumber: record.phone_number,
      visitReason: record.visit_reason,
      requestedEmployee: record.requested_employee,
      date: record.date,
      time: record.time,
      createdBy: record.created_by,
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    }));
  }

  static async updateVisitorRecord(id: string, recordData: any): Promise<void> {
    const { error } = await supabase
      .from("visitor_records")
      .update({
        name: recordData.name,
        phone_number: recordData.phoneNumber,
        visit_reason: recordData.visitReason,
        requested_employee: recordData.requestedEmployee,
        date: recordData.date,
        time: recordData.time,
        branch: recordData.branch,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error("خطأ Supabase في تحديث سجل الزائر:", error);
      throw new Error(
        `خطأ في تحديث سجل الزائر: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }
  }

  static async deleteVisitorRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from("visitor_records")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("خطأ Supabase في حذف سجل الزائر:", error);
      throw new Error(
        `خطأ في حذف سجل الزائر: ${error.message || error.details || "خطأ غير معروف"}`,
      );
    }
  }

  // دوال 3CX
  static async save3CXData(data: any): Promise<void> {
    try {
      const record = {
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('threecx_data')
        .insert([record]);

      if (error) {
        console.error('خطأ في حفظ بيانات 3CX:', error);
        throw error;
      }

      console.log('تم حفظ بيانات 3CX بنجاح');
    } catch (error) {
      console.error('خطأ في save3CXData:', error);
      throw error;
    }
  }

  static async get3CXData(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('threecx_data')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('خطأ في جلب بيانات 3CX:', error);
        throw error;
      }

      console.log('تم تحميل بيانات 3CX من قاعدة البيانات:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('خطأ في get3CXData:', error);
      throw error;
    }
  }

  static async delete3CXData(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('threecx_data')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('خطأ في حذف بيانات 3CX:', error);
        throw error;
      }

      console.log('تم حذف بيانات 3CX بنجاح');
    } catch (error) {
      console.error('خطأ في delete3CXData:', error);
      throw error;
    }
  }

  // دوال التسليم
  static async getDeliveryBookings(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('delivery_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('خطأ في جلب حجوزات التسليم:', error);
        throw error;
      }

      console.log('تم تحميل حجوزات التسليم من قاعدة البيانات:', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('خطأ في getDeliveryBookings:', error);
      throw error;
    }
  }

  static async createDeliveryBooking(bookingData: any): Promise<any> {
    try {
      // تحديد الحالة بناءً على المراحل المكتملة
      const status = this.calculateBookingStatus(bookingData);

      // تحويل أسماء الحقول لتطابق قاعدة البيانات
      const dataToInsert = {
        booking_date: bookingData.booking_date,
        customer_name: bookingData.customer_name,
        customer_phone: bookingData.customer_phone,
        project: bookingData.project,
        building: bookingData.building,
        unit: bookingData.unit,
        payment_method: bookingData.payment_method,
        sale_type: bookingData.sale_type || null,
        unit_value: bookingData.unit_value || 0,
        handover_date: bookingData.handover_date,
        sales_employee: bookingData.sales_employee,
        sales_completed: bookingData.sales_completed || false,
        construction_completion_date: bookingData.construction_completion_date,
        final_handover_date: bookingData.final_handover_date,
        electricity_meter_transfer_date: bookingData.electricity_meter_transfer_date,
        water_meter_transfer_date: bookingData.water_meter_transfer_date,
        customer_delivery_date: bookingData.customer_delivery_date,
        project_notes: bookingData.project_notes,
        projects_completed: bookingData.projects_completed || false,
        customer_evaluation_done: bookingData.customer_evaluation_done || false,
        evaluation_percentage: bookingData.evaluation_percentage || 0,
        customer_service_completed: bookingData.customer_service_completed || false,
        status,
        created_by: bookingData.created_by,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('delivery_bookings')
        .insert([dataToInsert])
        .select()
        .single();

      if (error) {
        console.error('خطأ في إنشاء حجز التسليم:', error);
        throw error;
      }

      console.log('تم إنشاء حجز التسليم بنجاح:', data);
      return data;
    } catch (error) {
      console.error('خطأ في createDeliveryBooking:', error);
      throw error;
    }
  }

  static async updateDeliveryBooking(id: number, bookingData: any): Promise<any> {
    try {
      // تحديد الحالة بناءً على المراحل المكتملة
      const status = this.calculateBookingStatus(bookingData);

      const dataToUpdate = {
        ...bookingData,
        status,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('delivery_bookings')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('خطأ في تحديث حجز التسليم:', error);
        throw error;
      }

      console.log('تم تحديث حجز التسليم بنجاح:', data);
      return data;
    } catch (error) {
      console.error('خطأ في updateDeliveryBooking:', error);
      throw error;
    }
  }

  static async deleteDeliveryBooking(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('delivery_bookings')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('خطأ في حذف حجز التسليم:', error);
        throw error;
      }

      console.log('تم حذف حجز التسليم بنجاح');
    } catch (error) {
      console.error('خطأ في deleteDeliveryBooking:', error);
      throw error;
    }
  }

  // دالة مساعدة لحساب حالة الحجز
  private static calculateBookingStatus(booking: any): string {
    if (booking.customer_service_completed) {
      return "مكتمل";
    } else if (booking.projects_completed) {
      return "في راحة العملاء";
    } else if (booking.sales_completed) {
      return "في إدارة المشاريع";
    } else {
      return "في المبيعات";
    }
  }

  // دالة إعادة حساب وتصحيح مجموع المكالمات
  static async recalculateCallsTotal(period: "weekly" | "yearly"): Promise<void> {
    try {
      const { data, error } = await supabase
        .from("customer_service")
        .select("*")
        .eq("period", period)
        .single();

      if (error || !data) {
        console.log("لا توجد بيانات لإعادة حساب المجموع");
        return;
      }

      const correctTotal = (data.complaints || 0) + 
                          (data.contact_requests || 0) + 
                          (data.maintenance_requests || 0) + 
                          (data.inquiries || 0) + 
                          (data.office_interested || 0) + 
                          (data.projects_interested || 0) + 
                          (data.customers_interested || 0);

      if (data.total !== correctTotal) {
        console.log(`تصحيح المجموع للفترة ${period} من ${data.total} إلى ${correctTotal}`);
        
        const { error: updateError } = await supabase
          .from("customer_service")
          .update({ total: correctTotal })
          .eq("period", period);

        if (updateError) {
          console.error("خطأ في تحديث المجموع:", updateError);
        } else {
          console.log("تم تصحيح المجموع بنجاح");
        }
      }
    } catch (error) {
      console.error("خطأ في إعادة حساب المجموع:", error);
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

  // دوال 3CX الكاملة
  static async save3CXCallRecords(records: any[], period: 'weekly' | 'yearly' = 'weekly', createdBy?: string): Promise<void> {
    try {
      // حذف البيانات القديمة للفترة
      await this.clear3CXData(period);

      // إدراج البيانات الجديدة
      const recordsToInsert = records.map(record => ({
        call_time: record.callTime,
        call_id: record.callId,
        from_number: record.from,
        to_number: record.to,
        direction: (record.direction === 'Inbound' || record.direction === 'Outbound') ? 
                  record.direction : 
                  (record.direction?.toLowerCase().includes('in') ? 'Inbound' : 'Outbound'),
        status: (record.status === 'Answered' || record.status === 'Unanswered') ? 
                record.status : 
                (record.status?.toLowerCase().includes('answer') ? 'Answered' : 'Unanswered'),
        ringing_duration: record.ringingDuration,
        talking_duration: record.talkingDuration,
        agent_name: record.agentName,
        is_business_hours: record.isBusinessHours,
        response_time: record.responseTime,
        period: period,
        created_by: createdBy,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('threecx_data')
        .insert(recordsToInsert);

      if (error) {
        console.error('خطأ في حفظ بيانات 3CX:', error);
        throw new Error(`خطأ في حفظ بيانات 3CX: ${error.message || error.details || "خطأ غير معروف"}`);
      }

      console.log(`تم حفظ ${recordsToInsert.length} سجل مكالمة للفترة ${period}`);
    } catch (error) {
      console.error('خطأ في save3CXCallRecords:', error);
      throw error;
    }
  }

  static async get3CXCallRecords(period: 'weekly' | 'yearly' = 'weekly'): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('threecx_data')
        .select('*')
        .eq('period', period)
        .order('call_time', { ascending: false });

      if (error) {
        console.error('خطأ في جلب بيانات 3CX:', error);
        throw new Error(`خطأ في جلب بيانات 3CX: ${error.message || error.details || "خطأ غير معروف"}`);
      }

      const records = (data || []).map(record => ({
        id: `${record.id}-${record.call_time}`,
        callTime: record.call_time,
        callId: record.call_id,
        from: record.from_number,
        to: record.to_number,
        direction: record.direction,
        status: record.status,
        ringingDuration: record.ringing_duration,
        talkingDuration: record.talking_duration,
        agentName: record.agent_name,
        isBusinessHours: record.is_business_hours,
        responseTime: record.response_time
      }));

      console.log(`تم تحميل ${records.length} سجل مكالمة للفترة ${period}`);
      return records;
    } catch (error) {
      console.error('خطأ في get3CXCallRecords:', error);
      return [];
    }
  }

  static async clear3CXData(period: 'weekly' | 'yearly'): Promise<void> {
    try {
      const { error } = await supabase
        .from('threecx_data')
        .delete()
        .eq('period', period);

      if (error) {
        console.error('خطأ في حذف بيانات 3CX:', error);
        throw new Error(`خطأ في حذف بيانات 3CX: ${error.message || error.details || "خطأ غير معروف"}`);
      }

      console.log(`تم حذف بيانات 3CX للفترة ${period}`);
    } catch (error) {
      console.error('خطأ في clear3CXData:', error);
      throw error;
    }
  }

  static async get3CXAnalytics(period: 'weekly' | 'yearly' = 'weekly'): Promise<any> {
    try {
      const records = await this.get3CXCallRecords(period);

      // تصفية المكالمات في أوقات الدوام فقط
      const businessHoursRecords = records.filter(r => r.isBusinessHours);

      const totalCalls = businessHoursRecords.length;
      const answeredCalls = businessHoursRecords.filter(r => r.status === 'Answered').length;
      const unansweredCalls = totalCalls - answeredCalls;

      const answerRate = totalCalls > 0 ? (answeredCalls / totalCalls) * 100 : 0;

      const answeredRecords = businessHoursRecords.filter(r => r.status === 'Answered' && r.responseTime > 0);
      const averageResponseTime = answeredRecords.length > 0 
        ? answeredRecords.reduce((sum, r) => sum + r.responseTime, 0) / answeredRecords.length 
        : 0;

      const totalTalkTime = businessHoursRecords.reduce((sum, r) => sum + r.talkingDuration, 0);
      const businessHoursCalls = businessHoursRecords.length;
      const outsideHoursCalls = records.length - businessHoursCalls;

      return {
        totalCalls,
        answeredCalls,
        unansweredCalls,
        answerRate,
        averageResponseTime,
        totalTalkTime,
        businessHoursCalls,
        outsideHoursCalls
      };
    } catch (error) {
      console.error('خطأ في get3CXAnalytics:', error);
      return null;
    }
  }

  static async get3CXEmployeePerformance(period: 'weekly' | 'yearly' = 'weekly'): Promise<any[]> {
    try {
      const records = await this.get3CXCallRecords(period);
      const businessHoursRecords = records.filter(r => r.isBusinessHours);

      const employeeMap = new Map();

      businessHoursRecords.forEach(record => {
        if (record.agentName === 'غير محدد') return;

        if (!employeeMap.has(record.agentName)) {
          employeeMap.set(record.agentName, {
            agentName: record.agentName,
            totalCalls: 0,
            answeredCalls: 0,
            averageResponseTime: 0,
            answerRate: 0,
            totalTalkTime: 0
          });
        }

        const employee = employeeMap.get(record.agentName);
        employee.totalCalls++;

        if (record.status === 'Answered') {
          employee.answeredCalls++;
          employee.totalTalkTime += record.talkingDuration;
        }
      });

      // حساب المعدلات النهائية
      const performance = Array.from(employeeMap.values()).map(emp => {
        const answeredRecords = businessHoursRecords.filter(r => 
          r.agentName === emp.agentName && 
          r.status === 'Answered' && 
          r.responseTime > 0
        );

        const averageResponseTime = answeredRecords.length > 0
          ? answeredRecords.reduce((sum, r) => sum + r.responseTime, 0) / answeredRecords.length
          : 0;

        return {
          ...emp,
          answerRate: emp.totalCalls > 0 ? (emp.answeredCalls / emp.totalCalls) * 100 : 0,
          averageResponseTime
        };
      });

      performance.sort((a, b) => b.totalCalls - a.totalCalls);
      return performance;
    } catch (error) {
      console.error('خطأ في get3CXEmployeePerformance:', error);
      return [];
    }
  }

  // حفظ وجلب نتائج CSAT
  static async saveCSATScore(score: number, source: string = 'whatsapp', period: 'weekly' | 'yearly' = 'weekly', createdBy?: string): Promise<void> {
    try {
      const insertData = {
        score: score,
        period: period,
        created_by: createdBy || 'مجهول'
      };

      const { error } = await supabase
        .from('csat_whatsapp')
        .insert(insertData);

      if (error) {
        console.error('خطأ Supabase في حفظ نتيجة CSAT:', error);
        throw new Error(`خطأ في حفظ نتيجة CSAT: ${error.message || error.details || "خطأ غير معروف"}`);
      }

      console.log('تم حفظ نتيجة CSAT بنجاح:', insertData);
    } catch (error) {
      console.error('خطأ في حفظ نتيجة CSAT:', error);
      throw error;
    }
  }

  static async getLatestCSATScore(source: string = 'whatsapp', period: 'weekly' | 'yearly' = 'weekly'): Promise<number | null> {
    try {
      const { data, error } = await supabase
        .from('csat_whatsapp')
        .select('score')
        .eq('period', period)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // لا توجد نتائج
          console.log('لا توجد نتائج CSAT للفترة:', period);
          return null;
        }
        console.error('خطأ Supabase في جلب نتيجة CSAT:', error);
        return null;
      }

      console.log('تم جلب نتيجة CSAT بنجاح:', data?.score);
      return data?.score || null;
    } catch (error) {
      console.error('خطأ في جلب نتيجة CSAT:', error);
      return null;
    }
  }

  static async getCSATHistory(source: string = 'whatsapp', period: 'weekly' | 'yearly' = 'weekly', limit: number = 10): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('csat_whatsapp')
        .select('*')
        .eq('period', period)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('خطأ Supabase في جلب تاريخ CSAT:', error);
        return [];
      }

      console.log('تم جلب تاريخ CSAT بنجاح:', data?.length || 0, 'سجل');
      return data || [];
    } catch (error) {
      console.error('خطأ في جلب تاريخ CSAT:', error);
      return [];
    }
  }

  static async deleteCSATRecord(recordId: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('csat_whatsapp')
        .delete()
        .eq('id', recordId);

      if (error) {
        console.error('خطأ Supabase في حذف سجل CSAT:', error);
        throw new Error(`خطأ في حذف سجل CSAT: ${error.message || error.details || "خطأ غير معروف"}`);
      }
      console.log('تم حذف سجل CSAT بنجاح');
    } catch (error) {
      console.error('خطأ في حذف سجل CSAT:', error);
      throw error;
    }
  }

  // إضافة دالة deleteCSATScore للتوافق مع الكود الموجود
  static async deleteCSATScore(recordId: number): Promise<void> {
    return this.deleteCSATRecord(recordId);
  }
}