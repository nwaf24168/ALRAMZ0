import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Eye } from 'lucide-react';
import ComplaintDetails from './ComplaintDetails';

export default function ComplaintsPage() {
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const handleViewDetails = (complaint) => {
    setSelectedComplaint(complaint);
    setIsDetailsOpen(true);
  };

  return (
    <Layout>
      <div className="container mx-auto p-2 sm:p-4 md:p-6">
        <div className="space-y-4">
          <h1 className="text-xl sm:text-2xl font-bold">سجل الشكاوى والطلبات</h1>
          
          <div className="bg-[#1a1c23] rounded-lg border border-gray-800">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">#</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">اسم العميل</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">المشروع</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">رقم الوحدة</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">الحالة</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">المدة</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr key={complaint.id} className="border-b border-gray-800 last:border-0">
                      <td className="py-3 px-4 text-sm">{complaint.id}</td>
                      <td className="py-3 px-4 text-sm">{complaint.customerName}</td>
                      <td className="py-3 px-4 text-sm">{complaint.projectName}</td>
                      <td className="py-3 px-4 text-sm">{complaint.unitNumber}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs ${getStatusClass(complaint.status)}`}>
                          {complaint.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">{complaint.duration}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewDetails(complaint)}
                          className="p-2 hover:bg-gray-800 rounded-full transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selectedComplaint && (
          <ComplaintDetails
            isOpen={isDetailsOpen}
            onClose={() => setIsDetailsOpen(false)}
            complaint={selectedComplaint}
          />
        )}
      </div>
    </Layout>
  );
}

const getStatusClass = (status: string) => {
  switch (status) {
    case 'تم الحل':
      return 'bg-emerald-500/20 text-emerald-500';
    case 'قيد المعالجة':
      return 'bg-yellow-500/20 text-yellow-500';
    case 'تم الإلغاء':
      return 'bg-red-500/20 text-red-500';
    default:
      return 'bg-gray-500/20 text-gray-500';
  }
};

// بيانات تجريبية
const complaints = [
  {
    id: "1",
    customerName: "أحمد محمد",
    projectName: "برج النفيسي",
    unitNumber: "A-203",
    complaintSource: "مكالمة هاتفية",
    status: "تم الحل",
    duration: "2 يوم",
    details: "مشكلة في تسريب المياه من السقف",
    action: "تم إصلاح التسريب وإعادة دهان السقف",
    createdBy: "موظف خدمة العملاء",
    createdAt: "2024-03-20"
  },
  // يمكنك إضافة المزيد من البيانات هنا
]; 