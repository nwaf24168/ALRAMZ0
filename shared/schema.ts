import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const metrics = pgTable("metrics", {
  id: serial("id").primaryKey(),
  period: text("period").notNull(), // "weekly" or "yearly"
  metricIndex: integer("metric_index").notNull(),
  title: text("title").notNull(),
  value: text("value").notNull(),
  target: text("target").notNull(),
  change: real("change").notNull().default(0),
  isPositive: boolean("is_positive").notNull().default(true),
  reachedTarget: boolean("reached_target").notNull().default(false),
  isLowerBetter: boolean("is_lower_better").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const customerService = pgTable("customer_service", {
  id: serial("id").primaryKey(),
  period: text("period").notNull(), // "weekly" or "yearly"
  complaints: integer("complaints").notNull().default(0),
  contactRequests: integer("contact_requests").notNull().default(0),
  maintenanceRequests: integer("maintenance_requests").notNull().default(0),
  inquiries: integer("inquiries").notNull().default(0),
  officeInterested: integer("office_interested").notNull().default(0),
  projectsInterested: integer("projects_interested").notNull().default(0),
  customersInterested: integer("customers_interested").notNull().default(0),
  total: integer("total").notNull().default(0),
  generalInquiries: integer("general_inquiries").notNull().default(0),
  documentRequests: integer("document_requests").notNull().default(0),
  deedInquiries: integer("deed_inquiries").notNull().default(0),
  apartmentRentals: integer("apartment_rentals").notNull().default(0),
  soldProjects: integer("sold_projects").notNull().default(0),
  cancelledMaintenance: integer("cancelled_maintenance").notNull().default(0),
  resolvedMaintenance: integer("resolved_maintenance").notNull().default(0),
  inProgressMaintenance: integer("in_progress_maintenance").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const satisfaction = pgTable("satisfaction", {
  id: serial("id").primaryKey(),
  period: text("period").notNull(), // "weekly" or "yearly"
  category: text("category").notNull(), // "serviceQuality", "closureTime", "firstTimeResolution"
  veryHappy: integer("very_happy").notNull().default(0),
  happy: integer("happy").notNull().default(0),
  neutral: integer("neutral").notNull().default(0),
  unhappy: integer("unhappy").notNull().default(0),
  veryUnhappy: integer("very_unhappy").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  period: text("period").notNull(), // "weekly" or "yearly"
  text: text("text").notNull(),
  username: text("username").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const complaints = pgTable("complaints", {
  id: serial("id").primaryKey(),
  complaintId: text("complaint_id").notNull().unique(),
  date: text("date").notNull(),
  customerName: text("customer_name").notNull(),
  project: text("project").notNull(),
  unitNumber: text("unit_number"),
  source: text("source").notNull(),
  status: text("status").notNull(),
  description: text("description").notNull(),
  action: text("action"),
  duration: integer("duration").default(0),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  bookingId: text("booking_id").notNull().unique(),
  bookingDate: text("booking_date").notNull(),
  customerName: text("customer_name").notNull(),
  project: text("project").notNull(),
  building: text("building"),
  unit: text("unit").notNull(),
  paymentMethod: text("payment_method").notNull(),
  saleType: text("sale_type").notNull(),
  unitValue: real("unit_value").notNull(),
  transferDate: text("transfer_date"),
  salesEmployee: text("sales_employee").notNull(),
  constructionEndDate: text("construction_end_date"),
  finalReceiptDate: text("final_receipt_date"),
  electricityTransferDate: text("electricity_transfer_date"),
  waterTransferDate: text("water_transfer_date"),
  deliveryDate: text("delivery_date"),
  status: text("status").notNull(),
  statusSalesFilled: boolean("status_sales_filled").notNull().default(false),
  statusProjectsFilled: boolean("status_projects_filled").notNull().default(false),
  statusCustomerFilled: boolean("status_customer_filled").notNull().default(false),
  isEvaluated: boolean("is_evaluated").notNull().default(false),
  evaluationScore: integer("evaluation_score"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const receptionRecords = pgTable("reception_records", {
  id: text("id").primaryKey(),
  date: text("date").notNull(),
  customerName: text("customer_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  project: text("project").notNull(),
  employee: text("employee").notNull(),
  contactMethod: text("contact_method").notNull(),
  type: text("type").notNull(),
  customerRequest: text("customer_request").notNull(),
  action: text("action").notNull(),
  status: text("status").notNull().default("جديد"),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const qualityCalls = pgTable("quality_calls", {
  id: text("id").primaryKey(),
  callId: text("call_id").notNull().unique(),
  callDate: text("call_date").notNull(),
  customerName: text("customer_name").notNull(),
  phoneNumber: text("phone_number").notNull(),
  project: text("project").notNull(),
  unitNumber: text("unit_number"),
  callType: text("call_type").notNull(),
  callDuration: integer("call_duration"),
  evaluationScore: integer("evaluation_score"),
  qualificationStatus: text("qualification_status").notNull().default("قيد المراجعة"),
  qualificationReason: text("qualification_reason"),
  notes: text("notes"),
  audioFileUrl: text("audio_file_url"),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
});

export const insertMetricSchema = createInsertSchema(metrics);
export const insertCustomerServiceSchema = createInsertSchema(customerService);
export const insertSatisfactionSchema = createInsertSchema(satisfaction);
export const insertCommentSchema = createInsertSchema(comments);
export const insertComplaintSchema = createInsertSchema(complaints);
export const insertBookingSchema = createInsertSchema(bookings);
export const insertReceptionRecordSchema = createInsertSchema(receptionRecords);
export const insertQualityCallSchema = createInsertSchema(qualityCalls);

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertMetric = z.infer<typeof insertMetricSchema>;
export type Metric = typeof metrics.$inferSelect;
export type InsertCustomerService = z.infer<typeof insertCustomerServiceSchema>;
export type CustomerService = typeof customerService.$inferSelect;
export type InsertSatisfaction = z.infer<typeof insertSatisfactionSchema>;
export type Satisfaction = typeof satisfaction.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertComplaint = z.infer<typeof insertComplaintSchema>;
export type Complaint = typeof complaints.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertReceptionRecord = z.infer<typeof insertReceptionRecordSchema>;
export type ReceptionRecord = typeof receptionRecords.$inferSelect;
export type InsertQualityCall = z.infer<typeof insertQualityCallSchema>;
export type QualityCall = typeof qualityCalls.$inferSelect;
