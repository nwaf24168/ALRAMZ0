import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Edit, Eye, Calendar, User, Building, CreditCard, CheckCircle } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { DataService } from "@/lib/dataService";

interface DeliveryBooking {
  id?: number;
  // مرحلة المبيعات
  booking_date?: string;
  customer_name: string;
  customer_phone?: string;
  project?: string;
  building?: string;
  unit?: string;
  payment_method?: string;
  sale_type?: string;
  unit_value?: number;
  handover_date?: string;
  sales_employee?: string;
  sales_completed?: boolean;

  // مرحلة إدارة المشاريع
  construction_completion_date?: string;
  final_handover_date?: string;
  electricity_meter_transfer_date?: string;
  water_meter_transfer_date?: string;
  customer_delivery_date?: string;
  project_notes?: string;
  projects_completed?: boolean;

  // مرحلة راحة العملاء
  customer_evaluation_done?: boolean;
  evaluation_percentage?: number;
  customer_service_completed?: boolean;

  status?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export default function Delivery() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [bookings, setBookings] = useState<DeliveryBooking[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<DeliveryBooking | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [activeTab, setActiveTab] = useState("sales");
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<DeliveryBooking>({
    customer_name: "",
    customer_phone: "",
    project: "",
    building: "",
    unit: "",
    payment_method: "",
    sale_type: "",
    unit_value: 0,
    sales_employee: user?.username || "",
    sales_completed: false,
    projects_completed: false,
    customer_evaluation_done: false,
    customer_service_completed: false,
    evaluation_percentage: 0
  });

  useEffect(() => {
    loadBookings();
  }, []);

  const loadBookings = async () => {
    try {
      setLoading(true);
      const data = await DataService.getDeliveryBookings();
      setBookings(data);
    } catch (error) {
      console.error("خطأ في تحميل الحجوزات:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في تحميل بيانات الحجوزات"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);

      if (selectedBooking?.id) {
        await DataService.updateDeliveryBooking(selectedBooking.id, formData);
        toast({
          title: "تم التحديث",
          description: "تم تحديث بيانات الحجز بنجاح"
        });
      } else {
        await DataService.createDeliveryBooking(formData);
        toast({
          title: "تم الحفظ",
          description: "تم إضافة الحجز الجديد بنجاح"
        });
      }

      await loadBookings();
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("خطأ في حفظ الحجز:", error);
      toast({
        variant: "destructive",
        title: "خطأ",
        description: "فشل في حفظ بيانات الحجز"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      customer_name: "",
      customer_phone: "",
      project: "",
      building: "",
      unit: "",
      payment_method: "",
      sale_type: "",
      unit_value: 0,
      sales_employee: user?.username || "",
      sales_completed: false,
      projects_completed: false,
      customer_evaluation_done: false,
      customer_service_completed: false,
      evaluation_percentage: 0
    });
    setSelectedBooking(null);
    setIsViewMode(false);
    setActiveTab("sales");
  };

  const handleEdit = (booking: DeliveryBooking) => {
    setSelectedBooking(booking);
    setFormData({ ...booking });
    setIsViewMode(false);
    setIsDialogOpen(true);
  };

  const handleView = (booking: DeliveryBooking) => {
    setSelectedBooking(booking);
    setFormData({ ...booking });
    setIsViewMode(true);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "في المبيعات":
        return <Badge variant="secondary">في المبيعات</Badge>;
      case "في إدارة المشاريع":
        return <Badge variant="outline">في إدارة المشاريع</Badge>;
      case "في راحة العملاء":
        return <Badge variant="default">في راحة العملاء</Badge>;
      case "مكتمل":
        return <Badge variant="destructive">مكتمل</Badge>;
      default:
        return <Badge>غير محدد</Badge>;
    }
  };

  const canEditStage = (stage: string) => {
    if (isViewMode) return false;

    switch (stage) {
      case "sales":
        return user?.role?.includes("مبيعات") || user?.role?.includes("مدير");
      case "projects":
        return (user?.role?.includes("مشاريع") || user?.role?.includes("مدير")) && formData.sales_completed;
      case "customer_service":
        return (user?.role?.includes("راحة العملاء") || user?.role?.includes("مدير")) && formData.projects_completed;
      default:
        return false;
    }
  };

  return (
    <Layout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">إدارة التسليم</h1>
          <Button 
            onClick={() => {
              resetForm();
              setIsDialogOpen(true);
            }}
            disabled={loading}
          >
            <Plus className="ml-2 h-4 w-4" />
            إضافة حجز جديد
          </Button>
        </div>

        {/* إحصائيات سريعة */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Building className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">في المبيعات</p>
                  <p className="text-2xl font-bold">
                    {bookings.filter(b => b.status === "في المبيعات").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">في إدارة المشاريع</p>
                  <p className="text-2xl font-bold">
                    {bookings.filter(b => b.status === "في إدارة المشاريع").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">في راحة العملاء</p>
                  <p className="text-2xl font-bold">
                    {bookings.filter(b => b.status === "في راحة العملاء").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">مكتمل</p>
                  <p className="text-2xl font-bold">
                    {bookings.filter(b => b.status === "مكتمل").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* جدول الحجوزات */}
        <Card>
          <CardHeader>
            <CardTitle>قائمة الحجوزات</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم العميل</TableHead>
                    <TableHead>المشروع</TableHead>
                    <TableHead>العمارة</TableHead>
                    <TableHead>الوحدة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ الحجز</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.customer_name}</TableCell>
                      <TableCell>{booking.project}</TableCell>
                      <TableCell>{booking.building}</TableCell>
                      <TableCell>{booking.unit}</TableCell>
                      <TableCell>{getStatusBadge(booking.status || "غير محدد")}</TableCell>
                      <TableCell>
                        {booking.booking_date ? new Date(booking.booking_date).toLocaleDateString('ar-SA') : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleView(booking)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(booking)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* نافذة الحوار للإضافة/التعديل */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {isViewMode ? "عرض" : selectedBooking ? "تعديل" : "إضافة"} حجز
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="sales">المبيعات</TabsTrigger>
                  <TabsTrigger value="projects">إدارة المشاريع</TabsTrigger>
                  <TabsTrigger value="customer_service">راحة العملاء</TabsTrigger>
                </TabsList>

                {/* مرحلة المبيعات */}
                <TabsContent value="sales" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="booking_date">تاريخ الحجز</Label>
                      <Input
                        id="booking_date"
                        type="date"
                        value={formData.booking_date || ""}
                        onChange={(e) => setFormData({...formData, booking_date: e.target.value})}
                        disabled={!canEditStage("sales")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="customer_name">اسم العميل</Label>
                      <Input
                        id="customer_name"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                        disabled={!canEditStage("sales")}
                        required
                      />
                    </div>

                    <div>
                      <Label htmlFor="customer_phone">رقم العميل</Label>
                      <Input
                        id="customer_phone"
                        value={formData.customer_phone || ""}
                        onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                        disabled={!canEditStage("sales")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="project">المشروع</Label>
                      <Input
                        id="project"
                        value={formData.project || ""}
                        onChange={(e) => setFormData({...formData, project: e.target.value})}
                        disabled={!canEditStage("sales")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="building">العمارة</Label>
                      <Input
                        id="building"
                        value={formData.building || ""}
                        onChange={(e) => setFormData({...formData, building: e.target.value})}
                        disabled={!canEditStage("sales")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="unit">الوحدة</Label>
                      <Input
                        id="unit"
                        value={formData.unit || ""}
                        onChange={(e) => setFormData({...formData, unit: e.target.value})}
                        disabled={!canEditStage("sales")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="payment_method">طريقة الدفع</Label>
                      <Input
                        id="payment_method"
                        value={formData.payment_method || ""}
                        onChange={(e) => setFormData({...formData, payment_method: e.target.value})}
                        disabled={!canEditStage("sales")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="sale_type">نوع البيع</Label>
                      <Select
                        value={formData.sale_type || ""}
                        onValueChange={(value) => setFormData({...formData, sale_type: value})}
                        disabled={!canEditStage("sales")}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر نوع البيع" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="بيع على الخارطة">بيع على الخارطة</SelectItem>
                          <SelectItem value="جاهز">جاهز</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="unit_value">قيمة الوحدة</Label>
                      <Input
                        id="unit_value"
                        type="number"
                        value={formData.unit_value || ""}
                        onChange={(e) => setFormData({...formData, unit_value: parseFloat(e.target.value)})}
                        disabled={!canEditStage("sales")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="handover_date">تاريخ الإفراغ</Label>
                      <Input
                        id="handover_date"
                        type="date"
                        value={formData.handover_date || ""}
                        onChange={(e) => setFormData({...formData, handover_date: e.target.value})}
                        disabled={!canEditStage("sales")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="sales_employee">اسم موظف المبيعات</Label>
                      <Input
                        id="sales_employee"
                        value={formData.sales_employee || ""}
                        onChange={(e) => setFormData({...formData, sales_employee: e.target.value})}
                        disabled={!canEditStage("sales")}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sales_completed"
                      checked={formData.sales_completed || false}
                      onCheckedChange={(checked) => setFormData({...formData, sales_completed: !!checked})}
                      disabled={!canEditStage("sales")}
                    />
                    <Label htmlFor="sales_completed">تم تعبئة البيانات من قبل المبيعات</Label>
                  </div>
                </TabsContent>

                {/* مرحلة إدارة المشاريع */}
                <TabsContent value="projects" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="construction_completion_date">تاريخ انتهاء أعمال البناء</Label>
                      <Input
                        id="construction_completion_date"
                        type="date"
                        value={formData.construction_completion_date || ""}
                        onChange={(e) => setFormData({...formData, construction_completion_date: e.target.value})}
                        disabled={!canEditStage("projects")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="final_handover_date">تاريخ الاستلام النهائي للوحدة</Label>
                      <Input
                        id="final_handover_date"
                        type="date"
                        value={formData.final_handover_date || ""}
                        onChange={(e) => setFormData({...formData, final_handover_date: e.target.value})}
                        disabled={!canEditStage("projects")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="electricity_meter_transfer_date">تاريخ نقل عداد الكهرباء</Label>
                      <Input
                        id="electricity_meter_transfer_date"
                        type="date"
                        value={formData.electricity_meter_transfer_date || ""}
                        onChange={(e) => setFormData({...formData, electricity_meter_transfer_date: e.target.value})}
                        disabled={!canEditStage("projects")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="water_meter_transfer_date">تاريخ نقل عداد الماء</Label>
                      <Input
                        id="water_meter_transfer_date"
                        type="date"
                        value={formData.water_meter_transfer_date || ""}
                        onChange={(e) => setFormData({...formData, water_meter_transfer_date: e.target.value})}
                        disabled={!canEditStage("projects")}
                      />
                    </div>

                    <div>
                      <Label htmlFor="customer_delivery_date">تاريخ التسليم للعميل</Label>
                      <Input
                        id="customer_delivery_date"
                        type="date"
                        value={formData.customer_delivery_date || ""}
                        onChange={(e) => setFormData({...formData, customer_delivery_date: e.target.value})}
                        disabled={!canEditStage("projects")}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="project_notes">ملاحظات</Label>
                    <Textarea
                      id="project_notes"
                      value={formData.project_notes || ""}
                      onChange={(e) => setFormData({...formData, project_notes: e.target.value})}
                      disabled={!canEditStage("projects")}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="projects_completed"
                      checked={formData.projects_completed || false}
                      onCheckedChange={(checked) => setFormData({...formData, projects_completed: !!checked})}
                      disabled={!canEditStage("projects")}
                    />
                    <Label htmlFor="projects_completed">تم تعبئة البيانات من قبل إدارة المشاريع</Label>
                  </div>
                </TabsContent>

                {/* مرحلة راحة العملاء */}
                <TabsContent value="customer_service" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="customer_evaluation_done"
                        checked={formData.customer_evaluation_done || false}
                        onCheckedChange={(checked) => setFormData({...formData, customer_evaluation_done: !!checked})}
                        disabled={!canEditStage("customer_service")}
                      />
                      <Label htmlFor="customer_evaluation_done">هل تم تقييم العميل؟</Label>
                    </div>

                    <div>
                      <Label htmlFor="evaluation_percentage">نسبة التقييم (%)</Label>
                      <Input
                        id="evaluation_percentage"
                        type="number"
                        min="0"
                        max="100"
                        value={formData.evaluation_percentage || ""}
                        onChange={(e) => setFormData({...formData, evaluation_percentage: parseFloat(e.target.value)})}
                        disabled={!canEditStage("customer_service") || !formData.customer_evaluation_done}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="customer_service_completed"
                      checked={formData.customer_service_completed || false}
                      onCheckedChange={(checked) => setFormData({...formData, customer_service_completed: !!checked})}
                      disabled={!canEditStage("customer_service")}
                    />
                    <Label htmlFor="customer_service_completed">تم تعبئة البيانات من قبل راحة العملاء</Label>
                  </div>
                </TabsContent>
              </Tabs>

              {!isViewMode && (
                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "جاري الحفظ..." : "حفظ"}
                  </Button>
                </div>
              )}
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}