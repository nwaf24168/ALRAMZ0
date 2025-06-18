import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, MapPin, Phone, User, Home, FileText, CheckCircle2, X, AlertCircle } from "lucide-react";

interface ComplaintDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  complaint: {
    id: string;
    customerName: string;
    projectName: string;
    unitNumber: string;
    complaintSource: string;
    status: string;
    duration: string;
    details: string;
    action: string;
    createdBy: string;
    createdAt: string;
  };
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "تم الحل":
    case "مغلقة":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "قيد المعالجة":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    case "معلقة":
      return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
    default:
      return "bg-red-500/10 text-red-400 border-red-500/20";
  }
};

const ComplaintDetails: React.FC<ComplaintDetailsProps> = ({
  isOpen,
  onClose,
  complaint
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#1a1c23] to-[#1f2128] border border-gray-800/50 shadow-2xl">
        <DialogHeader className="border-b border-gray-800/50 pb-4 mb-6">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-white flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-800/50">
                <FileText className="w-5 h-5 text-blue-400" />
              </div>
              <span>تفاصيل الشكوى #{complaint.id}</span>
            </DialogTitle>
            <div className="flex items-center gap-3">
              <Badge className={`${getStatusColor(complaint.status)} px-4 py-1 text-sm border rounded-full`}>
                {complaint.status}
              </Badge>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-800/50 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-white" />
              </button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-8">
          {/* معلومات العميل والمشروع */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
              <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <User className="w-4 h-4 text-blue-400" />
                معلومات العميل والمشروع
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                  <div className="p-2 rounded-lg bg-blue-500/10">
                    <User className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">اسم العميل</div>
                    <div className="font-medium text-white">{complaint.customerName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Home className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">المشروع</div>
                    <div className="font-medium text-white">{complaint.projectName}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                  <div className="p-2 rounded-lg bg-emerald-500/10">
                    <MapPin className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">رقم الوحدة</div>
                    <div className="font-medium text-white">{complaint.unitNumber}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                  <div className="p-2 rounded-lg bg-yellow-500/10">
                    <Phone className="w-5 h-5 text-yellow-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">مصدر الشكوى</div>
                    <div className="font-medium text-white">{complaint.complaintSource}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
              <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4 text-red-400" />
                معلومات الوقت والإنشاء
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                  <div className="p-2 rounded-lg bg-red-500/10">
                    <Clock className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">المدة</div>
                    <div className="font-medium text-white">{complaint.duration}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Calendar className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">تاريخ الإنشاء</div>
                    <div className="font-medium text-white">{complaint.createdAt}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800/30 transition-colors">
                  <div className="p-2 rounded-lg bg-teal-500/10">
                    <User className="w-5 h-5 text-teal-400" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-400">تم الإنشاء بواسطة</div>
                    <div className="font-medium text-white">{complaint.createdBy}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* تفاصيل الشكوى والإجراء */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
              <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-yellow-400" />
                تفاصيل الشكوى
              </h3>
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <p className="text-white leading-relaxed">{complaint.details}</p>
              </div>
            </div>

            <div className="bg-[#20232b] rounded-xl p-6 space-y-6 border border-gray-800/30">
              <h3 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-400" />
                الإجراء المتخذ
              </h3>
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <p className="text-white leading-relaxed">{complaint.action}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ComplaintDetails; 