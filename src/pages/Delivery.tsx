import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Filter, Plus, Trash2, Edit, Eye } from "lucide-react";

interface DeliveryRecord {
  id: string;
  bookingDate: string;
  customerName: string;
  customerPhone: string;
  project: string;
  building: string;
  unit: string;
  paymentMethod: string;
  saleType: string;
  unitValue: number;
  transferDate: string;
  salesEmployee: string;
  constructionEndDate: string;
  finalReceiptDate: string;
  electricityTransferDate: string;
  waterTransferDate: string;
  deliveryDate: string;
  notes: string;
  isEvaluated: boolean;
  evaluationScore: number;
  daysToReceiveFromContractor: number;
  daysToDeliverToCustomer: number;
  waterTransferDuration: number;
  electricityTransferDuration: number;
  cashTransferDays: number;
  bankTransferDays: number;
}

const saleTypes = ["بيع على الخارطة", "جاهز"];
const paymentMethods = ["نقدي", "تحويل بنكي", "تمويل عقاري"];

export default function Delivery() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [deliveries, setDeliveries] = useState<DeliveryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<DeliveryRecord | null>(null);

  const [newDelivery, setNewDelivery] = useState<Partial<DeliveryRecord>>({
    bookingDate: new Date().toISOString().split("T")[0],
    customerName: "",
    customerPhone: "",
    project: "",
    building: "",
    unit: "",
    paymentMethod: "",
    saleType: "",
    unitValue: 0,
    transferDate: "",
    salesEmployee: "",
    constructionEndDate: "",
    finalReceiptDate: "",
    electricityTransferDate: "",
    waterTransferDate: "",
    deliveryDate: "",
    notes: "",
    isEvaluated: false,
    evaluationScore: 0
  });

  const handleNewDeliveryChange = (field: string, value: any) => {
    setNewDelivery((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddDelivery = () => {
    const newId = (deliveries.length + 1).toString();
    const delivery: DeliveryRecord = {
      id: newId,
      ...newDelivery as DeliveryRecord
    };

    setDeliveries([delivery, ...deliveries]);
    setIsAddDialogOpen(false);

    addNotification({
      title: "تمت الإضافة",
      message: `تم إضافة تسليم جديد برقم ${newId} بنجاح`,
      type: "success"
    });
  };

  const filteredDeliveries = deliveries.filter((delivery) =>
    delivery.customerName.includes(searchTerm) ||
    delivery.project.includes(searchTerm) ||
    delivery.id.includes(searchTerm)
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">قسم الحجز</h1>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center">
                <Plus className="ml-2 h-4 w-4" />
                إضافة حجز جديد
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>إضافة حجز جديد</DialogTitle>
                <DialogDescription>
                  أدخل بيانات الحجز الجديد
                </DialogDescription>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                <div className="space-y-2">
                  <Label>تاريخ الحجز</Label>
                  <Input
                    type="date"
                    value={newDelivery.bookingDate}
                    onChange={(e) => handleNewDeliveryChange("bookingDate", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>اسم العميل</Label>
                  <Input
                    value={newDelivery.customerName}
                    onChange={(e) => handleNewDeliveryChange("customerName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>رقم العميل</Label>
                  <Input
                    value={newDelivery.customerPhone}
                    onChange={(e) => handleNewDeliveryChange("customerPhone", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>المشروع</Label>
                  <Input
                    value={newDelivery.project}
                    onChange={(e) => handleNewDeliveryChange("project", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>العمارة</Label>
                  <Input
                    value={newDelivery.building}
                    onChange={(e) => handleNewDeliveryChange("building", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>الوحدة</Label>
                  <Input
                    value={newDelivery.unit}
                    onChange={(e) => handleNewDeliveryChange("unit", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>طريقة الدفع</Label>
                  <Select
                    value={newDelivery.paymentMethod}
                    onValueChange={(value) => handleNewDeliveryChange("paymentMethod", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر طريقة الدفع" />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((method) => (
                        <SelectItem key={method} value={method}>
                          {method}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>نوع البيع</Label>
                  <Select
                    value={newDelivery.saleType}
                    onValueChange={(value) => handleNewDeliveryChange("saleType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="اختر نوع البيع" />
                    </SelectTrigger>
                    <SelectContent>
                      {saleTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>قيمة الوحدة</Label>
                  <Input
                    type="number"
                    value={newDelivery.unitValue}
                    onChange={(e) => handleNewDeliveryChange("unitValue", parseFloat(e.target.value))}
                  />
                </div>

                {/* Add remaining fields similarly */}

              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  إلغاء
                </Button>
                <Button onClick={handleAddDelivery}>
                  إضافة
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>سجل الحجز</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Filter className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="بحث..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-9"
                />
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">الرقم المتسلسل</TableHead>
                    <TableHead className="text-right">تاريخ الحجز</TableHead>
                    <TableHead className="text-right">اسم العميل</TableHead>
                    <TableHead className="text-right">المشروع</TableHead>
                    <TableHead className="text-right">الوحدة</TableHead>
                    <TableHead className="text-right">حالة الحجز</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDeliveries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        لا توجد سجلات حجز متطابقة مع معايير البحث
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDeliveries.map((delivery) => (
                      <TableRow key={delivery.id}>
                        <TableCell className="font-medium">{delivery.id}</TableCell>
                        <TableCell>{delivery.bookingDate}</TableCell>
                        <TableCell>{delivery.customerName}</TableCell>
                        <TableCell>{delivery.project}</TableCell>
                        <TableCell>{delivery.unit}</TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            delivery.deliveryDate ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {delivery.deliveryDate ? "تم التسليم" : "قيد التسليم"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}