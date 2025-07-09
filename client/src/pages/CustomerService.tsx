const updateCallsTotal = useCallback(() => {
    const {total, ...callsWithoutTotal} = calls;
    const newTotal = Object.values(callsWithoutTotal).reduce((sum, value) => sum + (value || 0), 0);

    console.log('تحديث مجموع المكالمات:', {
      oldTotal: calls.total,
      newTotal: newTotal,
      breakdown: callsWithoutTotal
    });

    if (newTotal !== calls.total) {
      setCalls(prev => ({ ...prev, total: newTotal }));
    }
  }, [calls]);
const updateCallsTotal = useCallback(() => {
    const {total, ...callsWithoutTotal} = calls;
    const newTotal = Object.values(callsWithoutTotal).reduce((sum, value) => sum + (value || 0), 0);

    console.log('تحديث مجموع المكالمات:', {
      oldTotal: calls.total,
      newTotal: newTotal,
      breakdown: callsWithoutTotal
    });

    if (newTotal !== calls.total) {
      setCalls(prev => ({ ...prev, total: newTotal }));
    }
  }, [calls]);
useEffect(() => {
    const {total, ...callsWithoutTotal} = calls;
    const newTotal = Object.values(callsWithoutTotal).reduce((sum, value) => sum + value, 0);
    if (newTotal !== calls.total) {
      setCalls(prev => ({ ...prev, total: newTotal }));
    }
  }, [calls.complaints, calls.contactRequests, calls.maintenanceRequests, calls.inquiries, calls.officeInterested, calls.projectsInterested, calls.customersInterested]);