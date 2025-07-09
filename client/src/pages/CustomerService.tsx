The code changes focus on ensuring that the Excel import and export functionality in the CustomerService component correctly handles data with matching columns and formats, addressing issues related to data consistency and user experience.
const updateCallsTotal = () => {
    const {total, ...callsWithoutTotal} = calls;
    const newTotal = Object.values(callsWithoutTotal).reduce((sum, value) => sum + value, 0);
    setCalls(prev => ({ ...prev, total: newTotal }));
  };
const updateCallsTotal = () => {
    const {total, ...callsWithoutTotal} = calls;
    const newTotal = Object.values(callsWithoutTotal).reduce((sum, value) => sum + value, 0);
    setCalls(prev => ({ ...prev, total: newTotal }));
  };
// حساب الإجمالي تلقائياً عند تغيير أي قيمة
  useEffect(() => {
    const {total, ...callsWithoutTotal} = calls;
    const newTotal = Object.values(callsWithoutTotal).reduce((sum, value) => sum + (typeof value === 'number' ? value : 0), 0);
    if (newTotal !== calls.total) {
      setCalls(prev => ({ ...prev, total: newTotal }));
    }
  }, [calls.complaints, calls.contactRequests, calls.maintenanceRequests, calls.inquiries, calls.officeInterested, calls.projectsInterested, calls.customersInterested]);

  // دالة لتحديث قيم المكالمات مع إعادة حساب الإجمالي
  const updateCallValue = (field: string, value: number) => {
    setCalls(prev => {
      const updated = { ...prev, [field]: value };
      const {total, ...callsWithoutTotal} = updated;
      const newTotal = Object.values(callsWithoutTotal).reduce((sum, val) => sum + (typeof val === 'number' ? val : 0), 0);
      return { ...updated, total: newTotal };
    });
  };